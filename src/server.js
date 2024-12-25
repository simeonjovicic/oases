const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const path = require("path");
const cors = require("cors");

app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],
    credentials: true,
  })
);

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "db",
});

app.use("/images", express.static(path.join(__dirname, "../assets")));

// ALL
app.get("/api/services", async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM services");
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Error fetching services" });
  }
});

// BY ID
app.get("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [service] = await db.query("SELECT * FROM services WHERE id = ?", [id]);

    if (service.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service[0]);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Error fetching service" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
