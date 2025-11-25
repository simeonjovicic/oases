const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const path = require('path');

// Pfade zu den Modulen
const { CustomerReferenced, ServiceReferenced, BookingReferenced } = require(path.join(__dirname, '../src/models/BookingReferenced'));
const { connectMongoDB, disconnectMongoDB } = require(path.join(__dirname, '../src/config/mongodb'));

// Konfiguration
const CONFIG = {
  NUM_BOOKINGS: parseInt(process.env.NUM_BOOKINGS) || 5000,
};

// MySQL-Konfiguration
const mysqlConfig = {
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD || "root",
  database: "db",
};

/**
 * Seeded MongoDB mit Referenzen (normalisiert)
 */
async function seedMongoDBReferenced() {
  let mysqlConnection;
  
  try {
    console.log("🚀 Starte MongoDB-Referencing-Seed-Prozess...");
    console.log(`📊 Konfiguration: ${CONFIG.NUM_BOOKINGS} Buchungen`);
    
    // MongoDB verbinden
    await connectMongoDB();
    
    // MySQL verbinden
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log("✅ MySQL-Verbindung hergestellt");
    
    // Lösche alte Daten
    await BookingReferenced.deleteMany({});
    await CustomerReferenced.deleteMany({});
    await ServiceReferenced.deleteMany({});
    console.log("🗑️  Alte Referencing-Daten gelöscht");
    
    // Hole Services aus MySQL und erstelle ServiceReferenced
    const [services] = await mysqlConnection.query("SELECT * FROM services");
    console.log(`✅ ${services.length} Services aus MySQL geladen`);
    
    const serviceDocs = services.map(s => ({
      serviceId: s.id,
      name: s.name,
      category: s.category,
      price: parseFloat(s.price),
      timeSpan: s.timeSpan,
      image: s.image || null,
      description: s.description || null
    }));
    
    await ServiceReferenced.insertMany(serviceDocs);
    console.log(`✅ ${services.length} Services in MongoDB (Referenced) erstellt`);
    
    // Hole Customers aus MySQL und erstelle CustomerReferenced
    const [customers] = await mysqlConnection.query(`
      SELECT DISTINCT c.* 
      FROM customers c
      INNER JOIN bookings b ON c.id = b.customerId
      LIMIT ${CONFIG.NUM_BOOKINGS * 2}
    `);
    console.log(`✅ ${customers.length} Kunden aus MySQL geladen`);
    
    const customerDocs = customers.map(c => ({
      customerId: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone || null,
      address: c.address || null,
      city: c.city || null,
      postalCode: c.postalCode || null
    }));
    
    await CustomerReferenced.insertMany(customerDocs);
    console.log(`✅ ${customers.length} Kunden in MongoDB (Referenced) erstellt`);
    
    // Hole Bookings aus MySQL
    const [bookings] = await mysqlConnection.query(`
      SELECT 
        b.id,
        b.customerId,
        b.bookingDate,
        b.status,
        b.totalPrice,
        b.notes
      FROM bookings b
      ORDER BY b.id
      LIMIT ?
    `, [CONFIG.NUM_BOOKINGS]);
    
    console.log(`✅ ${bookings.length} Buchungen aus MySQL geladen`);
    
    // Hole Booking-Services
    const bookingIds = bookings.map(b => b.id);
    const [bookingServices] = await mysqlConnection.query(`
      SELECT bs.bookingId, bs.serviceId, bs.quantity, bs.priceAtBooking, s.*
      FROM booking_services bs
      INNER JOIN services s ON bs.serviceId = s.id
      WHERE bs.bookingId IN (?)
    `, [bookingIds]);
    
    console.log(`✅ ${bookingServices.length} Booking-Services aus MySQL geladen`);
    
    // Gruppiere Services nach Booking
    const servicesByBooking = new Map();
    bookingServices.forEach(bs => {
      if (!servicesByBooking.has(bs.bookingId)) {
        servicesByBooking.set(bs.bookingId, []);
      }
      servicesByBooking.get(bs.bookingId).push(bs);
    });
    
    // Erstelle Bookings mit Referenzen
    const bookingDocs = [];
    const serviceMap = new Map();
    const customerMap = new Map();
    
    // Lade alle Services und Customers für schnellen Zugriff
    const allServices = await ServiceReferenced.find({});
    allServices.forEach(s => serviceMap.set(s.serviceId, s._id));
    
    const allCustomers = await CustomerReferenced.find({});
    allCustomers.forEach(c => customerMap.set(c.customerId, c._id));
    
    for (const booking of bookings) {
      const bookingServicesList = servicesByBooking.get(booking.id) || [];
      
      const customerRef = customerMap.get(booking.customerId);
      if (!customerRef) {
        console.log(`⚠️  Customer ${booking.customerId} nicht gefunden, überspringe Booking ${booking.id}`);
        continue;
      }
      
      const serviceRefs = bookingServicesList.map(bs => {
        const serviceRef = serviceMap.get(bs.serviceId);
        if (!serviceRef) {
          console.log(`⚠️  Service ${bs.serviceId} nicht gefunden`);
          return null;
        }
        return {
          service: serviceRef,
          quantity: bs.quantity || 1,
          priceAtBooking: parseFloat(bs.priceAtBooking)
        };
      }).filter(s => s !== null);
      
      if (serviceRefs.length === 0) {
        continue;
      }
      
      bookingDocs.push({
        customer: customerRef,
        services: serviceRefs,
        bookingDate: booking.bookingDate,
        status: booking.status,
        totalPrice: parseFloat(booking.totalPrice),
        notes: booking.notes || null
      });
    }
    
    // Batch-Insert Bookings
    let inserted = 0;
    const batchSize = 1000;
    for (let i = 0; i < bookingDocs.length; i += batchSize) {
      const batch = bookingDocs.slice(i, i + batchSize);
      await BookingReferenced.insertMany(batch);
      inserted += batch.length;
      console.log(`  ✓ ${inserted}/${bookingDocs.length} Bookings erstellt`);
    }
    
    console.log(`\n📊 Statistiken:`);
    console.log(`  • Services (Referenced): ${await ServiceReferenced.countDocuments()}`);
    console.log(`  • Customers (Referenced): ${await CustomerReferenced.countDocuments()}`);
    console.log(`  • Bookings (Referenced): ${await BookingReferenced.countDocuments()}`);
    
    console.log("\n✅ MongoDB-Referencing-Seed-Prozess erfolgreich abgeschlossen!");
    
  } catch (error) {
    console.error("❌ Fehler beim MongoDB-Referencing-Seed-Prozess:", error);
    throw error;
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log("🔌 MySQL-Verbindung geschlossen");
    }
    await disconnectMongoDB();
    console.log("🔌 MongoDB Verbindung getrennt");
  }
}

// Script ausführen
if (require.main === module) {
  seedMongoDBReferenced()
    .then(() => {
      console.log("\n✨ Fertig!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fehler:", error);
      process.exit(1);
    });
}

module.exports = { seedMongoDBReferenced };


