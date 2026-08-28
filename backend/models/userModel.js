const db = require('../config/db');

const userModel = {
  countAll: async () => {
    const res = await db.query('SELECT COUNT(*)::int AS total FROM users');
    return res.rows[0].total;
  },

  findUserByEmail: async (email) => {
    const res = await db.query(
      `SELECT id, name, email, password_hash, address, role, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return res.rows[0] || null;
  },

  findUserById: async (id) => {
    const res = await db.query(
      `SELECT id, name, email, address, role, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  createUser: async ({ name, email, password_hash, address, role = 'NORMAL_USER' }) => {
    const res = await db.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at, updated_at`,
      [name.trim(), email.toLowerCase().trim(), password_hash, address.trim(), role]
    );
    return res.rows[0];
  },

  updatePassword: async (id, newPasswordHash) => {
    const res = await db.query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email`,
      [newPasswordHash, id]
    );
    return res.rows[0] || null;
  },

  findUsers: async ({ name, email, address, role, sortBy = 'created_at', order = 'desc', limit = 20, offset = 0 }) => {
    let queryText = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at, u.updated_at
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      params.push(role);
      queryText += ` AND u.role = $${params.length}`;
    } else {
      // Default: Return NORMAL_USER and SYSTEM_ADMINISTRATOR (exclude STORE_OWNER by default unless specified)
      queryText += ` AND u.role IN ('NORMAL_USER', 'SYSTEM_ADMINISTRATOR')`;
    }

    if (name) {
      params.push(`%${name.trim()}%`);
      queryText += ` AND u.name ILIKE $${params.length}`;
    }

    if (email) {
      params.push(`%${email.trim()}%`);
      queryText += ` AND u.email ILIKE $${params.length}`;
    }

    if (address) {
      params.push(`%${address.trim()}%`);
      queryText += ` AND u.address ILIKE $${params.length}`;
    }

    const sortWhitelist = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at',
    };

    const sortColumn = sortWhitelist[sortBy] || 'u.created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortColumn} ${sortOrder}`;

    params.push(limit);
    queryText += ` LIMIT $${params.length}`;

    params.push(offset);
    queryText += ` OFFSET $${params.length}`;

    const res = await db.query(queryText, params);
    return res.rows;
  },

  countUsers: async ({ name, email, address, role }) => {
    let queryText = `SELECT COUNT(*)::int AS total FROM users u WHERE 1=1`;
    const params = [];

    if (role) {
      params.push(role);
      queryText += ` AND u.role = $${params.length}`;
    } else {
      queryText += ` AND u.role IN ('NORMAL_USER', 'SYSTEM_ADMINISTRATOR')`;
    }

    if (name) {
      params.push(`%${name.trim()}%`);
      queryText += ` AND u.name ILIKE $${params.length}`;
    }

    if (email) {
      params.push(`%${email.trim()}%`);
      queryText += ` AND u.email ILIKE $${params.length}`;
    }

    if (address) {
      params.push(`%${address.trim()}%`);
      queryText += ` AND u.address ILIKE $${params.length}`;
    }

    const res = await db.query(queryText, params);
    return res.rows[0].total;
  },

  findUserByIdDetailed: async (id) => {
    const userRes = await db.query(
      `SELECT id, name, email, address, role, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    const user = userRes.rows[0];
    if (!user) return null;

    let storeInfo = null;

    if (user.role === 'STORE_OWNER') {
      const storeRes = await db.query(
        `SELECT 
          s.id, 
          s.name, 
          ROUND(AVG(r.rating)::numeric, 1)::float AS average_rating,
          COUNT(r.id)::int AS rating_count
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [id]
      );

      if (storeRes.rows.length > 0) {
        const row = storeRes.rows[0];
        storeInfo = {
          id: Number(row.id),
          name: row.name,
          averageRating: row.rating_count > 0 ? Number(row.average_rating) : null,
          ratingCount: Number(row.rating_count),
        };
      }
    }

    return {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
      store: storeInfo,
    };
  },
};

module.exports = userModel;
