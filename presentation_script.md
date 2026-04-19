# Presentation Video Script: StartupEvents (8 Minutes)

This script divides the 8-minute presentation into a **2+3+3** format. It ensures that both Member 2 and you demonstrate **Full-Stack** knowledge by presenting both Frontend and Backend logic.

---

## 🕒 Member 1: The Foundation (0:00 - 2:00)
**Goal**: Hook the audience and explain the "What" and "Why".

- **0:00 - 0:30**: **hook & Title**: Introduce the project "StartupEvents" and the team. 
    - *Visual*: Homepage scroll.
    - *Talk*: "We built a platform specifically for the startup ecosystem to bridge the gap between networking and AI-driven event management."
- **0:30 - 1:15**: **The Problem & Solution**: 
    - *Visual*: Show the clean, modern Glassmorphism UI.
    - *Talk*: Explain how current platforms are generic. Our solution uses AI to match users to events they *actually* care about.
- **1:15 - 2:00**: **The Architecture**: 
    - *Visual*: Show a simple diagram (Vite + Express + MongoDB).
    - *Talk*: Mention the split-deployment (Vercel for FE, Render for BE) and the decoupled architecture.

---

## 🕒 Member 2: Auth & Core Experience (2:00 - 5:00)
**Goal**: Show how the app starts—Security and Basic Functionality.

- **2:00 - 3:30**: **Frontend (Modern UI & Auth)**:
    - *Demo*: Register a new user and login.
    - *Talk*: "Our frontend is built with Vanilla JS but uses a modern Vite workflow. Notice the Glassmorphism effects in the auth cards."
- **3:30 - 5:00**: **Backend (JWT & RBAC)**:
    - *Visual*: Show the code for `authController.js` and `middlewares/auth.js`.
    - *Talk*: "Behind the scenes, we use JWT tokens stored in HttpOnly cookies for security. We implemented Role-Based Access Control (RBAC) so that Organizers see a completely different dashboard than Attendees."

---

## 🕒 You: Advanced Logic & Real-time (5:00 - 8:00)
**Goal**: The "Wow" factor—AI, Sockets, and Data.

- **5:00 - 6:30**: **The AI Engine (Backend to Frontend)**:
    - *Visual*: Show the code in `recommendationController.js` and then the "Recommended for You" cards in the Dashboard.
    - *Talk*: "This is the brain of the app. We don't just filter tags; our algorithm calculates a Match Score based on your RSVP history. If you attend 3+ events, the AI begins to learn your profile."
- **6:30 - 7:30**: **Real-Time Communication**:
    - *Demo*: Open two windows, join a chat, and send a message.
    - *Talk*: "We used Socket.IO for real-time collaboration. The backend manages private 'Rooms' so that chat messages are only seen by people in that specific event."
- **7:30 - 8:00**: **Conclusion & Syllabus Match**:
    - *Visual*: Show a quick list of standard compliance (Node Streams, Mongoose, Zlib).
    - *Talk*: "This project covers 95%+ of our syllabus, from advanced Node.js I/O to TypeScript and LLM integration. We successfully deployed this via a professional CI/CD pipeline on GitHub."

---

## 💡 Pro-Tips for the Video:
1.  **Screen Recording**: Use a tool like OBS or Zoom to record your screen while you talk.
2.  **Highlight Code**: When showing code files, zoom in or use a "Spotlight" effect so the teacher can see the function names (e.g., `getRecommendations` or `initChat`).
3.  **Toasts**: Make sure to trigger a "Success Toast" in the video—it shows great polish and attention to UX.
