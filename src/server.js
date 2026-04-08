const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const cors = require("cors");
const { connectMongoDB } = require("./config/mongodb");
const bookingService = require("./services/bookingService");

app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://oase-spa-wien.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Cache-Control",
      "Pragma",
      "Expires",
    ],
    credentials: true,
  })
);
app.use(express.json()); // Add this to parse JSON request bodies

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "db",
});

app.use("/images", express.static(path.join(__dirname, "../assets/images")));

// PING ENDPOINT (For CI/CD Demo)
app.get("/api/ping", (req, res) => {
  res.json({ message: "Verbindung zum Backend erfolgreich! CI/CD funktioniert." });
});

// GET ALL (Public - no authentication required)
app.get("/api/services", async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM services");
    res.json(services);
  } catch (error) {
    console.error("Error fetching services, fallback to mock data:", error);
    res.json([
      { id: 1, name: "Traditionelle Thai Massage", description: "Tiefgehende Entspannung durch Akupressur", duration: 60, price: 65, image: "" },
      { id: 2, name: "Aroma Öl Massage", description: "Sanfte Massage mit ätherischen Ölen", duration: 45, price: 55, image: "" },
      { id: 3, name: "Fußreflexzonen Massage", description: "Stimulation der Organe über die Füße", duration: 30, price: 40, image: "" }
    ]);
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

// POST (Public - no authentication required)
app.post(
  "/api/services",
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

// DELETE (Public - no authentication required)
app.delete(
  "/api/services/:id",
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

// PUT (Public - no authentication required)
app.put(
  "/api/services/:id",
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

// ============================================================================
// CUSTOMERS API (MySQL)
// ============================================================================

// GET ALL CUSTOMERS
app.get("/api/customers", async (req, res) => {
  try {
    const [customers] = await db.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers, fallback to mock data:", error);
    res.json([
      { id: 1, firstName: "Anna", lastName: "Muster", email: "anna@example.com", phone: "+43 664 1234567" }
    ]);
  }
});

// ============================================================================
// BOOKINGS API (MySQL - Relational)
// ============================================================================

// GET ALL BOOKINGS (with customer and services via JOIN)
app.get("/api/bookings", async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.id,
        b.customerId,
        b.bookingDate,
        b.status,
        b.totalPrice,
        b.notes,
        b.createdAt,
        b.updatedAt,
        c.id as customer_id,
        c.firstName,
        c.lastName,
        c.email,
        c.phone,
        c.address,
        c.city,
        c.postalCode
      FROM bookings b
      INNER JOIN customers c ON b.customerId = c.id
      ORDER BY b.id DESC
    `);

    // Get services for each booking
    const bookingsWithServices = await Promise.all(
      bookings.map(async (booking) => {
        const [services] = await db.query(`
          SELECT 
            bs.serviceId,
            bs.quantity,
            bs.priceAtBooking,
            s.name,
            s.category,
            s.price,
            s.timeSpan,
            s.image,
            s.description
          FROM booking_services bs
          INNER JOIN services s ON bs.serviceId = s.id
          WHERE bs.bookingId = ?
        `, [booking.id]);

        return {
          id: booking.id,
          customerId: booking.customerId,
          customer: {
            id: booking.customer_id,
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            phone: booking.phone,
            address: booking.address,
            city: booking.city,
            postalCode: booking.postalCode
          },
          services: services.map(s => ({
            serviceId: s.serviceId,
            id: s.serviceId,
            name: s.name,
            category: s.category,
            price: s.price,
            timeSpan: s.timeSpan,
            image: s.image,
            description: s.description,
            quantity: s.quantity,
            priceAtBooking: s.priceAtBooking
          })),
          bookingDate: booking.bookingDate,
          status: booking.status,
          totalPrice: booking.totalPrice,
          notes: booking.notes,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        };
      })
    );

    res.json(bookingsWithServices);
  } catch (error) {
    console.error("Error fetching bookings, fallback to mock data:", error);
    res.json([
      {
        id: 1,
        customerId: 1,
        bookingDate: new Date().toISOString(),
        status: "confirmed",
        totalPrice: 65,
        notes: "Mock Data Buchung (Kein MySQL Server)",
        customer: { id: 1, firstName: "Anna", lastName: "Muster", email: "anna@example.com" },
        services: [{ serviceId: 1, name: "Traditionelle Thai Massage", price: 65 }]
      }
    ]);
  }
});

// GET BOOKING BY ID
app.get("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [bookings] = await db.query(`
      SELECT 
        b.*,
        c.firstName, c.lastName, c.email, c.phone, c.address, c.city, c.postalCode
      FROM bookings b
      INNER JOIN customers c ON b.customerId = c.id
      WHERE b.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const [services] = await db.query(`
      SELECT 
        bs.serviceId,
        bs.quantity,
        bs.priceAtBooking,
        s.name, s.category, s.price, s.timeSpan, s.image, s.description
      FROM booking_services bs
      INNER JOIN services s ON bs.serviceId = s.id
      WHERE bs.bookingId = ?
    `, [id]);

    res.json({
      ...bookings[0],
      customer: {
        firstName: bookings[0].firstName,
        lastName: bookings[0].lastName,
        email: bookings[0].email,
        phone: bookings[0].phone,
        address: bookings[0].address,
        city: bookings[0].city,
        postalCode: bookings[0].postalCode
      },
      services
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Error fetching booking" });
  }
});

// CREATE BOOKING
app.post("/api/bookings", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { customerId, bookingDate, status, services, notes } = req.body;

    if (!customerId || !bookingDate || !status || !services || services.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate total price
    const [servicePrices] = await connection.query(
      "SELECT id, price FROM services WHERE id IN (?)",
      [services.map(s => s.serviceId)]
    );
    const priceMap = new Map(servicePrices.map(s => [s.id, parseFloat(s.price)]));
    const totalPrice = services.reduce((sum, s) => {
      return sum + (priceMap.get(s.serviceId) * (s.quantity || 1));
    }, 0);

    // Insert booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (customerId, bookingDate, status, totalPrice, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [customerId, bookingDate, status, totalPrice.toFixed(2), notes || null]
    );

    const bookingId = bookingResult.insertId;

    // Insert booking_services
    const bookingServiceValues = services.map(s => [
      bookingId,
      s.serviceId,
      s.quantity || 1,
      (priceMap.get(s.serviceId) * (s.quantity || 1)).toFixed(2)
    ]);

    if (bookingServiceValues.length > 0) {
      await connection.query(
        `INSERT INTO booking_services (bookingId, serviceId, quantity, priceAtBooking)
         VALUES ?`,
        [bookingServiceValues]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Booking created successfully", bookingId });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Error creating booking" });
  } finally {
    connection.release();
  }
});

// UPDATE BOOKING
app.put("/api/bookings/:id", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { customerId, bookingDate, status, services, notes } = req.body;

    // Update booking
    await connection.query(
      `UPDATE bookings 
       SET customerId = ?, bookingDate = ?, status = ?, notes = ?, updatedAt = NOW()
       WHERE id = ?`,
      [customerId, bookingDate, status, notes || null, id]
    );

    // Delete old services
    await connection.query("DELETE FROM booking_services WHERE bookingId = ?", [id]);

    // Insert new services
    if (services && services.length > 0) {
      const [servicePrices] = await connection.query(
        "SELECT id, price FROM services WHERE id IN (?)",
        [services.map(s => s.serviceId)]
      );
      const priceMap = new Map(servicePrices.map(s => [s.id, parseFloat(s.price)]));
      const totalPrice = services.reduce((sum, s) => {
        return sum + (priceMap.get(s.serviceId) * (s.quantity || 1));
      }, 0);

      const bookingServiceValues = services.map(s => [
        id,
        s.serviceId,
        s.quantity || 1,
        (priceMap.get(s.serviceId) * (s.quantity || 1)).toFixed(2)
      ]);

      await connection.query(
        `INSERT INTO booking_services (bookingId, serviceId, quantity, priceAtBooking)
         VALUES ?`,
        [bookingServiceValues]
      );

      // Update total price
      await connection.query(
        "UPDATE bookings SET totalPrice = ? WHERE id = ?",
        [totalPrice.toFixed(2), id]
      );
    }

    await connection.commit();
    res.json({ message: "Booking updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Error updating booking" });
  } finally {
    connection.release();
  }
});

