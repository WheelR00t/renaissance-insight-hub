const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const BlogPost = require('../models/BlogPost');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB par défaut
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// @route   GET /api/admin/dashboard
// @desc    Statistiques du tableau de bord admin
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Statistiques générales
    const stats = await Promise.all([
      // Utilisateurs
      User.countDocuments({ isGuest: false }),
      User.countDocuments({ 
        isGuest: false, 
        createdAt: { $gte: startOfMonth } 
      }),
      
      // Rendez-vous
      Appointment.countDocuments(),
      Appointment.countDocuments({ 
        appointmentDate: { $gte: startOfWeek } 
      }),
      Appointment.countDocuments({ 
        status: 'pending' 
      }),
      
      // Revenus
      Appointment.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      Appointment.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid',
            createdAt: { $gte: startOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      
      // Articles de blog
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'draft' })
    ]);

    const [
      totalUsers,
      newUsersThisMonth,
      totalAppointments,
      appointmentsThisWeek,
      pendingAppointments,
      totalRevenue,
      revenueThisMonth,
      publishedPosts,
      draftPosts
    ] = stats;

    // Rendez-vous récents
    const recentAppointments = await Appointment.find()
      .populate('user', 'firstName lastName email')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Statistiques par service
    const serviceStats = await Appointment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { 
        $group: { 
          _id: '$service', 
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        } 
      },
      { 
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth
        },
        appointments: {
          total: totalAppointments,
          thisWeek: appointmentsThisWeek,
          pending: pendingAppointments
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: revenueThisMonth[0]?.total || 0
        },
        blog: {
          published: publishedPosts,
          drafts: draftPosts
        }
      },
      recentAppointments,
      serviceStats
    });

  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des statistiques' });
  }
});

// @route   GET /api/admin/users
// @desc    Gestion des utilisateurs
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { 
      search, 
      isGuest, 
      limit = 20, 
      page = 1,
      sort = 'recent' 
    } = req.query;

    let filter = {};
    let sortOption = {};

    // Filtres
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isGuest !== undefined) {
      filter.isGuest = isGuest === 'true';
    }

    // Tri
    switch (sort) {
      case 'name':
        sortOption = { firstName: 1, lastName: 1 };
        break;
      case 'email':
        sortOption = { email: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur gestion utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
});

// @route   GET /api/admin/appointments
// @desc    Gestion des rendez-vous
// @access  Private (Admin)
router.get('/appointments', adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      service, 
      date,
      limit = 20, 
      page = 1 
    } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (service) filter.service = service;
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('service', 'name category duration price')
      .sort({ appointmentDate: 1 })
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
    console.error('Erreur gestion RDV:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des RDV' });
  }
});

// @route   PUT /api/admin/appointments/:id
// @desc    Modifier un rendez-vous (Admin)
// @access  Private (Admin)
router.put('/appointments/:id', adminAuth, [
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']).withMessage('Statut invalide'),
  body('adminNotes').optional().isLength({ max: 1000 }).withMessage('Notes admin trop longues')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email')
    .populate('service', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    res.json({
      message: 'Rendez-vous modifié avec succès',
      appointment
    });

  } catch (error) {
    console.error('Erreur modification RDV admin:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification du RDV' });
  }
});

// @route   POST /api/admin/upload
// @desc    Upload de fichier (images)
// @access  Private (Admin)
router.post('/upload', adminAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Fichier uploadé avec succès',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Erreur upload fichier:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'upload du fichier' });
  }
});

// @route   GET /api/admin/blog
// @desc    Gestion des articles (tous statuts)
// @access  Private (Admin)
router.get('/blog', adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      category,
      limit = 20, 
      page = 1 
    } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const posts = await BlogPost.find(filter)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await BlogPost.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur gestion blog admin:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des articles' });
  }
});

module.exports = router;