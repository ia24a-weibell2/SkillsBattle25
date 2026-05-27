const express = require("express");
const rulesController = require("../controllers/rules.controller");

const router = express.Router();

router.get("/", rulesController.getRules);

module.exports = router;
