# MongoDB Setup und Verwendung

## Voraussetzungen

1. **MongoDB installieren**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS (mit Homebrew)
   brew install mongodb-community
   
   # Oder Docker verwenden (einfachste Option!)
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **MongoDB starten**

   **Einfachste Methode (automatisch):**
   ```bash
   ./db/startMongoDB.sh
   ```

   **Oder manuell:**
   ```bash
   # Linux (systemd)
   sudo systemctl start mongodb
   # oder
   sudo systemctl start mongod
   
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Docker (wenn bereits erstellt)
   docker start mongodb
   
   # Docker (neu erstellen)
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **MongoDB Status prüfen**
   ```bash
   # Prüfe ob MongoDB läuft
   mongosh --eval "db.adminCommand('ping')"
   
   # Oder mit Docker
   docker ps | grep mongo
   ```

3. **Node.js Packages installieren**
   ```bash
   npm install
   ```

## MongoDB-Seed-Script

Das Script migriert Daten aus der relationalen MySQL-Datenbank in MongoDB.

### Verwendung

**Wichtig:** Das relationale Seed-Script muss zuerst ausgeführt werden!

```bash
# 1. Zuerst relationale DB seeden
npm run seed:medium

# 2. Dann MongoDB seeden
npm run seed:mongo:medium
```

### Verfügbare Commands

```bash
# Standard (5000 Bookings)
npm run seed:mongo

# Kleine Skalierung (50 Bookings)
npm run seed:mongo:small

# Mittlere Skalierung (500 Bookings)
npm run seed:mongo:medium

# Große Skalierung (5000 Bookings)
npm run seed:mongo:large

# Sehr große Skalierung (50.000 Bookings)
npm run seed:mongo:huge

# Maximale Skalierung (100.000 Bookings)
npm run seed:mongo:max

# Benutzerdefiniert
NUM_BOOKINGS=2000 node db/seedMongoDB.js
```

### Umgebungsvariablen

```bash
# MongoDB Connection String (Standard: mongodb://localhost:27017/spa-bookings)
export MONGODB_URI="mongodb://localhost:27017/spa-bookings"

# MySQL Passwort (falls nötig)
export DB_PASSWORD="dein_passwort"

# Anzahl der zu migrierenden Bookings
export NUM_BOOKINGS=5000
```

## Datenbank-Struktur

### Collection: `bookings`

Die Collection enthält alle Buchungen im frontend-optimierten Format:

- **Embedded Customer-Info** - Keine separate Customer-Collection
- **Embedded Services** - Services direkt im Booking-Document
- **Indizes** - Für optimale Query-Performance

### Beispiel-Document

```json
{
  "_id": ObjectId("..."),
  "customer": {
    "customerId": 1,
    "firstName": "Anna",
    "lastName": "Müller",
    "email": "anna.mueller1@gmail.com",
    "phone": "+43123456789",
    "address": "Hauptstraße 42",
    "city": "Wien",
    "postalCode": "1010"
  },
  "services": [
    {
      "serviceId": 1,
      "name": "Maniküre",
      "category": "Nägel",
      "price": 30,
      "timeSpan": "40min",
      "quantity": 1,
      "priceAtBooking": 30
    }
  ],
  "bookingDate": ISODate("2024-12-15T10:00:00Z"),
  "status": "confirmed",
  "totalPrice": 30,
  "notes": null,
  "createdAt": ISODate("2024-12-01T08:00:00Z"),
  "updatedAt": ISODate("2024-12-01T08:00:00Z")
}
```

## CRUD-Operationen

Siehe `src/services/bookingService.js` für alle verfügbaren CRUD-Operationen:

- `createBooking()` - Erstellt neue Buchung
- `findAllBookings()` - Findet alle Buchungen
- `findBookingById()` - Findet Buchung nach ID
- `findBookingsWithFilter()` - Findet mit Filter
- `findBookingsWithProjection()` - Findet mit Projektion
- `findBookingsWithSort()` - Findet mit Sortierung
- `updateBooking()` - Aktualisiert Buchung
- `deleteBooking()` - Löscht Buchung
- `deleteManyBookings()` - Batch-Delete

## Aggregation-Beispiele

Der Service enthält bereits Aggregation-Methoden:

- `getAveragePriceByStatus()` - Durchschnittspreis pro Status
- `getBookingsByCategory()` - Buchungen pro Kategorie
- `getTopCustomersByRevenue()` - Top-Kunden nach Umsatz

## Troubleshooting

### Fehler: "MongoServerError: connection refused"
**Lösung:** Stelle sicher, dass MongoDB läuft:
```bash
# Prüfe Status
sudo systemctl status mongodb
# oder
docker ps | grep mongo
```

### Fehler: "Keine Buchungen gefunden"
**Lösung:** Führe zuerst das relationale Seed-Script aus:
```bash
npm run seed:medium
npm run seed:mongo:medium
```

### Fehler: "Service X nicht gefunden"
**Lösung:** Stelle sicher, dass die Services-Tabelle in MySQL gefüllt ist (db.sql ausführen).

## Performance-Tipps

1. **Indizes nutzen** - Die wichtigsten Indizes sind bereits erstellt
2. **Batch-Operations** - Verwende `insertMany()` für große Datenmengen
3. **Projection** - Nutze Projektion, um nur benötigte Felder zu laden
4. **Limit** - Setze Limits bei großen Abfragen

