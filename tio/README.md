# TryItOn! 🎨

A fashion **outfit-design platform** proof-of-concept built for a university thesis and future startup. TryItOn! lets users design 2D layered avatars, assemble outfits from shirts, pants, and hats, save looks to a personal wardrobe, browse colour-themed demo shops, and get simple shop recommendations based on the items they want to buy.

> This is a **proof-of-concept** — there is no real checkout, payments, or AI. The avatar is a 2D PNG compositing system, and recommendations use plain colour/category set-matching.

---

## ✨ Features

- **Authentication** — register, login, logout with bcrypt-hashed passwords and express-session.
- **Dashboard** — personalised greeting and navigation cards to every tool.
- **Profile** — view account details, member-since date, saved-outfit count, and body measurements; edit username and measurements via a modal.
- **Avatar Designer** — a 2D layered avatar (legs → body → head → hat) with three colours (Red / Blue / Yellow) per layer. Colours update in real time and persist via `localStorage`.
- **Outfit Designer** — pick shirt, pants, and hat colours, name your look, and save it to the database. Supports editing existing outfits.
- **Wardrobe** — card grid of every saved outfit with live avatar previews, colour swatches, dates, and edit / duplicate / delete actions.
- **Shop** — three demo shops, each themed around a single colour (Shop A = Red, Shop B = Blue, Shop C = Yellow), each stocking a shirt, pants, and hat.
- **Recommendations** — multi-select colours per item category; shops are ranked by how many of your picks they stock, with the best match highlighted.
- **Error pages** — custom 404 and 500 pages.
- **Design system** — minimalist Apple/Nike/Figma-inspired UI with glassmorphism, soft shadows, rounded corners, scroll-reveal animations, and a fully responsive layout.

---

## 🧱 Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | HTML5, CSS3 (custom properties), Vanilla JavaScript (ES6+) |
| Backend      | Node.js, Express.js                 |
| Database     | SQLite (`sqlite3`)                  |
| Auth         | `bcrypt` (10 rounds) + `express-session` |
| Avatars      | 2D PNG layers (600×840), no AI / no 3D |

---

## 📁 Project Structure

