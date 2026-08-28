const { Client, Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const targetDb = process.env.DB_NAME || 'store_rating';

async function setupDatabase() {
  console.log(`Connecting to default postgres database to verify database [${targetDb}]...`);
  const rootClient = new Client({ ...config, database: 'postgres' });
  await rootClient.connect();

  const res = await rootClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDb]);
  if (res.rowCount === 0) {
    console.log(`Creating database [${targetDb}]...`);
    await rootClient.query(`CREATE DATABASE "${targetDb}"`);
  } else {
    console.log(`Database [${targetDb}] already exists.`);
  }
  await rootClient.end();

  console.log(`Connecting to database [${targetDb}]...`);
  const dbPool = new Pool({ ...config, database: targetDb });

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  console.log('Applying database schema (Tables, Foreign Keys, Indexes, Constraints)...');
  await dbPool.query(schemaSql);
  console.log('Schema applied successfully.');

  console.log('Inserting development seed data with hashed passwords...');
  const adminHash = await bcrypt.hash('AdminPass123!', 10);
  const owner1Hash = await bcrypt.hash('OwnerPass123!', 10);
  const owner2Hash = await bcrypt.hash('OwnerPass123!', 10);
  const user1Hash = await bcrypt.hash('UserPass123!', 10);
  const user2Hash = await bcrypt.hash('UserPass123!', 10);

  // Insert Users (All 3 roles included)
  const usersResult = await dbPool.query(`
    INSERT INTO users (name, email, password_hash, address, role)
    VALUES
      ('System Administrator Account', 'admin@platform.com', '${adminHash}', '100 Admin HQ Blvd, Suite 500', 'SYSTEM_ADMINISTRATOR'),
      ('Store Owner Robert Smith Senior', 'owner1@supermart.com', '${owner1Hash}', '456 Owner Ave, Retail District', 'STORE_OWNER'),
      ('Store Owner Sarah Jenkins Lead', 'owner2@citycafe.com', '${owner2Hash}', '789 Commercial Way, Downtown', 'STORE_OWNER'),
      ('Normal User Alice Johnson Customer', 'user1@gmail.com', '${user1Hash}', '123 Pine Street, Residential Area', 'NORMAL_USER'),
      ('Normal User Bob Williams Reviewer', 'user2@gmail.com', '${user2Hash}', '321 Oak Avenue, Suburban Heights', 'NORMAL_USER')
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
      ('Metro Tech Store', 'info@metrotech.com', '101 Innovation Parkway, Tech Park', NULL)
    RETURNING id, name;
  `);

  const store1 = storesResult.rows.find(s => s.name === 'Apex Supermart');
  const store2 = storesResult.rows.find(s => s.name === 'City Central Cafe');
  const store3 = storesResult.rows.find(s => s.name === 'Metro Tech Store');

  // Insert Ratings
  await dbPool.query(`
    INSERT INTO ratings (user_id, store_id, rating)
    VALUES
      (${user1.id}, ${store1.id}, 5),
      (${user1.id}, ${store2.id}, 4),
      (${user2.id}, ${store1.id}, 4),
      (${user2.id}, ${store3.id}, 3)
  `);

  console.log('Development seed data populated successfully.');
  await dbPool.end();
}

setupDatabase().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
