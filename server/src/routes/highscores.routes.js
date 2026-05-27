const express = require("express");
const highscoresController = require("../controllers/highscores.controller");
const { requireAuth } = require("../services/auth");

const router = express.Router();

router.get("/", requireAuth, highscoresController.list);

module.exports = router;
