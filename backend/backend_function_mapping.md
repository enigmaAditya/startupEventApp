# StartupEvents Backend Function and Middleware Mapping

This file is a viva-style reference sheet for the backend. Use it when a teacher asks:

- “Where did you use this middleware?”
- “Where is this function called?”
- “Which file contains this logic?”
- “Where did you use virtuals, static methods, instance methods, or EventEmitter?”

The goal is simple: for every important backend concept, this file tells you **what it is**, **where it is defined**, **where it is used**, and **what to say about it**.

---

## 1. Middleware Mapping

### `protect` middleware

**Defined in:**
- `src/middlewares/auth.js`

**Used in:**
- `src/routes/authRoutes.js`
  - `POST /logout`
  - `PUT /update-password`
- `src/routes/eventRoutes.js`
  - `POST /`
  - `PUT /:id`
  - `DELETE /:id`
  - `POST /:id/rsvp`
  - `POST /:id/reviews`
  - `DELETE /:id/chat`
- `src/routes/userRoutes.js`
  - applied globally with `router.use(protect)`
- `src/routes/analyticsRoutes.js`
  - applied globally with `router.use(protect)`
- `src/routes/aiRoutes.js`
  - `GET /recommendations`
  - `POST /enhance-description`
  - `POST /generate-draft`
- `src/routes/recommendationRoutes.js`
  - `GET /`

**What it does:**
- Verifies the JWT.
- Reads token from `Authorization` header or cookie.
- Fetches the user from DB.
- Attaches user to `req.user`.

**One-line viva answer:**

“`protect` is my authentication middleware. I used it on all private routes so only logged-in users can access them.”

---

### `authorize(...roles)` middleware

**Defined in:**
- `src/middlewares/authorize.js`

**Used in:**
- `src/routes/eventRoutes.js`
  - `POST /` with `authorize('organizer', 'admin')`
  - `PUT /:id` with `authorize('organizer', 'admin')`
  - `DELETE /:id` with `authorize('organizer', 'admin')`
  - `DELETE /:id/chat` with `authorize('organizer', 'admin')`
- `src/routes/userRoutes.js`
  - `GET /` with `authorize('admin')`
  - `PATCH /:id/role` with `authorize('admin')`
  - `PATCH /:id/status` with `authorize('admin')`
  - `PATCH /:id/verify` with `authorize('admin')`
- `src/routes/analyticsRoutes.js`
  - applied globally with `authorize('organizer', 'admin')`

**What it does:**
- Checks whether the logged-in user’s role is in the allowed role list.

**One-line viva answer:**

“`authorize` is my RBAC middleware. I used it after `protect` to restrict routes based on role.”

---

### `paginate` middleware

**Defined in:**
- `src/middlewares/paginate.js`

**Used in:**
- `src/routes/eventRoutes.js`
  - `GET /` with `eventQueryRules, paginate, getEvents`

**What it does:**
- Reads `page` and `limit` from query params.
- Computes `skip`.
- Stores pagination data in `req.pagination`.

**One-line viva answer:**

“`paginate` is my reusable pagination middleware. I used it in the event listing route to avoid repeating pagination logic in controllers.”

---

### `rateLimiter` middleware

**Defined in:**
- `src/middlewares/rateLimiter.js`

**Used in:**
- `src/app.js`
  - `app.use('/api/', rateLimiter)`

**What it does:**
- Limits how many API requests one client can make in a time window.

**One-line viva answer:**

“`rateLimiter` is applied at app level for all `/api/` routes to protect the backend from abuse and brute-force traffic.”

---

### `errorHandler` middleware

**Defined in:**
- `src/middlewares/errorHandler.js`

**Used in:**
- `src/app.js`
  - `app.use(errorHandler)`

**What it does:**
- Centralized global error response handler.
- Converts Mongoose errors, JWT errors, and duplicate-key errors into clean API responses.

**One-line viva answer:**

“`errorHandler` is my centralized Express error middleware. It is mounted at the end of the app so all controller and middleware errors come through one place.”

---

### `notFoundHandler`

**Defined in:**
- `src/middlewares/errorHandler.js`

