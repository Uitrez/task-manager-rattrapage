const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const listRoutes = require("./routes/listRoutes");
const taskRoutes = require("./routes/taskRoutes");
const memberRoutes = require("./routes/memberRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/lists", listRoutes);
app.use("/tasks", taskRoutes);
app.use("/lists", memberRoutes);

module.exports = app;
