# My Backend Presentation Speech & Notes

This document contains my presentation notes for Parts 2, 3, 6, and 7 of the StartupEvents backend. I rewrote it to match the actual codebase more closely and to sound more natural when speaking.

---

## Part 2: Event Management

**Where I implemented this:**
- **Routes:** `src/routes/eventRoutes.js`
- **Controllers:** `src/controllers/eventController.js`
- **Models:** `src/models/Event.js`, `src/models/RSVP.js`

**How I built it:**

1. **Querying and filtering events (`getEvents`)**
   - In `getEvents`, I build the MongoDB filter object dynamically from query params like `category`, `status`, `city`, `organizer`, and `search`.
   - By default, public users do **not** see events with `status: 'pending-approval'`, and they also do not see events whose `moderationStatus` is `'hidden'`.
   - If the logged-in user is an admin, they can see everything. If the logged-in user is an organizer, they can see all non-hidden events plus their own hidden events.
   - For text search, I use MongoDB’s `$text` search on the Event model’s text index and sort by text score.
   - For pagination, I use my `paginate` middleware, which attaches `page`, `limit`, and `skip` to `req.pagination`, and then I apply `skip()` and `limit()` to the query.
   - One extra thing I do here is “harden” `attendeeCount` in the response by recalculating it from the attendees array before sending the data back.

2. **Creating events (`createEvent`)**
   - Before creating the event, I check validation errors using `express-validator`.
   - I automatically assign the logged-in user as the organizer by setting `req.body.organizer = req.user._id`.
   - I also enforce a moderation rule: if the user has the `organizer` role but their `organizerStatus` is not `verified`, I force the event `status` to `'pending-approval'`.
   - After saving the event, I update the organizer’s `eventsOrganized` array using `$addToSet`, and then I emit an internal app event through `appEvents.emit('event:created', ...)`.

3. **Updating events (`updateEvent`)**
   - In `updateEvent`, I first validate the request and then check whether the user is either the event owner or an admin.
   - If the user is the owner, they can update normal event fields like `title`, `description`, `category`, `date`, `location`, `capacity`, and tags.
   - If the user is an admin but not the owner, I restrict them to moderation-related fields only, such as `isFeatured`, `isVerified`, `moderationStatus`, `moderationNote`, and `status`.
   - So the key idea here is field-level authorization: owners manage the event content, while admins mainly manage moderation state.

4. **Deleting events (`deleteEvent`)**
   - The route allows both organizers and admins to reach the controller, but inside the controller I still check authorization properly.
   - The delete only succeeds if the requester is the event owner or an admin.
   - After deleting the event, I also clean up related data: I delete all RSVPs for that event, remove the event from the organizer’s `eventsOrganized` array, and remove it from every attendee’s `eventsAttending` array.
   - This is basically a manual cascading delete to avoid orphaned references.

5. **RSVP logic (`rsvpToEvent`)**
   - I first make sure the event exists.
   - Organizers are not allowed to RSVP to events.
   - I then check the Event model’s virtual `isFullyBooked` property before creating the RSVP.
   - To prevent duplicate registration, I rely on a compound unique index in the RSVP model on `{ user, event }`.
   - If MongoDB throws error code `11000`, I catch it and convert it into a clean `409 Conflict` response.
   - After a successful RSVP, I create the RSVP record, add the user to the event’s `attendees` list through the Event model’s `addAttendee()` instance method, add the event to the user’s `eventsAttending` array, and emit an internal app event.

**Natural way to say this in presentation:**

“For event management, I split the logic across routes, controllers, and Mongoose models. In the listing API, I built dynamic filtering with role-based visibility, so public users only see approved visible events, admins can see everything, and organizers can also see their own hidden events. For event creation and updates, I added validation and field-level authorization. I also made sure deleting an event cleans up related RSVP and user references, and for RSVPs I used both business checks and a database-level unique index to prevent duplicate registrations.”

---

## Part 3: User Management

**Where I implemented this:**
- **Routes:** `src/routes/userRoutes.js`
- **Controllers:** `src/controllers/userController.js`
- **Models:** `src/models/User.js`

**How I built it:**

1. **Profile management (`updateMe`)**
   - In `updateMe`, I do not blindly trust the request body.
   - I whitelist only a small set of fields: `firstName`, `lastName`, `bio`, `interests`, and `avatar`.
   - That prevents users from changing sensitive fields like `role`, `organizerStatus`, or other protected properties through the profile update endpoint.

2. **Admin user operations (`getAllUsers`, `updateUserRole`, `toggleUserStatus`)**
   - In `getAllUsers`, admins can filter by `role` and search across `firstName`, `lastName`, and `email`.
   - I implemented the search using MongoDB `$or` with case-insensitive `$regex`.
   - In `updateUserRole`, I only allow three valid roles: `attendee`, `organizer`, and `admin`.
   - If an admin changes someone back to `attendee`, I also reset `organizerStatus` to `'none'` so the data stays consistent.
   - I also added `toggleUserStatus`, where an admin can activate or deactivate a user by flipping the `isActive` flag.

3. **Organizer application flow (`requestOrganizerAccess`, `verifyOrganizer`, `revokeApplication`)**
   - In `requestOrganizerAccess`, I first check whether the user is already a verified organizer.
   - If their previous organizer application was rejected, I apply a 20-day cooldown using `organizerRejectionDate`.
   - If the cooldown has not finished yet, I calculate the remaining days and return that clearly in the error message.
   - If the request is allowed, I set `organizerStatus` to `'pending'` and clear the rejection date.
   - In `verifyOrganizer`, the admin sends either `'verified'` or `'rejected'`.
   - If the admin verifies the user, I set `role = 'organizer'` and clear the rejection date.
   - If the admin rejects the user, I set `role = 'attendee'` and store a fresh `organizerRejectionDate`.
   - I also added `revokeApplication`, which resets the user back to `attendee` with `organizerStatus = 'none'`.

