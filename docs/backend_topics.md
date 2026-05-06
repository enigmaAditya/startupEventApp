# StartupEvents Backend Topics Overview

This file is a presentation-friendly overview of the major backend modules in the `startupEventApp` project. I rewrote it to reflect the actual codebase more accurately and to make it easier to use when dividing the backend into presentation parts.

---

## 1. Security and Identity

**Main files:**
- `src/routes/authRoutes.js`
- `src/controllers/authController.js`
- `src/middlewares/auth.js`
- `src/middlewares/authorize.js`
- `src/models/User.js`

**What is implemented:**
- User registration, login, logout, and password update.
- JWT-based authentication using access and refresh tokens.
- Token delivery through both cookies and JSON response payloads.
- Password hashing with `bcryptjs` through a Mongoose pre-save hook.
- Role-based access control using middleware for roles like `attendee`, `organizer`, and `admin`.

**Important code-level details:**
- The `protect` middleware accepts tokens from either the `Authorization` header or cookies.
- The `authorize(...roles)` middleware is a higher-order function that checks whether the logged-in user has one of the allowed roles.
- During registration, a user can be created with a requested role, and if that role is `organizer`, the initial `organizerStatus` becomes `pending`.

**Natural way to say this:**

“The backend has a full authentication and authorization layer. I used JWT for session handling, bcrypt for password hashing, and middleware-based RBAC so protected routes can allow only the right roles.”

---

## 2. Event Management

**Main files:**
- `src/routes/eventRoutes.js`
- `src/controllers/eventController.js`
- `src/models/Event.js`
- `src/models/RSVP.js`
- `src/models/Review.js`
- `src/controllers/reviewController.js`

**What is implemented:**
- Event CRUD operations.
- Filtering, pagination, text search, and role-aware visibility rules.
- RSVP registration with duplicate protection.
- Review submission and retrieval for events.
- Chat history clearing for an event.

**Important code-level details:**
- Public users do not see events with `status: 'pending-approval'` or `moderationStatus: 'hidden'`.
- Organizers can see their own hidden events, and admins can see everything.
- Duplicate RSVPs are prevented by a compound unique index on `{ user, event }`.
- The Event model uses Mongoose virtuals like `attendeeCount`, `spotsRemaining`, and `isFullyBooked`.
- The Event model also defines instance methods like `addAttendee()` and static methods like `findUpcoming()` and `search()`.

**Natural way to say this:**

“Event management is one of the core backend modules. It covers CRUD, search, visibility control, RSVP handling, and review support, with a mix of controller logic plus database-level constraints for safety.”

---

## 3. User Management

**Main files:**
- `src/routes/userRoutes.js`
- `src/controllers/userController.js`
- `src/models/User.js`

**What is implemented:**
- Current-user profile retrieval and update.
- Admin search and role management.
- Account activation or deactivation.
- Organizer application, verification, rejection, and revocation flow.

**Important code-level details:**
- Normal users can update only whitelisted profile fields such as `firstName`, `lastName`, `bio`, `interests`, and `avatar`.
- Admins can search users across `firstName`, `lastName`, and `email`.
- If an organizer application is rejected, the backend enforces a 20-day cooldown before re-applying.
- The user model also stores relational arrays like `eventsOrganized` and `eventsAttending`.

**Natural way to say this:**

“User management is designed around controlled updates and clear role transitions. I separated normal profile actions from admin-only actions and added a proper organizer approval workflow.”

---

## 4. Artificial Intelligence Features

**Main files:**
- `src/routes/aiRoutes.js`
- `src/controllers/aiController.js`
- `src/services/aiService.js`

**What is implemented:**
- AI availability/status check.
- AI-based event recommendations from user interests.
- AI-assisted event description enhancement.
- Semantic event search.
- Full event draft generation from a short prompt.

**Important code-level details:**
- The AI layer uses the `openai` package only if it is installed and `OPENAI_API_KEY` is configured.
- If OpenAI is not available, the service falls back to mock outputs so development still works.
- The service uses chat completions for recommendations, description generation, and event draft generation.
- It also uses embeddings for semantic search when AI is available.

**Accuracy note:**

Some route comments say “Organizer” access, but in the current route middleware, `enhance-description` and `generate-draft` are protected only by authentication, not by an explicit organizer-only authorization middleware.

**Natural way to say this:**

“The backend also includes an AI integration layer. It can enhance event descriptions, generate event drafts, run semantic search, and provide recommendations, while still falling back gracefully to mock behavior if no OpenAI key is configured.”

---

## 5. Recommendations

**Main files:**
- `src/routes/recommendationRoutes.js`
- `src/controllers/recommendationController.js`
- `src/models/Event.js`
- `src/models/RSVP.js`

**What is implemented:**
- Personalized recommendation of upcoming events based on a user’s RSVP history.

**Important code-level details:**
- This route is protected and works only for logged-in users.
- The current recommendation engine is not using OpenAI.
- It is a rule-based scoring system built from RSVP behavior:
  - preferred categories,
  - repeated tags,
  - frequent cities,
  - event urgency,
  - and featured-event bonus.
- The controller requires at least 3 confirmed RSVPs before generating meaningful recommendations.

**Natural way to say this:**

“Besides the OpenAI features, I also built a separate recommendation module that uses behavior-based scoring. It studies the user’s confirmed RSVPs and recommends future events based on category, tags, city, and engagement patterns.”

---

## 6. Data and Analytics

**Main files:**
- `src/routes/analyticsRoutes.js`
- `src/controllers/analyticsController.js`
- `src/services/analyticsService.js`
- `src/models/EventAnalytics.js`
- `src/models/UserActivity.js`

