const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const cors = require("cors");

const admin = require("firebase-admin");
const serviceAccount = require("../assets/config/servicekey.json"); // Replace with your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
app.use(express.json()); // Add this to parse JSON request bodies

// Middleware to verify Firebase token
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    console.log(req.user);
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

const checkAdminRole = async (req, res, next) => {
  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(req.user.uid)
      .get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  } catch (error) {
    console.error("Error checking admin role:", error);
    return res.status(500).json({ error: "Error checking permissions" });
  }
};

app.put("/admin-api/user/:fbuid/claim", async (req, res) => {
  const uid = req.params.fbuid;
  const roleKey = req.query.roleKey;
  const roleValue = req.query.roleValue;
  console.log(
    "Set customClaim/role of user " +
      uid +
      " to (roleKey: " +
      roleKey +
      ", roleValue: " +
      roleValue +
      ")"
  );
  try {
    const customClaims = {};
    customClaims[roleKey] = roleValue;
    await admin.auth().setCustomUserClaims(uid, customClaims);
    res.json({ message: "Custom claim set" });
  } catch (error) {
    console.error("Error setting custom claim:", error);
    res.status(500).json({ error: "Error setting custom claim" });
  }
});
app.get("/admin-api/user/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await admin.auth().getUser(uid);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Simeon",
  database: "db",
});

app.use("/images", express.static(path.join(__dirname, "../assets/images")));

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "ID token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn,
    });

    // Set cookie
    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      status: "success",
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || "",
        picture: decodedToken.picture || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Unauthorized - Invalid credentials" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  res.clearCookie("session");
  res.json({ status: "success" });
});

// GET ALL (Public - no authentication required)
app.get("/api/services", async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM services");
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Error fetching services" });
  }
});

// GET BY ID (Public - no authentication required)
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

// POST (Protected - requires authentication)
app.post(
  "/api/services",
  authenticate,
  checkAdminRole,
  upload.single("image"),
  async (req, res) => {
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
          error:
            "Name, category, description, price, and timeSpan are required",
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
  }
);

// DELETE (Protected - requires authentication)
app.delete(
  "/api/services/:id",
  authenticate,
  checkAdminRole,
  async (req, res) => {
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
        res
          .status(404)
          .json({ message: "No image associated with the service" });
      }

      const [result] = await db.query("DELETE FROM services WHERE id = ?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Service not found" });
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Error deleting service" });
    }
  }
);

// PUT (Protected - requires authentication)
app.put(
  "/api/services/:id",
  authenticate,
  checkAdminRole,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const { name, category, description, price, timeSpan } = req.body;

    const connection = await db.getConnection();
    const buffer = req.file?.buffer;
    const finalPath = req.file
      ? path.join(
          __dirname,
          "../assets/images",
          `${Date.now()}-${req.file.originalname}`
        )
      : null;

    try {
      if (!name || !category || !description || !price || !timeSpan) {
        return res.status(400).json({
          error:
            "Name, category, description, price, and timeSpan are required",
        });
      }

      await connection.beginTransaction();

      // Fetch existing service
      const [existingService] = await connection.query(
        "SELECT * FROM services WHERE id = ?",
        [id]
      );

      if (existingService.length === 0) {
        return res.status(404).json({ error: "Service not found" });
      }

      const updateQuery = `
      UPDATE services
      SET name = ?, category = ?, description = ?, price = ?, timeSpan = ?, image = ?
      WHERE id = ?
    `;
      const newImagePath = req.file
        ? `/images/${path.basename(finalPath)}`
        : existingService[0].image;

      await connection.query(updateQuery, [
        name,
        category,
        description,
        parseFloat(price),
        timeSpan,
        newImagePath,
        id,
      ]);

      if (req.file) {
        fs.writeFile(finalPath, buffer, (err) => {
          if (err) {
            console.error("Error saving the image:", err);
            throw new Error("Image could not be saved");
          }
        });
      }

      await connection.commit();

      res.json({ message: "Service updated successfully" });
    } catch (error) {
      console.error("Error updating service:", error);
      if (finalPath && fs.existsSync(finalPath)) {
        fs.unlink(finalPath, (err) => {
          if (err) console.error("Error deleting the image:", err);
        });
      }
      await connection.rollback();
      res.status(500).json({ error: "Error updating service" });
    } finally {
      connection.release();
    }
  }
);

// DISPLAY PORT TYPE SHIT
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
