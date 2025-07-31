import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from Express API!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
