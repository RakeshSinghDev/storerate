-- Database schema for Store Rating Platform

DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL CHECK (CHAR_LENGTH(name) >= 20 AND CHAR_LENGTH(name) <= 60),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL CHECK (CHAR_LENGTH(address) <= 400),
  role VARCHAR(30) NOT NULL CHECK (role IN ('SYSTEM_ADMINISTRATOR', 'NORMAL_USER', 'STORE_OWNER')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  address VARCHAR(400) NOT NULL CHECK (CHAR_LENGTH(address) <= 400),
  owner_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
);

-- Indexes for optimal querying
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_address ON stores(address);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);