```
tryiton/
├── app.js                      # Express entry point (middleware, routes, server)
├── package.json                # Dependencies & npm scripts
├── generate_avatar_assets.py   # Python script that builds the PNG avatar layers
├── README.md
│
├── config/
│   └── index.js                # Central config (port, db path, session secret, bcrypt rounds)
│
├── db/
│   ├── connection.js           # Promisified sqlite3 singleton (run / get / all)
│   ├── init.js                 # Schema creation + seed-safe init
│   └── tryiton.sqlite          # SQLite database file (auto-generated)
│
├── middleware/
│   ├── auth.js                 # requireAuth, redirectIfAuth, attachUser
│   ├── validate.js             # Registration / login / outfit input validators
│   └── errorHandler.js         # 404 + centralised error handler
│
├── models/
│   ├── user.js                 # create, findByEmail, findByUsername, findById, updateProfile
│   └── outfit.js               # create, findById, findByUser, update, remove
│
├── controllers/
│   ├── authController.js       # register / login / logout
│   ├── profileController.js    # show profile, GET/POST /api/me
│   └── outfitController.js     # list / create / update / delete / duplicate
│
├── routes/
│   ├── index.js                # GET / → landing
│   ├── auth.js                 # /auth/register, /auth/login, /auth/logout
│   ├── pages.js                # Auth-gated HTML pages (/dashboard, /profile, …)
│   └── api.js                  # JSON API for /api/me and /api/outfits
│
└── public/                     # Static assets served by Express
    ├── index.html              # Landing page
    ├── register.html
    ├── login.html
    ├── dashboard.html
    ├── profile.html
    ├── avatar.html             # Avatar Designer
    ├── design.html             # Outfit Designer
    ├── wardrobe.html
    ├── shop.html
    ├── recommend.html          # Recommendations
    ├── 404.html
    ├── 500.html
    │
    ├── css/
    │   ├── variables.css       # Design tokens (colours, type, spacing, radii, shadows)
    │   ├── base.css            # Reset, typography, body, footer
    │   ├── navbar.css          # Shared navbar (injected via JS)
    │   ├── buttons.css         # Button variants
    │   ├── cards.css           # Cards, outfit cards, colour swatches
    │   ├── forms.css           # Inputs, fields, labels
    │   ├── avatar.css          # Layered avatar stage + pop animation
    │   ├── animations.css      # Keyframes (fade-up, fade-in, scale-in, …)
    │   ├── utilities.css       # Helpers (flex, text-muted, badges, spacing)
    │   ├── landing.css         # Landing-page-specific styles
    │   └── pages.css           # Dashboard, designer, wardrobe, shop, recommend, modal
    │
    ├── js/
    │   ├── utils.js            # formatDate, param, escape (XSS), toast, sleep
    │   ├── api.js              # Fetch wrapper for /api/* and /data/shops.json
    │   ├── main.js             # Navbar init, scroll reveals, footer builder
    │   ├── components/
    │   │   ├── navbar.js       # Navbar.init() — renders shared nav
    │   │   └── avatar.js       # Avatar.render(colors, size) — 2D layer compositing
    │   └── pages/
    │       ├── landing.js      # Hero avatar + interactive demo
    │       ├── auth.js         # Register & login form logic
    │       ├── dashboard.js    # Greeting personalisation
    │       ├── profile.js      # Profile render + edit modal
    │       ├── avatar.js       # Avatar designer logic
    │       ├── design.js       # Outfit designer (create + edit modes)
    │       ├── wardrobe.js     # Wardrobe grid + actions
    │       ├── shop.js         # Shop tabs + items
    │       └── recommend.js    # Multi-select chips + shop ranking
    │
    ├── data/
    │   └── shops.json          # Demo shop data (3 shops × 3 items)
    │
    └── images/
        └── avatar/
            ├── head.png                    # Shared head layer
            ├── body-{red,blue,yellow}.png  # Body / shirt layer
            ├── legs-{red,blue,yellow}.png  # Legs / pants layer
            ├── hat-{red,blue,yellow}.png   # Hat layer
            └── logo.png                    # Favicon / brand mark
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (tested on Node 20)
- **npm** (comes with Node)
- *(Optional)* **Python 3** with `cairosvg` — only needed if you want to regenerate the avatar PNGs via `generate_avatar_assets.py`. The PNGs are already included.

### Installation

```bash
# 1. Clone / extract the project and enter its directory
cd tryiton

# 2. Install dependencies
npm install

# 3. Initialise the database (creates users, outfits, sessions tables)
npm run init-db

