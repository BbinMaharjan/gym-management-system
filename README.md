# Gym Management System

A full-stack gym management application with role-based access control.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Ant Design + Redux Toolkit + React Query
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Install All Dependencies

```bash
npm run install:all
```

### Seed SuperAdmin

```bash
npm run seed
```

### Run Both (Frontend + Backend)

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:3000` (proxies `/api` to backend)

### Default SuperAdmin Credentials

- **Email:** superadmin@gym.com
- **Password:** SuperAdmin@123

## Features

- JWT-based authentication with role & permission-based access (RBAC)
- Member management (CRUD, membership plans, attendance, payments)
- Equipment management with maintenance logging
- User management (SuperAdmin only) with granular permissions
- Dashboard with summary stats
- Responsive admin UI

## Project Structure

```
gym/
├── package.json        Root scripts (npm run dev)
├── server/             Express API
│   ├── src/
│   │   ├── config/   DB connection
│   │   ├── models/   Mongoose schemas
│   │   ├── routes/   Express routes
│   │   ├── controllers/
│   │   ├── middleware/  Auth, permissions, error handling
│   │   └── seeds/    SuperAdmin seed script
│   └── server.js
├── client/             React + Vite app
│   ├── src/
│   │   ├── api/      Axios + API calls
│   │   ├── components/  Layout, ProtectedRoute, PermissionGate
│   │   ├── store/    Redux Toolkit (auth)
│   │   ├── pages/    Login, Dashboard, Members, Equipment, Users, Plans
│   │   └── hooks/    useAuth, usePermission
│   └── vite.config.js
└── README.md
```
