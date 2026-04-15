# 🚀 StartupEvents

> A full-stack platform for discovering, creating, and RSVPing to startup-related events — hackathons, pitch nights, workshops, meetups, and conferences.

## 📋 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, TypeScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose, PostgreSQL + Prisma |
| **Real-time** | Socket.IO |
| **Auth** | JWT + bcrypt |
| **AI** | OpenAI API |
| **Build Tool** | Vite |
| **Testing** | Vitest (frontend), Jest + Supertest (backend) |

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
cp .env.example .env   # Edit with your values
npm run seed            # Seed the database
npm run dev             # Start backend on port 5000

# Frontend (in another terminal)
# Open http://localhost:5000 in your browser
# (Frontend is served statically by Express)
```

### Test Accounts (after seeding)
| Role | Email | Password |
|---|---|---|
| Admin | admin@startupevents.com | Admin@123 |
| Organizer | ravi@techhub.in | Organizer@123 |
| Attendee | amit@gmail.com | Attendee@123 |

## 📂 Project Structure

```
startupevents/
├── frontend/          # Frontend HTML, CSS, JS, TypeScript
│   └── src/
│       ├── pages/     # HTML pages
│       ├── css/       # Stylesheets (design system)
│       ├── js/        # JavaScript modules
│       └── ts/        # TypeScript (later sprints)
│
├── backend/           # Node.js + Express API
│   └── src/
│       ├── config/    # Configuration
│       ├── models/    # Mongoose models
│       ├── routes/    # Express routes
│       ├── controllers/ # Route handlers
│       ├── middlewares/  # Auth, validation, error handling
│       ├── sockets/   # Socket.IO handlers
│       ├── services/  # Business logic
│       └── utils/     # Logger, event bus, compression
│
└── docs/              # Documentation
```

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/events` | List events (paginated) | Public |
| `GET` | `/api/v1/events/:id` | Get event details | Public |
| `POST` | `/api/v1/events` | Create event | Organizer |
| `PUT` | `/api/v1/events/:id` | Update event | Owner |
| `DELETE` | `/api/v1/events/:id` | Delete event | Admin |
| `POST` | `/api/v1/events/:id/rsvp` | RSVP to event | Auth |
| `POST` | `/api/v1/auth/register` | Register | Public |
| `POST` | `/api/v1/auth/login` | Login | Public |
| `GET` | `/api/v1/users/me` | Get profile | Auth |

## 📚 Syllabus Mapping

See [SYLLABUS_MAPPING.md](docs/SYLLABUS_MAPPING.md) for a detailed mapping of every module to syllabus units.

## 📄 License

MIT
