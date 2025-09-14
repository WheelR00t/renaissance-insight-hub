const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Service = require('../models/Service');

// Configuration initiale de la base de données
async function setupDatabase() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/renaissance-by-steph', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connecté à MongoDB');

    // Créer l'administrateur par défaut
    await createAdminUser();
    
    // Créer les services par défaut
    await createDefaultServices();

    console.log('🎉 Configuration initiale terminée !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'stephanie@renaissance-by-steph.fr';
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('👤 Administrateur déjà existant');
      return;
    }

    // Créer l'administrateur
    const admin = new User({
      firstName: 'Stephanie',
      lastName: 'Renaissance',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!',
      isAdmin: true,
      isVerified: true
    });

    await admin.save();
    console.log('👤 Administrateur créé:', adminEmail);

  } catch (error) {
    console.error('❌ Erreur création admin:', error);
  }
}

async function createDefaultServices() {
  try {
    // Vérifier s'il y a déjà des services
    const existingServices = await Service.countDocuments();
    if (existingServices > 0) {
      console.log('🔮 Services déjà existants');
      return;
    }

    const defaultServices = [
      {
        name: 'Tirage de Cartes Oracle',
        description: 'Une guidance spirituelle personnalisée à travers les cartes oracle pour éclairer votre chemin et répondre à vos questions les plus profondes.',
        shortDescription: 'Guidance spirituelle personnalisée avec les cartes oracle',
        price: 45,
        duration: 45,
        category: 'tirage-cartes',
        isOnline: true,
        isInPerson: false,
        features: [
          'Tirage personnalisé selon votre question',
          'Interprétation détaillée des cartes',
          'Guidance et conseils pratiques',
          'Enregistrement audio de la séance'
        ],
        availableSlots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
        ],
        order: 1
      },
      {
        name: 'Séance de Reiki',
        description: 'Soin énergétique de Reiki pour harmoniser vos chakras, libérer les blocages énergétiques et retrouver votre équilibre intérieur.',
        shortDescription: 'Soin énergétique pour harmoniser vos chakras',
        price: 60,
        duration: 60,
        category: 'reiki',
        isOnline: true,
        isInPerson: true,
        features: [
          'Nettoyage et harmonisation des chakras',
          'Libération des blocages énergétiques',
          'Relaxation profonde',
          'Conseils pour maintenir l\'équilibre'
        ],
        availableSlots: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '16:00' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '16:00' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '16:00' }
        ],
        order: 2
      },
      {
        name: 'Consultation Pendule',
        description: 'Consultation au pendule pour obtenir des réponses claires à vos questions et éclairer vos choix de vie.',
        shortDescription: 'Réponses claires à vos questions grâce au pendule',
        price: 35,
        duration: 30,
        category: 'pendule',
        isOnline: true,
        isInPerson: false,
        features: [
          'Questions/réponses précises',
          'Guidance pour vos décisions',
          'Clarification des situations',
          'Compte-rendu écrit'
        ],
        availableSlots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
          { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' }
        ],
        order: 3
      },
      {
        name: 'Séance de Guérison Énergétique',
        description: 'Séance complète de guérison énergétique combinant plusieurs techniques pour un rééquilibrage en profondeur.',
        shortDescription: 'Guérison énergétique complète et rééquilibrage',
        price: 80,
        duration: 75,
        category: 'guerison',
        isOnline: true,
        isInPerson: true,
        features: [
          'Diagnostic énergétique complet',
          'Techniques de guérison multiples',
          'Nettoyage des mémoires cellulaires',
          'Plan de suivi personnalisé'
        ],
        availableSlots: [
          { dayOfWeek: 2, startTime: '14:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '14:00', endTime: '17:00' },
          { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' }
        ],
        order: 4
      }
    ];

    await Service.insertMany(defaultServices);
    console.log('🔮 Services par défaut créés');

  } catch (error) {
    console.error('❌ Erreur création services:', error);
  }
}

// Lancer la configuration
setupDatabase();