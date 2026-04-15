/* ============================================
   StartupEvents — Seed Data Script
   Syllabus: BE Unit I — Streams, JSON, fs module,
             async/await, Mongoose operations
   ============================================ */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Event = require('../models/Event');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Sample seed data
 * Demonstrates: arrays of objects, complex data structures
 */
const sampleUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@startupevents.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    firstName: 'Ravi',
    lastName: 'Sharma',
    email: 'ravi@techhub.in',
    password: 'Organizer@123',
    role: 'organizer',
  },
  {
    firstName: 'Priya',
    lastName: 'Agarwal',
    email: 'priya@greenfuture.ai',
    password: 'Organizer@123',
    role: 'organizer',
  },
  {
    firstName: 'Amit',
    lastName: 'Singh',
    email: 'amit@gmail.com',
    password: 'Attendee@123',
    role: 'attendee',
  },
  {
    firstName: 'Neha',
    lastName: 'Patel',
    email: 'neha@gmail.com',
    password: 'Attendee@123',
    role: 'attendee',
  },
];

/**
 * Generate sample events
 * @param {string} organizerId1
 * @param {string} organizerId2
 * @returns {Array}
 */
const getSampleEvents = (organizerId1, organizerId2) => [
  {
    title: 'Build for Tomorrow — 48hr Hackathon',
    description: 'A 48-hour hackathon bringing together 500+ developers, designers, and entrepreneurs to build innovative solutions for tomorrow\'s challenges. $10,000 in prizes across 5 categories.',
    category: 'hackathon',
    date: new Date('2026-05-15'),
    endDate: new Date('2026-05-17'),
    time: { start: '09:00', end: '18:00' },
    location: { venue: 'TechHub Bangalore', city: 'Bangalore', state: 'Karnataka', country: 'India' },
    organizer: organizerId1,
    capacity: 500,
    tags: ['ai/ml', 'web3', 'fintech', 'hackathon'],
    status: 'upcoming',
    prizePool: '$10,000',
    isFeatured: true,
  },
  {
    title: 'Startup Pitch Arena — Season 4',
    description: '10 startups pitch to a panel of VCs and angel investors. Winner gets $50K seed funding and 3-month incubation at TechHub.',
    category: 'pitch-night',
    date: new Date('2026-05-22'),
    time: { start: '18:00', end: '21:00' },
    location: { venue: 'Surge Ventures HQ', city: 'Delhi', state: 'Delhi', country: 'India' },
    organizer: organizerId2,
    capacity: 200,
    tags: ['saas', 'funding', 'pitch', 'investors'],
    status: 'upcoming',
    prizePool: '$50,000',
    isFeatured: true,
  },
  {
    title: 'Full-Stack Dev Bootcamp — MERN Stack',
    description: 'Intensive 2-day workshop covering MongoDB, Express, React, and Node.js. Build and deploy a complete startup MVP by the end.',
    category: 'workshop',
    date: new Date('2026-06-03'),
    endDate: new Date('2026-06-04'),
    time: { start: '10:00', end: '17:00' },
    location: { venue: 'WeWork BKC', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    organizer: organizerId1,
    capacity: 120,
    tags: ['mern', 'beginner', 'full-stack', 'workshop'],
    status: 'upcoming',
    isFeatured: true,
  },
  {
    title: "Founder's Coffee — Breakfast Networking",
    description: 'A casual breakfast meetup for startup founders to share stories, exchange ideas, and forge meaningful connections.',
    category: 'meetup',
    date: new Date('2026-05-28'),
    time: { start: '08:00', end: '10:00' },
    location: { venue: 'The Coffee House', city: 'Pune', state: 'Maharashtra', country: 'India' },
    organizer: organizerId2,
    capacity: 50,
    tags: ['networking', 'free', 'founders', 'casual'],
    status: 'upcoming',
  },
  {
    title: 'TechSummit India 2026',
    description: "India's largest startup technology conference. 3 days, 100+ speakers, and 5000+ attendees. Keynotes, workshops, and expo.",
    category: 'conference',
    date: new Date('2026-06-15'),
    endDate: new Date('2026-06-17'),
    time: { start: '09:00', end: '18:00' },
    location: { venue: 'HICC', city: 'Hyderabad', state: 'Telangana', country: 'India' },
    organizer: organizerId1,
    capacity: 5000,
    tags: ['conference', 'enterprise', 'keynote', 'expo'],
    status: 'upcoming',
    isFeatured: true,
  },
  {
    title: 'GreenTech Hack — Sustainability Challenge',
    description: 'Build technology solutions for climate change and sustainability. Sponsored by leading ClimateTech VCs.',
    category: 'hackathon',
    date: new Date('2026-06-20'),
    endDate: new Date('2026-06-21'),
    time: { start: '09:00', end: '18:00' },
    location: { venue: 'IIT Madras Research Park', city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    organizer: organizerId2,
    capacity: 300,
    tags: ['climatetech', 'sustainability', 'green', 'hackathon'],
    status: 'upcoming',
    prizePool: '$5,000',
  },
];

/**
 * Seed the database
 * Demonstrates: async/await, try/catch, Mongoose operations
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startupevents');
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    logger.info('Cleared existing data');

    // Create users
    const users = await User.create(sampleUsers);
    logger.info(`Created ${users.length} users`);

    // Get organizer IDs
    const organizer1 = users.find((u) => u.email === 'ravi@techhub.in')._id;
    const organizer2 = users.find((u) => u.email === 'priya@greenfuture.ai')._id;

    // Create events
    const events = await Event.create(getSampleEvents(organizer1, organizer2));
    logger.info(`Created ${events.length} events`);

    logger.info('✅ Database seeded successfully!');
    logger.info('');
    logger.info('Test accounts:');
    logger.info('  Admin:     admin@startupevents.com / Admin@123');
    logger.info('  Organizer: ravi@techhub.in / Organizer@123');
    logger.info('  Attendee:  amit@gmail.com / Attendee@123');

    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
