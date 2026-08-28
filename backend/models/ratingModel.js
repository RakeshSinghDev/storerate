const db = require('../config/db');

const ratingModel = {
  countAll: async () => {
    const res = await db.query('SELECT COUNT(*)::int AS total FROM ratings');
    return res.rows[0].total;
  },

  createRating: async ({ userId, storeId, rating }) => {
    const res = await db.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       RETURNING id, user_id AS "userId", store_id AS "storeId", rating, created_at, updated_at`,
      [userId, storeId, rating]
    );
    const row = res.rows[0];
    return {
      id: Number(row.id),
      userId: Number(row.userId),
      storeId: Number(row.storeId),
      rating: Number(row.rating),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  updateRating: async ({ userId, storeId, rating }) => {
    const res = await db.query(
      `UPDATE ratings
       SET rating = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND store_id = $3
       RETURNING id, user_id AS "userId", store_id AS "storeId", rating, created_at, updated_at`,
      [rating, userId, storeId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: Number(row.id),
      userId: Number(row.userId),
      storeId: Number(row.storeId),
      rating: Number(row.rating),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  findByUserAndStore: async (userId, storeId) => {
    const res = await db.query(
      `SELECT id, user_id AS "userId", store_id AS "storeId", rating, created_at, updated_at
       FROM ratings
       WHERE user_id = $1 AND store_id = $2`,
      [userId, storeId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: Number(row.id),
      userId: Number(row.userId),
      storeId: Number(row.storeId),
      rating: Number(row.rating),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },

  findByStoreId: async (storeId) => {
    const res = await db.query(
      `SELECT r.id, r.user_id, r.store_id, r.rating, r.created_at, u.name AS user_name
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1`,
      [storeId]
    );
    return res.rows;
  },

  getStoreRatingSummary: async (storeId) => {
    const res = await db.query(
      `SELECT 
        ROUND(AVG(rating)::numeric, 1)::float AS average_rating,
        COUNT(id)::int AS rating_count
       FROM ratings
       WHERE store_id = $1`,
      [storeId]
    );
    const row = res.rows[0];
    const ratingCount = Number(row.rating_count);
    return {
      averageRating: ratingCount > 0 ? Number(row.average_rating) : null,
      ratingCount,
    };
  },

  findRatingsByStoreIdPaginated: async (storeId, limit = 20, offset = 0) => {
    const res = await db.query(
      `SELECT 
        r.id, 
        r.rating, 
        r.created_at AS "createdAt",
        u.id AS "userId", 
        u.name AS "userName"
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [storeId, limit, offset]
    );

    return res.rows.map(row => ({
      userId: Number(row.userId),
      userName: row.userName,
      rating: Number(row.rating),
      createdAt: row.createdAt,
    }));
  },

  countRatingsByStoreId: async (storeId) => {
    const res = await db.query(
      `SELECT COUNT(*)::int AS total FROM ratings WHERE store_id = $1`,
      [storeId]
    );
    return res.rows[0].total;
  },
};

module.exports = ratingModel;
