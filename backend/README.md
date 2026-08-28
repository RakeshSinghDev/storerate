# Store Rating Platform - Backend Foundation & Database (Phase 1 & 2)

This directory contains the Node.js + Express.js (MVC) backend foundation and PostgreSQL database implementation for the Store Rating Platform.

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                 # PostgreSQL connection pool (pg.Pool) with test query
├── controllers/              # Reserved for API controllers
├── database/
│   ├── schema.sql            # Table DDL, foreign keys, constraints, and indexes
│   ├── seed.sql              # Development test seed data SQL statements
│   └── setup.js              # Database creation, migration, and seed execution script
├── middleware/
│   └── errorMiddleware.js    # Centralized Express error handler
├── models/
│   ├── userModel.js          # User database access model
│   ├── storeModel.js         # Store database access model
│   └── ratingModel.js        # Rating database access model
├── routes/
│   └── healthRoutes.js       # GET /api/health route handler
├── validators/               # Reserved for request input validators
├── utils/
│   └── password.js           # Password hashing helper (bcryptjs)
├── app.js                    # Express app configuration & middleware
├── server.js                 # HTTP server entrypoint & DB connection test
├── package.json
├── .env                      # Local environment secrets (ignored by git)
├── .env.example              # Environment variables template
└── README.md
```

---

## Environment Variables Configuration

Create a `.env` file based on `.env.example`:

```ini
PORT=5000

DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=store_rating
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=super_secret_key_store_rating_2026
JWT_EXPIRES_IN=1d
```

---

## Setup & Local Execution Commands

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run Database Setup Script
Initialize database `store_rating`, create tables, foreign keys, constraints, indexes, and seed initial test data:
```bash
npm run db:setup
```

### 3. Start Backend Server
```bash
npm start
# Or for development hot reloading:
npm run dev
```

### 4. Health Check
Access health endpoint at:
`http://localhost:5000/api/health`
Response:
```json
{
  "success": true,
  "message": "API is running"
}
```

---

## Database Schema Summary

### Tables
- `users`: `id BIGSERIAL PK`, `name VARCHAR(60)`, `email VARCHAR(255) UNIQUE`, `password_hash`, `address VARCHAR(400)`, `role CHECK ('SYSTEM_ADMINISTRATOR', 'NORMAL_USER', 'STORE_OWNER')`.
- `stores`: `id BIGSERIAL PK`, `name VARCHAR(60)`, `email VARCHAR(255)`, `address VARCHAR(400)`, `owner_id REFERENCES users(id) ON DELETE SET NULL`.
- `ratings`: `id BIGSERIAL PK`, `user_id REFERENCES users(id) ON DELETE CASCADE`, `store_id REFERENCES stores(id) ON DELETE CASCADE`, `rating CHECK (1..5)`, `UNIQUE(user_id, store_id)`.

### Indexes
- `idx_users_email` ON users(email)
- `idx_users_role` ON users(role)
- `idx_stores_name` ON stores(name)
- `idx_stores_email` ON stores(email)
- `idx_stores_address` ON stores(address)
- `idx_stores_owner_id` ON stores(owner_id)
- `idx_ratings_user_id` ON ratings(user_id)
- `idx_ratings_store_id` ON ratings(store_id)
