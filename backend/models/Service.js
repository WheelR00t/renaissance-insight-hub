const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // en minutes
    required: true,
    min: 15
  },
  category: {
    type: String,
    required: true,
    enum: ['tirage-cartes', 'reiki', 'pendule', 'guerison', 'consultation']
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  isInPerson: {
    type: Boolean,
    default: false
  },
  maxBookingsPerDay: {
    type: Number,
    default: 10
  },
  features: [{
    type: String,
    trim: true
  }],
  preparationInstructions: {
    type: String,
    default: ''
  },
  availableSlots: [{
    dayOfWeek: {
      type: Number, // 0=Dimanche, 1=Lundi, etc.
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String, // Format "HH:mm"
      required: true
    },
    endTime: {
      type: String, // Format "HH:mm"
      required: true
    }
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ order: 1 });

module.exports = mongoose.model('Service', serviceSchema);