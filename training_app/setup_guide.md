# Setup Guide

This guide explains how to run the training tracker on your local machine.  The application is composed of a Node/Express + SQLite backend and a React + Tailwind frontend.  You need **Node ≥ 18** installed.  Internet access is only required during package installation.

## 1. Clone the Repository

```bash
git clone <your‑repo‑url>
cd training_app
```

## 2. Install Dependencies

The backend and frontend are separate Node projects.  Install dependencies for each:

```bash
# install backend dependencies
cd backend
npm install

# install frontend dependencies
cd ../frontend
npm install
```

If you plan to enable optional Supabase cloud syncing, create a `.env` file in both `backend/` and `frontend/` with the keys `SUPABASE_URL` and `SUPABASE_ANON_KEY`.  The current code does not automatically sync to Supabase but these variables can be consumed by future extensions.

## 3. Run in Development

To start both services concurrently, open two terminal windows.

1. **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   This launches the Express server on `http://localhost:3001`.  The first run creates `database.db` and seeds it with exercises.

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Vite serves the React app on `http://localhost:5173` and proxies API requests to the backend.  Tailwind CSS recompiles automatically on save.

Navigate to the frontend URL in your browser (optimised for Samsung Galaxy S24 FE portrait at 1080×2340 px).  The app supports dark/light mode, a sticky bottom navigation and is fully touch‑friendly.  Use the **Add to home screen** option in your mobile browser to install it as a Progressive Web App.  Offline caching is handled by a service worker.

## 4. Build for Production

To create an optimised build of the frontend:

```bash
cd frontend
npm run build
```

The compiled assets appear in `frontend/dist`.  You can serve them behind the Express backend by copying the `dist` folder into `backend/public` and adding `express.static` middleware in `backend/index.js`.  Alternatively, deploy the frontend separately to Vercel or Netlify and the backend to Render or your own server.

## 5. Database Backup & Restore

The backend exposes two endpoints to back up and restore your local SQLite database.  These actions should be triggered from an admin UI or using tools like `curl`:

* **Create backup:**
  ```bash
  curl -X POST -H "Content-Type: application/json" \
       -d '{"passphrase":"mySecret"}' \
       http://localhost:3001/api/backup > backup.json
  ```
  The response contains a base64‑encoded encrypted copy of `database.db`.  Store this JSON somewhere safe.

* **Restore backup:**
  ```bash
  curl -X POST -H "Content-Type: application/json" \
       -d '{"passphrase":"mySecret","backup":"<paste‑base64‑data>"}' \
       http://localhost:3001/api/restore
  ```
  The server decrypts and writes the new `database.db`, replacing existing data.

## 6. Optional Supabase Add‑On

If you wish to store data in the cloud, you can create a **Supabase** project (free tier) and retrieve your **Project URL** and **Anon key**.  Then:

1. Install the dependency in the backend if not already present: `npm install @supabase/supabase-js`.
2. Configure `.env` variables `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. Extend `backend/index.js` to initialise the Supabase client and mirror writes to your Postgres database whenever a workout or vital is added.

The current implementation intentionally avoids cloud dependencies to prioritise privacy and offline access.