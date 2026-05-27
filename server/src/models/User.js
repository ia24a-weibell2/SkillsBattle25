// User model (hashing, lookup, soft-delete)

const bcrypt = require("bcryptjs");
const { query } = require("../db/queries");

const SALT_ROUNDS = 10;

async function createUser({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash]
  );
  return { id: result.insertId, username, email };
}

async function findByUsernameOrEmail(identifier) {
  const rows = await query(
    "SELECT * FROM users WHERE (username = ? OR email = ?) AND deleted_at IS NULL LIMIT 1",
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

async function softDeleteUser(userId) {
  await query("UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [userId]);
  await query("UPDATE results SET user_id = NULL WHERE user_id = ?", [userId]);
}

module.exports = {
  createUser,
  findByUsernameOrEmail,
  verifyPassword,
  softDeleteUser,
};
