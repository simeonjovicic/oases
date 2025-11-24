const mysql = require('mysql2/promise');
const Booking = require('../src/models/Booking');
const bookingService = require('../src/services/bookingService');
const { connectMongoDB, disconnectMongoDB } = require('../src/config/mongodb');
const fs = require('fs');
const path = require('path');

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

function generateTestBooking(availableServices, customerIds, customerId = null) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = generateEmail(firstName, lastName, Math.floor(Math.random() * 10000));
  
  // Wähle eindeutige Services (keine Duplikate pro Booking)
  const numServices = Math.floor(Math.random() * Math.min(3, availableServices.length)) + 1;
  const selectedServices = [];
  const usedServiceIds = new Set();
  
  while (selectedServices.length < numServices && selectedServices.length < availableServices.length) {
    const randomService = availableServices[Math.floor(Math.random() * availableServices.length)];
    if (!usedServiceIds.has(randomService.id)) {
      usedServiceIds.add(randomService.id);
      selectedServices.push(randomService);
    }
  }
  
  const embeddedServices = selectedServices.map(service => ({
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
  
  // Verwende existierende Customer-ID oder wähle zufällig aus dem Array
  let selectedCustomerId;
  if (customerId) {
    selectedCustomerId = customerId;
  } else if (customerIds && customerIds.length > 0) {
    selectedCustomerId = customerIds[Math.floor(Math.random() * customerIds.length)];
  } else {
    throw new Error("Keine Customer-IDs verfügbar! Bitte zuerst seed:medium ausführen.");
  }
  
  return {
    customer: {
      customerId: selectedCustomerId,
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

async function measureTime(fn) {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1000000;
  return { result, duration: durationMs };
}

// Test-Ergebnisse sammeln
const testResults = {
  timestamp: new Date().toISOString(),
  tests: []
};

function saveResults() {
  const filepath = path.join(__dirname, 'performance-results.json');
  fs.writeFileSync(filepath, JSON.stringify(testResults, null, 2));
  console.log(`\n💾 Ergebnisse gespeichert in: ${filepath}`);
}

// ============================================================================
// RELATIONAL DB TESTS (MySQL)
// ============================================================================

class RelationalDBTests {
  constructor(connection) {
    this.connection = connection;
  }

  async writeBookings(bookings) {
    // Für große Batches, teile in kleinere Chunks auf
    const chunkSize = 10000; // Maximal 10.000 Bookings pro Batch
    const chunks = [];
    
    for (let i = 0; i < bookings.length; i += chunkSize) {
      chunks.push(bookings.slice(i, i + chunkSize));
    }
    
    let firstInsertId = null;
    let totalInserted = 0;
    
    for (const chunk of chunks) {
      const values = chunk.map(b => [
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
      
      if (firstInsertId === null) {
        firstInsertId = result.insertId;
      }
      
      const [insertedBookings] = await this.connection.query(
        `SELECT id FROM bookings WHERE id >= ? ORDER BY id ASC LIMIT ?`,
        [result.insertId, chunk.length]
      );
      
      const bookingServiceValues = [];
      for (let i = 0; i < chunk.length; i++) {
        const booking = chunk[i];
        const bookingId = insertedBookings[i].id;
        // Verwende Set um Duplikate zu vermeiden
        const uniqueServiceIds = new Set();
        for (const service of booking.services) {
          if (!uniqueServiceIds.has(service.serviceId)) {
            uniqueServiceIds.add(service.serviceId);
            bookingServiceValues.push([
              bookingId,
              service.serviceId,
              service.quantity,
              service.priceAtBooking
            ]);
          }
        }
      }
      
      if (bookingServiceValues.length > 0) {
        // Auch booking_services in Chunks einfügen
        const bsChunkSize = 5000;
        for (let i = 0; i < bookingServiceValues.length; i += bsChunkSize) {
          const bsChunk = bookingServiceValues.slice(i, i + bsChunkSize);
          const bsPlaceholders = bsChunk.map(() => "(?, ?, ?, ?)").join(", ");
          const bsFlatValues = bsChunk.flat();
          await this.connection.query(
            `INSERT INTO booking_services (bookingId, serviceId, quantity, priceAtBooking) VALUES ${bsPlaceholders}`,
            bsFlatValues
          );
        }
      }
      
      totalInserted += chunk.length;
    }
    
    return { insertId: firstInsertId, affectedRows: totalInserted };
  }

  async writeBookingsSingle(bookings) {
    const results = [];
    for (const booking of bookings) {
      const [result] = await this.connection.query(
        `INSERT INTO bookings (customerId, bookingDate, status, totalPrice, notes) VALUES (?, ?, ?, ?, ?)`,
        [booking.customer.customerId, booking.bookingDate, booking.status, booking.totalPrice, booking.notes || null]
      );
      
      const bookingId = result.insertId;
      // Verwende Set um Duplikate zu vermeiden
      const uniqueServiceIds = new Set();
      for (const service of booking.services) {
        if (!uniqueServiceIds.has(service.serviceId)) {
          uniqueServiceIds.add(service.serviceId);
          await this.connection.query(
            `INSERT INTO booking_services (bookingId, serviceId, quantity, priceAtBooking) VALUES (?, ?, ?, ?)`,
            [bookingId, service.serviceId, service.quantity, service.priceAtBooking]
          );
        }
      }
      
      results.push(result);
    }
    return results;
  }

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

  async updateBooking(bookingId, updateData) {
    const [result] = await this.connection.query(
      `UPDATE bookings SET status = ?, notes = ?, updatedAt = NOW() WHERE id = ?`,
      [updateData.status, updateData.notes, bookingId]
    );
    return result;
  }

  async deleteBooking(bookingId) {
    await this.connection.query(`DELETE FROM booking_services WHERE bookingId = ?`, [bookingId]);
    const [result] = await this.connection.query(`DELETE FROM bookings WHERE id = ?`, [bookingId]);
    return result;
  }
}

// ============================================================================
// MONGODB TESTS
// ============================================================================

class MongoDBTests {
  async writeBookings(bookings) {
    return await Booking.insertMany(bookings, { ordered: false });
  }

  async writeBookingsSingle(bookings) {
    const results = [];
    for (const booking of bookings) {
      const doc = new Booking(booking);
      await doc.save();
      results.push(doc);
    }
    return results;
  }

  async findAllBookings() {
    return await bookingService.findAllBookings();
  }

  async findBookingsWithFilter(status) {
    return await bookingService.findBookingsWithFilter({ status });
  }

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

  async updateBooking(bookingId, updateData) {
    return await bookingService.updateBooking(bookingId, updateData);
  }

  async deleteBooking(bookingId) {
    return await bookingService.deleteBooking(bookingId);
  }
}

// ============================================================================
// JEST TEST SUITE
// ============================================================================

describe('Performance Tests: Relational DB vs MongoDB', () => {
  let mysqlConnection;
  let relationalTests;
  let mongoTests;
  let services;
  let customerIds; // Array mit existierenden Customer-IDs
  let testBookingId;
  let testMongoBookingId;

  beforeAll(async () => {
    // Verbindungen herstellen
    mysqlConnection = await mysql.createConnection(CONFIG.MYSQL_CONFIG);
    await connectMongoDB();
    
    relationalTests = new RelationalDBTests(mysqlConnection);
    mongoTests = new MongoDBTests();
    
    // Services für Test-Daten holen
    const [servicesData] = await mysqlConnection.query("SELECT * FROM services LIMIT 5");
    if (servicesData.length === 0) {
      throw new Error("Keine Services gefunden! Bitte zuerst db.sql ausführen.");
    }
    services = servicesData;
    
    // Existierende Customer-IDs holen (wichtig für Foreign Key Constraints)
    const [customersData] = await mysqlConnection.query("SELECT id FROM customers");
    if (customersData.length === 0) {
      throw new Error("Keine Kunden gefunden! Bitte zuerst npm run seed:medium ausführen.");
    }
    customerIds = customersData.map(c => c.id);
    console.log(`✅ ${customerIds.length} Customer-IDs geladen für Tests`);
    
    // Existierende Booking-IDs für Update/Delete Tests
    const [existingBookings] = await mysqlConnection.query("SELECT id FROM bookings LIMIT 1");
    testBookingId = existingBookings.length > 0 ? existingBookings[0].id : null;
    
    const [existingMongoBookings] = await Booking.find().limit(1);
    testMongoBookingId = existingMongoBookings ? existingMongoBookings._id : null;
  });

  // Helper-Funktion um Connection wiederherzustellen
  async function ensureConnection() {
    try {
      // Versuche eine einfache Query um zu prüfen ob Connection noch funktioniert
      await mysqlConnection.query('SELECT 1');
    } catch (error) {
      // Connection ist tot, erstelle neue
      if (mysqlConnection) {
        try {
          await mysqlConnection.end();
        } catch (e) {
          // Ignoriere Fehler
        }
      }
      mysqlConnection = await mysql.createConnection(CONFIG.MYSQL_CONFIG);
      relationalTests = new RelationalDBTests(mysqlConnection);
    }
  }

  afterAll(async () => {
    try {
      if (mysqlConnection) {
        await mysqlConnection.end();
      }
    } catch (error) {
      // Ignoriere Fehler beim Schließen
    }
    try {
      await disconnectMongoDB();
    } catch (error) {
      // Ignoriere Fehler beim Schließen
    }
    saveResults();
  });

  // ========================================================================
  // WRITING OPERATIONS
  // ========================================================================
  
  describe('Writing Operations', () => {
    describe('Batch-Insert', () => {
      CONFIG.SCALES.forEach(scale => {
        test(`Batch-Insert ${scale} Bookings`, async () => {
          await ensureConnection();
          
          const testBookings = [];
          for (let i = 0; i < scale; i++) {
            testBookings.push(generateTestBooking(services, customerIds));
          }

          const mysqlResult = await measureTime(() => relationalTests.writeBookings(testBookings));
          const mongoResult = await measureTime(() => mongoTests.writeBookings(testBookings));

          const speedup = ((mysqlResult.duration - mongoResult.duration) / mysqlResult.duration * 100).toFixed(1);

          testResults.tests.push({
            test: `Batch Write ${scale}`,
            mysql: mysqlResult.duration,
            mongodb: mongoResult.duration,
            speedup: parseFloat(speedup)
          });

          // Assertions
          expect(mysqlResult.result).toBeDefined();
          expect(mongoResult.result).toBeDefined();
          expect(mysqlResult.duration).toBeGreaterThan(0);
          expect(mongoResult.duration).toBeGreaterThan(0);
          
          console.log(`  Batch Write ${scale}: MySQL=${mysqlResult.duration.toFixed(2)}ms, MongoDB=${mongoResult.duration.toFixed(2)}ms (${speedup}% diff)`);
        }, 300000); // 5 Minuten Timeout
      });
    });

    describe('Single-Insert', () => {
      [100, 1000].forEach(scale => {
        test(`Single-Insert ${scale} Bookings`, async () => {
          await ensureConnection();
          
          const testBookings = [];
          for (let i = 0; i < scale; i++) {
            testBookings.push(generateTestBooking(services, customerIds));
          }

          const mysqlResult = await measureTime(() => relationalTests.writeBookingsSingle(testBookings));
          const mongoResult = await measureTime(() => mongoTests.writeBookingsSingle(testBookings));

          const speedup = ((mysqlResult.duration - mongoResult.duration) / mysqlResult.duration * 100).toFixed(1);

          testResults.tests.push({
            test: `Single Write ${scale}`,
            mysql: mysqlResult.duration,
            mongodb: mongoResult.duration,
            speedup: parseFloat(speedup)
          });

          expect(mysqlResult.result).toBeDefined();
          expect(mongoResult.result).toBeDefined();
          
          console.log(`  Single Write ${scale}: MySQL=${mysqlResult.duration.toFixed(2)}ms, MongoDB=${mongoResult.duration.toFixed(2)}ms (${speedup}% diff)`);
        }, 300000);
      });
    });
  });

  // ========================================================================
  // FIND OPERATIONS
  // ========================================================================

  describe('Find Operations', () => {
    test('Find ohne Filter', async () => {
      await ensureConnection();
      
      const mysqlResult = await measureTime(() => relationalTests.findAllBookings());
      const mongoResult = await measureTime(() => mongoTests.findAllBookings());

      testResults.tests.push({
        test: 'Find ohne Filter',
        mysql: mysqlResult.duration,
        mongodb: mongoResult.duration,
        mysqlCount: mysqlResult.result.length,
        mongodbCount: mongoResult.result.length
      });

      expect(mysqlResult.result).toBeInstanceOf(Array);
      expect(mongoResult.result).toBeInstanceOf(Array);
      expect(mysqlResult.result.length).toBeGreaterThan(0);
      
      console.log(`  Find ohne Filter: MySQL=${mysqlResult.duration.toFixed(2)}ms (${mysqlResult.result.length} Ergebnisse), MongoDB=${mongoResult.duration.toFixed(2)}ms (${mongoResult.result.length} Ergebnisse)`);
    });

    test('Find mit Filter', async () => {
      await ensureConnection();
      
      const mysqlResult = await measureTime(() => relationalTests.findBookingsWithFilter('confirmed'));
      const mongoResult = await measureTime(() => mongoTests.findBookingsWithFilter('confirmed'));

      testResults.tests.push({
        test: 'Find mit Filter',
        mysql: mysqlResult.duration,
        mongodb: mongoResult.duration,
        mysqlCount: mysqlResult.result.length,
        mongodbCount: mongoResult.result.length
      });

      expect(mysqlResult.result).toBeInstanceOf(Array);
      expect(mongoResult.result).toBeInstanceOf(Array);
      
      console.log(`  Find mit Filter: MySQL=${mysqlResult.duration.toFixed(2)}ms (${mysqlResult.result.length} Ergebnisse), MongoDB=${mongoResult.duration.toFixed(2)}ms (${mongoResult.result.length} Ergebnisse)`);
    });

    test('Find mit Filter und Projektion', async () => {
      await ensureConnection();
      
      const mysqlResult = await measureTime(() => relationalTests.findBookingsWithProjection('confirmed'));
      const mongoResult = await measureTime(() => mongoTests.findBookingsWithProjection('confirmed'));

      testResults.tests.push({
        test: 'Find mit Filter + Projektion',
        mysql: mysqlResult.duration,
        mongodb: mongoResult.duration,
        mysqlCount: mysqlResult.result.length,
        mongodbCount: mongoResult.result.length
      });

      expect(mysqlResult.result).toBeInstanceOf(Array);
      expect(mongoResult.result).toBeInstanceOf(Array);
      
      console.log(`  Find mit Filter + Projektion: MySQL=${mysqlResult.duration.toFixed(2)}ms, MongoDB=${mongoResult.duration.toFixed(2)}ms`);
    });

    test('Find mit Filter, Projektion und Sortierung', async () => {
      await ensureConnection();
      
      const mysqlResult = await measureTime(() => relationalTests.findBookingsWithSort('confirmed'));
      const mongoResult = await measureTime(() => mongoTests.findBookingsWithSort('confirmed'));

      testResults.tests.push({
        test: 'Find mit Filter + Projektion + Sort',
        mysql: mysqlResult.duration,
        mongodb: mongoResult.duration,
        mysqlCount: mysqlResult.result.length,
        mongodbCount: mongoResult.result.length
      });

      expect(mysqlResult.result).toBeInstanceOf(Array);
      expect(mongoResult.result).toBeInstanceOf(Array);
      
      console.log(`  Find mit Filter + Projektion + Sort: MySQL=${mysqlResult.duration.toFixed(2)}ms, MongoDB=${mongoResult.duration.toFixed(2)}ms`);
    });
  });

  // ========================================================================
  // UPDATE OPERATION
  // ========================================================================

  describe('Update Operation', () => {
    test('Update Booking', async () => {
      await ensureConnection();
      
      if (!testBookingId || !testMongoBookingId) {
        console.log('  ⚠️  Keine Test-Bookings gefunden, Update-Test übersprungen');
        return;
      }

      const updateData = {
        status: 'completed',
        notes: `Updated at ${new Date().toISOString()}`
      };

      const mysqlResult = await measureTime(() => relationalTests.updateBooking(testBookingId, updateData));
      const mongoResult = await measureTime(() => mongoTests.updateBooking(testMongoBookingId, updateData));

      testResults.tests.push({
        test: 'Update',
        mysql: mysqlResult.duration,
        mongodb: mongoResult.duration
      });

      expect(mysqlResult.result).toBeDefined();
      expect(mongoResult.result).toBeDefined();
      
      console.log(`  Update: MySQL=${mysqlResult.duration.toFixed(2)}ms, MongoDB=${mongoResult.duration.toFixed(2)}ms`);
    });
  });

  // ========================================================================
  // DELETE OPERATION
  // ========================================================================

  describe('Delete Operation', () => {
    test('Delete Booking', async () => {
      await ensureConnection();
      
      // Erstelle temporäre Bookings für Delete-Test
      const tempBooking = generateTestBooking(services, customerIds);
      const tempMysqlBooking = await relationalTests.writeBookings([tempBooking]);
      const tempMysqlBookingId = tempMysqlBooking.insertId;
      
      const [insertedBookings] = await mysqlConnection.query(
        `SELECT id FROM bookings WHERE id >= ? ORDER BY id ASC LIMIT 1`,
        [tempMysqlBookingId, 1]
      );
      const actualMysqlBookingId = insertedBookings[0].id;

      const tempMongoBookings = await mongoTests.writeBookings([tempBooking]);
      const tempMongoBookingId = tempMongoBookings[0]._id;

      const mysqlResult = await measureTime(() => relationalTests.deleteBooking(actualMysqlBookingId));
      const mongoResult = await measureTime(() => mongoTests.deleteBooking(tempMongoBookingId));

      testResults.tests.push({
        test: 'Delete',
        mysql: mysqlResult.duration,
        mongodb: mongoResult.duration
      });

      expect(mysqlResult.result).toBeDefined();
      expect(mongoResult.result).toBeDefined();
      
      console.log(`  Delete: MySQL=${mysqlResult.duration.toFixed(2)}ms, MongoDB=${mongoResult.duration.toFixed(2)}ms`);
    });
  });
});