// DELETE BOOKING
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM bookings WHERE id = ?", [id]);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Error deleting booking" });
  }
});

// ============================================================================
// MONGODB BOOKINGS API
// ============================================================================

// GET ALL MONGODB BOOKINGS
app.get("/api/mongo/bookings", async (req, res) => {
  try {
    const bookings = await bookingService.findAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching MongoDB bookings, fallback to mock data:", error);
    res.json([
      {
        _id: "mock123",
        customer: { firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "0123456789" },
        services: [{ _id: 1, name: "Aroma Öl Massage", price: 55 }],
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2700000).toISOString(),
        totalPrice: 55,
        status: "confirmed",
        notes: "Automatischer Mock-Eintrag (Keine DB-Verbindung)"
      }
    ]);
  }
});

// GET MONGODB BOOKING BY ID
app.get("/api/mongo/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.findBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error("Error fetching MongoDB booking:", error);
    res.status(500).json({ message: "Error fetching booking" });
  }
});

// CREATE MONGODB BOOKING
app.post("/api/mongo/bookings", async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate required fields
    if (!bookingData.customer || !bookingData.customer.firstName || !bookingData.customer.lastName || !bookingData.customer.email) {
      return res.status(400).json({ error: "Missing required customer fields: firstName, lastName, email" });
    }
    
    if (!bookingData.services || !Array.isArray(bookingData.services) || bookingData.services.length === 0) {
      return res.status(400).json({ error: "At least one service is required" });
    }
    
    if (!bookingData.bookingDate) {
      return res.status(400).json({ error: "bookingDate is required" });
    }
    
    if (!bookingData.status) {
      bookingData.status = 'pending';
    }
    
    // Ensure customerId is set (can be 0 for new customers)
    if (!bookingData.customer.customerId) {
      bookingData.customer.customerId = 0;
    }
    
    // Normalize services
    bookingData.services = bookingData.services.map(service => ({
      serviceId: parseInt(service.serviceId) || parseInt(service.id) || 0,
      name: service.name || '',
      category: service.category || '',
      price: parseFloat(service.price) || 0,
      timeSpan: service.timeSpan || '',
      image: service.image || null,
      description: service.description || null,
      quantity: parseInt(service.quantity) || 1,
      priceAtBooking: parseFloat(service.priceAtBooking) || parseFloat(service.price) || 0
    }));
    
    // Calculate total price
    if (!bookingData.totalPrice) {
      bookingData.totalPrice = bookingData.services.reduce((sum, s) => {
        return sum + (parseFloat(s.priceAtBooking) * parseInt(s.quantity || 1));
      }, 0);
    }
    
    // Set timestamps
    bookingData.createdAt = new Date();
    bookingData.updatedAt = new Date();
    
    const booking = await bookingService.createBooking(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating MongoDB booking:", error);
    console.error("Error details:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      error: "Error creating booking",
      message: error.message 
    });
  }
});

