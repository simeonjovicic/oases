const mysql = require('mysql2/promise');
const Booking = require('../src/models/Booking');
const bookingService = require('../src/services/bookingService');
const { connectMongoDB, disconnectMongoDB } = require('../src/config/mongodb');

// Konfiguration
const CONFIG = {
  SCALES: [100, 1000, 100000], // Skalierungen für Writing-Tests
  MYSQL_CONFIG: {
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD || "",
    database: "db",
  },
};

// Test-Daten Generatoren
const firstNames = ["Anna", "Maria", "Sophia", "Emma", "Michael", "Thomas", "David", "Alexander"];
const lastNames = ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker"];
const cities = ["Wien", "Graz", "Linz", "Salzburg", "Innsbruck"];
const statuses = ["pending", "confirmed", "completed", "cancelled"];

function generateEmail(firstName, lastName, index) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@test.com`;
}

function generateBookingDate() {
  const now = new Date();
  const future = new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
  return future;
}

/**
 * Generiert Test-Booking-Daten
 */
function generateTestBooking(services, customerId = null) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = generateEmail(firstName, lastName, Math.floor(Math.random() * 10000));
  
  const embeddedServices = services.map(service => ({
    serviceId: service.id,
    name: service.name,
    category: service.category,
    price: parseFloat(service.price),
    timeSpan: service.timeSpan,
    image: service.image || null,
    description: service.description || null,
    quantity: 1,
    priceAtBooking: parseFloat(service.price)
  }));
  
  const totalPrice = embeddedServices.reduce((sum, s) => sum + s.priceAtBooking, 0);
  
  return {
    customer: {
      customerId: customerId || Math.floor(Math.random() * 1000) + 1,
      firstName,
      lastName,
      email,
      phone: `+43${Math.floor(Math.random() * 900000000) + 100000000}`,
      address: `Teststraße ${Math.floor(Math.random() * 200) + 1}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      postalCode: `${Math.floor(Math.random() * 9000) + 1000}`
    },
    services: embeddedServices,
    bookingDate: generateBookingDate(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    totalPrice: totalPrice.toFixed(2),
    notes: `Test booking ${Date.now()}`
  };
}

/**
 * Misst die Ausführungszeit einer Funktion
 */
async function measureTime(fn, label) {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1000000; // Konvertiere zu Millisekunden
  return { result, duration: durationMs, label };
}

/**
 * Formatiert Zeit für Ausgabe
 */
