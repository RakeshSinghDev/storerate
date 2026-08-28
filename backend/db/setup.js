const { Client, Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

async function setupDatabase() {
  console.log('Connecting to default postgres database to ensure storeratings database exists...');
  const rootClient = new Client({ ...config, database: 'postgres' });
  await rootClient.connect();

  const res = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'storeratings'");
  if (res.rowCount === 0) {
    console.log('Creating database storeratings...');
    await rootClient.query('CREATE DATABASE storeratings');
  } else {
    console.log('Database storeratings already exists.');
  }
  await rootClient.end();

  console.log('Connecting to storeratings database...');
  const dbPool = new Pool({ ...config, database: 'storeratings' });

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  console.log('Applying database schema...');
  await dbPool.query(schemaSql);
  console.log('Schema applied successfully.');

  console.log('Seeding initial data...');
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const owner1PasswordHash = await bcrypt.hash('OwnerPass123!', 10);
  const owner2PasswordHash = await bcrypt.hash('OwnerPass123!', 10);
  const user1PasswordHash = await bcrypt.hash('UserPass123!', 10);
  const user2PasswordHash = await bcrypt.hash('UserPass123!', 10);

  // Insert Users (names must be 20 to 60 chars)
  const usersResult = await dbPool.query(`
    INSERT INTO users (name, email, password_hash, address, role)
    VALUES
      ('System Administrator Account', 'admin@platform.com', '${adminPasswordHash}', '100 Admin HQ Blvd, Suite 500, Tech City', 'SYSTEM_ADMINISTRATOR'),
      ('Store Owner Robert Smith Senior', 'owner1@supermart.com', '${owner1PasswordHash}', '456 Owner Ave, Retail District', 'STORE_OWNER'),
      ('Store Owner Sarah Jenkins Lead', 'owner2@citycafe.com', '${owner2PasswordHash}', '789 Commercial Way, Downtown', 'STORE_OWNER'),
      ('Normal User Alice Johnson Customer', 'user1@gmail.com', '${user1PasswordHash}', '123 Pine Street, Residential Area', 'NORMAL_USER'),
      ('Normal User Bob Williams Reviewer', 'user2@gmail.com', '${user2PasswordHash}', '321 Oak Avenue, Suburban Heights', 'NORMAL_USER')
    RETURNING id, role, email;
  `);

  const owner1 = usersResult.rows.find(u => u.email === 'owner1@supermart.com');
  const owner2 = usersResult.rows.find(u => u.email === 'owner2@citycafe.com');
  const user1 = usersResult.rows.find(u => u.email === 'user1@gmail.com');
  const user2 = usersResult.rows.find(u => u.email === 'user2@gmail.com');

  // Insert Stores
  const storesResult = await dbPool.query(`
    INSERT INTO stores (name, email, address, owner_id)
    VALUES
      ('Apex Supermart', 'contact@apexsupermart.com', '456 Retail Blvd, Shopping Plaza', ${owner1.id}),
      ('City Central Cafe', 'hello@citycentralcafe.com', '789 Market Street, Old Town', ${owner2.id}),
      ('Metro Tech Electronics Store', 'info@metrotech.com', '101 Innovation Parkway, Tech Park', NULL)
    RETURNING id, name;
  `);

  const store1 = storesResult.rows.find(s => s.name === 'Apex Supermart');
  const store2 = storesResult.rows.find(s => s.name === 'City Central Cafe');
  const store3 = storesResult.rows.find(s => s.name === 'Metro Tech Electronics Store');

  // Insert Ratings
  await dbPool.query(`
    INSERT INTO ratings (user_id, store_id, rating)
    VALUES
      (${user1.id}, ${store1.id}, 5),
      (${user1.id}, ${store2.id}, 4),
      (${user2.id}, ${store1.id}, 4),
      (${user2.id}, ${store3.id}, 3)
  `);

  console.log('Database setup & seeding completed successfully.');
  await dbPool.end();
}

setupDatabase().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
