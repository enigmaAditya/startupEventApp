/* ============================================
   StartupEvents — User Model (Mongoose)
   Syllabus: BE Unit IV — Schema, models
   BE Unit III — bcrypt password hashing, JWT
   ============================================ */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * User Schema
 * Demonstrates: pre-save hooks, instance methods, enum, select
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['attendee', 'organizer', 'admin'],
      default: 'attendee',
    },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    interests: [{ type: String }],
    eventsOrganized: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    eventsAttending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---- Virtual: fullName ----
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ---- Pre-save Hook: Hash Password ----
// Demonstrates: pre-save middleware, bcrypt, async/await in hooks
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---- Instance Methods ----

/**
 * Compare entered password with hashed password
 * Demonstrates: bcrypt.compare, async instance method
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate JWT access token
 * Demonstrates: jwt.sign, payload creation
 * @returns {string}
 */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expire }
  );
};

/**
 * Generate JWT refresh token
 * @returns {string}
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpire }
  );
};

// ---- Static Methods ----

/**
 * Find user by email (including password for auth)
 * @param {string} email
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select('+password');
};

const User = mongoose.model('User', userSchema);

module.exports = User;
