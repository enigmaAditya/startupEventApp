/* ============================================
   StartupEvents — Jest Backend Tests
   Syllabus: BE Unit VI — REST API testing,
             Jest + Supertest, integration tests
   ============================================ */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Event = require('../models/Event');

// ============ TEST SETUP ============

/**
 * Test database connection
 * Uses a separate test database to avoid affecting development data
 */
beforeAll(async () => {
  const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/startupevents_test';
  await mongoose.connect(MONGO_URI);
});

/**
 * Clean up after each test
 * Demonstrates: test isolation — each test starts fresh
 */
afterEach(async () => {
  await User.deleteMany({});
  await Event.deleteMany({});
});

/**
 * Close database connection after all tests
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

// ============ HELPER: Create Test User ============

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Password123!',
  role: 'organizer',
};

/**
 * Register and login a user, return auth token
 * Demonstrates: helper functions in tests, async/await
 */
const getAuthToken = async () => {
  await request(app).post('/api/v1/auth/register').send(testUser);
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: testUser.email, password: testUser.password });
  return res.body.data?.accessToken || '';
};

// ============ AUTH TESTS ============

describe('Auth Endpoints', () => {
  /**
   * Test: POST /api/v1/auth/register
   * Demonstrates: testing POST with body, status code assertion, response shape
   */
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should reject duplicate email', async () => {
      // Register once
      await request(app).post('/api/v1/auth/register').send(testUser);

      // Register again with same email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, email: 'notanemail' });

      expect(res.status).toBe(400);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, password: '123' });

      expect(res.status).toBe(400);
    });
  });

  /**
   * Test: POST /api/v1/auth/login
   */
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword!' });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123!' });

      expect(res.status).toBe(401);
    });
  });
});

// ============ EVENTS TESTS ============

describe('Events Endpoints', () => {
  const testEvent = {
    title: 'Test Hackathon',
    description: 'A test hackathon event for integration testing.',
    category: 'hackathon',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    location: {
      venue: 'Test Venue',
      city: 'Bangalore',
      country: 'India',
      isVirtual: false,
    },
    capacity: 100,
    tags: ['testing', 'jest'],
  };

  /**
   * Test: GET /api/v1/events (public)
   */
  describe('GET /api/v1/events', () => {
    it('should return an array of events', async () => {
      const res = await request(app)
        .get('/api/v1/events')
        .expect('Content-Type', /json/);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const res = await request(app)
        .get('/api/v1/events?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
    });
  });

  /**
   * Test: POST /api/v1/events (protected — organizer only)
   */
  describe('POST /api/v1/events', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send(testEvent);

      expect(res.status).toBe(401);
    });

    it('should create event when authenticated as organizer', async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(testEvent);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testEvent.title);
    });

    it('should reject event without required fields', async () => {
      const token = await getAuthToken();

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Missing fields' });

      expect(res.status).toBe(400);
    });
  });

  /**
   * Test: GET /api/v1/events/:id
   */
  describe('GET /api/v1/events/:id', () => {
    it('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/events/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return event by ID', async () => {
      const token = await getAuthToken();

      // Create an event first
      const createRes = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(testEvent);

      const eventId = createRes.body.data._id;

      // Get by ID
      const res = await request(app).get(`/api/v1/events/${eventId}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(eventId);
      expect(res.body.data.title).toBe(testEvent.title);
    });
  });
});

// ============ HEALTH CHECK TEST ============

describe('Health Check', () => {
  it('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('running');
  });
});
