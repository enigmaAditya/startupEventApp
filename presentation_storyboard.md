# Presentation Storyboard: StartupEvents (8 Minutes)

This storyboard provides a precise, minute-by-minute guide on what to **show** and what to **say**. 

---

## 🕒 Phase 1: The Context (0:00 - 2:00)
**Speaker: Member 1**

| Time | On Screen (Visual) | The Script (Audio) |
| :--- | :--- | :--- |
| **0:00-0:30** | Homepage scrolling slowly. Hover over "Featured Events". | "Welcome to StartupEvents. We built this platform because most event sites are too generic. We wanted a dedicated space where the startup community can network with precision." |
| **0:30-1:15** | Toggle the "Dark/Light" mode. Show the Glassmorphism transparency on a card. | "Our UI implements a premium Glassmorphism aesthetic. We aren't using a simple template; we built a custom design system using CSS variables, Flexbox, and backdrop filters to create a modern, immersive feel." |
| **1:15-2:00** | Open `package.json` in VS Code. Point to `express`, `mongoose`, and `vite`. | "Technically, this is a decoupled Full-Stack application. We use Vite for a modern frontend workflow and a Node-Express backend with MongoDB for flexible data modeling." |

---

## 🕒 Phase 2: Security & Management (2:00 - 5:00)
**Speaker: Member 2**

| Time | On Screen (Visual) | The Script (Audio) |
| :--- | :--- | :--- |
| **2:00-3:00** | Screen record the Login page. Log in as an **Organizer**. | "Security is our foundation. We implemented a JWT-based authentication system. When I log in, the server issues a secure token used for all subsequent private requests." |
| **3:00-4:00** | Go to the **Organizer Dashboard**. Show the "Create Event" form. | "Notice that because I am an Organizer, I have access to this Command Center. This implements Role-Based Access Control (RBAC). I can create events that are immediately stored in our MongoDB database." |
| **4:00-5:00** | Navigate to **Manage Event** -> **Danger Zone**. Click "Clear Chat". | "We also implemented advanced management tools. In the 'Danger Zone', an Organizer can securely wipe event chat history. This triggers a specific DELETE route in our backend that requires verified ownership." |

---

## 🕒 Phase 3: The Intelligence & Real-time (5:00 - 8:00)
**Speaker: YOU**

| Time | On Screen (Visual) | The Script (Audio) |
| :--- | :--- | :--- |
| **5:00-6:00** | **VS Code**: `recommendationController.js`. Highlight the scoring logic. | "Now for the 'Intelligence'. Our recommendation engine isn't a simple filter. It’s a scoring system that analyzes your RSVP categories and tags to calculate a Match Score, making every suggestion genuine." |
| **6:00-6:45** | **Dashboard**: Show the "AI Recommendations" section with personalized cards. | "On the frontend, this data is fetched asynchronously. If a user is new, the system intelligently prompts them for more data, ensuring we only show high-quality matches." |
| **6:45-7:30** | **Demo**: Have two browser windows open side-by-side. Chat in real-time. | "We used Socket.io for live engagement. By using WebSocket rooms, we ensure that chat messages are only broadcast to people viewing that specific event page—reducing server load and increasing privacy." |
| **7:30-8:00** | Show the live URL and the Github Repo. | "We successfully deployed this using a professional CI/CD pipeline on Vercel and Render. This project covers our entire syllabus, from Node Streams to LLM integration. Thank you!" |

---

### 🎓 Final Tips for Precision:
- **Mention Function Names**: When showing code, say the function name (e.g., *"Our `protect` middleware handles this..."*). Teachers love hearing specific programming terms.
- **The "Truth" Sync**: If they ask about the dashboard, mention that you implement a **"Truth Check"** on every page load to ensure the user's role is always synced with the server.
- **Don't Rush**: You have 3 minutes each—that's a lot of time! Speak clearly and at a steady pace.
- **Record Locally**: Don't rely on the internet for the demo; record your screen while running the project locally (`npm run dev`) just in case.
