const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Expires",
    ],
    credentials: true,
  })
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "db",
});

app.use("/images", express.static(path.join(__dirname, "../assets/images")));

// GET ALL
app.get("/api/services", async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM services");
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Error fetching services" });
  }
});

// GET BY ID
app.get("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [service] = await db.query("SELECT * FROM services WHERE id = ?", [
      id,
    ]);

    if (service.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service[0]);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Error fetching service" });
  }
});

// POST
app.post("/api/services", upload.single("image"), async (req, res) => {
  const connection = await db.getConnection();
  const buffer = req.file?.buffer; // Image data in memory
  const finalPath = req.file
    ? path.join(
        __dirname,
        "../assets/images",
        `${Date.now()}-${req.file.originalname}`
      )
    : null;

  try {
    const { name, category, description, price, timeSpan } = req.body;

    if (!name || !category || !description || !price || !timeSpan) {
      return res.status(400).json({
        error: "Name, category, description, price, and timeSpan are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image is required!" });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `
        INSERT INTO services (name, category, description, price, timeSpan, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        category,
        description,
        parseFloat(price),
        timeSpan,
        `/images/${path.basename(finalPath)}`,
      ]
    );

    const serviceId = result.insertId;

    fs.writeFile(finalPath, buffer, (err) => {
      if (err) {
        console.error("Error saving the image:", err);
        throw new Error("Image could not be saved");
      }
    });

    await connection.commit();

    res.status(201).json({
      message: "Service successfully added",
      serviceId,
      name,
      category,
      description,
      price,
      timeSpan,
      imageUrl: `/images/${path.basename(finalPath)}`,
    });
  } catch (error) {
    console.error("Error adding service:", error);

    if (finalPath && fs.existsSync(finalPath)) {
      fs.unlink(finalPath, (err) => {
        if (err) console.error("Error deleting the image:", err);
      });
    }

    await connection.rollback();
    res.status(500).json({ error: "Error adding service" });
  } finally {
    connection.release();
  }
});

// DELETE
app.delete("/api/services/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [service] = await db.query(
      "SELECT image FROM services WHERE id = ?",
      [id]
    );

    if (service.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const imagePath = service[0].image;

    if (imagePath) {
      const imageFilePath = path.resolve(
        __dirname,
        "../assets/images",
        path.basename(imagePath)
      );

      if (fs.existsSync(imageFilePath)) {
        fs.unlink(imageFilePath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
            res.status(500).json({ message: "Error deleting image" });
          } else {
            console.log(`Image ${imageFilePath} successfully deleted.`);
            res.status(200).json({ message: "Service successfully deleted" });
          }
        });
      } else {
        console.log("Image file not found, no need to delete.");
        res.status(404).json({ message: "Image file not found" });
      }
    } else {
      console.log("No image path found for the service.");
      res.status(404).json({ message: "No image associated with the service" });
    }

    const [result] = await db.query("DELETE FROM services WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Error deleting service" });
  }
});

// DISPLAY PORT TYPE SHIT
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
