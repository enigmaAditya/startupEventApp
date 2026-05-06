# StartupEvents Backend Architecture: 3-Part Division

This document outlines the architectural division of the StartupEvents backend into three distinct, specialized components for your presentation.

---

## Part 1: Security & Identity Layer (Auth & RBAC)
**Purpose:** Acts as the secure gateway for the application, ensuring that user identity is verified and access to resources is strictly controlled based on user roles.

* **Authentication (Auth):**
  * Manages secure user registration and login workflows (`authRoutes`, `authController`).
  * Issues and validates JSON Web Tokens (JWT) for stateless session management.
* **Role-Based Access Control (RBAC):**
  * Utilizes dedicated middleware (e.g., `src/middlewares/authorize.js`) to intercept and validate incoming requests.
  * Enforces granular permission checks (e.g., distinguishing between standard users, organizers, and admins) to protect sensitive endpoints.
  * Prevents unauthorized data manipulation or access to restricted events.

---

## Part 2: Real-Time Communication Engine (WebSockets)
**Purpose:** Dedicated to handling low-latency, bidirectional data streams to provide users with a live and interactive experience without the overhead of continuous HTTP polling.

* **Socket Layer (`src/sockets`):**
  * Manages persistent connections between the client and the server.
* **Live Updates:**
  * Pushes instantaneous notifications for event updates, live ticket availability, or interactive event chats directly to connected clients.
* **Performance & Scale:**
  * Offloads high-frequency, real-time synchronization from the main HTTP API, improving overall backend performance and user experience.

---

## Part 3: Core API Services & Business Logic
**Purpose:** The main "engine" of the platform that handles standard requests, heavy data processing, database persistence, and external service orchestration.

* **Business Logic (`src/controllers` & `src/services`):**
  * Handles the core functionality: Event Management, User Operations, Analytics, and AI-driven Recommendations.
  * Orchestrates complex tasks like data aggregation and interacting with external APIs.
* **Data Modeling & Persistence (`src/models`):**
  * Defines the MongoDB schemas for structured storage of Events, Users, and other entities.
* **RESTful Routing (`src/routes`):**
  * Exposes a clean, versioned API (e.g., `/api/v1/events`, `/api/v1/analytics`) for the frontend to consume data securely and efficiently.
