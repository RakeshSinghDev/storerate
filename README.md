# Store Rating Platform - FullStack Coding Challenge

A production-grade, role-based Store Rating Platform application built with **React.js**, **Node.js/Express.js (MVC Architecture)**, **PostgreSQL**, **JWT Authentication**, and **Bcrypt Password Hashing**.

---

## Technical Stack

- **Frontend**: React.js, React Router DOM, Vite, CSS (Restrained design system adhering to UI rules).
- **Backend**: Node.js, Express.js (MVC Architecture), `pg` (PostgreSQL client pool), `express-validator`.
- **Database**: PostgreSQL (Normalized schema, Foreign keys, UNIQUE constraints, `CHECK (rating >= 1 AND rating <= 5)` constraint).
- **Authentication**: JWT (JSON Web Tokens) with 24h expiration, Bcrypt password hashing.

---

## Directory Structure

```text
internshiptasks/
├── backend/
│   ├── config/           # Database pool configuration (db.js)
│   ├── controllers/      # MVC Controllers (auth, user, store, rating, admin, owner)
│   ├── db/               # SQL schema, setup script, and seeding logic
│   ├── middleware/       # JWT auth, role authorization, and error handling
│   ├── models/           # Data access models and parameterized SQL queries
│   ├── routes/           # REST API routes
│   ├── utils/            # JWT and password hash helpers
│   ├── validators/       # Input validation schemas (express-validator)
│   ├── app.js            # Express app configuration
│   ├── server.js         # HTTP server entrypoint
│   └── verify_database_integrity.js # SQL constraint verification script
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components (Button, Input, Card, Table, RatingStars, SearchBar, Modal, etc.)
│   │   ├── context/      # AuthContext for global user state & session restoration
│   │   ├── layouts/      # PublicLayout & AuthenticatedLayout
│   │   ├── pages/        # React pages for normal user, store owner, and admin views
│   │   ├── routes/       # React Router setup, ProtectedRoute, & RoleRoute guards
│   │   ├── services/     # Centralized API service layer functions
│   │   ├── styles/       # Design system CSS variables & global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── verify_phase12_final.cjs # Master E2E verification test suite
│   ├── index.html
│   └── vite.config.js
├── README.md
└── .gitignore
```

---

## Roles and Access Control

1. **`SYSTEM_ADMINISTRATOR`**:
   - Access real-time admin dashboard metrics (`totalUsers`, `totalStores`, `totalRatings` directly from PostgreSQL).
   - Create accounts for any role (`SYSTEM_ADMINISTRATOR`, `NORMAL_USER`, `STORE_OWNER`).
   - Create stores and assign registered store owners (`STORE_OWNER` role restriction).
   - View, search (Name, Email, Address), sort, and paginate user & store directories.
   - View user details and assigned store rating metrics.

2. **`NORMAL_USER`**:
   - Public account registration & automatic login (role hardcoded to `NORMAL_USER`).
   - Discover registered stores with overall ratings (`averageRating` & `ratingCount`) and personal rating status (`myRating`).
   - Search stores by Store Name and Address (`ILIKE`), sort, and paginate results.
   - Submit 1 to 5 star rating or modify an existing rating (enforced 1 rating per store per user).
   - Update password.

3. **`STORE_OWNER`**:
   - View assigned store details, overall average rating (`averageRating` visual focus), and rating count.
   - View customer ratings history table (`User`, `Rating`, `Date`) sorted by `created_at DESC`.
   - Paginate customer ratings.
   - Handles unassigned store state and unrated store state cleanly.
   - Update password.

---

## Input Validation & Database Constraints

- **User Name**: 20 to 60 characters long.
- **User Address**: Maximum 400 characters long.
- **Password**: 8 to 16 characters, containing at least 1 uppercase letter and at least 1 special character.
- **Email**: Standard valid email format.
- **Rating**: Integer from 1 to 5 stars (`CHECK (rating >= 1 AND rating <= 5)`).
- **Database Constraint**: `UNIQUE(user_id, store_id)` prevents multiple ratings per store by the same user.

---

## Seed Test Credentials

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@platform.com` | `AdminPass123!` |
| **Store Owner 1** | `owner1@supermart.com` | `OwnerPass123!` |
| **Store Owner 2** | `owner2@citycafe.com` | `OwnerPass123!` |
| **Normal User 1** | `user1@gmail.com` | `UserPass123!` |
| **Normal User 2** | `user2@gmail.com` | `UserPass123!` |

---

## Setup & Running Instructions

### 1. Database Initialization
Ensure PostgreSQL daemon is running locally:
```bash
cd backend
node db/setup.js
```

### 2. Start Backend Server
```bash
cd backend
node server.js
```
Backend API will start at `http://localhost:5000/api`.

### 3. Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
Frontend Vite server will start at `http://localhost:5173`.

### 4. Run Database Integrity Verification
```bash
cd backend
node verify_database_integrity.js
```

### 5. Run Master E2E & Security Test Suite
```bash
cd frontend
node verify_phase12_final.cjs
```

---

## API Specification Overview

### Auth (`/api/auth`)
- `POST /api/auth/register` - Public normal user signup
- `POST /api/auth/login` - Unified login for all roles
- `GET /api/auth/me` - Get authenticated user profile
- `PUT /api/auth/password` - Update password

### Stores & Ratings (`/api/stores`)
- `GET /api/stores` - Search, sort, and paginate stores with overall & personal ratings
- `GET /api/stores/:id` - Get single store details
- `GET /api/stores/:storeId/ratings/me` - Get user's rating for store
- `POST /api/stores/:storeId/ratings` - Submit 1-5 star rating
- `PUT /api/stores/:storeId/ratings` - Modify existing rating

### System Administrator (`/api/admin`)
- `GET /api/admin/dashboard` - Admin dashboard count metrics
- `GET /api/admin/users` - Filtered, sorted, and paginated user directory
- `GET /api/admin/users/:id` - User details inspector with store owner stats
- `POST /api/admin/users` - Create user account for any role
- `GET /api/admin/stores` - Filtered, sorted, and paginated store directory
- `POST /api/admin/stores` - Create store with store owner validation

### Store Owner (`/api/owner`)
- `GET /api/owner/dashboard` - Store owner dashboard with store summary, average rating focus, and customer ratings table (`created_at DESC`)
