# StartupEvents: Detailed Function & Code Map

Use this map to quickly find exactly **where** a feature is implemented when your teacher asks.

---

## 1. Authentication System
*Teacher asks: "How do you handle logins and where is the security logic?"*

| Feature | Backend Location | Frontend Location |
| :--- | :--- | :--- |
| **User Registration** | `backend/src/controllers/authController.js` (`register` function) | `frontend/register.html` & `frontend/src/js/auth.js` |
| **User Login** | `backend/src/controllers/authController.js` (`login` function) | `frontend/login.html` & `frontend/src/js/api/client.js` |
| **Password Hashing** | `backend/src/models/User.js` (`pre('save')` hook) | N/A (Handled safely on server) |
| **JWT Generation** | `backend/src/models/User.js` (`generateAccessToken`) | `frontend/src/js/services/tokenManager.js` (Storage) |
| **Route Protection** | `backend/src/middlewares/auth.js` (`protect` middleware) | `frontend/src/js/auth.js` (`checkAuth` sync) |

---

## 2. Event Management (CRUD)
*Teacher asks: "Where is the logic to create an event or handle an RSVP?"*

| Feature | Backend Location | Frontend Location |
| :--- | :--- | :--- |
| **Create Event** | `backend/src/controllers/eventController.js` (`createEvent`) | `frontend/organizer-dashboard.html` (`create-event-form`) |
| **RSVP Logic** | `backend/src/controllers/eventController.js` (`rsvpToEvent`) | `frontend/event-detail.html` (Floating RSVP Bar) |
| **RSVP Rules** | `backend/src/controllers/eventController.js` (Checks for `isFullyBooked` & existing RSVPs) | `frontend/event-detail.html` (Dynamic button states) |
| **Clear Chat History**| `backend/src/controllers/eventController.js` (`clearEventChat`) | `frontend/manage-event.html` (`#clear-chat-btn`) |
| **Delete Event** | `backend/src/controllers/eventController.js` (`deleteEvent`) | `frontend/manage-event.html` (`#delete-event-btn`) |

---

## 3. AI Recommendation Engine
*Teacher asks: "How does the AI actually 'match' a user and where is that math done?"*

- **Logic Location**: [recommendationController.js](file:///Users/adii/Desktop/startupEventApp/backend/src/controllers/recommendationController.js)
- **Key Function**: `getRecommendations`
- **What to show**: 
    - Lines ~40-65: Scoring users based on `categoryMatch`, `tagMatch`, and `cityMatch`.
    - Lines ~25-30: The check for a minimum of 3 RSVPs to ensure data quality.
- **Frontend Display**: `frontend/dashboard.html` (`initRecommendations` function in the script tag).

---

## 4. Real-time Chat (Socket.io)
*Teacher asks: "How do messages show up instantly without refreshing?"*

- **Backend Logic**: [sockets/index.js](file:///Users/adii/Desktop/startupEventApp/backend/src/sockets/index.js)
    - `io.on('connection')`: Handles user connecting.
    - `socket.join(eventId)`: Places user in a private event room.
    - `socket.on('chat:message')`: Receives a message and broadcasts it back to the room.
- **Frontend Logic**: `frontend/event-detail.html` (The `initChat()` function).
    - Uses `socket.emit('chat:join', eventId)` to start the connection.

---

## 5. Role-Based Dashboard Logic
*Teacher asks: "How do you distinguish between what an Organizer sees vs an Attendee?"*

- **Frontend Navigation**: `frontend/src/js/auth.js`
    - Logic that checks `user.role` and redirects to either `/dashboard` or `/organizer-dashboard`.
- **Sidebar Toggles**: `frontend/organizer-dashboard.html` (Look for `if (user.role === 'admin')` in the `<script>` tag).
- **Backend Authorization**: `backend/src/middlewares/auth.js` (`authorize` function). It allows us to restrict routes like `router.delete('/...', authorize('admin'), ... )`.

---

## 6. Advanced Modern Features
*Teacher asks: "What technical polish have you added?"*

- **Glassmorphism UI**: [variables.css](file:///Users/adii/Desktop/startupEventApp/frontend/src/css/variables.css) & [modern-ui.css](file:///Users/adii/Desktop/startupEventApp/frontend/src/css/modern-ui.css). Explains the use of `clamp()` for typography and `--blur-standard`.
- **Change Password**: 
    - **Backend**: `backend/src/controllers/authController.js` (`updatePassword`).
    - **Frontend**: `dashboard.html` & `organizer-dashboard.html` (The "Security" section).
- **CORS & Deployment**: [app.js](file:///Users/adii/Desktop/startupEventApp/backend/src/app.js) (Setting up `allowedOrigins` for Vercel and Render).

---

## 7. Database Structure (The Schema)
*Teacher asks: "How is your data organized?"*

- **Users**: [User.js](file:///Users/adii/Desktop/startupEventApp/backend/src/models/User.js)
- **Events**: [Event.js](file:///Users/adii/Desktop/startupEventApp/backend/src/models/Event.js)
- **Reviews**: Linked inside the Event model or fetched via `reviewController.js`.
