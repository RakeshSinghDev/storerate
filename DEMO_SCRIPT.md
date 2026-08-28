# Store Rating Platform - 5 to 7 Minute Demonstration Script

This script provides a structured, professional demonstration flow for presenting the Store Rating Platform during an internship interview or technical evaluation.

---

## Preparation Checklist Before Demo
1. Ensure PostgreSQL is running locally on port `5433` (or configured port).
2. Start backend server: `cd backend && node server.js` (runs on `http://localhost:5000/api`).
3. Start frontend dev server: `cd frontend && npm run dev` (runs on `http://localhost:5173`).
4. Open a clean browser window at `http://localhost:5173`.

---

## Demonstration Steps (5-7 Minutes)

### 1. Homepage & Platform Overview (30 Seconds)
- **Navigate to**: `http://localhost:5173/`
- **Script**: "Welcome to the Store Rating Platform. This application allows users to discover registered stores, view authentic customer ratings, and submit or modify their own ratings. The platform enforces strict role-based access control across three user roles: System Administrators, Normal Users, and Store Owners."

### 2. Normal User Registration & Auto-Login (45 Seconds)
- **Click**: `Get Started` or `Register` link in Navbar.
- **Input**:
  - Name: `Alice Johnson Customer Record Name` (Must be 20–60 chars)
  - Email: `alice.demo@example.com`
  - Address: `123 Main Street, Suite 400, City`
  - Password: `UserPass123!` (8–16 chars, 1 uppercase, 1 special char)
- **Click**: `Create Account`
- **Script**: "Public registration automatically creates an account with the `NORMAL_USER` role. Notice that role selection is omitted on public signup to prevent privilege escalation. Upon registration, the user is automatically logged in and redirected to the store discovery view."

### 3. Store Discovery, Search, & Filtering (1 Minute)
- **Navigate to**: `http://localhost:5173/stores`
- **Actions**:
  - Type `Apex` into the Store Name search box and click `Search`.
  - Type `Retail` into Address search and press `Enter`.
  - Change sort dropdown from `Newest First` to `Highest Rated`.
  - Demonstrate pagination controls `[Previous] 1 2 [Next]`.
- **Script**: "Here on the Stores page, normal users can search stores by name or address. Search filters, sorting, and pagination are executed server-side in PostgreSQL using parameterized queries and URL search parameter state."

### 4. 1-to-5 Star Rating Submission & Real-time Update (1 Minute)
- **Click**: `Rate this store` or `Apex Supermart` title to open `/stores/1`.
- **Actions**:
  - Show the Overall Rating aggregate (e.g. `4.5` ★★★★★ `2 ratings`) and "Your Rating: Not rated".
  - Hover over the 5-star interactive rating picker and click 5 stars.
  - Click `Submit rating`.
- **Script**: "The rating component provides accessible 1 to 5 star selection. When I submit a 5-star rating, the backend validates the payload, inserts the record into PostgreSQL, and updates both the store's average rating and total rating count in real-time without requiring a full page refresh."

### 5. Rating Modification Workflow (45 Seconds)
- **Actions**:
  - Show that the card state changes to "Your Rating: ★★★★★ 5.0" and the button changes to `Save rating`.
  - Change the rating to 4 stars and click `Save rating`.
  - Highlight the inline confirmation banner ("Rating updated.").
- **Script**: "If a user rates a store again, the backend uses a `PUT` endpoint to modify their existing rating record rather than creating a duplicate row. PostgreSQL enforces this via a `UNIQUE(user_id, store_id)` constraint."

### 6. System Administrator Management Dashboard (1 Minute)
- **Action**: Click `Logout` and sign in as System Admin:
  - Email: `admin@platform.com`
  - Password: `AdminPass123!`
- **Navigate to**: `/admin/dashboard`, `/admin/users`, `/admin/stores`
- **Script**: "Now I will log in as a System Administrator. The Admin Dashboard displays real-time total users, stores, and ratings metrics queried directly from PostgreSQL. Admins can view paginated user directories, inspect store owner metrics, and create new accounts for any role."

### 7. Store Owner Overview & Role Security (1 Minute)
- **Action**: Click `Logout` and sign in as Store Owner 1:
  - Email: `owner1@supermart.com`
  - Password: `OwnerPass123!`
- **Navigate to**: `/owner/dashboard`
- **Script**: "Finally, logging in as a Store Owner opens the Owner Overview. This view displays the owner's assigned store name, address, prominent average rating, and a paginated customer ratings history table sorted by newest first. Notice that owner identity is derived strictly from the verified JWT token (`req.user.userId`), guaranteeing multi-tenant isolation where Owner A can never view Store B's ratings."

---

## Key Talking Points Summary
1. **Security**: Bcrypt password hashing, JWT Bearer tokens, server-side RBAC middleware, and parameterized SQL queries.
2. **Database**: PostgreSQL composite `UNIQUE(user_id, store_id)` constraint and SQL aggregation (`AVG`, `COUNT`).
3. **UX**: Restrained, accessible design system built with custom CSS variables without bloated third-party frameworks.
