# Cloud-Vergleich Quick Start

## Schnellstart

### 1. Cloud-Datenbanken einrichten

**MongoDB Atlas (kostenlos):**
1. Registriere dich bei https://www.mongodb.com/cloud/atlas/register
2. Erstelle einen M0 Cluster (Free Tier)
3. Erstelle einen Database User
4. Whitelist deine IP (oder `0.0.0.0/0` für Tests)
5. Kopiere den Connection String

**MySQL Cloud (PlanetScale - kostenlos):**
1. Registriere dich bei https://planetscale.com/
2. Erstelle eine neue Database
3. Kopiere die Verbindungsdaten

### 2. Umgebungsvariablen setzen

Erstelle eine `.env` Datei im Projekt-Root:

```bash
# MongoDB Atlas
MONGODB_CLOUD_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/spa-bookings?retryWrites=true&w=majority

# MySQL Cloud
MYSQL_CLOUD_HOST=xxxxx.planetscale.com
MYSQL_CLOUD_USER=xxxxx
MYSQL_CLOUD_PASSWORD=xxxxx
MYSQL_CLOUD_DATABASE=spa-bookings
MYSQL_CLOUD_PORT=3306
MYSQL_CLOUD_SSL=true
```

### 3. Schema in Cloud-Datenbanken erstellen

**MySQL:**
```bash
mysql -h <HOST> -u <USER> -p <DATABASE> < db/db.sql
```

**MongoDB:**
- Wird automatisch beim ersten Schreiben erstellt
- Oder: `MONGODB_URI=<cloud-uri> npm run seed:mongo:medium`

### 4. Tests ausführen

```bash
# Alle Tests (inkl. Cloud-Vergleich, falls konfiguriert)
npm test

# Nur Cloud-Vergleichs-Tests
npm test -- --testNamePattern="Cloud"
```

## Was wird getestet?

Die Cloud-Tests vergleichen die Performance zwischen lokalen und Cloud-Datenbanken:

- ✅ MySQL Write (100 Bookings)
- ✅ MySQL Find with Filter
- ✅ MongoDB Write (100 Bookings)
- ✅ MongoDB Find with Filter
- ✅ MySQL Aggregation
- ✅ MongoDB Aggregation

## Wichtig

- ⚠️ Cloud-Tests sind **optional** - sie werden nur ausgeführt, wenn Cloud-URIs konfiguriert sind
- ⚠️ Verwende **separate Test-Datenbanken**, nicht die Produktionsdatenbank!
- ⚠️ Cloud-Tests können langsamer sein aufgrund von Netzwerk-Latenz

## Weitere Informationen

Siehe `CLOUD_SETUP.md` für detaillierte Anleitung.

