/* ============================================
   StartupEvents — Event Model (Mongoose)
   Syllabus: BE Unit IV — Schema definition, models,
             validation, indexes, virtuals
   ============================================ */

const mongoose = require('mongoose');

/**
 * Event Schema
 * Demonstrates: Mongoose schema types, validation, enums,
 *               nested objects, arrays, timestamps, indexes, virtuals
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true, // Index for search performance
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['hackathon', 'pitch-night', 'workshop', 'meetup', 'conference'],
        message: '{VALUE} is not a valid category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true,
    },
    endDate: {
      type: Date,
    },
    time: {
      start: { type: String },
      end: { type: String },
    },
    // Nested object for location
    location: {
      venue: { type: String, required: [true, 'Venue is required'] },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String },
      country: { type: String, default: 'India' },
      isVirtual: { type: Boolean, default: false },
      meetingLink: { type: String },
    },
    // Reference to User document (ObjectId)
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    // Array of ObjectIds
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [{ type: String, trim: true, lowercase: true }],
    image: { type: String },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    prizePool: { type: String },
    isFeatured: { type: Boolean, default: false },
    chatHistory: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      }
    ],
  },
  {
    // Adds createdAt and updatedAt automatically
    timestamps: true,

    // Enable virtuals in JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---- Text Index for Search ----
// Demonstrates: MongoDB text index for full-text search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ---- Virtual Fields ----
// Demonstrates: Mongoose virtuals (computed properties not stored in DB)

/**
 * Virtual: attendeeCount — computed from attendees array length
 */
eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees ? this.attendees.length : 0;
});

/**
 * Virtual: spotsRemaining — computed from capacity minus attendees
 */
eventSchema.virtual('spotsRemaining').get(function () {
  return this.capacity - (this.attendees ? this.attendees.length : 0);
});

/**
 * Virtual: isFullyBooked — true if no spots remaining
 */
eventSchema.virtual('isFullyBooked').get(function () {
  return this.spotsRemaining <= 0;
});

// ---- Static Methods ----
// Demonstrates: Mongoose static methods (called on the Model)

/**
 * Find upcoming events with pagination
 * @param {Object} filters - Query filters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
eventSchema.statics.findUpcoming = function (filters = {}, page = 1, limit = 10) {
  const query = {
    date: { $gte: new Date() },
    status: 'upcoming',
    ...filters,
  };

  return this.find(query)
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('organizer', 'firstName lastName email');
};

/**
 * Search events by text
 * @param {string} searchText
 */
eventSchema.statics.search = function (searchText) {
  return this.find(
    { $text: { $search: searchText } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

// ---- Instance Methods ----
// Demonstrates: Mongoose instance methods (called on a document)

/**
 * Add an attendee to the event
 * @param {string} userId
 */
eventSchema.methods.addAttendee = function (userId) {
  if (this.isFullyBooked) {
    throw new Error('Event is fully booked');
  }
  if (this.attendees.includes(userId)) {
    throw new Error('User already registered');
  }
  this.attendees.push(userId);
  return this.save();
};

/**
 * Remove an attendee from the event
 * @param {string} userId
 */
eventSchema.methods.removeAttendee = function (userId) {
  this.attendees = this.attendees.filter(
    (id) => id.toString() !== userId.toString()
  );
  return this.save();
};

/**
 * Sync status based on current date/time
 * Transition events to 'completed' if endDate is in the past
 */
eventSchema.methods.syncStatus = function () {
  const now = new Date();
  const targetDate = this.endDate || this.date;

  if (targetDate < now && this.status !== 'completed' && this.status !== 'cancelled') {
    this.status = 'completed';
    return this.save();
  }
  return Promise.resolve(this);
};

// Create and export the model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
