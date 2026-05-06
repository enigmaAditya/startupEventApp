# Quick Revision: Detailed Backend Presentation

Use this file only for fast revision of:
- Part 2: Event Management
- Part 3: User Management
- Part 6: Real-Time Communication
- Part 7: Middleware and Utilities

If you forget anything in viva, use this answer format:

“It is implemented in `X` file, used for `Y`, and its purpose is `Z`.”

---

## Part 2: Event Management

**Main files:**
- `src/routes/eventRoutes.js`
- `src/controllers/eventController.js`
- `src/models/Event.js`
- `src/models/RSVP.js`

**What to remember:**
- `getEvents`:
  - builds dynamic filters
  - supports search, city, category, status, organizer
  - public users cannot see `pending-approval` or `hidden` events
  - organizers can see their own hidden events
  - admins can see everything
  - uses `paginate` middleware

- `createEvent`:
  - checks validation using `express-validator`
  - sets `req.body.organizer = req.user._id`
  - unverified organizer events become `pending-approval`
  - adds event to `eventsOrganized`
  - emits `event:created`

- `updateEvent`:
  - owner or admin can update
  - owner updates normal content
  - admin mainly updates moderation fields

- `deleteEvent`:
  - owner or admin can delete
  - deletes RSVPs too
  - removes event from organizer and attendees arrays

- `rsvpToEvent`:
  - organizers cannot RSVP
  - checks `isFullyBooked`
  - duplicate RSVP prevented by unique index on `{ user, event }`
  - uses `event.addAttendee()`
  - emits `event:rsvp`

**Best 3 viva points:**
- role-based event visibility
- duplicate RSVP prevention
- cleanup on delete

---

## Part 3: User Management

**Main files:**
- `src/routes/userRoutes.js`
- `src/controllers/userController.js`
- `src/models/User.js`

**What to remember:**
- `updateMe`:
  - only allows safe fields
  - `firstName`, `lastName`, `bio`, `interests`, `avatar`
  - prevents role change through profile API

- `getAllUsers`:
  - admin-only
  - supports role filter and search
  - uses `$or` and `$regex`

- `updateUserRole`:
  - admin-only
  - valid roles: `attendee`, `organizer`, `admin`
  - if role becomes `attendee`, `organizerStatus` becomes `none`

- `requestOrganizerAccess`:
  - sets `organizerStatus = 'pending'`
  - if previously rejected, user must wait 20 days

- `verifyOrganizer`:
  - admin sends `verified` or `rejected`
  - verified → role becomes `organizer`
  - rejected → role becomes `attendee`

**Best 3 viva points:**
- whitelist-based profile update
- admin search and role control
- 20-day organizer cooldown

---

## Part 6: Real-Time Communication

**Main file:**
- `src/sockets/index.js`

**What to remember:**
- Socket.IO is attached to the HTTP server
- uses rooms like `event:${eventId}`
- `join:event`:
  - joins event room
  - checks organizer ownership if user claims organizer role
  - sends old `chatHistory`

- `chat:message`:
  - blocks guest users if `userId` is missing
  - saves message to event `chatHistory`
  - broadcasts to same room

- exported helpers:
  - `emitNotification`
  - `emitToEventRoom`

**Important accuracy point:**
- code checks organizer ownership on join
- code blocks guests from sending messages
- code does not fully verify attendee membership for every normal user joining room

**Best 3 viva points:**
- room-based chat
- organizer verification
- persistent chat history

---

## Part 7: Middleware and Utilities

**Main files:**
- `src/middlewares/errorHandler.js`
- `src/middlewares/paginate.js`
- `src/middlewares/rateLimiter.js`
- `src/middlewares/validators/`

**What to remember:**
- `ApiError`:
  - custom error class
  - has `statusCode`
  - has `isOperational`
  - factory helpers like `badRequest()`, `notFound()`, `conflict()`

- `errorHandler`:
  - global Express error middleware
  - handles `ValidationError`
  - handles duplicate key `11000`
  - handles `CastError`
  - handles JWT errors

- validation:
  - done with `express-validator`
  - rules are applied before controller
  - controller checks `validationResult(req)`

- `paginate`:
  - reads `page` and `limit`
  - computes `skip`
  - stores values in `req.pagination`

- `rateLimiter`:
  - protects `/api/` routes
  - prevents abuse

**Best 3 viva points:**
- centralized error handling
- validation before controller logic
- reusable pagination

---

## 10 Most Important Names to Remember

- `protect`
- `authorize`
- `paginate`
- `ApiError`
- `errorHandler`
- `getEvents`
- `rsvpToEvent`
- `updateMe`
- `requestOrganizerAccess`
- `initializeSocketIO`

---

## 10 Fast Viva Answers

### “Where did you use pagination?”
- In `src/routes/eventRoutes.js` and `src/middlewares/paginate.js`, mainly for `getEvents`.

### “Where did you use role-based access?”
- In `authorize.js`, `eventRoutes.js`, `userRoutes.js`, and analytics routes.

### “Where did you use JWT?”
- In auth flow and `protect` middleware.

### “Where did you use validation?”
- In auth and event validators, then checked with `validationResult(req)` in controllers.

### “How did you prevent duplicate RSVP?”
- Unique compound index in `src/models/RSVP.js` on `{ user, event }`.

### “How did you prevent unauthorized profile changes?”
- In `updateMe`, I used allowed field whitelisting.

### “How did you manage organizer applications?”
- With `requestOrganizerAccess`, `verifyOrganizer`, and `organizerRejectionDate` cooldown logic.

### “Where did you use WebSockets?”
- In `src/sockets/index.js` with Socket.IO rooms.

### “How is chat stored?”
- In `chatHistory` inside the Event model.

### “Where did you use centralized error handling?”
- In `src/middlewares/errorHandler.js`, mounted in `src/app.js`.

---

## Final 30-Second Summary

“My backend presentation covers event management, user management, real-time communication, and middleware. For events, I implemented filtering, role-based visibility, update control, delete cleanup, and RSVP protection. For users, I added safe profile updates, admin controls, and organizer approval flow. For real-time features, I used Socket.IO event rooms and chat persistence. For middleware, I used centralized error handling, validation, pagination, and rate limiting.”