**Used in:**
- `src/app.js`
  - `app.all('{*path}', notFoundHandler)`

**What it does:**
- Handles undefined routes and returns a 404 through `ApiError.notFound()`.

---

### `registerRules`

**Defined in:**
- `src/middlewares/validators/authValidator.js`

**Used in:**
- `src/routes/authRoutes.js`
  - `POST /register`

**What it validates:**
- `firstName`, `lastName`, `email`, `password`, optional `role`

---

### `loginRules`

**Defined in:**
- `src/middlewares/validators/authValidator.js`

**Used in:**
- `src/routes/authRoutes.js`
  - `POST /login`

**What it validates:**
- `email`, `password`

---

### `updatePasswordRules`

**Defined in:**
- `src/middlewares/validators/authValidator.js`

**Used in:**
- `src/routes/authRoutes.js`
  - `PUT /update-password`

**What it validates:**
- `currentPassword`, `newPassword`

---

### `createEventRules`

**Defined in:**
- `src/middlewares/validators/eventValidator.js`

**Used in:**
- `src/routes/eventRoutes.js`
  - `POST /`

**What it validates:**
- event title, description, category, date, location, capacity, tags

---

### `updateEventRules`

**Defined in:**
- `src/middlewares/validators/eventValidator.js`

**Used in:**
- `src/routes/eventRoutes.js`
  - `PUT /:id`

---

### `eventQueryRules`

**Defined in:**
- `src/middlewares/validators/eventValidator.js`

**Used in:**
- `src/routes/eventRoutes.js`
  - `GET /`

**What it validates:**
- `page`, `limit`, `category`

---

## 2. Route to Controller Mapping

### Auth routes

- `POST /api/v1/auth/register` → `register` in `src/controllers/authController.js`
- `POST /api/v1/auth/login` → `login`
- `POST /api/v1/auth/logout` → `logout`
- `PUT /api/v1/auth/update-password` → `updatePassword`

### Event routes

- `GET /api/v1/events` → `getEvents` in `src/controllers/eventController.js`
- `GET /api/v1/events/:id` → `getEvent`
- `POST /api/v1/events` → `createEvent`
- `PUT /api/v1/events/:id` → `updateEvent`
- `DELETE /api/v1/events/:id` → `deleteEvent`
- `POST /api/v1/events/:id/rsvp` → `rsvpToEvent`
- `GET /api/v1/events/:id/reviews` → `getEventReviews` in `src/controllers/reviewController.js`
- `POST /api/v1/events/:id/reviews` → `addReview`
- `DELETE /api/v1/events/:id/chat` → `clearEventChat`

### User routes

- `GET /api/v1/users/me` → `getMe` in `src/controllers/userController.js`
- `PUT /api/v1/users/me` → `updateMe`
- `POST /api/v1/users/request-organizer` → `requestOrganizerAccess`
- `POST /api/v1/users/revoke-application` → `revokeApplication`
- `GET /api/v1/users` → `getAllUsers`
- `PATCH /api/v1/users/:id/role` → `updateUserRole`
- `PATCH /api/v1/users/:id/status` → `toggleUserStatus`
- `PATCH /api/v1/users/:id/verify` → `verifyOrganizer`

### Analytics routes

- `GET /api/v1/analytics/organizer` → `getOrganizerAnalytics` in `src/controllers/analyticsController.js`

### AI routes

- `GET /api/v1/ai/status` → inline route logic in `src/routes/aiRoutes.js`
- `GET /api/v1/ai/recommendations` → inline route logic in `src/routes/aiRoutes.js`
- `POST /api/v1/ai/enhance-description` → inline route logic in `src/routes/aiRoutes.js`
- `GET /api/v1/ai/search` → inline route logic in `src/routes/aiRoutes.js`
- `POST /api/v1/ai/generate-draft` → `generateDraft` in `src/controllers/aiController.js`

### Recommendation routes

- `GET /api/v1/recommendations` → `getRecommendations` in `src/controllers/recommendationController.js`

---

## 3. Controller Function Mapping

### `register`

**Defined in:**
- `src/controllers/authController.js`

