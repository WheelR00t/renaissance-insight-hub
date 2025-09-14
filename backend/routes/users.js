const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user: user.toPublicJSON() });

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
});

// @route   PUT /api/users/profile
// @desc    Modifier le profil de l'utilisateur connecté
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut être vide'),
  body('lastName').optional().trim().notEmpty().withMessage('Le nom ne peut être vide'),
  body('phone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide'),
  body('birthDate').optional().isISO8601().withMessage('Date de naissance invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, phone, birthDate, preferences } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      message: 'Profil modifié avec succès',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur modification profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification du profil' });
  }
});

// @route   PUT /api/users/password
// @desc    Modifier le mot de passe
// @access  Private
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Modifier le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });

  } catch (error) {
    console.error('Erreur modification mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification du mot de passe' });
  }
});

// @route   DELETE /api/users/account
// @desc    Supprimer le compte utilisateur
// @access  Private
router.delete('/account', auth, [
  body('password').notEmpty().withMessage('Le mot de passe est requis pour supprimer le compte')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.user.userId);

    res.json({ message: 'Compte supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression compte:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte' });
  }
});

// @route   POST /api/users/convert-guest
// @desc    Convertir un compte invité en compte permanent
// @access  Private
router.post('/convert-guest', auth, [
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (!user.isGuest) {
      return res.status(400).json({ message: 'Ce compte n\'est pas un compte invité' });
    }

    // Convertir le compte invité
    user.password = password;
    user.isGuest = false;
    user.isVerified = true;
    
    await user.save();

    res.json({
      message: 'Compte converti avec succès',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur conversion compte invité:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la conversion du compte' });
  }
});

module.exports = router;