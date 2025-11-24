# Performance-Tests: Relational vs MongoDB

Dieses Test-Script führt umfassende Performance-Vergleiche zwischen der relationalen MySQL-Datenbank und MongoDB durch.

## Voraussetzungen

1. **MySQL-Datenbank mit Testdaten**
   ```bash
   # Zuerst relationale DB seeden
   npm run seed:medium
   ```

2. **MongoDB mit Testdaten**
   ```bash
   # Dann MongoDB seeden
   npm run seed:mongo:medium
   ```

3. **Beide Datenbanken müssen laufen**
   - MySQL auf Port 3306
   - MongoDB auf Port 27017

## Ausführung

```bash
npm run test:performance
```

## Durchgeführte Tests

### 1. Writing Operations (2 verschiedene Skalierungen)

Testet das Einfügen von Bookings in verschiedenen Größenordnungen:
- **100 Bookings**
- **1.000 Bookings**
- **100.000 Bookings**

**Gemessen wird:**
- Zeit für Batch-Insert in MySQL
- Zeit für Batch-Insert in MongoDB
- Performance-Unterschied

### 2. Find Operations (4 Varianten)

#### 2.1 Find ohne Filter
- Lädt alle Bookings aus beiden Datenbanken
- Vergleich der Laufzeiten

#### 2.2 Find mit Filter
- Filtert nach Status (`status = 'confirmed'`)
- MySQL: `WHERE status = ?`
- MongoDB: `{ status: 'confirmed' }`

#### 2.3 Find mit Filter und Projektion
- Filtert nach Status
- Lädt nur bestimmte Felder (Projektion)
- MySQL: `SELECT id, bookingDate, status, totalPrice, ...`
- MongoDB: Projektion auf bestimmte Felder

#### 2.4 Find mit Filter, Projektion und Sortierung
- Filtert nach Status
- Projektion auf bestimmte Felder
- Sortiert nach `totalPrice DESC, bookingDate ASC`
- MySQL: `ORDER BY totalPrice DESC, bookingDate ASC`
- MongoDB: `sort({ totalPrice: -1, bookingDate: 1 })`

### 3. Update Operation

- Aktualisiert eine bestehende Buchung
- Ändert Status und Notes
- Vergleich der Update-Laufzeiten

### 4. Delete Operation

- Löscht eine Buchung
- MySQL: Löscht auch abhängige `booking_services` (CASCADE)
- MongoDB: Löscht das gesamte Document
- Vergleich der Delete-Laufzeiten

## Ausgabe

Das Script gibt für jeden Test aus:
- **Laufzeit MySQL** (in ms/s)
- **Laufzeit MongoDB** (in ms/s)
- **Performance-Unterschied** (in %)
- **Anzahl der Ergebnisse** (bei Find-Operationen)

### Beispiel-Ausgabe

```
📝 TEST 1: WRITING OPERATIONS
============================================================

  Skalierung: 100 Bookings
    MySQL:   45.23ms
    MongoDB: 12.34ms
    Differenz: 72.7% schneller (MongoDB vs MySQL)

🔍 TEST 2: FIND OPERATIONS
============================================================

  2.1: Find ohne Filter
    MySQL:   234.56ms (5000 Ergebnisse)
    MongoDB: 89.12ms (5000 Ergebnisse)
```

## Ergebnisse speichern

Die Ergebnisse werden automatisch in `tests/performance-results.json` gespeichert:

```json
{
  "timestamp": "2024-12-15T10:00:00.000Z",
  "tests": [
    {
      "test": "Write 100",
      "mysql": 45.23,
      "mongodb": 12.34,
      "speedup": 72.7
    },
    ...
  ]
}
```

## Interpretation der Ergebnisse

### Writing Operations
- **MongoDB** ist typischerweise schneller bei Batch-Inserts
- **MySQL** benötigt mehr Zeit wegen JOINs und Constraints

### Find Operations
- **Ohne Filter**: MongoDB kann schneller sein (keine JOINs)
- **Mit Filter**: Abhängig von Index-Qualität
- **Mit Projektion**: MongoDB profitiert von embedded Documents
- **Mit Sortierung**: Abhängig von Index-Strategie

### Update/Delete
- **MongoDB**: Einfacher, da alles in einem Document
- **MySQL**: Kann komplexer sein wegen Foreign Keys

## Tipps für bessere Performance

### MySQL
- Stelle sicher, dass Indizes auf `status`, `bookingDate`, `customerId` existieren
- Verwende `EXPLAIN` um Query-Pläne zu analysieren

### MongoDB
- Indizes sind bereits im Modell definiert
- Nutze Projektion, um nur benötigte Felder zu laden
- Embedded Documents eliminieren JOINs

## Troubleshooting

### Fehler: "Keine Services gefunden"
**Lösung:** Führe zuerst `db/db.sql` aus, um Services zu erstellen.

### Fehler: "Keine Bookings gefunden"
**Lösung:** Führe zuerst die Seed-Scripts aus:
```bash
npm run seed:medium
npm run seed:mongo:medium
```

### Fehler: "Connection refused"
**Lösung:** Stelle sicher, dass beide Datenbanken laufen:
```bash
# MySQL prüfen
mysql -u root -p -e "SELECT 1"

# MongoDB prüfen
mongosh --eval "db.adminCommand('ping')"
```

## Erweiterte Tests

Für zusätzliche Tests (Aggregation, Referencing, etc.) siehe die Bonus-Aufgaben in der Aufgabenstellung.

