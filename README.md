# Changelog & Product Updates Hub 🚀

A production-grade, full-stack **MERN** (MongoDB, Express.js, React.js with Vite, Node.js) product update and release delivery hub inspired by Headway and Beamer. Features **Dual JWT token rotation with reuse/theft detection**, an **unread notification center**, an **admin markdown publishing studio with live split preview**, and an **interactive emoji reaction timeline**.

---

## 📸 Overview & Key Features

- 🛡️ **Dual JWT Token Auth with Refresh Rotation**:
  - 15-minute short-lived Access Tokens passed via `Authorization: Bearer <token>`.
  - 7-day long-lived Refresh Tokens stored in an `httpOnly`, `sameSite: 'lax'` cookie.
  - **Single-Use Rotation & Theft Detection**: Any attempt to reuse an old refresh token hash immediately revokes all active sessions for that user and returns HTTP `401 TOKEN_REUSE_DETECTED`.
- 🔔 **"What's New" Notification Center & Drawer**:
  - Dynamic unread badge counter calculated via `publishedAt > user.lastViewedChangelogDate`.
  - Accessible slide-over drawer with backdrop blur and keyboard `ESC` dismissal.
  - Opening the drawer automatically syncs the user's timestamp and zeroes the badge.
- 🎨 **Admin Markdown Publishing Studio**:
  - Real-time split-screen editor: raw Markdown on the left, live styled preview on the right.
  - Syntax highlighting for code blocks, GitHub alert callouts, tables, and blockquotes.
  - Auto-generated URL slugs with manual override capability.
  - Cover image file uploads handled via **Multer** and saved to `/backend/uploads` (served statically).
  - Draft vs. Published lifecycle management (`publishedAt` timestamping).
- ❤️ **Interactive Emoji Reactions**:
  - Live reaction counters for `❤️`, `🎉`, and `🚀`.
  - Database-enforced compound uniqueness (`{ user, changelogEntry, emoji }`) preventing count inflation while allowing users to select multiple distinct reaction types.
- 🔍 **Public Release Timeline**:
  - Debounced keyword search across title and markdown content.
  - Category pill tabs: `#New`, `#Improved`, `#Fixed`, `All`.
  - Standalone deep-linkable release pages (`/changelog/:slug`).
  - Public JSON feed (`/api/v1/changelog/feed`) for external integrations, widgets, or RSS readers.
- 🧩 **Accessible Tailwind UI Primitives**:
  - Handcrafted, composable UI components in `src/components/ui/` (`Button`, `Input`, `Textarea`, `Card`, `Badge`, `Sheet`, `Dialog`, `Tabs`, `Toast`, `Skeleton`).

---

## 📁 Repository Structure

```
/
├── backend/
│   ├── .env.example               # Documented environment variable template
│   ├── .gitignore
│   ├── package.json
│   ├── postman_collection.json    # Complete API test suite
│   ├── uploads/                   # Statically served uploaded cover images
│   ├── scripts/
│   │   ├── seed.js                # Seeds admin, demo user, 6+ rich posts & reactions
│   │   ├── runBackendTest.js      # In-process test runner
│   │   └── testAuthFlow.js        # Automated API test suite (10 verification checks)
│   └── src/
│       ├── config/                # DB connection, JWT config, constants
│       ├── controllers/           # Auth, Changelog, Admin, Reaction, Notification, Upload
│       ├── middleware/            # Auth protect, adminOnly, Zod validation, rate limiter, Multer
│       ├── models/                # User, ChangelogEntry, Reaction
│       ├── routes/                # Express v1 route definitions
│       ├── schemas/               # Zod input validation schemas
│       ├── utils/                 # Token generator, SHA256 hashing, slugify, email simulator
│       └── server.js              # Express app entrypoint (Port 5000)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js             # Vite config with /api and /uploads proxy to Port 5000
│   └── src/
│       ├── components/
│       │   ├── ui/                # Button, Input, Textarea, Card, Badge, Sheet, Dialog, Tabs, Toast, Skeleton
│       │   ├── layout/            # Navbar, Footer, AppLayout, AdminLayout, EmailVerificationBanner
│       │   ├── changelog/         # ChangelogCard, ReactionBar, FilterBar, MarkdownRenderer
│       │   └── widget/            # NotificationBell, SlideoverDrawer
│       ├── context/               # AuthContext, NotificationContext, ToastContext
│       ├── hooks/                 # useDebounce
│       ├── pages/                 # PublicTimeline, ChangelogDetail, Login, Signup, VerifyEmail, ForgotPassword, ResetPassword, AdminDashboard, AdminEditor, WidgetDemo
│       ├── services/              # Axios instance with 401 silent refresh rotation queue
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
└── README.md
```

---

## 🛠️ Tech Stack & Third-Party Library Rationale

