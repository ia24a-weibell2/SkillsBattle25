// Auth controller logic

const { createUser, findByUsernameOrEmail, verifyPassword, softDeleteUser } = require("../models/User");
const { signToken } = require("../services/auth");
const { isValidUsername, isValidEmail, isValidPassword } = require("../services/validation");

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!isValidUsername(username)) {
      return res.status(400).json({ error: "Invalid username" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const user = await createUser({ username, email, password });
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Username or email already exists" });
    }
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }
    const user = await findByUsernameOrEmail(identifier);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const ok = await verifyPassword(user, password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user);
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    return next(error);
  }
}

async function deleteAccount(req, res, next) {
  try {
    await softDeleteUser(req.user.id);
    return res.json({ message: "Account deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  deleteAccount,
};
