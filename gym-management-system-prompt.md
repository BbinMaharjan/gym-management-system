# Gym Management System

---

## Project Overview

Build a full-stack **Gym Management System** with:

- **Frontend:** React.js (Vite) + Tailwind CSS + Ant Design + React Query + Redux tool kit
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT-based authentication with role & permission-based access control (RBAC)

The system has **one SuperAdmin** (seeded at setup, cannot be deleted) who creates other **Admin/Staff users** and assigns them **granular permissions**. The system manages **gym members** and **gym equipment**.

---

## 1. User Roles & Permission System

### Roles

- **SuperAdmin** — full, unrestricted access. Only one exists, created via a seed script (not through the UI). Can create/edit/delete/deactivate all other users and assign their permissions.
- **Admin / Staff** — created by SuperAdmin. Access is limited to whatever permissions are explicitly granted.

### Permission Model (granular, not just role-based)

Store permissions as an array of permission keys on each user, e.g.:

```
members:view, members:create, members:edit, members:delete,
equipment:view, equipment:create, equipment:edit, equipment:delete,
payments:view, payments:manage,
attendance:view, attendance:manage,
users:manage (SuperAdmin only),
reports:view
```

- Backend middleware checks `req.user.permissions` against the required permission for each route.
- Frontend hides/shows UI elements and routes based on the logged-in user's permissions (fetched at login, stored in auth state).
- SuperAdmin bypasses all permission checks automatically.

### User Management (SuperAdmin only)

- Create staff/admin accounts (name, email, password, role, permission checklist)
- Edit a user's permissions at any time
- Deactivate/reactivate or delete a user
- View audit log of who created/modified what (optional but recommended)

---

## 2. Core Modules

### A. Authentication

- Login (email + password) → JWT access token (+ optional refresh token)
- Password hashing with bcrypt
- Protected routes via middleware (`verifyToken`, `checkPermission('members:edit')`)
- Forgot/reset password (optional)

### B. Member Management

- CRUD for gym members: name, photo, contact info, address, DOB, gender, emergency contact
- Membership plans (e.g., Monthly, Quarterly, Annual) with pricing and duration
- Assign/renew/cancel a member's plan; track start date & expiry date
- Auto-flag expired or expiring-soon memberships
- Attendance/check-in tracking (member checks in via ID or QR code)
- Payment history per member (amount, date, method, plan paid for)
- Search/filter members by name, status (active/expired), plan type

### C. Equipment Management

- CRUD for gym equipment: name, category, brand, purchase date, cost, condition/status
- Track equipment status: Available / In-Use / Under Maintenance / Retired
- Maintenance log: schedule maintenance dates, record service history, assign technician notes
- Low-stock or maintenance-due alerts (e.g., equipment due for service this month)
- Optional: equipment usage tracking per area/room

### D. Dashboard & Reports

- Overview cards: total active members, expiring memberships this week, total equipment, equipment under maintenance, revenue this month
- Charts: membership growth over time, revenue trends, attendance trends
- Exportable reports (CSV/PDF) for members and payments — optional

---

## 3. Database Schema (suggested Mongoose models)

**User**

```
name, email (unique), password (hashed), role: ['superadmin','admin','staff'],
permissions: [String], isActive: Boolean, createdBy: ObjectId(User), timestamps
```

**Member**

```
name, photo, email, phone, address, dob, gender, emergencyContact,
membershipPlan: ObjectId(Plan), planStartDate, planExpiryDate,
status: ['active','expired','frozen'], createdBy: ObjectId(User), timestamps
```

**MembershipPlan**

```
name, durationInDays, price, description, isActive
```

**Payment**

```
member: ObjectId(Member), amount, method, plan: ObjectId(Plan), paidOn, recordedBy: ObjectId(User)
```

**Attendance**

```
member: ObjectId(Member), checkInTime, checkOutTime (optional)
```

**Equipment**

```
name, category, brand, purchaseDate, cost, status: ['available','in-use','maintenance','retired'],
lastServicedDate, nextServiceDue, notes, timestamps
```

**MaintenanceLog**

```
equipment: ObjectId(Equipment), date, description, cost, performedBy
```

---

## 4. API Structure (REST)

```
/api/auth/login
/api/auth/me

/api/users            (SuperAdmin only: GET, POST)
/api/users/:id         (SuperAdmin only: GET, PUT, DELETE)

/api/members           (GET, POST — permission: members:*)
/api/members/:id        (GET, PUT, DELETE)
/api/members/:id/attendance
/api/members/:id/payments

/api/plans              (GET, POST, PUT, DELETE)

/api/equipment           (GET, POST — permission: equipment:*)
/api/equipment/:id        (GET, PUT, DELETE)
/api/equipment/:id/maintenance

/api/dashboard/summary
```

Every protected route should run through:

1. `verifyToken` — validates JWT, attaches `req.user`
2. `checkPermission('resource:action')` — rejects with 403 if the user lacks it (SuperAdmin always passes)

---

## 5. Frontend Structure (React + Vite)

```
src/
  api/            # axios instance + API calls per module
  components/     # shared UI (Table, Modal, ProtectedRoute, PermissionGate)
  context/ or store/  # auth state (user, token, permissions) — Zustand or Redux Toolkit
  pages/
    Login/
    Dashboard/
    Members/
    Equipment/
    Users/        # SuperAdmin only
  routes/         # route config with permission-based guarding
  utils/
```

Key frontend behaviors:

- `<ProtectedRoute permission="members:view">` wrapper component to guard routes
- `<PermissionGate permission="equipment:create">` wrapper to conditionally render buttons/actions
- Auth state persisted (e.g., token in httpOnly cookie or localStorage + refresh flow)
- Responsive, clean admin-dashboard UI (sidebar nav, tables with search/filter/pagination, modals for create/edit forms)

---

## 6. Non-Functional Requirements

- Input validation on both frontend (form-level) and backend (e.g., Joi/Zod or Mongoose validators)
- Centralized error handling middleware on the backend
- Environment variables for secrets (`JWT_SECRET`, `MONGO_URI`, etc.) via `.env`
- Seed script to create the initial SuperAdmin account
- Basic rate-limiting on the login route
- Clear README with setup, run, and environment instructions

---

## 7. Suggested Build Order

1. Backend: project setup, MongoDB connection, User model, SuperAdmin seed script, JWT auth, permission middleware
2. Backend: Member, Plan, Payment, Attendance, Equipment, MaintenanceLog models + CRUD routes
3. Frontend: Vite + Tailwind setup, auth pages, protected routing, permission gating
4. Frontend: Member management UI, Equipment management UI, User management UI (SuperAdmin)
5. Dashboard summary + charts
6. Polish: validation, error handling, loading/empty states, responsive design
