const express = require('express');
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/services
// @desc    Obtenir tous les services actifs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = { isActive: true };
    if (category) {
      filter.category = category;
    }

    const services = await Service.find(filter).sort({ order: 1, createdAt: 1 });
    
    res.json({ services });
  } catch (error) {
    console.error('Erreur récupération services:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des services' });
  }
});

// @route   GET /api/services/:id
// @desc    Obtenir un service par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, isActive: true });
    
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json({ service });
  } catch (error) {
    console.error('Erreur récupération service:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du service' });
  }
});

// @route   GET /api/services/category/:category
// @desc    Obtenir les services par catégorie
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const services = await Service.find({ 
      category, 
      isActive: true 
    }).sort({ order: 1, createdAt: 1 });
    
    res.json({ services });
  } catch (error) {
    console.error('Erreur récupération services par catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des services' });
  }
});

// @route   POST /api/services
// @desc    Créer un nouveau service (Admin)
// @access  Private (Admin)
router.post('/', adminAuth, [
  body('name').trim().notEmpty().withMessage('Le nom du service est requis'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('shortDescription').trim().isLength({ max: 200 }).withMessage('La description courte ne peut excéder 200 caractères'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('duration').isInt({ min: 15 }).withMessage('La durée doit être d\'au moins 15 minutes'),
  body('category').isIn(['tirage-cartes', 'reiki', 'pendule', 'guerison', 'consultation']).withMessage('Catégorie invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const service = new Service(req.body);
    await service.save();

    res.status(201).json({
      message: 'Service créé avec succès',
      service
    });

  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du service' });
  }
});

// @route   PUT /api/services/:id
// @desc    Modifier un service (Admin)
// @access  Private (Admin)
router.put('/:id', adminAuth, [
  body('name').optional().trim().notEmpty().withMessage('Le nom du service ne peut être vide'),
  body('description').optional().trim().notEmpty().withMessage('La description ne peut être vide'),
  body('shortDescription').optional().trim().isLength({ max: 200 }).withMessage('La description courte ne peut excéder 200 caractères'),
  body('price').optional().isNumeric().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('duration').optional().isInt({ min: 15 }).withMessage('La durée doit être d\'au moins 15 minutes'),
  body('category').optional().isIn(['tirage-cartes', 'reiki', 'pendule', 'guerison', 'consultation']).withMessage('Catégorie invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json({
      message: 'Service modifié avec succès',
      service
    });

  } catch (error) {
    console.error('Erreur modification service:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification du service' });
  }
});

// @route   DELETE /api/services/:id
// @desc    Supprimer un service (Admin)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json({ message: 'Service supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression service:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du service' });
  }
});

module.exports = router;