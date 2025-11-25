# Cloud-Vergleich Setup (Bonus: 0.5 Punkte)

Dieses Setup ermöglicht es, Performance-Tests zwischen lokalen und Cloud-Datenbanken zu vergleichen.

## Optionen für kostenlose Cloud-Datenbanken

### 1. MongoDB Atlas (Kostenlos) - Empfohlen

**Setup:**
1. Gehe zu https://www.mongodb.com/cloud/atlas/register
2. Erstelle einen kostenlosen Account (M0 Cluster - Free Tier)
3. Erstelle einen Cluster (z.B. in AWS, Region: Frankfurt)
4. Erstelle einen Database User (z.B. `testuser` / `testpassword`)
5. Whitelist deine IP-Adresse (oder `0.0.0.0/0` für alle IPs - **nur für Tests!**)
6. Kopiere den Connection String:
   ```
   mongodb+srv://testuser:testpassword@cluster0.xxxxx.mongodb.net/spa-bookings?retryWrites=true&w=majority
   mongodb+srv://simeon_db_user:7UzQKTxevHVpp5tl@dbi.kormuoa.mongodb.net/?appName=DBI
   simeon_db_user
   7UzQKTxevHVpp5tl
   92.42.139.178
   ```

**Wichtig:** Verwende eine separate Test-Datenbank, nicht die Produktionsdatenbank!

### 2. MySQL Cloud (Kostenlos)

**Option A: PlanetScale (Empfohlen - einfachste Option)**
1. Gehe zu https://planetscale.com/
2. Erstelle einen kostenlosen Account
3. Erstelle eine neue Database
4. Kopiere die Verbindungsdaten aus dem Dashboard:
   - Host
   - User
   - Password
   - Database Name
   - Port (meist 3306)

**Option B: AWS RDS (Free Tier)**
- Komplexer, aber kostenlos für 12 Monate
- Erfordert AWS Account
- Setup-Anleitung: https://aws.amazon.com/rds/free/

**Option C: Railway / Render (Einfach)**
- Kostenlose Tier verfügbar
- Einfaches Setup
- Railway: https://railway.app/
- Render: https://render.com/

## Konfiguration

### Schritt 1: Umgebungsvariablen setzen

Erstelle eine `.env` Datei im Projekt-Root (oder setze Umgebungsvariablen):

```bash
# MongoDB Atlas
MONGODB_CLOUD_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/spa-bookings?retryWrites=true&w=majority

# MySQL Cloud (PlanetScale oder andere)
MYSQL_CLOUD_HOST=xxxxx.planetscale.com
MYSQL_CLOUD_USER=xxxxx
MYSQL_CLOUD_PASSWORD=xxxxx
MYSQL_CLOUD_DATABASE=spa-bookings
MYSQL_CLOUD_PORT=3306
MYSQL_CLOUD_SSL=true  # Für PlanetScale: true, für andere: false
```

**Hinweis:** Die `.env` Datei sollte in `.gitignore` sein, damit keine Credentials ins Repository kommen!

### Schritt 2: Datenbank-Schema in Cloud erstellen

**MySQL Cloud:**
```bash
# Schema in Cloud-Datenbank laden
mysql -h <MYSQL_CLOUD_HOST> -u <MYSQL_CLOUD_USER> -p <MYSQL_CLOUD_DATABASE> < db/db.sql
```

**MongoDB Cloud:**
- Schema wird automatisch beim ersten Schreiben erstellt
- Oder migriere Daten mit: `MONGODB_URI=<cloud-uri> npm run seed:mongo:medium`

### Schritt 3: Test-Daten in Cloud seeden (optional)

```bash
# MySQL Cloud
MYSQL_CLOUD_HOST=xxx MYSQL_CLOUD_USER=xxx MYSQL_CLOUD_PASSWORD=xxx MYSQL_CLOUD_DATABASE=xxx node db/seed.js

# MongoDB Cloud
MONGODB_URI=<cloud-uri> npm run seed:mongo:medium
```

## Tests ausführen

### Alle Tests (inkl. Cloud-Vergleich, falls konfiguriert)
```bash
npm test
```

### Nur Cloud-Vergleichs-Tests
```bash
npm test -- --testNamePattern="Cloud"
```

### Mit Umgebungsvariablen
```bash
MONGODB_CLOUD_URI=xxx MYSQL_CLOUD_HOST=xxx npm test -- --testNamePattern="Cloud"
```

## Was wird getestet?

Die Cloud-Vergleichs-Tests führen folgende Operationen aus und vergleichen die Performance:

1. **MySQL Write (100 Bookings)** - Batch-Insert lokal vs. Cloud
2. **MySQL Find with Filter** - Query mit Filter lokal vs. Cloud
3. **MongoDB Write (100 Bookings)** - Batch-Insert lokal vs. Cloud
4. **MongoDB Find with Filter** - Query mit Filter lokal vs. Cloud
5. **MySQL Aggregation** - GROUP BY Query lokal vs. Cloud
6. **MongoDB Aggregation** - Aggregation Pipeline lokal vs. Cloud

Die Ergebnisse werden in `tests/performance-results.json` gespeichert.

## Wichtig

- ✅ Cloud-Tests sind **optional** - sie werden nur ausgeführt, wenn Cloud-URIs konfiguriert sind
- ✅ Für Tests: Verwende **separate Test-Datenbanken** in der Cloud
- ❌ **NICHT** die Produktionsdatenbank verwenden!
- ⚠️ Cloud-Tests können langsamer sein aufgrund von Netzwerk-Latenz
- 💰 Achte auf kostenlose Tier-Limits (z.B. MongoDB Atlas: 512MB Storage)

## Troubleshooting

### "Connection refused" oder "Timeout"
- Prüfe ob deine IP-Adresse in der Whitelist ist (MongoDB Atlas)
- Prüfe ob die Datenbank läuft
- Prüfe Firewall-Einstellungen

### "SSL required" (PlanetScale)
- Setze `MYSQL_CLOUD_SSL=true` in der `.env` Datei

### "Authentication failed"
- Prüfe Username/Password
- Prüfe ob der User die richtigen Rechte hat

### Tests werden übersprungen
- Prüfe ob alle Umgebungsvariablen gesetzt sind
- Prüfe ob die `.env` Datei geladen wird (Jest lädt `.env` nicht automatisch - verwende `dotenv` oder setze Variablen direkt)

