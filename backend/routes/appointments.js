const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/appointments/availability/:serviceId
// @desc    Vérifier les créneaux disponibles pour un service
// @access  Public
router.get('/availability/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Vérifier si le service est disponible ce jour
    const daySlots = service.availableSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
    if (daySlots.length === 0) {
      return res.json({ availableSlots: [] });
    }

    // Obtenir les RDV existants pour cette date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      service: serviceId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Calculer les créneaux disponibles
    const availableSlots = [];
    
    for (const daySlot of daySlots) {
      const [startHour, startMinute] = daySlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = daySlot.endTime.split(':').map(Number);
      
      let currentTime = new Date(targetDate);
      currentTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(targetDate);
      endTime.setHours(endHour, endMinute, 0, 0);

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + service.duration);

        if (slotEnd <= endTime) {
          // Vérifier si ce créneau est libre
          const isAvailable = !existingAppointments.some(appointment => {
            const appointmentStart = new Date(appointment.appointmentDate);
            const appointmentEnd = new Date(appointmentStart);
            appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration);

            return (currentTime < appointmentEnd && slotEnd > appointmentStart);
          });

          if (isAvailable) {
            availableSlots.push({
              startTime: currentTime.toISOString(),
              endTime: slotEnd.toISOString(),
              duration: service.duration
            });
          }
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30); // Créneaux toutes les 30 minutes
      }
    }

    res.json({ availableSlots });

  } catch (error) {
    console.error('Erreur vérification disponibilité:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification des disponibilités' });
  }
});

// @route   POST /api/appointments
// @desc    Créer un nouveau RDV
// @access  Private
router.post('/', auth, [
  body('serviceId').isMongoId().withMessage('ID de service invalide'),
  body('appointmentDate').isISO8601().withMessage('Date de RDV invalide'),
  body('sessionType').isIn(['online', 'in-person']).withMessage('Type de session invalide'),
  body('clientNotes').optional().isLength({ max: 1000 }).withMessage('Notes trop longues')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { serviceId, appointmentDate, sessionType, clientNotes } = req.body;

    // Vérifier que le service existe
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Service non trouvé ou inactif' });
    }

    // Vérifier que la date est dans le futur
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ message: 'La date du RDV doit être dans le futur' });
    }

    // Vérifier la disponibilité du créneau
    const existingAppointment = await Appointment.findOne({
      service: serviceId,
      appointmentDate: appointmentDateTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Ce créneau n\'est pas disponible' });
    }

    // Créer le RDV
    const appointment = new Appointment({
      user: req.user.userId,
      service: serviceId,
      appointmentDate: appointmentDateTime,
      duration: service.duration,
      price: service.price,
      sessionType,
      clientNotes
    });

    await appointment.save();

    // Peupler les données pour la réponse
    await appointment.populate([
      { path: 'service', select: 'name category duration price' },
      { path: 'user', select: 'firstName lastName email phone' }
    ]);

    res.status(201).json({
      message: 'Rendez-vous créé avec succès',
      appointment
    });

  } catch (error) {
    console.error('Erreur création RDV:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du RDV' });
  }
});

// @route   GET /api/appointments/my
// @desc    Obtenir les RDV de l'utilisateur connecté
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    let filter = { user: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('service', 'name category duration price')
      .sort({ appointmentDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur récupération RDV utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des RDV' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Obtenir un RDV par ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service', 'name category duration price features')
      .populate('user', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Vérifier que l'utilisateur a le droit de voir ce RDV
    if (appointment.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json({ appointment });

  } catch (error) {
    console.error('Erreur récupération RDV:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du RDV' });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Annuler un RDV
// @access  Private
router.put('/:id/cancel', auth, [
  body('reason').optional().isLength({ max: 500 }).withMessage('Raison trop longue')
], async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Vérifier que l'utilisateur peut annuler ce RDV
    if (appointment.user.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Vérifier si le RDV peut être annulé
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({ 
        message: 'Ce rendez-vous ne peut plus être annulé (moins de 24h avant ou statut incompatible)' 
      });
    }

    // Annuler le RDV
    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason;
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user.userId;

    await appointment.save();

    res.json({
      message: 'Rendez-vous annulé avec succès',
      appointment
    });

  } catch (error) {
    console.error('Erreur annulation RDV:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'annulation du RDV' });
  }
});

module.exports = router;