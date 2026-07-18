# TryItOn! — Proof-of-Concept Website

## Phase 1: Project Scaffolding
- [x] Create folder structure (public, routes, controllers, models, middleware, db, config)
- [x] package.json with dependencies (express, bcrypt, express-session, sqlite3)
- [x] Server entry point (app.js)
- [x] Database initialization + schema (users, outfits, sessions)
- [x] Config files (db connection)
- [x] Install deps + init DB (verified: users, outfits, sessions tables)

## Phase 2: Backend
- [x] Models: User, Outfit
- [x] Middleware: auth guard, input validation, error handler
- [x] Controllers: auth, profile, outfit
- [x] Routes: index, auth, pages, api
- [x] Static JSON for shops

## Phase 3: Frontend — Shared
- [x] CSS: variables.css, base.css, navbar.css, buttons.css, cards.css, forms.css, avatar.css, animations.css, utilities.css, landing.css, pages.css
- [x] JS: api.js, utils.js, components/navbar.js, components/avatar.js, main.js

## Phase 4: Frontend — Pages
- [x] Landing (index.html + landing.js)
- [x] Register (register.html + auth.js)
- [x] Login (login.html + auth.js)
- [x] Dashboard (dashboard.html + dashboard.js)
- [x] Profile (profile.html + profile.js)
- [x] Avatar Designer (avatar.html + avatar.js page script)
- [x] Outfit Designer (design.html + design.js page script)
- [x] Wardrobe (wardrobe.html + wardrobe.js page script)
- [x] Shop (shop.html + shop.js page script)
- [x] Recommendation (recommend.html + recommend.js page script)
- [x] Error pages (404.html, 500.html)

## Phase 5: Assets
- [x] Generate PNG avatar layers (head, body, legs, hat) in 3 colors each + logo
- [x] Verified layer compositing (all 600x840, stack pixel-perfect)

## Phase 6: Run & Verify + README
- [x] README.md with run instructions
- [ ] Install deps, init DB, start server, smoke test all pages/routes
- [ ] Final delivery (complete tool)
