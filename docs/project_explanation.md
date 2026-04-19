# StartupEvents: Technical Overview & Architecture

This guide provides a comprehensive breakdown of the StartupEvents platform to help you explain the project structure, logic, and design decisions to your teacher.

---

## 1. Project Vision
**StartupEvents** is a niche networking platform designed for the startup ecosystem. It moves beyond simple event listings by incorporating **Role-Based Access Control (RBAC)**, **Real-time Collaboration**, and an **AI-driven Recommendation Engine** that matches users to events based on their actual professional interests and history.

---

## 2. Tech Stack Overview

### Frontend (The User Experience)
- **Language**: Vanilla JavaScript (ES6+) with HTML5 and Modern CSS.
- **Design System**: A custom "Apple-style" **Glassmorphism** aesthetic using advanced CSS techniques like `backdrop-filter`, HSL color tokens, and CSS Variables.
- **Build Tool**: **Vite** — used for bundling, minifying assets, and providing a fast development environment.
- **Real-time**: **Socket.io-client** for the live chat functionality.

### Backend (The Logic & Data)
- **Runtime**: **Node.js** with the **Express.js** framework.
- **Database**: **MongoDB Atlas** (NoSQL). We use **Mongoose** as an ODM (Object Data Modeling) tool to provide structure to our data.
- **Security**: **JWT (JSON Web Tokens)** for stateless authentication, with **bcryptjs** for hashing passwords.
- **Communication**: **Socket.io** for handling real-time WebSocket connections.

---

## 3. System Architecture
The application follows a **Decoupled Architecture**:
- **Frontend**: Hosted on **Vercel**. It is a Static Site with client-side routing logic.
- **Backend**: Hosted on **Render**. It serves as a RESTful API.
- **Cross-Origin**: Because they are on different domains, we implement **CORS (Cross-Origin Resource Sharing)** and use `sameSite: "none"` cookies to ensure the login stays active across the split deployment.

---

## 4. Core Features & "Smart" Logic

### A. Authentication & RBAC (Role-Based Access Control)
- **Middleware**: We use a `protect` middleware on the backend that verifies the JWT token before allowing access to private data.
- **Roles**:
    - **Attendee**: Can browse events and RSVP.
    - **Organizer**: Can create and manage their own events, see attendee lists, and clear chat history.
    - **Admin**: Has platform-wide oversight, can approve/reject organizer applications, and manage all users.

### B. AI Recommendation Engine
This is a "Genuine" scoring system located in `recommendationController.js`. It doesn't just show random events; it calculates a **Match Score** for each user:
1.  **Data Extraction**: It looks at the user's past 3+ confirmed RSVPs.
2.  **Scoring Algorithm**:
    - **Category Match**: +5 points if the event matches a category the user frequently attends.
    - **Tag Match**: +2 points for every matching interest tag (e.g., #AI, #Web3).
    - **City Proximity**: +3 points if the event is in the user's city.
3.  **Thresholding**: If a user has fewer than 3 RSVPs, the system honestly explains that it needs more data to make accurate suggestions.

### C. Live Chat (WebSockets)
- Unlike traditional HTTP requests (Request -> Response), the chat uses **WebSockets** (Bi-directional).
- **Rooms**: When a user joins an event page, the backend places them in a specific "Socket Room" based on the Event ID. This ensures only people interested in *that* specific event see the messages.

### D. The "Danger Zone"
- For security, destructive actions (like deleting an event or clearing chat history) are placed in a "Danger Zone".
- These actions require **Double Confirmation** (Frontend `confirm()` + Backend Ownership Check) to prevent accidental data loss.

---

## 5. Key Design Decisions

1.  **Why Vanilla JS?**: To demonstrate a deep understanding of the DOM (Document Object Model) and core JavaScript without relying on heavy frameworks like React.
2.  **Why MongoDB?**: Flexible schemas allow us to easily evolve the "Event" model (adding tags, chat history, etc.) without complex SQL migrations.
3.  **Mobile First**: The floating RSVP bar and responsive layout ensure the app feels like a native mobile app on phones.

---

## 6. How to Explain the "Flow"
If your teacher asks: *"What happens when a user clicks RSVP?"*
1.  **Frontend**: Checks if the user is logged in. If yes, it sends a `POST` request to `/api/v1/events/:id/rsvp`.
2.  **Backend**: The `protect` middleware ensures the user is valid. The `eventController` checks if the event is full and if the user has already RSVPed.
3.  **Database**: The user's ID is added to the event's `attendees` array, and the Event ID is added to the user's `eventsAttending` array.
4.  **Feedback**: The server returns a `200 OK`, and the Frontend UI immediately updates the RSVP button to "RSVP Secured!" using a toast notification.
