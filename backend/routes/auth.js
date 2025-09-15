const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Inscription utilisateur
// @access  Public
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('phone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, email, password, phone, birthDate } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà' });
    }

    // Créer l'utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      birthDate: birthDate ? new Date(birthDate) : undefined
    });

    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// @route   POST /api/auth/login
// @desc    Connexion utilisateur
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.json({
      message: 'Connexion réussie',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
});

// @route   POST /api/auth/guest
// @desc    Créer un utilisateur invité
// @access  Public
router.post('/guest', [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('phone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, email, phone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user && !user.isGuest) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà' });
    }

    if (!user) {
      // Créer un utilisateur invité
      user = new User({
        firstName,
        lastName,
        email,
        phone,
        isGuest: true
      });
      await user.save();
    }

    // Générer le token
    const token = generateToken(user._id);

    res.json({
      message: 'Session invité créée',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur session invité:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la session invité' });
  }
});

// @route   GET /api/auth/me
// @desc    Obtenir les infos de l'utilisateur connecté
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/auth/logout
// @desc    Déconnexion (côté client principalement)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;