**Used by:**
- `POST /api/v1/auth/register`

**What it does:**
- validates input
- checks duplicate email
- creates user
- sets organizer status if needed
- emits `user:registered`
- sends access and refresh token response

---

### `login`

**Defined in:**
- `src/controllers/authController.js`

**Used by:**
- `POST /api/v1/auth/login`

**Special functions used inside it:**
- `User.findByEmail()`
- `user.comparePassword()`
- `sendTokenResponse()`

---

### `logout`

**Defined in:**
- `src/controllers/authController.js`

**Used by:**
- `POST /api/v1/auth/logout`

**What it does:**
- clears auth cookies

---

### `updatePassword`

**Defined in:**
- `src/controllers/authController.js`

**Used by:**
- `PUT /api/v1/auth/update-password`

**Special functions used inside it:**
- `validationResult(req)`
- `user.comparePassword()`
- Mongoose pre-save hook for password hashing

---

### `getEvents`

**Defined in:**
- `src/controllers/eventController.js`

**Used by:**
- `GET /api/v1/events`

**What it demonstrates:**
- filtering
- role-based visibility
- full-text search
- pagination
- `populate()`
- `paginatedResponse()`

---

### `getEvent`

**Defined in:**
- `src/controllers/eventController.js`

**Used by:**
- `GET /api/v1/events/:id`

**What it does:**
- fetches one event
- populates organizer and attendees

---

### `createEvent`

**Defined in:**
- `src/controllers/eventController.js`

**Used by:**
- `POST /api/v1/events`

**Special things used inside it:**
- `validationResult(req)`
- `User.findByIdAndUpdate(...$addToSet...)`
- `appEvents.emit('event:created', ...)`

---

### `updateEvent`

**Defined in:**
- `src/controllers/eventController.js`

**Used by:**
- `PUT /api/v1/events/:id`

**What it demonstrates:**
- ownership check
- admin moderation control
- field-level authorization

---

### `deleteEvent`

**Defined in:**
- `src/controllers/eventController.js`

**Used by:**
- `DELETE /api/v1/events/:id`

**Special queries used inside it:**
- `Event.findByIdAndDelete()`
- `RSVP.deleteMany()`
- `User.findByIdAndUpdate(...$pull...)`
- `User.updateMany(...$pull...)`

---

### `rsvpToEvent`

**Defined in:**
- `src/controllers/eventController.js`

**Used by:**
- `POST /api/v1/events/:id/rsvp`

**Special functions used inside it:**
- Event virtual `isFullyBooked`
- `RSVP.create()`
- `event.addAttendee()`
- `User.findByIdAndUpdate(...$addToSet...)`
- `appEvents.emit('event:rsvp', ...)`

---

### `clearEventChat`

**Defined in:**
- `src/controllers/eventController.js`

**Used by:**
- `DELETE /api/v1/events/:id/chat`

**What it does:**
- clears `chatHistory` for an event after owner/admin check

---

### `addReview`

**Defined in:**
- `src/controllers/reviewController.js`

**Used by:**
- `POST /api/v1/events/:id/reviews`

**Special functions used inside it:**
- `event.syncStatus()`
- attendee check with `event.attendees`
- `Review.create()`

---

### `getEventReviews`

**Defined in:**
- `src/controllers/reviewController.js`

**Used by:**
- `GET /api/v1/events/:id/reviews`

---

### `getMe`

**Defined in:**
- `src/controllers/userController.js`

**Used by:**
- `GET /api/v1/users/me`

**Special query used inside it:**
- `populate('eventsOrganized')`
- `populate('eventsAttending')`

---

### `updateMe`

**Defined in:**
- `src/controllers/userController.js`

**Used by:**
- `PUT /api/v1/users/me`

**What it demonstrates:**
- whitelist-based update security

---

### `getAllUsers`

**Defined in:**
- `src/controllers/userController.js`

**Used by:**
- `GET /api/v1/users`

**Special logic:**
- admin search with `$or` and `$regex`

---

### `updateUserRole`

**Defined in:**
- `src/controllers/userController.js`

**Used by:**
- `PATCH /api/v1/users/:id/role`

