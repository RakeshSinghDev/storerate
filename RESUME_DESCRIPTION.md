# Store Rating Platform - Resume Project Descriptions

These bullet points are technically accurate, non-exaggerated descriptions of the project suitable for software engineering resume listing.

---

## Option 1: Full-Stack Developer Bullet Points (Recommended)

- **Store Rating Platform** | *Node.js, Express.js, PostgreSQL, React.js, JavaScript (ES6+), JWT, Bcrypt*
  - Engineered a full-stack role-based Store Rating web platform supporting 3 distinct user roles (`SYSTEM_ADMINISTRATOR`, `NORMAL_USER`, `STORE_OWNER`) using an MVC backend architecture and React SPA frontend.
  - Implemented secure JWT authentication and Bcrypt password hashing, enforcing server-side RBAC middleware and input boundary validations (Name length 20–60, Address <=400, Password 8–16 with special characters).
  - Architected a normalized PostgreSQL relational database schema featuring composite unique constraints (`UNIQUE(user_id, store_id)`), index optimizations, and SQL aggregations for real-time rating average and count calculations.
  - Built a restrained, accessible React product interface featuring server-side multi-parameter search (`ILIKE`), whitelisted sorting, backend-driven pagination, and dynamic 1–5 star rating submission and modification.

---

## Option 2: Concise 3-Bullet Variant

- Architected a RESTful MVC API using **Node.js**, **Express.js**, and **PostgreSQL**, implementing JWT authentication, Bcrypt password hashing, and role-based authorization middleware across 3 user tiers.
- Developed a responsive **React.js** single-page application with centralized API state management, role-protected client routes, URL query state synchronization, and an accessible 1–5 star rating design system.
- Designed database constraints and SQL aggregation pipelines preventing duplicate ratings (`UNIQUE(user_id, store_id)`), preventing privilege escalation, and insulating multi-tenant store owners via server-derived token identities.
