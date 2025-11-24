const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const path = require('path');

// Pfade zu den Modulen (relativ zum db-Ordner)
const Booking = require(path.join(__dirname, '../src/models/Booking'));
const { connectMongoDB, disconnectMongoDB } = require(path.join(__dirname, '../src/config/mongodb'));

// Konfiguration
const CONFIG = {
  NUM_BOOKINGS: parseInt(process.env.NUM_BOOKINGS) || 5000,
};

// MySQL-Konfiguration (um Daten aus relationaler DB zu lesen)
const mysqlConfig = {
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD || "",
  database: "db",
};

/**
 * Liest Daten aus MySQL und konvertiert sie in MongoDB-Format
 */
async function migrateToMongoDB() {
  let mysqlConnection;
  
  try {
    console.log("🚀 Starte MongoDB-Seed-Prozess...");
    console.log(`📊 Konfiguration: ${CONFIG.NUM_BOOKINGS} Buchungen`);
    
    // MongoDB verbinden
    await connectMongoDB();
    
    // MySQL verbinden
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log("✅ MySQL-Verbindung hergestellt");
    
    // Lösche alle bestehenden Bookings in MongoDB
    const deleteResult = await Booking.deleteMany({});
    console.log(`🗑️  ${deleteResult.deletedCount} bestehende Bookings gelöscht`);
    
    // Hole Services aus MySQL
    const [services] = await mysqlConnection.query("SELECT * FROM services");
    const servicesMap = new Map(services.map(s => [s.id, s]));
    console.log(`✅ ${services.length} Services aus MySQL geladen`);
    
    // Hole Bookings mit Customer- und Service-Informationen aus MySQL
    const [bookings] = await mysqlConnection.query(`
      SELECT 
        b.id,
        b.bookingDate,
        b.status,
        b.totalPrice,
        b.notes,
        b.createdAt,
        b.updatedAt,
        c.id as customerId,
        c.firstName,
        c.lastName,
        c.email,
        c.phone,
        c.address,
        c.city,
        c.postalCode
      FROM bookings b
      INNER JOIN customers c ON b.customerId = c.id
      ORDER BY b.id
      LIMIT ?
    `, [parseInt(CONFIG.NUM_BOOKINGS)]);
    
    console.log(`✅ ${bookings.length} Buchungen aus MySQL geladen`);
    
    // Hole Booking-Services (m:n Beziehung)
    const bookingIds = bookings.map(b => b.id);
    if (bookingIds.length === 0) {
      throw new Error("Keine Buchungen gefunden! Bitte zuerst das relationale Seed-Script ausführen.");
    }
    
    const placeholders = bookingIds.map(() => '?').join(',');
    const [bookingServices] = await mysqlConnection.query(`
      SELECT 
        bs.bookingId,
        bs.serviceId,
        bs.quantity,
        bs.priceAtBooking
      FROM booking_services bs
      WHERE bs.bookingId IN (${placeholders})
      ORDER BY bs.bookingId
    `, bookingIds);
    
    console.log(`✅ ${bookingServices.length} Booking-Services aus MySQL geladen`);
    
    // Gruppiere Booking-Services nach bookingId
    const servicesByBooking = new Map();
    for (const bs of bookingServices) {
      if (!servicesByBooking.has(bs.bookingId)) {
        servicesByBooking.set(bs.bookingId, []);
      }
      servicesByBooking.get(bs.bookingId).push(bs);
    }
    
    // Konvertiere zu MongoDB-Format (frontend-optimiert)
    console.log("\n📝 Konvertiere zu MongoDB-Format...");
    const mongoBookings = [];
    const chunkSize = 1000;
    
    for (const booking of bookings) {
      const bookingServicesList = servicesByBooking.get(booking.id) || [];
      
      // Erstelle embedded Services Array
      const embeddedServices = bookingServicesList.map(bs => {
        const service = servicesMap.get(bs.serviceId);
        if (!service) {
          throw new Error(`Service ${bs.serviceId} nicht gefunden`);
        }
        
        return {
          serviceId: service.id,
          name: service.name,
          category: service.category,
          price: parseFloat(service.price),
          timeSpan: service.timeSpan,
          image: service.image || null,
          description: service.description || null,
          quantity: bs.quantity,
          priceAtBooking: parseFloat(bs.priceAtBooking)
        };
      });
      
      // Erstelle embedded Customer-Objekt
      const embeddedCustomer = {
        customerId: booking.customerId,
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: booking.phone || null,
        address: booking.address || null,
        city: booking.city || null,
        postalCode: booking.postalCode || null
      };
      
      // Erstelle MongoDB-Document
      const mongoBooking = {
        customer: embeddedCustomer,
        services: embeddedServices,
        bookingDate: new Date(booking.bookingDate),
        status: booking.status,
        totalPrice: parseFloat(booking.totalPrice),
        notes: booking.notes || null,
        createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
        updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : new Date()
      };
      
      mongoBookings.push(mongoBooking);
    }
    
    // Füge Bookings in Batches zu MongoDB ein
    console.log("\n💾 Speichere Bookings in MongoDB...");
    for (let i = 0; i < mongoBookings.length; i += chunkSize) {
      const chunk = mongoBookings.slice(i, i + chunkSize);
      await Booking.insertMany(chunk, { ordered: false });
      
      if ((i + chunkSize) % 5000 === 0 || i + chunkSize >= mongoBookings.length) {
        console.log(`  ✓ ${Math.min(i + chunkSize, mongoBookings.length)}/${mongoBookings.length} Bookings gespeichert`);
      }
    }
    
    // Statistiken
    console.log("\n📊 Statistiken:");
    const totalCount = await Booking.countDocuments();
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log(`  • Gesamt Bookings: ${totalCount}`);
    console.log(`  • Status-Verteilung:`);
    statusCounts.forEach(s => {
      console.log(`    - ${s._id}: ${s.count}`);
    });
    
    // Service-Kategorien
    const categoryCounts = await Booking.aggregate([
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`  • Service-Kategorien:`);
    categoryCounts.forEach(c => {
      console.log(`    - ${c._id}: ${c.count}`);
    });
    
    console.log("\n✅ MongoDB-Seed-Prozess erfolgreich abgeschlossen!");
    
  } catch (error) {
    console.error("❌ Fehler beim MongoDB-Seed-Prozess:", error);
    throw error;
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log("🔌 MySQL-Verbindung geschlossen");
    }
    await disconnectMongoDB();
  }
}

// Script ausführen
if (require.main === module) {
  migrateToMongoDB()
    .then(() => {
      console.log("\n✨ Fertig!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fehler:", error);
      process.exit(1);
    });
}

module.exports = { migrateToMongoDB, CONFIG };