---

### `toggleUserStatus`

**Defined in:**
- `src/controllers/userController.js`

**Used by:**
- `PATCH /api/v1/users/:id/status`

---

### `requestOrganizerAccess`

**Defined in:**
- `src/controllers/userController.js`

**Used by:**
- `POST /api/v1/users/request-organizer`

**Special logic:**
- 20-day rejection cooldown using `organizerRejectionDate`

---

### `revokeApplication`

**Defined in:**
- `src/controllers/userController.js`

**Used by:**
- `POST /api/v1/users/revoke-application`

---

### `verifyOrganizer`

**Defined in:**
- `src/controllers/userController.js`

**Used by:**
- `PATCH /api/v1/users/:id/verify`

---

### `getOrganizerAnalytics`

**Defined in:**
- `src/controllers/analyticsController.js`

**Used by:**
- `GET /api/v1/analytics/organizer`

**What it does:**
- computes organizer/admin analytics summary from Event and RSVP data

---

### `generateDraft`

**Defined in:**
- `src/controllers/aiController.js`

**Used by:**
- `POST /api/v1/ai/generate-draft`

**What it does:**
- validates `prompt`
- calls `aiService.generateEventDraft(prompt)`

---

### `getRecommendations` in recommendation controller

**Defined in:**
- `src/controllers/recommendationController.js`

**Used by:**
- `GET /api/v1/recommendations`

**What it does:**
- creates personalized recommendations from confirmed RSVP history

---

## 4. Model Methods, Virtuals, Hooks, and Where They Are Used

### User model methods

#### `comparePassword()`

**Defined in:**
- `src/models/User.js`

**Used in:**
- `login` in `src/controllers/authController.js`
- `updatePassword` in `src/controllers/authController.js`

**What it does:**
- compares plain password with hashed password using bcrypt

---

#### `generateAccessToken()`

**Defined in:**
- `src/models/User.js`

**Used in:**
- `sendTokenResponse()` inside `src/controllers/authController.js`

---

#### `generateRefreshToken()`

**Defined in:**
- `src/models/User.js`

**Used in:**
- `sendTokenResponse()` inside `src/controllers/authController.js`

---

#### `findByEmail()`

**Defined in:**
- `src/models/User.js`

**Used in:**
- `login` in `src/controllers/authController.js`

---

#### password pre-save hook

**Defined in:**
- `src/models/User.js`

**Triggered when:**
- creating a user in `register`
- saving a changed password in `updatePassword`

**What it does:**
- hashes password before save

---

### Event model virtuals

#### `attendeeCount`

**Defined in:**
- `src/models/Event.js`

**Used in:**
- event JSON/object output
- also manually recalculated in `getEvents` and `getEvent`

---

#### `spotsRemaining`

**Defined in:**
- `src/models/Event.js`

**Used in:**
- supports booking logic and event computed output

---

#### `isFullyBooked`

**Defined in:**
- `src/models/Event.js`

**Used in:**
- `rsvpToEvent` in `src/controllers/eventController.js`
- `addAttendee()` in `src/models/Event.js`

---

### Event model instance methods

#### `addAttendee(userId)`

**Defined in:**
- `src/models/Event.js`

**Used in:**
- `rsvpToEvent` in `src/controllers/eventController.js`

**What it does:**
- prevents overbooking
- prevents duplicate attendee
- pushes attendee into array

---

#### `removeAttendee(userId)`

**Defined in:**
- `src/models/Event.js`

**Used in:**
- currently defined but not called in the checked backend code

---

#### `syncStatus()`

**Defined in:**
- `src/models/Event.js`

**Used in:**
- `addReview` in `src/controllers/reviewController.js`

**What it does:**
- marks event completed when end date or date is in the past

---

### Event model static methods

#### `findUpcoming(filters, page, limit)`

**Defined in:**
- `src/models/Event.js`

**Used in:**
- currently defined but not called in the checked backend code

---

#### `search(searchText)`

**Defined in:**
- `src/models/Event.js`

**Used in:**
- currently defined but not called directly in the checked backend code
- similar search logic is implemented directly in `getEvents`