| Layer | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Backend** | Node.js + Express | Fast, scalable asynchronous REST API server. |
| **Database** | MongoDB + Mongoose | Flexible document schema with compound indexes and text search. |
| **Validation** | Zod | Runtime schema validation on all mutating request bodies and parameters. |
| **Auth & Security** | `jsonwebtoken`, `bcryptjs`, `crypto` | Dual JWT rotation, SHA256 token hashing, and bcrypt 12-round password hashing. |
| **Rate Limiting** | `express-rate-limit` | Shields auth endpoints (5 req/15min on login/signup/forgot-password). |
| **File Storage** | `multer` | Disk storage for cover images with mime type filtering (served at `/uploads`). |
| **Frontend** | React 18 + Vite | Blazing-fast SPA development and production bundling. |
| **Styling** | Tailwind CSS | Utility-first, responsive design with customized dark-mode theme. |
| **Icons** | Lucide React | Lightweight, accessible SVG icon set. |
| **Markdown** | `react-markdown` + `remark-gfm` | Robust Markdown parsing with GitHub Flavored Markdown tables, strikethrough, and task lists. |
| **Networking** | Axios | Interceptors for seamless 401 refresh queuing and retry handling. |

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `CLIENT_URL` | Frontend URL for CORS allowance | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/changelog_hub` |
| `JWT_ACCESS_SECRET` | Secret key for signing short-lived access tokens | *32+ character random secret* |
| `JWT_ACCESS_EXPIRES_IN`| Expiration for access tokens | `15m` |
| `JWT_REFRESH_SECRET` | Secret key for signing long-lived refresh tokens | *32+ character random secret* |
| `JWT_REFRESH_EXPIRES_IN`| Expiration for refresh tokens | `7d` |
| `EMAIL_SIMULATION` | Flag to log verification/reset links to console | `true` |
| `ADMIN_EMAIL` | Default admin email populated by seed script | `admin@example.com` |
| `ADMIN_PASSWORD` | Default admin password populated by seed script | `AdminPass123!` |
| `ADMIN_NAME` | Default admin display name | `Super Admin` |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on v26)
- **MongoDB**: v6+ running locally on port `27017`

### 2. Backend Setup & Database Seeding

```bash
cd backend

# Install dependencies
npm install

# Run database seeding (populates admin, test user, 6 rich changelog posts & reactions)
npm run seed

# Start development API server (runs on http://127.0.0.1:5000)
npm run dev
```

### 3. Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Default Seed Credentials

| Account | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `AdminPass123!` | `admin` | Full publishing studio access, CRUD, publish toggle, image upload. |
| **Demo User** | `user@example.com` | `UserPass123!` | `user` | Can view timeline, toggle reactions, view unread notifications. |

> 💡 *Quick demo autofill buttons are built directly into the Login page for convenient one-click evaluation.*

---

## 🔐 Deep Dive: Token Rotation & Security Architecture

### 1. Dual Token Architecture
1. **Access Token** (`15 minutes`): Sent in the `Authorization: Bearer <accessToken>` header for all protected API calls.
2. **Refresh Token** (`7 days`): Stored in a secure `httpOnly`, `sameSite: 'lax'`, `path: '/'` cookie. JS code cannot read this cookie.

### 2. Rotation & Theft Detection Algorithm
```
Client Request (401 Expired Access Token)
         │
         ▼
POST /api/v1/auth/refresh (Cookie: refreshToken=...)
         │
         ├─► 1. Verify token signature via JWT_REFRESH_SECRET
         ├─► 2. Hash incoming token: hash = SHA256(refreshToken)
         ├─► 3. Compare with user.refreshTokenHash in database
         │
         ├───► ❌ MISMATCH (Old / Reused Token):
         │        • Trigger Security Alert: Token replay/theft suspected!
         │        • Invalidate stored hash: user.refreshTokenHash = null
         │        • Clear refresh cookie
         │        • Return 401 "TOKEN_REUSE_DETECTED" (Terminates all sessions)
         │
         └───► ✅ MATCH (Valid Current Token):
                  • Generate new Access Token (15m)
                  • Generate new Refresh Token (7d with random UUID jti nonce)
                  • Update database: user.refreshTokenHash = SHA256(newRefreshToken)
                  • Set new Refresh Token in httpOnly cookie
                  • Return new Access Token in response JSON