function formatTime(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Schreibt Ergebnisse in eine Datei
 */
function saveResults(results, filename = 'performance-results.json') {
  const fs = require('fs');
  const path = require('path');
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Ergebnisse gespeichert in: ${filepath}`);
}

// ============================================================================
// RELATIONAL DB TESTS (MySQL)
// ============================================================================

class RelationalDBTests {
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * WRITE - Erstellt mehrere Buchungen
   */
  async writeBookings(bookings) {
    const values = bookings.map(b => [
      b.customer.customerId,
      b.bookingDate,
      b.status,
      b.totalPrice,
      b.notes || null
    ]);
    
    const placeholders = values.map(() => "(?, ?, ?, ?, ?)").join(", ");
    const flatValues = values.flat();
    
    const [result] = await this.connection.query(
      `INSERT INTO bookings (customerId, bookingDate, status, totalPrice, notes) VALUES ${placeholders}`,
      flatValues
    );
    
    // Hole die eingefügten Booking-IDs
    const [insertedBookings] = await this.connection.query(
      `SELECT id FROM bookings WHERE id >= ? ORDER BY id ASC LIMIT ?`,
      [result.insertId, bookings.length]
    );
    
    // Füge auch booking_services ein
    const bookingServiceValues = [];
    
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const bookingId = insertedBookings[i].id;
      
      for (const service of booking.services) {
        bookingServiceValues.push([
          bookingId,
          service.serviceId,
          service.quantity,
          service.priceAtBooking
        ]);
      }
    }
    
    if (bookingServiceValues.length > 0) {
      const bsPlaceholders = bookingServiceValues.map(() => "(?, ?, ?, ?)").join(", ");
      const bsFlatValues = bookingServiceValues.flat();
      await this.connection.query(
        `INSERT INTO booking_services (bookingId, serviceId, quantity, priceAtBooking) VALUES ${bsPlaceholders}`,
        bsFlatValues
      );
    }
    
    return result;
  }

  /**
   * WRITE - Erstellt Buchungen einzeln (Single-Insert)
   */
  async writeBookingsSingle(bookings) {
    const results = [];
    for (const booking of bookings) {
      const [result] = await this.connection.query(
        `INSERT INTO bookings (customerId, bookingDate, status, totalPrice, notes) VALUES (?, ?, ?, ?, ?)`,
        [booking.customer.customerId, booking.bookingDate, booking.status, booking.totalPrice, booking.notes || null]
      );
      
      const bookingId = result.insertId;
      
      // Füge booking_services ein
      for (const service of booking.services) {
        await this.connection.query(
          `INSERT INTO booking_services (bookingId, serviceId, quantity, priceAtBooking) VALUES (?, ?, ?, ?)`,
          [bookingId, service.serviceId, service.quantity, service.priceAtBooking]
        );
      }
      
      results.push(result);
    }
    return results;
  }

  /**
   * FIND - Alle Buchungen ohne Filter
   */
  async findAllBookings() {
    const [bookings] = await this.connection.query(`
      SELECT 
        b.*,
        c.firstName, c.lastName, c.email, c.phone, c.address, c.city, c.postalCode
      FROM bookings b
      INNER JOIN customers c ON b.customerId = c.id
    `);
    return bookings;
  }

  /**
   * FIND - Mit Filter (nach Status)
   */
  async findBookingsWithFilter(status) {
    const [bookings] = await this.connection.query(`
      SELECT 
        b.*,
        c.firstName, c.lastName, c.email, c.phone, c.address, c.city, c.postalCode
      FROM bookings b
      INNER JOIN customers c ON b.customerId = c.id
      WHERE b.status = ?
    `, [status]);
    return bookings;
  }

  /**
   * FIND - Mit Filter und Projektion (nur bestimmte Felder)
   */
  async findBookingsWithProjection(status) {
    const [bookings] = await this.connection.query(`
      SELECT 
        b.id,
        b.bookingDate,
        b.status,
        b.totalPrice,
        c.email,
        c.firstName,
        c.lastName
      FROM bookings b
      INNER JOIN customers c ON b.customerId = c.id
      WHERE b.status = ?
    `, [status]);
    return bookings;
  }

  /**
   * FIND - Mit Filter, Projektion und Sortierung
   */
  async findBookingsWithSort(status) {
    const [bookings] = await this.connection.query(`
      SELECT 
        b.id,
        b.bookingDate,
        b.status,
        b.totalPrice,
        c.email,
        c.firstName,
        c.lastName
      FROM bookings b
      INNER JOIN customers c ON b.customerId = c.id
      WHERE b.status = ?
      ORDER BY b.totalPrice DESC, b.bookingDate ASC
    `, [status]);
    return bookings;
  }

  /**
   * UPDATE - Aktualisiert eine Buchung
   */
  async updateBooking(bookingId, updateData) {
    const [result] = await this.connection.query(
      `UPDATE bookings SET status = ?, notes = ?, updatedAt = NOW() WHERE id = ?`,
      [updateData.status, updateData.notes, bookingId]
    );
    return result;
  }

  /**
   * DELETE - Löscht eine Buchung
   */
  async deleteBooking(bookingId) {
    // Lösche zuerst booking_services (CASCADE sollte das automatisch machen, aber sicherheitshalber)
    await this.connection.query(`DELETE FROM booking_services WHERE bookingId = ?`, [bookingId]);
    const [result] = await this.connection.query(`DELETE FROM bookings WHERE id = ?`, [bookingId]);
    return result;
  }
}

// ============================================================================
// MONGODB TESTS
// ============================================================================

class MongoDBTests {
  /**
   * WRITE - Erstellt mehrere Buchungen (Batch-Insert)
   */
  async writeBookings(bookings) {
    return await Booking.insertMany(bookings, { ordered: false });
  }

  /**
   * WRITE - Erstellt Buchungen einzeln (Single-Insert)
   */
  async writeBookingsSingle(bookings) {
    const results = [];
    for (const booking of bookings) {
      const doc = new Booking(booking);
      await doc.save();
      results.push(doc);
    }
    return results;
  }

  /**
   * FIND - Alle Buchungen ohne Filter
   */
  async findAllBookings() {
    return await bookingService.findAllBookings();
  }

  /**
   * FIND - Mit Filter (nach Status)
   */
  async findBookingsWithFilter(status) {
    return await bookingService.findBookingsWithFilter({ status });
  }

  /**
   * FIND - Mit Filter und Projektion
   */
  async findBookingsWithProjection(status) {
    return await bookingService.findBookingsWithProjection(
      { status },
      { 
        _id: 1, 
        bookingDate: 1, 
        status: 1, 
        totalPrice: 1,
        'customer.email': 1,
        'customer.firstName': 1,
        'customer.lastName': 1
      }
    );
  }

  /**
   * FIND - Mit Filter, Projektion und Sortierung
   */
  async findBookingsWithSort(status) {
    return await bookingService.findBookingsWithSort(
      { status },
      { 
        _id: 1, 
        bookingDate: 1, 
        status: 1, 
        totalPrice: 1,
        'customer.email': 1,
        'customer.firstName': 1,
        'customer.lastName': 1
      },
      { totalPrice: -1, bookingDate: 1 }
    );
  }

  /**
   * UPDATE - Aktualisiert eine Buchung
   */
  async updateBooking(bookingId, updateData) {
    return await bookingService.updateBooking(bookingId, updateData);
  }

  /**
   * DELETE - Löscht eine Buchung
   */
  async deleteBooking(bookingId) {
    return await bookingService.deleteBooking(bookingId);
  }
}

// ============================================================================
// PERFORMANCE TEST SUITE
// ============================================================================

class PerformanceTestSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: []
    };
  }

  async runAllTests() {
    let mysqlConnection;
    
    try {
      console.log("🚀 Starte Performance-Tests...\n");
      
      // Verbindungen herstellen
      mysqlConnection = await mysql.createConnection(CONFIG.MYSQL_CONFIG);
      console.log("✅ MySQL verbunden");
      
      await connectMongoDB();
      console.log("✅ MongoDB verbunden\n");
      
      const relationalTests = new RelationalDBTests(mysqlConnection);
      const mongoTests = new MongoDBTests();
      
      // Hole Services für Test-Daten
      const [services] = await mysqlConnection.query("SELECT * FROM services LIMIT 5");
      if (services.length === 0) {
        throw new Error("Keine Services gefunden! Bitte zuerst db.sql ausführen.");
      }
      
      // Hole eine existierende Booking-ID für Update/Delete Tests
      const [existingBookings] = await mysqlConnection.query("SELECT id FROM bookings LIMIT 1");
      const testBookingId = existingBookings.length > 0 ? existingBookings[0].id : null;
      
      const [existingMongoBookings] = await Booking.find().limit(1);
      const testMongoBookingId = existingMongoBookings ? existingMongoBookings._id : null;
      
      // ========================================================================
      // TEST 1: WRITING OPERATIONS (2 verschiedene Varianten in verschiedenen Skalierungen)
      // ========================================================================
      console.log("📝 TEST 1: WRITING OPERATIONS");
      console.log("=" .repeat(60));
      
      // Test 1.1: Batch-Insert in verschiedenen Skalierungen
      console.log("\n  1.1: Batch-Insert (mehrere Bookings auf einmal)");
      for (const scale of CONFIG.SCALES) {
        console.log(`\n    Skalierung: ${scale} Bookings`);
        
        // Generiere Test-Daten
        const testBookings = [];
        for (let i = 0; i < scale; i++) {
          const numServices = Math.floor(Math.random() * 3) + 1; // 1-3 Services
          const selectedServices = [];
          for (let j = 0; j < numServices; j++) {
            selectedServices.push(services[Math.floor(Math.random() * services.length)]);
          }
          testBookings.push(generateTestBooking(selectedServices));
        }
        
        // MySQL Batch Write Test
        const mysqlResult = await measureTime(
          () => relationalTests.writeBookings(testBookings),
          `MySQL Batch Write (${scale})`
        );
        console.log(`      MySQL:   ${formatTime(mysqlResult.duration)}`);
        
        // MongoDB Batch Write Test
        const mongoResult = await measureTime(
          () => mongoTests.writeBookings(testBookings),
          `MongoDB Batch Write (${scale})`
        );
        console.log(`      MongoDB: ${formatTime(mongoResult.duration)}`);
        
        const speedup = ((mysqlResult.duration - mongoResult.duration) / mysqlResult.duration * 100).toFixed(1);
        console.log(`      Differenz: ${speedup}% ${mongoResult.duration < mysqlResult.duration ? 'schneller' : 'langsamer'} (MongoDB vs MySQL)`);
        
        this.results.tests.push({
          test: `Batch Write ${scale}`,
          mysql: mysqlResult.duration,
          mongodb: mongoResult.duration,
          speedup: parseFloat(speedup)
        });
      }
      
      // Test 1.2: Single-Insert (nur für kleinere Skalierungen, da sonst zu langsam)
      console.log("\n  1.2: Single-Insert (einzelne Bookings nacheinander)");
      const singleInsertScales = [100, 1000]; // Nur kleinere Skalierungen
      
      for (const scale of singleInsertScales) {
        console.log(`\n    Skalierung: ${scale} Bookings`);
        
        // Generiere Test-Daten
        const testBookings = [];
        for (let i = 0; i < scale; i++) {
          const numServices = Math.floor(Math.random() * 3) + 1;
          const selectedServices = [];
          for (let j = 0; j < numServices; j++) {
            selectedServices.push(services[Math.floor(Math.random() * services.length)]);
          }
          testBookings.push(generateTestBooking(selectedServices));
        }
        
        // MySQL Single Write Test
        const mysqlResult = await measureTime(
          () => relationalTests.writeBookingsSingle(testBookings),
          `MySQL Single Write (${scale})`
        );
        console.log(`      MySQL:   ${formatTime(mysqlResult.duration)}`);
        
        // MongoDB Single Write Test
        const mongoResult = await measureTime(
          () => mongoTests.writeBookingsSingle(testBookings),
          `MongoDB Single Write (${scale})`
        );
        console.log(`      MongoDB: ${formatTime(mongoResult.duration)}`);
        
        const speedup = ((mysqlResult.duration - mongoResult.duration) / mysqlResult.duration * 100).toFixed(1);
        console.log(`      Differenz: ${speedup}% ${mongoResult.duration < mysqlResult.duration ? 'schneller' : 'langsamer'} (MongoDB vs MySQL)`);
        
        this.results.tests.push({
          test: `Single Write ${scale}`,
          mysql: mysqlResult.duration,
          mongodb: mongoResult.duration,
          speedup: parseFloat(speedup)
        });
      }
      
      // ========================================================================
      // TEST 2: FIND OPERATIONS (4 verschiedene Varianten)
      // ========================================================================
      console.log("\n\n🔍 TEST 2: FIND OPERATIONS");
      console.log("=" .repeat(60));
      
      // 2.1: Find ohne Filter
      console.log("\n  2.1: Find ohne Filter");
      const find1Mysql = await measureTime(
        () => relationalTests.findAllBookings(),
        "MySQL Find (ohne Filter)"
      );
      const find1Mongo = await measureTime(
        () => mongoTests.findAllBookings(),
        "MongoDB Find (ohne Filter)"
      );
      console.log(`    MySQL:   ${formatTime(find1Mysql.duration)} (${find1Mysql.result.length} Ergebnisse)`);
      console.log(`    MongoDB: ${formatTime(find1Mongo.duration)} (${find1Mongo.result.length} Ergebnisse)`);
      this.results.tests.push({
        test: "Find ohne Filter",
        mysql: find1Mysql.duration,
        mongodb: find1Mongo.duration,
        mysqlCount: find1Mysql.result.length,
        mongodbCount: find1Mongo.result.length
      });
      
      // 2.2: Find mit Filter
      console.log("\n  2.2: Find mit Filter (status = 'confirmed')");
      const find2Mysql = await measureTime(
        () => relationalTests.findBookingsWithFilter('confirmed'),
        "MySQL Find (mit Filter)"
      );
      const find2Mongo = await measureTime(
        () => mongoTests.findBookingsWithFilter('confirmed'),
        "MongoDB Find (mit Filter)"
      );
      console.log(`    MySQL:   ${formatTime(find2Mysql.duration)} (${find2Mysql.result.length} Ergebnisse)`);
      console.log(`    MongoDB: ${formatTime(find2Mongo.duration)} (${find2Mongo.result.length} Ergebnisse)`);
      this.results.tests.push({
        test: "Find mit Filter",
        mysql: find2Mysql.duration,
        mongodb: find2Mongo.duration,
        mysqlCount: find2Mysql.result.length,
        mongodbCount: find2Mongo.result.length
      });
      
      // 2.3: Find mit Filter und Projektion
      console.log("\n  2.3: Find mit Filter und Projektion");
      const find3Mysql = await measureTime(
        () => relationalTests.findBookingsWithProjection('confirmed'),
        "MySQL Find (Filter + Projektion)"
      );
      const find3Mongo = await measureTime(
        () => mongoTests.findBookingsWithProjection('confirmed'),
        "MongoDB Find (Filter + Projektion)"
      );
      console.log(`    MySQL:   ${formatTime(find3Mysql.duration)} (${find3Mysql.result.length} Ergebnisse)`);
      console.log(`    MongoDB: ${formatTime(find3Mongo.duration)} (${find3Mongo.result.length} Ergebnisse)`);
      this.results.tests.push({
        test: "Find mit Filter + Projektion",
        mysql: find3Mysql.duration,
        mongodb: find3Mongo.duration,
        mysqlCount: find3Mysql.result.length,
        mongodbCount: find3Mongo.result.length
      });
      
      // 2.4: Find mit Filter, Projektion und Sortierung
      console.log("\n  2.4: Find mit Filter, Projektion und Sortierung");
      const find4Mysql = await measureTime(
        () => relationalTests.findBookingsWithSort('confirmed'),
        "MySQL Find (Filter + Projektion + Sort)"
      );
      const find4Mongo = await measureTime(
        () => mongoTests.findBookingsWithSort('confirmed'),
        "MongoDB Find (Filter + Projektion + Sort)"
      );
      console.log(`    MySQL:   ${formatTime(find4Mysql.duration)} (${find4Mysql.result.length} Ergebnisse)`);
      console.log(`    MongoDB: ${formatTime(find4Mongo.duration)} (${find4Mongo.result.length} Ergebnisse)`);
      this.results.tests.push({
        test: "Find mit Filter + Projektion + Sort",
        mysql: find4Mysql.duration,
        mongodb: find4Mongo.duration,
        mysqlCount: find4Mysql.result.length,
        mongodbCount: find4Mongo.result.length
      });
      
      // ========================================================================
      // TEST 3: UPDATE OPERATION
      // ========================================================================
      console.log("\n\n✏️  TEST 3: UPDATE OPERATION");
      console.log("=" .repeat(60));
      
      if (testBookingId && testMongoBookingId) {
        const updateData = {
          status: 'completed',
          notes: `Updated at ${new Date().toISOString()}`
        };
        
        const updateMysql = await measureTime(
          () => relationalTests.updateBooking(testBookingId, updateData),
          "MySQL Update"
        );
        const updateMongo = await measureTime(
          () => mongoTests.updateBooking(testMongoBookingId, updateData),
          "MongoDB Update"
        );
        
        console.log(`    MySQL:   ${formatTime(updateMysql.duration)}`);
        console.log(`    MongoDB: ${formatTime(updateMongo.duration)}`);
        this.results.tests.push({
          test: "Update",
          mysql: updateMysql.duration,
          mongodb: updateMongo.duration
        });
      } else {
        console.log("    ⚠️  Keine Test-Bookings gefunden, Update-Test übersprungen");
      }
      
      // ========================================================================
      // TEST 4: DELETE OPERATION
      // ========================================================================
      console.log("\n\n🗑️  TEST 4: DELETE OPERATION");
      console.log("=" .repeat(60));
      
      // Erstelle temporäre Bookings für Delete-Test
      const tempBooking = generateTestBooking([services[0]]);
      const tempMysqlBooking = await relationalTests.writeBookings([tempBooking]);
      const tempMysqlBookingId = tempMysqlBooking.insertId;
      
      const tempMongoBookings = await mongoTests.writeBookings([tempBooking]);
      const tempMongoBookingId = tempMongoBookings[0]._id;
      
      const deleteMysql = await measureTime(
        () => relationalTests.deleteBooking(tempMysqlBookingId),
        "MySQL Delete"
      );
      const deleteMongo = await measureTime(
        () => mongoTests.deleteBooking(tempMongoBookingId),
        "MongoDB Delete"
      );
      
      console.log(`    MySQL:   ${formatTime(deleteMysql.duration)}`);
      console.log(`    MongoDB: ${formatTime(deleteMongo.duration)}`);
      this.results.tests.push({
        test: "Delete",
        mysql: deleteMysql.duration,
        mongodb: deleteMongo.duration
      });
      
      // ========================================================================
      // ZUSAMMENFASSUNG
      // ========================================================================
      console.log("\n\n📊 ZUSAMMENFASSUNG");
      console.log("=" .repeat(60));
      console.log("\nAlle Tests abgeschlossen! Ergebnisse:");
      this.results.tests.forEach(test => {
        const speedup = test.speedup ? `${test.speedup}%` : 'N/A';
        console.log(`  ${test.test}:`);
        console.log(`    MySQL:   ${formatTime(test.mysql)}`);
        console.log(`    MongoDB: ${formatTime(test.mongodb)}`);
        if (test.speedup) {
          console.log(`    Differenz: ${speedup}`);
        }
      });
      
      // Speichere Ergebnisse
      saveResults(this.results);
      
    } catch (error) {
      console.error("❌ Fehler beim Ausführen der Tests:", error);
      throw error;
    } finally {
      if (mysqlConnection) {
        await mysqlConnection.end();
        console.log("\n🔌 MySQL-Verbindung geschlossen");
      }
      await disconnectMongoDB();
    }
  }
}

// Script ausführen
if (require.main === module) {
  const testSuite = new PerformanceTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log("\n✨ Alle Tests erfolgreich abgeschlossen!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fehler:", error);
      process.exit(1);
    });
}

module.exports = { PerformanceTestSuite, CONFIG };

