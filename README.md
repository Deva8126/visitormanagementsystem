# Visitor Management System (VMS)

A production-ready, secure corporate visitor management system featuring dynamic webcam captures, instant QR badge generation, thermal card printing templates, real-time analytics widgets, and a dual-storage adapter (Google Sheets + Google Drive integration with automatic local filesystem fallbacks).

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Recharts (analytics), HTML5 MediaDevices (Webcam).
- **Backend**: Node.js, Express.js, JWT Authentication, Express-Validator.
- **Primary Storage**: Google Sheets API (database) & Google Drive API (image storage).
- **Secondary/Fallback Storage**: Local JSON File (`db.json`) & Local uploads folder (activated automatically if Google credentials are not provided).

---

## 📁 Project Structure

```
visitor-management-system/
├── backend/
│   ├── data/
│   │   ├── uploads/            # Local photo storage in local fallback mode
│   │   └── db.json             # Local database file in local fallback mode
│   ├── src/
│   │   ├── config/
│   │   │   └── google.js       # Google APIs Client Configuration
│   │   ├── controllers/
│   │   │   ├── auth.js         # JWT validation logic
│   │   │   └── visitor.js      # Visitor registration, exit, history log handlers
│   │   ├── middleware/
│   │   │   ├── auth.js         # Bearer token verification and RBAC checks
│   │   │   └── validate.js     # Sanitizers for visitor registration
│   │   ├── services/
│   │   │   ├── logger.js       # File-based audit logging
│   │   │   └── storage.js      # Multi-database adapter (Google Sheet vs Local JSON)
│   │   └── server.js           # Server startup and REST endpoints
│   ├── .env.example
│   ├── .env                    # Local environment variables
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx      # Navigation layout shell with role filtering
    │   │   ├── PrivateRoute.jsx# React Router auth guard
    │   │   ├── VisitorPass.jsx # Dual preview and @media print thermal pass card
    │   │   └── WebcamCapture.jsx # Camera stream controller
    │   ├── pages/
    │   │   ├── Login.jsx       # Custom screen with developer credentials helper
    │   │   ├── Dashboard.jsx   # Metrics panels and area trend graphs
    │   │   ├── EntryForm.jsx   # Register inputs validator form
    │   │   ├── History.jsx     # Data grid log viewer, search filters, and exports
    │   │   ├── Exit.jsx        # facility active log viewer with exit triggers
    │   │   └── Settings.jsx    # Google integration credentials check panel
    │   ├── utils/
    │   │   ├── api.js          # Pre-configured Axios instance
    │   │   └── export.js       # Native Blob CSV and XML Excel sheets export modules
    │   ├── App.jsx             # Root Routing config
    │   ├── index.css           # Tailwind configuration and custom page print rules
    │   └── main.jsx
    ├── index.html              # Title and SEO meta tags definitions
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ Environment Configurations

Create a `.env` file inside the `backend/` directory using the variables defined in `backend/.env.example`:

```ini
PORT=5000
JWT_SECRET=supersecretjwtkeyforvmsapp2026

# Default credentials for testing (also configurable)
ADMIN_EMAIL=admin@vms.com
ADMIN_PASSWORD=adminpassword
RECEPTIONIST_EMAIL=receptionist@vms.com
RECEPTIONIST_PASSWORD=receptionistpassword

# Google API Credentials (Leave empty to use local fallback mode)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-google-sheet-id-from-url
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

---

## 🚀 Setup & Launch Instructions

### 1. Launching the Backend API
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure credentials if Google APIs are available. If not, leaving Google variables blank will boot the server in local database fallback mode automatically.
4. Launch the developer server:
   ```bash
   npm run dev
   ```
   *The backend will boot up at `http://localhost:5000`.*

### 2. Launching the Frontend Client
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
   *Open your browser and load `http://localhost:5173`.*

---

## 🔐 Developer Testing Access

We provide quick-click helper buttons on the `/login` screen to instantly input credentials:
- **System Administrator (Role: admin)**:
  - **Email**: `admin@vms.com`
  - **Password**: `adminpassword`
  - *Has full access to all dashboards, registration modules, logs, and settings.*
- **Front Desk Receptionist (Role: receptionist)**:
  - **Email**: `receptionist@vms.com`
  - **Password**: `receptionistpassword`
  - *Has access to dashboards, registration, exit terminal, and history log. The Settings tab is hidden.*

---

## 📡 API Endpoint Documentation

All endpoints expect JSON payloads. Protected endpoints require authorization header: `Authorization: Bearer <JWT_TOKEN>`.

### Auth Controller
- **`POST /api/auth/login`**:
  - Request: `{ "email": "...", "password": "..." }`
  - Response: `{ "token": "...", "user": { "email": "...", "role": "...", "name": "..." } }`

### Visitor Controller
- **`POST /api/visitors/register`**: (Protected, Admin & Receptionist)
  - Request: `{ "name": "...", "address": "...", "mobile": "...", "purpose": "...", "hostName": "...", "idType": "...", "idNumber": "...", "photo": "data:image/jpeg;base64,..." }`
  - Response: Created visitor object with generated `"token"` and `"photoUrl"`.
- **`GET /api/visitors/history`**: (Protected, Admin & Receptionist)
  - Response: Array of all visitor objects containing timestamps, host names, check-out dates, etc.
- **`PUT /api/visitors/exit/:token`**: (Protected, Admin & Receptionist)
  - URL parameter: `token` (e.g. `T1001`)
  - Response: Updated visitor record with `"status": "Exited"` and `"exitTime": "..."`.

### System Controller
- **`GET /api/settings/status`**: (Protected, Admin)
  - Response: Connectivity diagnostics object showing sheet IDs, drive credentials loading success, and local fallback database checks.

---

## 🌐 Independent Deployment Guide

Frontend and backend contain separate packages and scripts, allowing them to be hosted on distinct servers.

### Backend Hosting (e.g., Render / Railway / Heroku)
1. Set the root folder of your project deployment configuration to `backend/`.
2. Configure your hosting platform build script: `npm install` and startup script: `npm start`.
3. Set environment variables on the host console corresponding to the `.env` values (especially `JWT_SECRET` and Google cloud keys).
4. Render/Railway will expose a public URL (e.g. `https://your-vms-backend.onrender.com`).

### Frontend Hosting (e.g., Vercel / Netlify)
1. Set the root folder of your project deployment configuration to `frontend/`.
2. Configure build script: `npm run build` and output directory: `dist`.
3. Define the environment variable **`VITE_API_URL`** on your host console and point it to the public backend URL (e.g. `https://your-vms-backend.onrender.com/api`).
4. Trigger build. Vercel/Netlify will host the client statically.
