# Syllabus ↔ Code Mapping

> Every piece of code in this project maps to a specific syllabus topic. This document shows you exactly where each concept is implemented.

---

## Frontend

### Unit I — HTML5 & CSS3 Foundations

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| HTML document structure | All `.html` files | `<!DOCTYPE>`, `<html>`, `<head>`, `<meta>`, `<body>` |
| Semantic elements | `index.html` | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` |
| Forms & input controls | `register.html`, `event-detail.html` | `<input>`, `<select>`, `<textarea>`, `<datalist>`, `<label>`, `type="email/password/date/file"` |
| Multimedia | `event-detail.html` | `<video controls>`, `<source>`, `poster` attribute |
| CSS Selectors & Specificity | `components.css` | Class selectors, pseudo-classes (`:hover`, `:focus`), BEM naming |
| Box Model | `components.css` | `padding`, `margin`, `border`, `box-sizing: border-box` |
| Positioning | `layout.css` | `sticky` (navbar), `fixed` (modal), `absolute` (badges), `relative` |
| Flexbox | `layout.css` | Navbar, hero actions, dashboard sidebar, card footers |
| CSS Grid | `layout.css` | Events grid, footer columns, event detail layout, stats |
| Responsive design | `responsive.css` | `@media` queries for mobile/tablet/desktop/large screens |
| CSS Variables | `variables.css` | `:root` custom properties for colors, spacing, typography |
| Git & GitHub | `.gitignore`, commit history | `git init`, branching, commits, `.gitignore` |

### Unit II — JavaScript Fundamentals

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| Syntax & data types | `validation.js` | Strings, numbers, booleans, objects, arrays |
| Variables & scope | `theme.js` | `const`, `let`, IIFE for scope isolation |
| Operators | `validation.js` | Ternary, spread (`...`), optional chaining (`?.`), regex `.test()` |
| Control flow | `validation.js`, `filters.js` | `if/else`, `switch`, `for...of` loop |
| Functions & arrow functions | `validation.js` | Named functions, arrow functions, callback parameters |
| Arrays | `filters.js` | `.filter()`, `.sort()`, `.map()`, `.forEach()`, `.some()`, `.every()` |
| Objects | `validation.js` | Object literals, destructuring, computed properties |
| Event handling | `theme.js`, `utils.js` | `addEventListener('click')`, `event.preventDefault()` |
| Browser interaction | `theme.js` | `localStorage.getItem/setItem`, `document.getElementById` |

### Unit III — Advanced JS & Async

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| Closures | `search.js` (debounce), `tokenManager.ts` | Debounce captures `timeoutId`, token manager captures tokens |
| Prototypes | `appEvents.js` (backend) | Custom EventEmitter extending Node's built-in |
| Event loop | Counter animation, async fetch | `requestAnimationFrame`, `setTimeout`, `Promise.then` ordering |
| Promises & async/await | API service layer | `fetch()`, `.then()`, `async/await`, `try/catch` |
| ES6+ features | Throughout | Destructuring, template literals, optional chaining, spread, modules |
| JS Modules | All files | `import/export` (ES modules in frontend) |

### Unit IV — DOM Manipulation & Tooling

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| DOM structure | All HTML pages | DOM tree, parent-child relationships |
| DOM traversal | `filters.js` | `querySelector`, `querySelectorAll`, `closest`, `parentElement` |
| DOM manipulation | `utils.js` (toasts), `filters.js` | `createElement`, `appendChild`, `remove`, `innerHTML` |
| Dynamic styling | `theme.js`, `validation.js` | `classList.add/remove/toggle`, `style` property, CSS variables |
| Event delegation | `filters.js` | Single listener on `.events-grid` handling all card clicks |
| Debugging | Throughout | `console.log`, `debugger`, DevTools |
| Bundling (Vite) | `vite.config.js` | Module bundling, HMR, production build |
| Linting | `.eslintrc.js`, `.prettierrc` | ESLint rules, Prettier formatting |

### Unit V — TypeScript Fundamentals

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| Type annotations | `ts/types/*.ts` | Function params, return types |
| Interfaces | `ts/types/event.ts` | `IEvent`, `IUser`, `IRSVP` |
| Type aliases | `ts/types/event.ts` | `EventCategory`, `UserRole` |
| Union types | `ts/types/api.ts` | `SuccessResponse \| ErrorResponse` |
| Intersection types | `ts/types/event.ts` | `IEvent & { organizer: IUser }` |
| Generics | `ts/api/client.ts` | `fetchData<T>(url): Promise<ApiResponse<T>>` |
| Type narrowing | API response handling | `if ('error' in response)` |
| `tsconfig.json` | `tsconfig.json` | Strict mode, target, module resolution |

### Unit VI — TypeScript for Web Apps & QA

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| Type-safe models | `ts/types/` | Shared types across all modules |
| Component typing | `ts/components/*.ts` | Typed render functions |
| Testing | `__tests__/*.test.ts` | Vitest unit tests |
| Static analysis | `.eslintrc.js` | `@typescript-eslint` rules |
| Code quality | `.husky/pre-commit` | Pre-commit hooks |

---

## Backend

### Unit I — Node.js & Data I/O

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| Node.js intro | `server.js` | Node.js runtime, event-driven architecture |
| npm & `package.json` | `package.json` | Scripts, dependencies, devDependencies |
| Core modules | `logger.js`, `compressor.js` | `fs`, `path`, `zlib`, `events`, `stream` |
| Local modules | `logger.js`, `appEvents.js` | `module.exports`, `require()` |
| Third-party modules | `app.js` | `express`, `mongoose`, `dotenv`, `chalk` |
| EventEmitter | `appEvents.js` | Custom event bus extending `EventEmitter` |
| Callbacks | `appEvents.js` | `.on()` callback listeners |
| fs module | `logger.js` | `createWriteStream`, `existsSync`, `mkdirSync` |
| Streams | `logger.js`, `compressor.js` | `ReadStream`, `WriteStream`, `pipeline()` |
| Zlib | `compressor.js` | `createGzip()`, `createGunzip()`, compression |
| Promises/async | `seed.js`, all controllers | `async/await`, `try/catch` |

### Unit II — Express & HTTP Services

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| Express setup | `app.js` | `express()`, middleware stack |
| GET/POST | `eventRoutes.js` | `.get()`, `.post()`, `.put()`, `.delete()` |
| `express.Router()` | All route files | Modular routing |
| `express-validator` | `validators/*.js` | `body()`, `query()`, validation chains |
| Error handling | `errorHandler.js` | 4-param middleware, custom `ApiError` class |
| HTTP module | `server.js` | `http.createServer()` |
| Request/Response | All controllers | `req.body`, `req.params`, `req.query`, `res.status().json()` |
| Status codes | All controllers | `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500` |

### Unit III — Sockets, Middleware & Auth

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| WebSocket/Socket.IO | `sockets/index.js` | `socket.on()`, `socket.emit()`, rooms |
| Chat server | `sockets/index.js` | `join:event`, `chat:message`, broadcasting |
| `app.use()` | `app.js` | Middleware ordering, global middleware |
| `app.all()` | `app.js` | 404 catch-all handler |
| `cookie-parser` | `app.js` | Parsing auth cookies |
| JWT | `auth.js`, `User.js` | `jwt.sign()`, `jwt.verify()`, access/refresh tokens |
| RBAC | `authorize.js` | Role-checking middleware factory (closure!) |
| Security headers | `app.js` | `helmet()` middleware |

### Unit IV — MongoDB & Mongoose

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| MongoDB terminology | `docs/mongodb-commands.md` | Database, collection, document |
| Shell commands | `docs/mongodb-commands.md` | `show dbs`, `use`, `find`, `insert`, `update`, `delete` |
| Schema definition | `models/Event.js`, `User.js` | Types, required, enums, nested objects |
| Models | All model files | `mongoose.model()`, static/instance methods |
| CRUD operations | `eventController.js` | `.find()`, `.create()`, `.findByIdAndUpdate()`, `.delete()` |
| Pagination | `paginate.js` | `.skip()`, `.limit()`, page/limit query params |

### Unit V — Advanced MongoDB & Analytics

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| Advanced Mongoose | `models/EventAnalytics.js`, `UserActivity.js` | Analytics schema design, compound indexes |
| Aggregation pipeline | `services/analyticsService.js` | `$group`, `$match`, `$sort`, `$lookup` |
| Dashboard queries | `controllers/analyticsController.js` | Event views, RSVP trends, top events |

### Unit VI — Testing & LLM

| Syllabus Topic | File(s) | What to Explain |
|---|---|---|
| REST API testing | `__tests__/*.test.js` | Jest + Supertest |
| Deployment | `render.yaml` | GitHub → Render deployment |
| API versioning | `app.js` | `/api/v1/` prefix |
| OpenAI API | `services/aiService.js` | Event recommendations |
| Embeddings | `services/embeddingService.js` | Semantic search |
| Prompt engineering | `services/aiService.js` | Structured prompts |
