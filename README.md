# NxT Health

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
