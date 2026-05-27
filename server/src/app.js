const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const puzzleRoutes = require("./routes/puzzles.routes");
const highscoresRoutes = require("./routes/highscores.routes");
const rulesRoutes = require("./routes/rules.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/puzzles", puzzleRoutes);
app.use("/highscores", highscoresRoutes);
app.use("/rules", rulesRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

module.exports = app;
