// Auth routes

const express = require("express");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../services/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.delete("/account", requireAuth, authController.deleteAccount);

module.exports = router;
