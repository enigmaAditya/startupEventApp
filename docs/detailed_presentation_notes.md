# Detailed Backend Presentation Notes

This document provides an extremely comprehensive breakdown of Parts 2, 3, 6, and 7 of the StartupEvents backend. It is designed to prepare you for any technical question by explaining exactly **how** things work and **where** they are implemented.

---

## Part 2: Event Management

**Where it is used:**
- **Routes:** `src/routes/eventRoutes.js`
- **Controllers:** `src/controllers/eventController.js`
- **Models:** `src/models/Event.js`, `src/models/RSVP.js`

**How it works (Deep Dive):**

1. **Querying & Filtering (`getEvents`):**
   - **Where:** `eventController.js -> getEvents`
   - **How:** The endpoint dynamically builds a MongoDB query object (`filter`) based on URL query parameters (`category`, `status`, `city`, `organizer`). 
   - **RBAC Logic:** It modifies the query based on the user's role. Admins see everything. Organizers see public events PLUS their own hidden events. Public users only see events where `moderationStatus` is NOT 'hidden'.
   - **Full-Text Search:** If a `search` query is provided, it utilizes MongoDB's native text index (`$text: { $search: search }`) and sorts by text match score (`{ $meta: 'textScore' }`).
   - **Pagination:** Relies on `skip()` and `limit()` injected by the pagination middleware.

2. **Creating Events (`createEvent`):**
   - **Where:** `eventController.js -> createEvent`
   - **How:** Before executing, it checks for validation errors caught by `express-validator`.
   - **Security Policy:** If an organizer's `organizerStatus` is not 'verified', it forcibly overrides the event status to `'pending-approval'`.
   - **Side-effects:** Once created, it adds the Event ID to the User's `eventsOrganized` array using `$addToSet` and emits an internal Node.js event (`appEvents.emit`) to trigger background tasks.

3. **Updating Events (`updateEvent`):**
   - **Where:** `eventController.js -> updateEvent`
   - **How:** Implements **Field-Level Authorization**. 
     - If the user is the **Owner (Organizer)**, they can update core content (title, description, capacity).
     - If the user is an **Admin**, they are stripped of the ability to edit content and can ONLY update moderation fields (`isFeatured`, `isVerified`, `moderationStatus`).

4. **Deleting Events (`deleteEvent`):**
   - **Where:** `eventController.js -> deleteEvent`
   - **How:** Employs **Cascading Deletes**. When an event is deleted, it doesn't leave orphaned data. It uses `RSVP.deleteMany()` to wipe registrations, and `User.updateMany()` to `$pull` the event ID from every attendee's `eventsAttending` array.

5. **RSVP Logic (`rsvpToEvent`):**
   - **Where:** `eventController.js -> rsvpToEvent`
   - **How:** Prevents Organizers from RSVPing. Checks the virtual property `event.isFullyBooked` before allowing the RSVP. To prevent duplicate registrations, it catches MongoDB Error Code `11000` (Duplicate Key Error) from the compound index on the RSVP model and translates it to a clean `409 Conflict` HTTP response.

---

## Part 3: User Management

**Where it is used:**
- **Routes:** `src/routes/userRoutes.js`
- **Controllers:** `src/controllers/userController.js`
- **Models:** `src/models/User.js`

**How it works (Deep Dive):**

1. **Profile Management (`updateMe`):**
   - **Where:** `userController.js -> updateMe`
   - **How:** Explicitly restricts which fields a user can update. It iterates over an `allowedFields` array (firstName, lastName, bio, interests, avatar) to prevent users from maliciously injecting a role change (e.g., trying to send `{"role": "admin"}` in the payload).

2. **Admin Operations (`getAllUsers`, `updateUserRole`):**
   - **Where:** `userController.js -> getAllUsers`
   - **How:** Uses MongoDB's `$or` operator combined with `$regex` to allow admins to search for users simultaneously across `firstName`, `lastName`, and `email` fields.
   - **Role Demotion:** If an Admin updates an Organizer back to an 'attendee', the code automatically resets their `organizerStatus` back to 'none' to keep the database state consistent.

