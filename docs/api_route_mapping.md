# API Route & Frontend Flow Map

This document explains the "How" and "Where" for every data request in the StartupEvents platform.

---

## 1. Authentication Module (`/api/v1/auth`)

| Method | Endpoint | Backend Function | Frontend Action / UI Trigger |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | `authController.register` | **Page**: `register.html` -> **Action**: Clicking "Create Account" button. |
| **POST** | `/login` | `authController.login` | **Page**: `login.html` -> **Action**: Clicking "Sign In" button. |
| **POST** | `/logout` | `authController.logout` | **Location**: All Pages -> **Action**: Clicking "Logout" in navbar or sidebar. |
| **PUT** | `/update-password` | `authController.updatePassword` | **Page**: `dashboard.html` / `organizer-dashboard.html` -> **Action**: Clicking "Update Password". |

---

## 2. Event Operations (`/api/v1/events`)

| Method | Endpoint | Backend Function | Frontend Action / UI Trigger |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | `eventController.getEvents` | **Page**: `index.html` (Featured) & `events.html` (Grid) -> **Action**: On page load. |
| **POST** | `/` | `eventController.createEvent` | **Page**: `organizer-dashboard.html` -> **Action**: Clicking "Publish Event". |
| **GET** | `/:id` | `eventController.getEvent` | **Page**: `event-detail.html` -> **Action**: On page load (extracts ID from URL). |
| **PUT** | `/:id` | `eventController.updateEvent` | **Page**: `manage-event.html` -> **Action**: Saving event edits or toggling RSVPs. |
| **DELETE** | `/:id` | `eventController.deleteEvent` | **Page**: `manage-event.html` -> **Action**: Clicking "Delete Permanently" in Danger Zone. |
| **POST** | `/:id/rsvp` | `eventController.rsvpToEvent` | **Page**: `event-detail.html` -> **Action**: Clicking the floating "RSVP Now" bar. |
| **DELETE** | `/:id/chat` | `eventController.clearEventChat` | **Page**: `manage-event.html` -> **Action**: Clicking "Clear Messages" in Danger Zone. |

---

## 3. User & Profile Module (`/api/v1/users`)

| Method | Endpoint | Backend Function | Frontend Action / UI Trigger |
| :--- | :--- | :--- | :--- |
| **GET** | `/me` | `userController.getMe` | **Page**: `dashboard.html` -> **Action**: On load to sync user data (role, status). |
| **PUT** | `/me` | `userController.updateMe` | **Page**: `dashboard.html` -> **Action**: Clicking "Save Changes" in Profile settings. |
| **POST** | `/request-organizer` | `userController.requestOrganizerAccess` | **Page**: `dashboard.html` -> **Action**: Clicking "Apply to Host" warning modal. |
| **POST** | `/revoke-application` | `userController.revokeApplication` | **Page**: `dashboard.html` -> **Action**: Clicking "Revoke Request" banner. |
| **PATCH** | `/:id/verify` | `userController.verifyOrganizer` | **Page**: `organizer-dashboard.html` -> **Action**: Admin clicking "Approve/Reject" in User table. |
| **PATCH** | `/:id/status` | `userController.toggleUserStatus` | **Page**: `organizer-dashboard.html` -> **Action**: Admin clicking "Suspend/Activate". |

---

## 4. Intel & AI Module (`/api/v1/recommendations` & `/api/v1/analytics`)

| Method | Endpoint | Backend Function | Frontend Action / UI Trigger |
| :--- | :--- | :--- | :--- |
| **GET** | `/recommendations` | `recommendationController.getRecommendations` | **Page**: `dashboard.html` -> **Action**: On load to populate the AI cards. |
| **GET** | `/analytics/organizer` | `analyticsController.getOrganizerStats` | **Page**: `organizer-dashboard.html` -> **Action**: On load to fill the stat cards (Reach, Growth). |

---

## Summary for Presentation
Explain it like this:
1.  **Frontend (The Client)**: Initiates an action (e.g., clicks a button).
2.  **API Request**: The frontend JS uses `fetch()` to call a specific **Endpoint** (e.g., `POST /login`).
3.  **Backend (The Server)**: The **Route** picks up the request and passes it to a **Controller**.
4.  **Database**: The Controller talks to the **MongoDB Schema** to save or retrieve data.
5.  **Return**: The server returns JSON back to the frontend, which updates the UI (e.g., shows a "Login Success" toast).
