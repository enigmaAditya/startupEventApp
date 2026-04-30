# 🚀 StartupEvents

> A full-stack platform for discovering, creating, and RSVPing to startup-related events — hackathons, pitch nights, workshops, meetups, and conferences.

## 📋 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Real-time** | Socket.IO |
| **Auth** | JWT + bcrypt |
| **AI Integration**| OpenAI API |

---

## 🏗️ Architecture & Working of the App

The application follows a decoupled, highly modular RESTful architecture combined with a Real-Time WebSockets engine. The backend is logically divided into three major functional parts:

### 1. Security & Identity Layer (Auth & RBAC)
**Working:**
This layer acts as the impenetrable gateway for the application. 
- **Authentication:** When a user logs in or registers, the system securely hashes their password and issues a JSON Web Token (JWT) for stateless session management.
- **Role-Based Access Control (RBAC):** We implemented strict middleware (`authorize.js`) that intercepts requests based on the user's role (`admin`, `organizer`, `attendee`). For example, standard users are blocked from creating events, and organizers are blocked from accessing admin-only data.

### 2. Core API Services & Business Logic (Event Engine)
**Working:**
This is the main engine of the platform handling data processing, database persistence, and external service orchestration.
- **Event Operations:** Users can create, update, and RSVP to events. The MongoDB queries use dynamic filtering, pagination, and native text indexing for lightning-fast search capabilities.
- **Relational Data:** We utilize Mongoose `ObjectId` references to seamlessly link Users, Events, and RSVPs. Cascading delete logic ensures that if an event is removed, all associated RSVPs are automatically wiped to prevent orphaned data.
- **AI Integration:** We utilize the OpenAI API (GPT-3.5 & ADA Embeddings) for automated recommendations, semantic search, and generative insights to improve the user experience.

### 3. Real-Time Communication Engine (WebSockets)
**Working:**
We implemented `Socket.IO` to handle low-latency, bidirectional data streams.
- **Event Rooms:** When users view an event, they join a dedicated Socket.IO "Room" (`event:${eventId}`).
- **Live Interaction:** This allows attendees and organizers to chat and receive instant notifications for event updates without the performance overhead of continuous HTTP polling. 
- **Security:** The socket layer is tightly secured by cross-referencing user IDs with the database to prevent unauthorized users from hijacking private event chat rooms.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/startupevents.git
cd startupevents

# Backend setup
cd backend
npm install
cp .env.example .env   # Edit with your database/Groq credentials
npm run dev            # Start backend on port 5000

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev            # Starts Vite development server
```

### Test Accounts 
| Role | Email | Password |
|---|---|---|
| Admin | admin@startupevents.com | Admin@123 |
| Organizer | ravi@techhub.in | Organizer@123 |
| Attendee | amit@gmail.com | Attendee@123 |

---

## 🔌 Core API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/events` | List events (filtered/paginated) | Public |
| `GET` | `/api/v1/events/:id` | Get event details | Public |
| `POST` | `/api/v1/events` | Create event | Organizer |
| `PUT` | `/api/v1/events/:id` | Update event | Owner |
| `DELETE` | `/api/v1/events/:id` | Delete event | Admin |
| `POST` | `/api/v1/events/:id/rsvp` | RSVP to event | Auth |
| `POST` | `/api/v1/auth/register` | Register new user | Public |
| `POST` | `/api/v1/auth/login` | Login user | Public |
| `GET` | `/api/v1/users/me` | Get active profile | Auth |

## 📄 License
MIT
