const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Konfiguration - Anzahl der zu generierenden Datensätze
const CONFIG = {
  // Anzahl der zu generierenden Datensätze (10 bis 100.000)
  NUM_CUSTOMERS: process.env.NUM_CUSTOMERS || 1000,
  NUM_BOOKINGS: process.env.NUM_BOOKINGS || 5000,
  SERVICES_PER_BOOKING_MIN: 1,
  SERVICES_PER_BOOKING_MAX: 5,
};

// Datenbank-Konfiguration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD || "",
  database: "db",
  multipleStatements: true,
};

// Vornamen und Nachnamen für zufällige Generierung
const firstNames = [
  "Anna", "Maria", "Sophia", "Emma", "Laura", "Julia", "Sarah", "Lisa",
  "Michael", "Thomas", "Andreas", "Stefan", "Martin", "Christian", "Daniel", "Markus",
  "Julia", "Katharina", "Nicole", "Melanie", "Jessica", "Jennifer", "Nina", "Sandra",
  "David", "Alexander", "Sebastian", "Florian", "Tobias", "Matthias", "Benjamin", "Philipp"
];

const lastNames = [
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker",
  "Schulz", "Hoffmann", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder",
  "Neumann", "Schwarz", "Zimmermann", "Braun", "Krüger", "Hofmann", "Hartmann", "Lange",
  "Schmitt", "Werner", "Schmitz", "Koch", "Schäfer", "Koch", "Bauer", "Richter"
];

const cities = [
  "Wien", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels",
  "Sankt Pölten", "Dornbirn", "Steyr", "Wiener Neustadt", "Feldkirch", "Bregenz", "Leonding", "Baden"
];

const streets = [
  "Hauptstraße", "Bahnhofstraße", "Kirchgasse", "Schulstraße", "Dorfstraße", "Bergstraße",
  "Waldweg", "Gartenstraße", "Parkstraße", "Ringstraße", "Neue Straße", "Alte Straße"
];

// Status für Bookings
const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"];

/**
 * Generiert eine zufällige E-Mail-Adresse
 */
function generateEmail(firstName, lastName, index) {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "a1.net"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
}

/**
 * Generiert eine zufällige Telefonnummer
 */
function generatePhone() {
  return `+43${Math.floor(Math.random() * 900000000) + 100000000}`;
}

/**
 * Generiert eine zufällige Postleitzahl
 */
function generatePostalCode() {
  return Math.floor(Math.random() * 9000) + 1000;
}

/**
 * Generiert einen zufälligen Datum zwischen heute und 1 Jahr in der Zukunft
 */
