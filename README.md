# NXT Health

A platform for medical founders: verified clinical problem statements, grant applications, step-by-step roadmaps, resources and events, mentors, and messaging.

- **Frontend:** React + Vite, hosted on GitHub Pages (`/`)
- **API:** Express + MongoDB, hosted on Render (`server/`)
- **Sign-in:** Firebase Authentication (email/password, email verification, password reset)
- **Evidence files:** stored in MongoDB (GridFS), 10 MB per file

## Run locally

You need Node.js 20+. Nothing else — MongoDB and sign-in run locally.

```bash
npm install
npm --prefix server install
```

Then, in three terminals:

```bash
npm run dev:auth   # Firebase Auth emulator (sign-in UI at http://127.0.0.1:4000)
npm run dev:api    # API on :8080 with an in-memory MongoDB (data kept in server/.dev-data)
npm run dev        # website on http://localhost:3000
```

Verification and password-reset emails aren't sent locally — open them from the emulator UI at http://127.0.0.1:4000/auth.

To make yourself an admin locally, sign up on the site, then:

```bash
MONGODB_URI="<the URI printed by dev:api>" npm --prefix server run make-admin -- you@example.com
```

Tests (permission rules, uploads, bookings, RSVP capacity):

```bash
npm run test:api
```

## Deploy

1. **MongoDB Atlas** — create a free M0 cluster and a database user. Under Network Access allow `0.0.0.0/0` (Render has no fixed IP on its free/starter plans). Copy the connection string.
2. **Firebase** — create a project, enable *Authentication → Email/Password*, and add `realsenso.github.io` under *Authentication → Settings → Authorized domains*. Register a web app and note its config. Under *Project settings → Service accounts* generate a private key (JSON).
3. **Render** — *New → Blueprint*, pick this repo (it reads `render.yaml`). Set `MONGODB_URI` and `FIREBASE_SERVICE_ACCOUNT` (paste the JSON on one line). Note the service URL, e.g. `https://nxt-health-api.onrender.com`.
4. **GitHub** — *Settings → Secrets and variables → Actions → Variables*: add `VITE_API_URL` (the Render URL) and `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`. Pushing to `main` deploys the site.
5. **First admin** — sign up on the live site, then run `make-admin` once with your Atlas `MONGODB_URI`, reload, open *Admin console* and click **Load starter content**.

Secrets (`MONGODB_URI`, the service-account JSON) belong only in Render — never in the repo.

## Look and feel

The site is black and white, set in Helvetica Neue. The colours live in `src/index.css` (tokens named `--nxt-*`).

**Fonts.** Helvetica Neue LT Std is a commercial font and this repository is public, so the font files are *not* committed. To use it locally, unzip the font and put these four files in `src/fonts/`: `HelveticaNeueLTStd-Roman.otf`, `-Md.otf`, `-Bd.otf`, `-Blk.otf`, then create `src/fonts.local.css` containing one `@font-face` rule per file (family `'Helvetica Neue LT Std'`, weights 400, 500, 600–800 and 900, `src: url('./fonts/<file>.otf')`). Both paths are git-ignored. Without them the site falls back to the Helvetica Neue / Helvetica that ships with Apple devices, then Arial. If your licence covers web embedding and you want to ship the files, remove the two lines from `.gitignore`.

## Public pages

- `/` — home page for visitors; its "Name the problem" form and `/experts/join` post to `POST /api/public/inquiries` (rate-limited, with a honeypot). Admins read them under **Admin console → Enquiries**.
- `/experts`, `/experts/:id` — the public expert directory and booking page. Experts are users an admin has marked as mentors whose profile is "accepting"; rate, topics, weekly days and IST start times come from the mentor profile. Booked sessions are paid with a **demo** payment step (no card is charged) and open a private chat.

## Categories, roadmaps and problem statements

- **Categories** (25 solution types, 6 open and 19 "coming soon") and the **problem statements** come from the NXT Platform sheets and are in `server/src/starterContent.ts`. A new, empty site gets them from **Load starter content** in the admin console. When the API starts it also removes the older sample content (the first-generation categories and the six sample problems) — a no-op once they are gone.
- **Roadmaps** are built from a checklist file — each phase becomes a step, each row a task with its details. The checklist is the product's core content and this repository is public, so it is **not committed**: it lives in `server/content/marketplace-roadmap.json` (git-ignored) and is loaded with **Categories → Import roadmap file** in the admin console. The format is defined in `server/src/roadmapTypes.ts`.
- Every open category currently gets the Marketplace checklist (the only one supplied so far). Add a category-specific file later and import it the same way.
- `npm --prefix server run seed-demo` also reads `server/content/marketplace-roadmap.json` (or `$ROADMAP_FILE`).

