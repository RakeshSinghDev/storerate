const db = require('../config/db');

const storeModel = {
  countAll: async () => {
    const res = await db.query('SELECT COUNT(*)::int AS total FROM stores');
    return res.rows[0].total;
  },

  createStore: async ({ name, email, address, ownerId = null }) => {
    const res = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id AS "ownerId", created_at, updated_at`,
      [name.trim(), email.toLowerCase().trim(), address.trim(), ownerId || null]
    );
    const row = res.rows[0];
    return {
      id: Number(row.id),
      name: row.name,
      email: row.email,
      address: row.address,
      ownerId: row.ownerId ? Number(row.ownerId) : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  findStoreById: async (id) => {
    const res = await db.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id AS "ownerId", s.created_at, s.updated_at, u.name AS "ownerName"
       FROM stores s
       LEFT JOIN users u ON u.id = s.owner_id
       WHERE s.id = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: Number(row.id),
      name: row.name,
      email: row.email,
      address: row.address,
      ownerId: row.ownerId ? Number(row.ownerId) : null,
      ownerName: row.ownerName || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  findStores: async ({ name, email, address, sortBy = 'created_at', order = 'desc', limit = 20, offset = 0 }) => {
    let queryText = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id AS "ownerId", 
        s.created_at,
        u.name AS "ownerName",
        ROUND(AVG(r.rating)::numeric, 1)::float AS average_rating,
        COUNT(r.id)::int AS rating_count
      FROM stores s
      LEFT JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      params.push(`%${name.trim()}%`);
      queryText += ` AND s.name ILIKE $${params.length}`;
    }

    if (email) {
      params.push(`%${email.trim()}%`);
      queryText += ` AND s.email ILIKE $${params.length}`;
    }

    if (address) {
      params.push(`%${address.trim()}%`);
      queryText += ` AND s.address ILIKE $${params.length}`;
    }

    queryText += ` GROUP BY s.id, u.name`;

    const sortWhitelist = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      averageRating: 'average_rating',
      created_at: 's.created_at',
    };

    const sortColumn = sortWhitelist[sortBy] || 's.created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortColumn} ${sortOrder}`;

    params.push(limit);
    queryText += ` LIMIT $${params.length}`;

    params.push(offset);
    queryText += ` OFFSET $${params.length}`;

    const res = await db.query(queryText, params);

    return res.rows.map(row => ({
      id: Number(row.id),
      name: row.name,
      email: row.email,
      address: row.address,
      ownerId: row.ownerId ? Number(row.ownerId) : null,
      ownerName: row.ownerName || null,
      averageRating: row.rating_count > 0 ? Number(row.average_rating) : null,
      ratingCount: Number(row.rating_count),
      created_at: row.created_at,
    }));
  },

  countStores: async ({ name, email, address }) => {
    let queryText = `SELECT COUNT(*)::int AS total FROM stores s WHERE 1=1`;
    const params = [];

    if (name) {
      params.push(`%${name.trim()}%`);
      queryText += ` AND s.name ILIKE $${params.length}`;
    }

    if (email) {
      params.push(`%${email.trim()}%`);
      queryText += ` AND s.email ILIKE $${params.length}`;
    }

    if (address) {
      params.push(`%${address.trim()}%`);
      queryText += ` AND s.address ILIKE $${params.length}`;
    }

    const res = await db.query(queryText, params);
    return res.rows[0].total;
  },

  findStoresForUser: async ({ userId, name, address, sortBy = 'created_at', order = 'desc', limit = 20, offset = 0 }) => {
    let queryText = `
      SELECT 
        s.id, 
        s.name, 
        s.address, 
        ROUND(AVG(r.rating)::numeric, 1)::float AS average_rating,
        COUNT(r.id)::int AS rating_count,
        (SELECT rating FROM ratings WHERE user_id = $1 AND store_id = s.id) AS my_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [userId];

    if (name) {
      params.push(`%${name.trim()}%`);
      queryText += ` AND s.name ILIKE $${params.length}`;
    }

    if (address) {
      params.push(`%${address.trim()}%`);
      queryText += ` AND s.address ILIKE $${params.length}`;
    }

    queryText += ` GROUP BY s.id`;

    const sortWhitelist = {
      name: 's.name',
      address: 's.address',
      averageRating: 'average_rating',
      created_at: 's.created_at',
    };

    const sortColumn = sortWhitelist[sortBy] || 's.created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortColumn} ${sortOrder}`;

    params.push(limit);
    queryText += ` LIMIT $${params.length}`;

    params.push(offset);
    queryText += ` OFFSET $${params.length}`;

    const res = await db.query(queryText, params);

    return res.rows.map(row => ({
      id: Number(row.id),
      name: row.name,
      address: row.address,
      averageRating: row.rating_count > 0 ? Number(row.average_rating) : null,
      ratingCount: Number(row.rating_count),
      myRating: row.my_rating !== null && row.my_rating !== undefined ? Number(row.my_rating) : null,
    }));
  },

  countStoresForUser: async ({ name, address }) => {
    let queryText = `SELECT COUNT(*)::int AS total FROM stores s WHERE 1=1`;
    const params = [];

    if (name) {
      params.push(`%${name.trim()}%`);
      queryText += ` AND s.name ILIKE $${params.length}`;
    }

    if (address) {
      params.push(`%${address.trim()}%`);
      queryText += ` AND s.address ILIKE $${params.length}`;
    }

    const res = await db.query(queryText, params);
    return res.rows[0].total;
  },

  findStoreByIdForUser: async (id, userId) => {
    const res = await db.query(
      `SELECT 
        s.id, 
        s.name, 
        s.address, 
        ROUND(AVG(r.rating)::numeric, 1)::float AS average_rating,
        COUNT(r.id)::int AS rating_count,
        (SELECT rating FROM ratings WHERE user_id = $2 AND store_id = s.id) AS my_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id, userId]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    return {
      id: Number(row.id),
      name: row.name,
      address: row.address,
      averageRating: row.rating_count > 0 ? Number(row.average_rating) : null,
      ratingCount: Number(row.rating_count),
      myRating: row.my_rating !== null && row.my_rating !== undefined ? Number(row.my_rating) : null,
    };
  },

  findStoreByOwnerIdDetailed: async (ownerId) => {
    const res = await db.query(
      `SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        ROUND(AVG(r.rating)::numeric, 1)::float AS average_rating,
        COUNT(r.id)::int AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    return {
      store: {
        id: Number(row.id),
        name: row.name,
        email: row.email,
        address: row.address,
      },
      averageRating: row.rating_count > 0 ? Number(row.average_rating) : null,
      ratingCount: Number(row.rating_count),
    };
  },
};

module.exports = storeModel;
