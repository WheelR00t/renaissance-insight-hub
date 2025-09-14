const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // en minutes
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'cash'],
    default: 'stripe'
  },
  paymentId: {
    type: String,
    default: null
  },
  sessionType: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'online'
  },
  meetingLink: {
    type: String,
    default: null
  },
  clientNotes: {
    type: String,
    maxlength: 1000
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  completionNotes: {
    type: String,
    maxlength: 2000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
appointmentSchema.index({ user: 1, appointmentDate: -1 });
appointmentSchema.index({ service: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1 });

// Méthode pour vérifier si le RDV peut être annulé
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentTime = new Date(this.appointmentDate);
  const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
  
  return hoursUntilAppointment >= 24 && ['pending', 'confirmed'].includes(this.status);
};

// Méthode pour vérifier si le RDV peut être modifié
appointmentSchema.methods.canBeModified = function() {
  const now = new Date();
  const appointmentTime = new Date(this.appointmentDate);
  const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
  
  return hoursUntilAppointment >= 48 && ['pending', 'confirmed'].includes(this.status);
};

module.exports = mongoose.model('Appointment', appointmentSchema);