**What is implemented:**
- Organizer analytics API.
- Event analytics model for views, unique views, RSVPs, shares, and traffic sources.
- User activity model for actions like view, RSVP, share, search, create event, and login.
- Aggregation-ready service methods for trends, top events, dashboard stats, and activity summaries.

**Important code-level details:**
- The currently exposed API route is `GET /api/v1/analytics/organizer`, and it is protected for organizers and admins.
- `EventAnalytics` stores daily per-event metrics and uses a unique compound index on `{ event, date }`.
- `UserActivity` uses a TTL index so activity records can automatically expire after 90 days.
- The analytics service contains more capabilities than the controller currently exposes through routes.

**Natural way to say this:**

“For analytics, I modeled both event-level metrics and user activity logs. The current API gives organizers a summary of their performance, but the service layer also includes richer aggregation methods for trends and dashboard-style reporting.”

---

## 7. Real-Time Communication

**Main files:**
- `src/sockets/index.js`

**What is implemented:**
- Socket.IO server initialization.
- Event-specific chat rooms.
- Organizer ownership check on room join.
- Guest-blocking for message sending.
- Chat history persistence inside the Event document.
- Reusable socket helper functions for app-wide notifications.

**Important code-level details:**
- Each event chat uses a room name like `event:${eventId}`.
- The join handler supports both legacy string payloads and object payloads.
- If a user claims to be the organizer, the socket layer verifies that against the event record.
- Messages are stored in `chatHistory` on the Event model.

**Accuracy note:**

The current socket implementation verifies organizer ownership and blocks guests from sending messages, but it does not fully verify attendee membership for every non-organizer who joins a room.

**Natural way to say this:**

“Real-time communication is handled with Socket.IO rooms, so every event can have its own live chat channel. I added basic security checks and also persist messages so chat history is not lost.”

---

## 8. Middleware and Shared Utilities

**Main files:**
- `src/middlewares/errorHandler.js`
- `src/middlewares/paginate.js`
- `src/middlewares/rateLimiter.js`
- `src/middlewares/validators/`
- `src/utils/appEvents.js`
- `src/utils/logger.js`

**What is implemented:**
- Centralized API error handling.
- Request validation with `express-validator`.
- Reusable pagination middleware and response formatting.
- API rate limiting.
- Internal event bus for app-level events.
- Structured logging.

**Important code-level details:**
- The custom `ApiError` class standardizes operational errors.
- The global error handler normalizes Mongoose, JWT, and duplicate-key failures.
- The pagination middleware injects `req.pagination`.
- `appEvents` is used for internal backend-side events such as user registration, event creation, and RSVP activity.

**Natural way to say this:**

“Middleware and utilities are what keep the rest of the backend clean. I centralized validation, pagination, rate limiting, error handling, and internal event signaling so controllers stay focused on business logic.”

---

## 9. Database Handling with MongoDB and Mongoose

**Main files:**
- `src/config/database.js`
- `src/models/Event.js`
- `src/models/User.js`
- `src/models/RSVP.js`
- `src/models/Review.js`
- `src/models/EventAnalytics.js`
- `src/models/UserActivity.js`

**What is implemented:**
- MongoDB connection setup with retry and recovery behavior.
- Rich Mongoose schemas with validation, enums, indexes, virtuals, static methods, and instance methods.
- ObjectId-based relationships across users, events, RSVPs, reviews, and analytics.
- Population of related documents for richer API responses.

**Important code-level details:**
- The DB connection layer retries on failure and listens for disconnect/error events on `mongoose.connection`.
- Text indexing is used on events for full-text search.
- Multiple models use compound indexes for correctness or performance.
- `populate()` is used in several controllers to resolve linked users, organizers, attendees, and events.

**Natural way to say this:**

“On the database side, I used MongoDB with Mongoose not just for basic CRUD, but for stronger modeling. I used schema validation, virtual fields, indexes, custom model methods, and relationship population to keep the data layer expressive and efficient.”

---

## 10. Application Setup and Routing

**Main files:**
- `src/app.js`
- `src/server.js`

**What is implemented:**
- Express app initialization.
- Middleware stack setup.
- Route mounting with API versioning.
- Health check endpoint.
- Static frontend serving behavior depending on environment.

**Important code-level details:**
- The app uses `helmet`, `cors`, `cookie-parser`, `morgan`, JSON parsing, URL-encoded parsing, and rate limiting.
- API routes are mounted under `/api/v1/...`.
- There is also a `/api/health` endpoint for service health checks.
- In production, the backend serves the built frontend; in development, it serves frontend source/static assets.

**Natural way to say this:**

“At the application level, I set up Express with a structured middleware stack, versioned API routes, logging, CORS, and health monitoring, so the backend is easier to deploy and maintain.”

---

## Simple Presentation Split Suggestion

If you want to divide the backend into 3 presentation parts, this is a clean split:

1. **Part A: Core Platform**
   - Security and Identity
   - User Management
   - Event Management

2. **Part B: Smart Features**
   - AI Features
   - Recommendations
   - Analytics

3. **Part C: Infrastructure and Engineering**
   - Real-Time Communication
   - Middleware and Utilities
   - Database Handling
   - App Setup and Routing

---

## Final Short Summary

“The StartupEvents backend includes authentication, role-based access control, event and user management, AI-assisted features, recommendation logic, analytics, real-time chat, reusable middleware, and structured MongoDB data modeling. The architecture is modular, with separate routes, controllers, services, models, and middleware so each part of the backend stays maintainable and presentation-friendly.”
