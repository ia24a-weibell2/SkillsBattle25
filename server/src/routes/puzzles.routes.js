// Puzzle routes

const express = require("express");
const puzzlesController = require("../controllers/puzzles.controller");
const { requireAuth } = require("../services/auth");

const router = express.Router();

router.get("/", requireAuth, puzzlesController.list);
router.post("/", requireAuth, puzzlesController.create);
router.get("/:id", requireAuth, puzzlesController.getById);
router.post("/:id/solve", requireAuth, puzzlesController.solve);
router.post("/:id/hint", requireAuth, puzzlesController.hint);
router.get("/:id/autosolve", requireAuth, puzzlesController.autosolve);
router.post("/:id/rating", requireAuth, puzzlesController.rate);

module.exports = router;