---

### EventAnalytics model static methods

#### `trackView(eventId, source)`

**Defined in:**
- `src/models/EventAnalytics.js`

**Used in:**
- `analyticsService.trackEventView()`

---

#### `getDailyTrend(eventId, days)`

**Defined in:**
- `src/models/EventAnalytics.js`

**Used in:**
- `analyticsService.getEventAnalytics()`

---

#### `getSourceBreakdown(eventId)`

**Defined in:**
- `src/models/EventAnalytics.js`

**Used in:**
- `analyticsService.getEventAnalytics()`

---

#### `getTopByViews(limit)`

**Defined in:**
- `src/models/EventAnalytics.js`

**Used in:**
- `analyticsService.getTopEvents()`

---

### UserActivity model static methods

#### `log(data)`

**Defined in:**
- `src/models/UserActivity.js`

**Used in:**
- `analyticsService.logActivity()`

---

#### `getUserFeed(userId, limit)`

**Defined in:**
- `src/models/UserActivity.js`

**Used in:**
- `analyticsService.getUserActivity()`

---

#### `getMostActiveUsers(limit)`

**Defined in:**
- `src/models/UserActivity.js`

**Used in:**
- `analyticsService.getMostActiveUsers()`

---

#### `getActivitySummary(since)`

**Defined in:**
- `src/models/UserActivity.js`

**Used in:**
- `analyticsService.getDashboardStats()`
- `analyticsService.getPlatformActivity()`

---

## 5. Service Layer Mapping

### `aiService`

**Defined in:**
- `src/services/aiService.js`

**Functions:**
- `isAIAvailable()`
- `getRecommendations(userInterests, availableEvents)`
- `enhanceDescription(eventData)`
- `semanticSearch(query, events)`
- `generateEventDraft(userPrompt)`

**Used in:**
- `src/routes/aiRoutes.js`
- `src/controllers/aiController.js`

**Viva point:**

“AI logic is separated into a service layer so route/controller code stays clean and external API logic stays centralized.”

---

### `analyticsService`

**Defined in:**
- `src/services/analyticsService.js`

**Functions:**
- `trackEventView()`
- `getDashboardStats()`
- `getEventAnalytics()`
- `getTopEvents()`
- `logActivity()`
- `getUserActivity()`
- `getMostActiveUsers()`
- `getPlatformActivity()`

**Used in:**
- not currently wired into the checked routes/controllers we reviewed for organizer analytics
- it exists as a reusable service layer for analytics-related business logic

**Viva point:**

“I also created an analytics service layer for aggregation-heavy logic, even though not every method is exposed directly through the current route set.”

---

## 6. Utility and Event Bus Mapping

### `appEvents`

**Defined in:**
- `src/utils/appEvents.js`

**Events emitted from controllers:**
- `user:registered`
  - emitted in `register` inside `src/controllers/authController.js`
- `event:created`
  - emitted in `createEvent` inside `src/controllers/eventController.js`
- `event:rsvp`
  - emitted in `rsvpToEvent` inside `src/controllers/eventController.js`

**Default listeners registered in:**
- `src/utils/appEvents.js`

**What it does:**
- provides internal event-driven backend communication using Node.js `EventEmitter`

**One-line viva answer:**

“I used `appEvents` as an internal EventEmitter so controllers can trigger backend-side side effects without tightly coupling everything together.”

---

### `logger`

**Defined in:**
- `src/utils/logger.js`

**Used in many places:**
- database connection
- app request logging
- server startup
- socket handling
- analytics/review/event error logging

**What it does:**
- centralized logging utility for debug/info/warn/error/http logs

---

### `emitNotification(eventName, data)`

**Defined in:**
- `src/sockets/index.js`

**Used in checked code:**
- exported for reuse, but no direct usage found in the scanned backend files

---

### `emitToEventRoom(eventId, eventName, data)`

**Defined in:**
- `src/sockets/index.js`

**Used in checked code:**
- exported for reuse, but no direct usage found in the scanned backend files

---

### `compressFile`, `decompressFile`, `compressOldLogs`

**Defined in:**
- `src/utils/compressor.js`