**Natural way to say this in presentation:**

“For user management, I focused on controlled updates and clean role transitions. Normal users can only edit safe profile fields, while admins have separate routes for searching users, changing roles, and toggling account status. I also built a small organizer approval workflow with pending, verified, and rejected states, plus a 20-day cooldown after rejection so users cannot spam organizer applications.”

---

## Part 6: Real-Time Communication (WebSockets)

**Where I implemented this:**
- **Sockets:** `src/sockets/index.js`

**How I built it:**

1. **Initialization and environment-based CORS**
   - I initialize Socket.IO on top of the existing HTTP server.
   - I also configure CORS differently based on the environment.
   - In production, it allows the deployed frontend domain. In development, it allows localhost-style origins such as port `3000` and `5173`, plus any custom `CORS_ORIGIN` value.

2. **Event rooms (`join:event`)**
   - I use Socket.IO rooms so each event has its own isolated chat space, using room names like `event:${eventId}`.
   - The join handler supports both a legacy string payload and a newer object payload for compatibility.
   - Before letting someone join as an organizer, I verify that their `userId` actually matches the event’s organizer in the database.
   - If that organizer check fails, I emit `chat:error` and block the join.
   - After a successful join, I send the existing `chatHistory` back to that socket and notify the rest of the room that a user joined.

3. **Chat messages (`chat:message`)**
   - When a message comes in, I first reject it if `userId` is missing, which blocks guest users from sending messages.
   - Then I build a message object for the socket payload.
   - I persist the message into the event document by pushing it into the `chatHistory` array with `Event.findByIdAndUpdate`.
   - After that, I broadcast the message to the rest of the users in the same event room using `socket.to(...).emit(...)`.

4. **Extra real-time helpers**
   - I also exported helper functions like `emitNotification` and `emitToEventRoom`.
   - These make it easy for regular controllers or services to trigger real-time updates without rewriting socket logic everywhere.

**Important accuracy note:**

The code specifically verifies organizer ownership on room join, and it blocks guests from sending messages. It does **not** currently check attendee membership before allowing a non-organizer to join the room.

**Natural way to say this in presentation:**

“For real-time features, I used Socket.IO with room-based chat, so every event has its own communication channel. I added a database-backed organizer verification check when someone tries to join as the host, and I block unauthenticated users from sending chat messages. I also persist each chat message into the event document, so the room can restore chat history when users join later.”

---

## Part 7: Middleware and Utilities

**Where I implemented this:**
- **Error handling:** `src/middlewares/errorHandler.js`
- **Validation:** `src/middlewares/validators/`
- **Pagination:** `src/middlewares/paginate.js`
- **Rate limiting:** `src/middlewares/rateLimiter.js`

**How I built it:**

1. **Custom API Error class (`ApiError`)**
   - I created a custom `ApiError` class that extends the native `Error` object.
   - It stores an HTTP `statusCode` and an `isOperational` flag so I can distinguish expected API errors from unexpected failures.
   - I also added factory helpers like `ApiError.badRequest()`, `ApiError.notFound()`, `ApiError.conflict()`, and so on, which makes controller code cleaner and more consistent.

2. **Global error middleware (`errorHandler`)**
   - I wrote a central Express error-handling middleware with the full four-parameter signature: `err, req, res, next`.
   - Inside it, I normalize common backend errors into cleaner API responses.
   - For Mongoose `ValidationError`, I collect all schema messages and join them into one readable message with status `400`.
   - For duplicate key errors with code `11000`, I convert them into a `409 Conflict`.
   - For `CastError`, I return a clean invalid-ID style message.
   - I also handle JWT errors like `JsonWebTokenError` and `TokenExpiredError` as `401 Unauthorized`.
   - On top of that, I log server-side errors differently depending on whether they are client errors or internal errors.

3. **Validation with `express-validator`**
   - I use `express-validator` in middleware before the controller logic runs.
   - For example, in the event validator I check things like required title, valid category, capacity being at least 1, and event date being in the future.
   - Then inside the controller, I read the validation result with `validationResult(req)` and stop early if there are validation errors.

4. **Pagination middleware (`paginate.js`)**
   - I wrote reusable pagination middleware that reads `page` and `limit` from the query string.
   - It also enforces sensible boundaries, like keeping `page` at least 1 and capping `limit` at 50.
   - Then it calculates `skip` and attaches everything to `req.pagination`, so controllers can stay clean.
   - I also wrote a `paginatedResponse()` helper to return consistent pagination metadata like `totalPages`, `hasNext`, and `hasPrev`.

5. **Rate limiting**
   - I added rate limiting using `express-rate-limit`.
   - It uses values from the central config and returns a structured JSON error response if the request limit is exceeded.
   - This protects the API from abuse like brute-force or excessive repeated requests.

**Natural way to say this in presentation:**

“For middleware and utilities, I tried to make the API predictable and reusable. I created a custom error class plus a global error handler so backend failures turn into clean client responses. I used validator middleware to reject bad input early, built reusable pagination so every listing endpoint stays consistent, and added rate limiting as a security layer.”

---

## Final Short Version for Speaking

“In the backend, I organized the project into routes, controllers, models, and middleware so each concern stays separate. For event management, I implemented filtering, pagination, role-based visibility, controlled event updates, cleanup on delete, and duplicate-safe RSVP handling. For user management, I added safe profile editing, admin controls, and an organizer approval workflow with rejection cooldown. For real-time communication, I used Socket.IO rooms for event-specific chat and added basic security checks before sending or saving messages. Finally, I supported everything with reusable middleware for validation, pagination, rate limiting, and centralized error handling.”