```

### 3. Frontend Silent Refresh Queue
When an API request returns `401 Unauthorized`:
- If another refresh is already in flight, subsequent requests are **queued**.
- The primary request triggers `/api/v1/auth/refresh`.
- Upon success, all queued requests are flushed with the new access token and retried.
- If refresh fails, `logout()` is dispatched and the user is redirected to `/login`.

---

## 🔔 Deep Dive: Unread Notification Algorithm

The unread badge count reflects real published releases that the user has not yet seen:

$$\text{Unread Count} = \text{Count of ChangelogEntry where } \left( \text{status} = \text{'Published'} \land \text{publishedAt} > \text{user.lastViewedChangelogDate} \right)$$

1. When a new user is created, `lastViewedChangelogDate` defaults to epoch `1970-01-01`, so all published releases start as unread.
2. When the user opens the slide-over notification drawer, the frontend dispatches `POST /api/v1/notifications/mark-read`.
3. The server updates `user.lastViewedChangelogDate = new Date()` and returns `unreadCount = 0`.
4. Subsequent published releases will increment the counter until the drawer is opened again.

---

## ❤️ Deep Dive: Reaction Uniqueness Guarantees

To ensure a user cannot artificially inflate reaction counts:
- The `Reaction` collection employs a **compound unique index**:
  ```javascript
  reactionSchema.index({ user: 1, changelogEntry: 1, emoji: 1 }, { unique: true });
  ```
- Calling `POST /api/v1/changelog/:id/react` with `{ emoji: '❤️' }` performs a toggle:
  - If the document exists for `(user, entry, emoji)` $\rightarrow$ delete it (`removed`).
  - If it does not exist $\rightarrow$ create it (`added`).
- A user **can** react with multiple different emoji types (e.g., both `❤️` and `🚀`), but cannot react with the same emoji twice on the same entry.

---

## 📡 API Reference

### Authentication (`/api/v1/auth`)
- `POST /signup` — Register user, returns JWT and logs simulated verification link.
- `GET /verify-email/:token` — Verifies user email address.
- `POST /login` — Authenticates user, sets refresh cookie, returns access token.
- `POST /refresh` — Rotates access and refresh tokens.
- `POST /logout` — Invalidate server refresh token hash and clear cookie.
- `POST /forgot-password` — Dispatches simulated password reset link.
- `POST /reset-password/:token` — Sets new password.
- `GET /me` — Returns current authenticated user profile (`protect` middleware).

### Public Changelog (`/api/v1/changelog`)
- `GET /` — List published entries. Supports `?category=New|Improved|Fixed|All`, `?q=search`, `?page=1`, `?limit=10`.
- `GET /:slug` — Get single published entry with author details and reactions.
- `GET /feed` — Public JSON feed for external widgets and aggregators.

### Emoji Reactions (`/api/v1/changelog`)
- `POST /:id/react` — Toggle emoji reaction (`❤️`, `🎉`, `🚀`) for authenticated user.
- `GET /:id/reactions` — Get reaction counts and current user's reaction states.

### Notification Center (`/api/v1/notifications`)
- `GET /unread-count` — Returns unread count based on `publishedAt > lastViewedChangelogDate`.
- `POST /mark-read` — Updates `lastViewedChangelogDate` to current timestamp.
- `GET /recent` — Returns recent 5 published entries for the slide-over preview.

### Admin Publishing Studio (`/api/v1/admin/changelog` - `adminOnly`)
- `GET /` — List all entries (Drafts + Published) with filters and reaction counts.
- `POST /` — Create new changelog entry.
- `GET /:id` — Get single entry for studio editor.
- `PUT /:id` — Update changelog entry.
- `PATCH /:id/publish` — Toggle or set publish status (`Draft` $\leftrightarrow$ `Published`).
- `DELETE /:id` — Delete entry and all associated reactions.

### Media Upload (`/api/v1/upload` - `adminOnly`)
- `POST /cover` — Multipart file upload via Multer. Saves image to `/backend/uploads` and returns URL.

---

## 📮 Postman Collection

A complete Postman Collection is included at [`backend/postman_collection.json`](backend/postman_collection.json).
It includes:
- Configured environment variables (`baseUrl`, `accessToken`, `adminAccessToken`, `changelogId`, `changelogSlug`).
- Automatic test scripts to capture and inject JWT tokens after login requests.
- Full coverage of Auth flows, Admin Studio CRUD, Public Feeds, Reactions, and Notifications.

---

## 🧪 Automated Testing

To run the backend test suite (covers health checks, admin login, token rotation, token reuse theft detection, public queries, reaction toggling, and notification mark-read):

```bash
cd backend
npm test
```

To verify the frontend build:

```bash
cd frontend
npm run build
```

---

## 🛡️ Security & Production Considerations

1. **Production Cookies**: In production (`NODE_ENV=production`), `secure: true` is enabled on the refresh cookie for HTTPS transmission.
2. **Rate Limiting**: `express-rate-limit` prevents brute-force attacks on `/auth/login`, `/auth/signup`, and `/auth/forgot-password`.
3. **Password Security**: Passwords are hashed with `bcryptjs` using 12 salt rounds and excluded by default (`select: false`).
4. **Input Validation**: All mutating endpoints enforce strict schema validation via `zod`.

---

## 📝 Assumptions & Limitations

- Email verification and password reset emails are **simulated** — no real 
  SMTP provider is integrated. Links/tokens are logged to the console and 
  returned in API responses when `NODE_ENV=development`.
- Cover images are stored on local disk (`/backend/uploads`), not on a 
  cloud storage service — suitable for local/demo use, not multi-server 
  production deployments.
- MongoDB is assumed to be running locally on the default port; no 
  managed cloud DB (e.g. Atlas) connection string is pre-configured.
- Rate limiting is applied only to auth routes, not globally across the API.
- No automated frontend test suite is included — only manual verification 
  and backend integration tests.