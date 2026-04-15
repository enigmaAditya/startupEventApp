/* ============================================
   StartupEvents — RSVP Model (Mongoose)
   Syllabus: BE Unit IV — Schema, references, indexes
   ============================================ */

const mongoose = require('mongoose');

/**
 * RSVP Schema — Join table between Users and Events
 * Demonstrates: compound index, references, enum status
 */
const rsvpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'waitlisted'],
      default: 'confirmed',
    },
    role: {
      type: String,
      enum: ['developer', 'designer', 'product-manager', 'entrepreneur', 'student', 'other'],
      default: 'other',
    },
    teamSize: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate RSVPs
// A user can only RSVP once per event
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

const RSVP = mongoose.model('RSVP', rsvpSchema);

module.exports = RSVP;