function generateBookingDate() {
  const now = new Date();
  const future = new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
  return future.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Seed-Script Hauptfunktion
 */
async function seedDatabase() {
  let connection;
  
  try {
    console.log("🚀 Starte Seed-Prozess...");
    console.log(`📊 Konfiguration: ${CONFIG.NUM_CUSTOMERS} Kunden, ${CONFIG.NUM_BOOKINGS} Buchungen`);
    
    // Datenbankverbindung herstellen
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Datenbankverbindung hergestellt");

    // Services aus der Datenbank holen
    const [services] = await connection.query("SELECT id, price FROM services");
    if (services.length === 0) {
      throw new Error("Keine Services in der Datenbank gefunden! Bitte zuerst db.sql ausführen.");
    }
    console.log(`✅ ${services.length} Services gefunden`);

    // 1. Kunden generieren
    console.log("\n📝 Generiere Kunden...");
    const customerValues = [];
    for (let i = 0; i < CONFIG.NUM_CUSTOMERS; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = generateEmail(firstName, lastName, i);
      const phone = generatePhone();
      const city = cities[Math.floor(Math.random() * cities.length)];
      const street = streets[Math.floor(Math.random() * streets.length)];
      const streetNumber = Math.floor(Math.random() * 200) + 1;
      const postalCode = generatePostalCode();
      
      customerValues.push([
        firstName,
        lastName,
        email,
        phone,
        `${street} ${streetNumber}`,
        city,
        postalCode.toString()
      ]);
    }

    // Batch-Insert für Kunden (in Chunks von 1000)
    const chunkSize = 1000;
    for (let i = 0; i < customerValues.length; i += chunkSize) {
      const chunk = customerValues.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
      const values = chunk.flat();
      
      await connection.query(
        `INSERT INTO customers (firstName, lastName, email, phone, address, city, postalCode) VALUES ${placeholders}`,
        values
      );
      
      if ((i + chunkSize) % 5000 === 0 || i + chunkSize >= customerValues.length) {
        console.log(`  ✓ ${Math.min(i + chunkSize, customerValues.length)}/${CONFIG.NUM_CUSTOMERS} Kunden eingefügt`);
      }
    }
    console.log(`✅ ${CONFIG.NUM_CUSTOMERS} Kunden erfolgreich generiert`);

    // 2. Kunden-IDs holen
    const [customers] = await connection.query("SELECT id FROM customers ORDER BY id");
    const customerIds = customers.map(c => c.id);
    console.log(`✅ ${customerIds.length} Kunden-IDs geladen`);

    // 3. Buchungen generieren
    console.log("\n📅 Generiere Buchungen...");
    const bookingValues = [];
    for (let i = 0; i < CONFIG.NUM_BOOKINGS; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const bookingDate = generateBookingDate();
      const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
      
      // Anzahl der Services pro Buchung (1-5)
      const numServices = Math.floor(Math.random() * (CONFIG.SERVICES_PER_BOOKING_MAX - CONFIG.SERVICES_PER_BOOKING_MIN + 1)) + CONFIG.SERVICES_PER_BOOKING_MIN;
      
      // Gesamtpreis berechnen (wird später mit den tatsächlichen Services aktualisiert)
      let totalPrice = 0;
      const selectedServices = [];
      const usedServiceIds = new Set();
      
      for (let j = 0; j < numServices; j++) {
        let service;
        do {
          service = services[Math.floor(Math.random() * services.length)];
        } while (usedServiceIds.has(service.id));
        
        usedServiceIds.add(service.id);
        selectedServices.push(service);
        totalPrice += parseFloat(service.price);
      }
      
      bookingValues.push({
        customerId,
        bookingDate,
        status,
        totalPrice: totalPrice.toFixed(2),
        services: selectedServices
      });
    }

    // Buchungen in die Datenbank einfügen
    const bookingServiceValues = [];
    
    // Hole die aktuelle maximale Booking-ID vor dem Insert
    const [maxIdResult] = await connection.query("SELECT COALESCE(MAX(id), 0) as maxId FROM bookings");
    let lastBookingId = maxIdResult[0].maxId;
    
    for (let i = 0; i < bookingValues.length; i += chunkSize) {
      const chunk = bookingValues.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => "(?, ?, ?, ?)").join(", ");
      const values = chunk.flatMap(b => [b.customerId, b.bookingDate, b.status, b.totalPrice]);
      
      await connection.query(
        `INSERT INTO bookings (customerId, bookingDate, status, totalPrice) VALUES ${placeholders}`,
        values
      );
      
      // Hole die neuen Booking-IDs (die letzten eingefügten)
      const [newBookings] = await connection.query(
        `SELECT id FROM bookings WHERE id > ? ORDER BY id ASC LIMIT ?`,
        [lastBookingId, chunk.length]
      );
      
      // Booking-Services für diese Buchungen vorbereiten
      for (let j = 0; j < chunk.length; j++) {
        const booking = chunk[j];
        const bookingId = newBookings[j].id;
        
        for (const service of booking.services) {
          bookingServiceValues.push([
            bookingId,
            service.id,
            1,
            service.price
          ]);
        }
      }
      
      lastBookingId = newBookings[newBookings.length - 1].id;
      
      if ((i + chunkSize) % 5000 === 0 || i + chunkSize >= bookingValues.length) {
        console.log(`  ✓ ${Math.min(i + chunkSize, bookingValues.length)}/${CONFIG.NUM_BOOKINGS} Buchungen eingefügt`);
      }
    }
    console.log(`✅ ${CONFIG.NUM_BOOKINGS} Buchungen erfolgreich generiert`);

    // 4. Booking-Services (m:n) einfügen
    console.log("\n🔗 Generiere Booking-Services (m:n Beziehung)...");
    for (let i = 0; i < bookingServiceValues.length; i += chunkSize) {
      const chunk = bookingServiceValues.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => "(?, ?, ?, ?)").join(", ");
      const values = chunk.flat();
      
      await connection.query(
        `INSERT INTO booking_services (bookingId, serviceId, quantity, priceAtBooking) VALUES ${placeholders}`,
        values
      );
      
      if ((i + chunkSize) % 10000 === 0 || i + chunkSize >= bookingServiceValues.length) {
        console.log(`  ✓ ${Math.min(i + chunkSize, bookingServiceValues.length)}/${bookingServiceValues.length} Booking-Services eingefügt`);
      }
    }
    console.log(`✅ ${bookingServiceValues.length} Booking-Services erfolgreich generiert`);

    // Statistiken ausgeben
    console.log("\n📊 Statistiken:");
    const [customerCount] = await connection.query("SELECT COUNT(*) as count FROM customers");
    const [bookingCount] = await connection.query("SELECT COUNT(*) as count FROM bookings");
    const [bookingServiceCount] = await connection.query("SELECT COUNT(*) as count FROM booking_services");
    
    console.log(`  • Kunden: ${customerCount[0].count}`);
    console.log(`  • Buchungen: ${bookingCount[0].count}`);
    console.log(`  • Booking-Services (m:n): ${bookingServiceCount[0].count}`);
    
    console.log("\n✅ Seed-Prozess erfolgreich abgeschlossen!");

  } catch (error) {
    console.error("❌ Fehler beim Seed-Prozess:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Datenbankverbindung geschlossen");
    }
  }
}

// Script ausführen
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("\n✨ Fertig!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fehler:", error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, CONFIG };