3. **Organizer Application Flow (`requestOrganizerAccess`, `verifyOrganizer`):**
   - **Where:** `userController.js`
   - **How (Cooldown Logic):** If a user applies to be an organizer and gets rejected, the system sets an `organizerRejectionDate`. If they try to apply again (`requestOrganizerAccess`), the controller calculates the time difference. If less than 20 days have passed, it blocks the application, calculating and telling the user exactly how many days are remaining in their cooldown.
   - **Verification:** The Admin's `verifyOrganizer` route patches the user's role and clears the rejection date upon approval.

---

## Part 6: Real-Time Communication (WebSockets)

**Where it is used:**
- **Sockets:** `src/sockets/index.js`

**How it works (Deep Dive):**

1. **Initialization and Security:**
   - **Where:** `index.js -> initializeSocketIO`
   - **How:** Binds Socket.IO to the Express HTTP server. Configures strict CORS (Cross-Origin Resource Sharing) policies based on the environment (allowing localhost in dev, but strictly Vercel in production).

2. **Rooms Architecture (`join:event`):**
   - **How:** Uses Socket.IO's "Rooms" feature (`socket.join('event:${eventId}')`). This ensures that when a user chats in Event A, the message is only broadcasted to users looking at Event A, not the entire platform.
   - **Auth Check:** If a user tries to join the room claiming the 'organizer' role, the socket checks the database to verify their User ID matches the Event's `organizer` ID. If they lie, it emits a `chat:error` back to them and prevents entry.

3. **Message Handling (`chat:message`):**
   - **How:** 
     1. Receives the message payload.
     2. Rejects messages if `userId` is missing (blocks unauthenticated guests).
     3. Asynchronously updates the database (`Event.findByIdAndUpdate`) using the `$push` operator to save the message into the event's `chatHistory` array.
     4. Broadcasts the message to everyone else in the room using `socket.to(room).emit()`.

4. **Exported Notification Helpers:**
   - **How:** Exposes `emitNotification` (global broadcasts) and `emitToEventRoom` (targeted broadcasts) so that standard HTTP controllers can trigger real-time updates seamlessly.

---

## Part 7: Middleware & Utilities

**Where it is used:**
- **Error Handling:** `src/middlewares/errorHandler.js`
- **Validation:** `src/middlewares/validators/`
- **Pagination:** `src/middlewares/paginate.js`
- **Rate Limiting:** `src/middlewares/rateLimiter.js`

**How it works (Deep Dive):**

1. **The Custom API Error Class (`ApiError`):**
   - **Where:** `errorHandler.js`
   - **How:** A custom class extending the native JavaScript `Error` object. It includes an `isOperational = true` flag to distinguish between expected API errors (like a bad password) and unexpected programmer errors (like a syntax crash).
   - Uses the **Factory Pattern** (`ApiError.badRequest()`, `ApiError.notFound()`) to easily throw standardized errors from anywhere in the codebase.

2. **Global Error Middleware (`errorHandler`):**
   - **Where:** `errorHandler.js -> errorHandler`
   - **How:** Express automatically recognizes this as an error handler because it has exactly 4 parameters (`err, req, res, next`). 
   - **Database Error Interception:** Instead of crashing or sending an ugly stack trace to the frontend, it intercepts specific Mongoose errors:
     - **ValidationError:** Maps over the error object, extracts the custom validation messages defined in the Schema, and joins them into a readable string (Status `400`).
     - **CastError:** Catches invalid MongoDB ObjectIds in the URL parameters and returns a clean `400 Bad Request`.
     - **JWT Errors:** Catches `JsonWebTokenError` and `TokenExpiredError` to return a `401 Unauthorized`.

3. **Request Validation (`express-validator`):**
   - **Where:** `src/middlewares/validators/eventValidator.js`
   - **How:** Used as middleware *before* the request reaches the controller. It ensures payloads are correct (e.g., checking if the date is in the future, if the title exists). If validation fails, the controller sees it via `validationResult(req)` and stops execution.

4. **Pagination Middleware (`paginate.js`):**
   - **How:** Intercepts the request, reads `page` and `limit` from the URL query strings, calculates the `skip` value (e.g., `(page - 1) * limit`), and injects a `req.pagination` object. The controller then just applies `skip` and `limit` directly to the Mongoose query without doing the math itself.
