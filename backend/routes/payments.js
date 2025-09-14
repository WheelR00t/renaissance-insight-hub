const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Créer une intention de paiement Stripe
// @access  Private
router.post('/create-payment-intent', auth, [
  body('appointmentId').isMongoId().withMessage('ID de RDV invalide'),
  body('paymentMethod').isIn(['stripe', 'paypal']).withMessage('Méthode de paiement invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { appointmentId, paymentMethod } = req.body;

    // Vérifier que le RDV existe et appartient à l'utilisateur
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.user.userId,
      paymentStatus: 'pending'
    }).populate('service', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé ou déjà payé' });
    }

    if (paymentMethod === 'stripe') {
      // Créer l'intention de paiement Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(appointment.price * 100), // Stripe utilise les centimes
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          appointmentId: appointment._id.toString(),
          userId: req.user.userId,
          serviceName: appointment.service.name
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });

    } else if (paymentMethod === 'paypal') {
      // Pour PayPal, on retournerait ici les informations nécessaires
      // pour initier le paiement côté frontend
      res.json({
        amount: appointment.price,
        currency: 'EUR',
        appointmentId: appointment._id,
        description: `Paiement pour ${appointment.service.name}`
      });
    }

  } catch (error) {
    console.error('Erreur création intention paiement:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du paiement' });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirmer un paiement
// @access  Private
router.post('/confirm-payment', auth, [
  body('appointmentId').isMongoId().withMessage('ID de RDV invalide'),
  body('paymentId').notEmpty().withMessage('ID de paiement requis'),
  body('paymentMethod').isIn(['stripe', 'paypal']).withMessage('Méthode de paiement invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { appointmentId, paymentId, paymentMethod } = req.body;

    // Vérifier que le RDV existe et appartient à l'utilisateur
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    let paymentConfirmed = false;

    if (paymentMethod === 'stripe') {
      // Vérifier le paiement Stripe
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        paymentConfirmed = paymentIntent.status === 'succeeded';
      } catch (stripeError) {
        console.error('Erreur vérification Stripe:', stripeError);
        return res.status(400).json({ message: 'Erreur lors de la vérification du paiement Stripe' });
      }
    } else if (paymentMethod === 'paypal') {
      // Ici, vous devriez vérifier le paiement PayPal
      // avec l'API PayPal en utilisant le paymentId
      paymentConfirmed = true; // Simplification pour l'exemple
    }

    if (paymentConfirmed) {
      // Mettre à jour le RDV
      appointment.paymentStatus = 'paid';
      appointment.paymentId = paymentId;
      appointment.paymentMethod = paymentMethod;
      appointment.status = 'confirmed';
      
      await appointment.save();

      // Ici, vous pourriez envoyer un email de confirmation
      // ou créer un lien de rendez-vous en ligne

      res.json({
        message: 'Paiement confirmé avec succès',
        appointment: {
          _id: appointment._id,
          status: appointment.status,
          paymentStatus: appointment.paymentStatus,
          appointmentDate: appointment.appointmentDate
        }
      });

    } else {
      res.status(400).json({ message: 'Le paiement n\'a pas pu être confirmé' });
    }

  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la confirmation du paiement' });
  }
});

// @route   POST /api/payments/webhook/stripe
// @desc    Webhook Stripe pour les événements de paiement
// @access  Public (mais sécurisé par signature Stripe)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erreur signature webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Mettre à jour le RDV
      if (paymentIntent.metadata.appointmentId) {
        try {
          await Appointment.findByIdAndUpdate(
            paymentIntent.metadata.appointmentId,
            {
              paymentStatus: 'paid',
              paymentId: paymentIntent.id,
              status: 'confirmed'
            }
          );
          console.log('RDV confirmé via webhook Stripe:', paymentIntent.metadata.appointmentId);
        } catch (error) {
          console.error('Erreur mise à jour RDV via webhook:', error);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      if (failedPayment.metadata.appointmentId) {
        try {
          await Appointment.findByIdAndUpdate(
            failedPayment.metadata.appointmentId,
            { paymentStatus: 'failed' }
          );
          console.log('Paiement échoué via webhook Stripe:', failedPayment.metadata.appointmentId);
        } catch (error) {
          console.error('Erreur mise à jour échec paiement via webhook:', error);
        }
      }
      break;

    default:
      console.log(`Événement Stripe non géré: ${event.type}`);
  }

  res.json({ received: true });
});

// @route   GET /api/payments/history
// @desc    Historique des paiements de l'utilisateur
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const payments = await Appointment.find({
      user: req.user.userId,
      paymentStatus: 'paid'
    })
    .populate('service', 'name category')
    .select('appointmentDate price paymentMethod paymentId createdAt')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Appointment.countDocuments({
      user: req.user.userId,
      paymentStatus: 'paid'
    });

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur historique paiements:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique' });
  }
});

module.exports = router;