**Used in checked code:**
- no direct usage found in the scanned backend files

---

## 7. Socket Mapping

### `initializeSocketIO(server)`

**Defined in:**
- `src/sockets/index.js`

**Used in:**
- `src/server.js`

**What it does:**
- attaches Socket.IO to the HTTP server

---

### `join:event`

**Defined in:**
- socket handler in `src/sockets/index.js`

**What it does:**
- joins user to `event:${eventId}` room
- verifies organizer ownership if role is organizer
- sends chat history

---

### `chat:message`

**Defined in:**
- socket handler in `src/sockets/index.js`

**What it does:**
- blocks guest messages without `userId`
- saves message to Event `chatHistory`
- emits to room

---

### `chat:typing`

**Defined in:**
- socket handler in `src/sockets/index.js`

**What it does:**
- broadcasts typing indicator to other users in event room

---

## 8. App and Server Level Mapping

### `connectDB()`

**Defined in:**
- `src/config/database.js`

**Used in:**
- `src/server.js`

**What it does:**
- connects to MongoDB
- retries on failure
- handles disconnect/error events

---

### `startServer()`

**Defined in:**
- `src/server.js`

**What it does:**
- connects DB
- creates HTTP server from Express app
- initializes Socket.IO
- starts listening

---

### route mounting in `app.js`

**Mounted in:**
- `src/app.js`

**Mappings:**
- `/api/v1/events` → `eventRoutes`
- `/api/v1/auth` → `authRoutes`
- `/api/v1/users` → `userRoutes`
- `/api/v1/analytics` → `analyticsRoutes`
- `/api/v1/ai` → `aiRoutes`
- `/api/v1/recommendations` → `recommendationRoutes`

---

## 9. Quick “Where Used?” Answers for Common Viva Questions

### “Where did you use JWT?”
- In `src/models/User.js` for `generateAccessToken()` and `generateRefreshToken()`
- In `src/middlewares/auth.js` for verifying access tokens
- In `src/controllers/authController.js` for login/register token response

### “Where did you use bcrypt?”
- In `src/models/User.js`
- password hashing in pre-save hook
- password comparison in `comparePassword()`

### “Where did you use EventEmitter?”
- In `src/utils/appEvents.js`
- emitted in auth and event controllers

### “Where did you use express-validator?”
- In `src/middlewares/validators/authValidator.js`
- In `src/middlewares/validators/eventValidator.js`
- Results checked with `validationResult(req)` in `authController.js` and `eventController.js`

### “Where did you use populate?”
- In `getEvents`, `getEvent`, `getMe`, `getEventReviews`, recommendation logic, and analytics queries

### “Where did you use indexes?”
- Text index in `src/models/Event.js`
- Unique compound index in `src/models/RSVP.js`
- Unique compound index in `src/models/EventAnalytics.js`
- TTL and compound indexes in `src/models/UserActivity.js`

### “Where did you use virtuals?”
- In `src/models/Event.js`
- `attendeeCount`, `spotsRemaining`, `isFullyBooked`

### “Where did you use static methods?”
- `User.findByEmail()`
- `EventAnalytics.trackView()`, `getDailyTrend()`, `getSourceBreakdown()`, `getTopByViews()`
- `UserActivity.log()`, `getUserFeed()`, `getMostActiveUsers()`, `getActivitySummary()`

### “Where did you use instance methods?”
- `Event.addAttendee()` in RSVP flow
- `Event.syncStatus()` in review flow
- `User.comparePassword()` in login and password update
- `User.generateAccessToken()` and `generateRefreshToken()` in auth flow

---

## 10. Best Way to Use This File Before Viva

Read this file in 3 layers:

1. Learn the middleware section first.
   - Teachers often ask this directly.

2. Learn the route-to-controller section second.
   - This helps you answer “which API calls which function?”

3. Learn the model methods and utility section third.
   - This helps with higher-level questions like virtuals, hooks, EventEmitter, JWT, and indexes.

If you remember just one answer style, use this:

“It is defined in `X` file, used in `Y` route or controller, and its purpose is `Z`.”

That format works for almost every backend viva question.