// UPDATE MONGODB BOOKING
app.put("/api/mongo/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate required fields
    if (!updateData.customer || !updateData.services || !Array.isArray(updateData.services) || updateData.services.length === 0) {
      return res.status(400).json({ error: "Missing required fields: customer, services" });
    }
    
    // Calculate total price if not provided
    if (!updateData.totalPrice) {
      updateData.totalPrice = updateData.services.reduce((sum, s) => {
        return sum + (parseFloat(s.priceAtBooking || s.price || 0) * (parseInt(s.quantity) || 1));
      }, 0);
    }
    
    // Ensure updatedAt is set
    updateData.updatedAt = new Date();
    
    const booking = await bookingService.updateBooking(id, updateData);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error("Error updating MongoDB booking:", error);
    console.error("Error details:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      error: "Error updating booking",
      message: error.message 
    });
  }
});

// DELETE MONGODB BOOKING
app.delete("/api/mongo/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.deleteBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting MongoDB booking:", error);
    res.status(500).json({ error: "Error deleting booking" });
  }
});

// DISPLAY PORT TYPE SHIT
const PORT = process.env.PORT || 5000;

// Connect to MongoDB on startup
connectMongoDB().then(() => {
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  // Still start server even if MongoDB fails
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} (MongoDB not connected)`);
  });
});
