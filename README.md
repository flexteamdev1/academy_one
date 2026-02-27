# Academy One

> Full-stack school management system with an Express + MongoDB backend and a React (CRA) admin UI.

**Repo Structure**

- `backend/` Express API, Mongoose, JWT auth, Cloudinary uploads, email notifications
- `ui/` React (Create React App) frontend, MUI

## Prerequisites

- Node.js + npm
- MongoDB
- Cloudinary account (for media uploads)
- SMTP credentials (for emails/password reset)

## Clone or download

```terminal
git clone https://github.com/flexteamdev1/academy_one.git
```

## Backend Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment variables in `backend/.env`

```bash
MONGO_URI=mongodb://USER:PASSWORD@HOST:PORT/DB_NAME
PORT=5000
JWT_SECRET=your_jwt_secret

# Frontend URLs used in emails
FRONTEND_URL=http://localhost:3000

# Branding
SCHOOL_NAME=Academy One
LOGO_URL=
SUPPORT_EMAIL=support@example.com
SUPPORT_PHONE=+1 (000) 000-0000

# Cloudinary (uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_ROOT_FOLDER=academy-one
CLOUDINARY_ENV_FOLDER=dev
CLOUDINARY_STUDENT_FOLDER=students/profile-photos
CLOUDINARY_TEACHER_FOLDER=teachers/profile-photos
CLOUDINARY_SCHOOL_FOLDER=schools
CLOUDINARY_NOTICE_FOLDER=notices

# SMTP / Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=school@example.com
SMTP_SECURE=false
```

3. Run the backend

```bash
npm run dev
```

Backend defaults to `http://localhost:5000`.

## UI Setup

1. Install dependencies

```bash
cd ui
npm install
```

2. Configure environment variables in `ui/.env`

```bash
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

3. Run the UI

```bash
npm start
```

UI defaults to `http://localhost:3000`.

Note: you can copy `ui/.env.example` to `ui/.env` and adjust as needed.

## Optional: Create a Super Admin

Set these in `backend/.env`:

```bash
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=strong_password
SUPERADMIN_NAME=Super Admin
SUPERADMIN_PHONE=+1 (000) 000-0000
```

Then run:

```bash
cd backend
node scripts/create-superadmin.js
```

## Environment Variable Details

**Backend (`backend/.env`)**

1. `MONGO_URI`
   MongoDB connection string.
2. `PORT`
   Express server port. Default is `5000`.
3. `JWT_SECRET`
   Secret used to sign auth tokens.
4. `FRONTEND_URL`, `STUDENT_PORTAL_URL`, `PARENT_PORTAL_URL`, `TEACHER_PORTAL_URL`, `ADMIN_PORTAL_URL`
   Used for links in emails/notifications.
5. `CLOUDINARY_*`
   Cloudinary credentials and folder structure for uploads.
6. `SMTP_*`
   SMTP credentials for sending emails.
7. `SCHOOL_NAME`, `LOGO_URL`, `SUPPORT_EMAIL`, `SUPPORT_PHONE`
   Branding and support metadata used in email templates.
8. `SUPERADMIN_*`
   Credentials for the optional super admin seed script.
