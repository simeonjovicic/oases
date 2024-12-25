const express = require("express");
const services = require("./services.json");
const mysql = require("mysql2/promise");
const app = express();
const path = require("path");
const port = 3000;
const fs = require("fs");
const multer = require("multer");
const cors = require('cors');

app.use(cors());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
    credentials: true,
  }));
  const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "db.sql",
    });  
const upload = multer({ storage: multer.memoryStorage() })


app.get('/api/data', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use("/images", express.static(path.join(__dirname, "../assets")));

app.get("/services", (req, res) => {
    res.json(services);
});