# 4. Start the server
npm start
```

The app runs on **http://localhost:3000**.

### npm Scripts

| Script          | Description                                  |
| --------------- | -------------------------------------------- |
| `npm start`     | Starts the Express server (`node app.js`)    |
| `npm run dev`   | Same as start (alias for development)        |
| `npm run init-db` | Creates the SQLite schema (idempotent)     |

---

## 🗄️ Database Schema

The SQLite database (`db/tryiton.sqlite`) is created by `db/init.js` and contains three tables:

### `users`
| Column        | Type    | Notes                                   |
| ------------- | ------- | --------------------------------------- |
| id            | INTEGER | Primary key, auto-increment             |
| email         | TEXT    | Unique, not null                        |
| username      | TEXT    | Unique, not null                        |
| password_hash | TEXT    | bcrypt hash (10 rounds), not null       |
| measurements  | TEXT    | JSON string (nullable)                  |
| created_at    | TEXT    | ISO timestamp                           |

### `outfits`
| Column    | Type    | Notes                                         |
| --------- | ------- | --------------------------------------------- |
| id        | INTEGER | Primary key, auto-increment                   |
| user_id   | INTEGER | FK → users.id, ON DELETE CASCADE              |
| name      | TEXT    | Outfit name (max 60 chars)                    |
| shirt     | TEXT    | Colour: `red` \| `blue` \| `yellow`           |
| pants     | TEXT    | Colour: `red` \| `blue` \| `yellow`           |
| hat       | TEXT    | Colour: `red` \| `blue` \| `yellow`           |
| created_at| TEXT    | ISO timestamp                                 |

### `sessions`
| Column    | Type    | Notes                                   |
| --------- | ------- | --------------------------------------- |
| sid       | TEXT    | Primary key (session id)                |
| sess      | TEXT    | JSON-serialised session data            |
| expired   | INTEGER | Expiry timestamp                        |

---

## 🔌 API Reference

All `/api/*` routes require an authenticated session and return JSON.

| Method | Endpoint                     | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/api/me`                    | Current user's profile               |
| POST   | `/api/me`                    | Update username / measurements       |
| GET    | `/api/outfits`               | List current user's outfits (newest) |
| POST   | `/api/outfits`               | Create a new outfit                  |
| PUT    | `/api/outfits/:id`           | Update an outfit                     |
| DELETE | `/api/outfits/:id`           | Delete an outfit                     |
| POST   | `/api/outfits/:id/duplicate` | Duplicate an outfit                  |

Auth routes (HTML or redirect responses):

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/auth/register`    | Render register page     |
| POST   | `/auth/register`    | Create account           |
| GET    | `/auth/login`       | Render login page        |
| POST   | `/auth/login`       | Authenticate + session   |
| POST   | `/auth/logout`      | Destroy session          |

---

## 🎭 How the Avatar Works (No AI, No 3D)

The avatar is a stack of four transparent PNG layers, each 600×840 pixels, positioned absolutely with z-index ordering:

```
z-index (bottom → top):  legs  →  body  →  head  →  hat
```

- **head.png** — a single shared head (no colour variant).
- **body-{color}.png** — the shirt/torso layer; one file per colour.
- **legs-{color}.png** — the pants layer; one file per colour.
- **hat-{color}.png** — the hat layer; one file per colour.

Changing a colour simply swaps the `src` of one `<img>` layer. A CSS `avatar-pop` keyframe re-triggers on every swap for a subtle animation. The PNGs were generated from SVG sources using `generate_avatar_assets.py` (Python + `cairosvg`).

---

## 🧭 Page Guide

| Page            | Route        | Auth | Purpose                                              |
| --------------- | ------------ | ---- | ---------------------------------------------------- |
| Landing         | `/`          | No  | Hero, features, interactive demo, CTAs               |
| Register        | `/auth/register` | No | Create an account                                 |
| Login           | `/auth/login`    | No | Sign in                                           |
| Dashboard       | `/dashboard` | Yes | Greeting + nav cards to every tool                   |
| Profile         | `/profile`   | Yes | Account details, measurements, edit modal            |
| Avatar Designer | `/avatar`    | Yes | Customise avatar colours (real-time preview)         |
| Outfit Designer | `/design`    | Yes | Assemble & save outfits (`?edit=<id>` for editing)   |
| Wardrobe        | `/wardrobe`  | Yes | Browse, edit, duplicate, delete saved outfits        |
| Shop            | `/shop`      | Yes | Browse three colour-themed demo shops                |
| Recommendations | `/recommend` | Yes | Pick items → ranked shop matches                     |

---

## 🎨 Design System

The UI follows a minimalist, Apple/Nike/Figma-inspired aesthetic:

- **Colours** — white, black, light gray, and an accent blue (defined in `public/css/variables.css`).
- **Typography** — system font stack with a clear size scale (`--text-sm` … `--text-2xl`).
- **Components** — rounded corners, soft shadows, glassmorphism (`backdrop-filter: blur`), and consistent spacing via CSS custom properties.
- **Motion** — scroll-reveal animations via `IntersectionObserver`, hover transitions, and keyframe entrance animations (`fade-up`, `scale-in`).
- **Responsive** — desktop-first with mobile-friendly breakpoints (e.g., designer grids collapse to a single column under 860px).

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (10 rounds) — never stored in plain text.
- Sessions are managed by **express-session** with a secret key and 24-hour cookie max-age.
- All authenticated routes are guarded by the `requireAuth` middleware.
- User input is validated server-side (`middleware/validate.js`) and escaped on the client (`Utils.escape`) to mitigate XSS.

> ⚠️ **Proof-of-concept only.** Before any real deployment you should: set a strong `SESSION_SECRET` via environment variables, enable `secure` cookies over HTTPS, add CSRF protection, rate-limit auth endpoints, and run behind a reverse proxy.

---

## 🛠️ Regenerating Avatar Assets (Optional)

The PNG layers are already included in `public/images/avatar/`. To regenerate them:

```bash
pip install cairosvg
python generate_avatar_assets.py
```

This script renders the SVG layer definitions to 600×840 PNGs.

---

## 📝 License

MIT — free to use for educational and prototype purposes.
