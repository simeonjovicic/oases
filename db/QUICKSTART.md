# Quick Start Guide

## Schnellstart für beide Datenbanken

### 1. MySQL Setup

```bash
# Schema erstellen
mysql -u root < db/db.sql
# oder mit Passwort
mysql -u root -p < db/db.sql

# Daten seeden
npm run seed:medium
```

### 2. MongoDB Setup

**Option A: Mit Docker (empfohlen - einfachste Methode)**

```bash
# MongoDB Container starten (erstellt automatisch wenn nicht vorhanden)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Prüfen ob es läuft
docker ps | grep mongo
```

**Option B: Mit automatischem Script**

```bash
# Versucht MongoDB automatisch zu starten
./db/startMongoDB.sh
```
# Automatisches Script (versucht verschiedene Methoden)
./db/startMongoDB.sh

# Oder direkt mit Docker
docker start mongodb
# oder neu erstellen
docker run -d -p 27017:27017 --name mongodb mongo:latest

**Option C: Manuell**

```bash
# Linux
sudo systemctl start mongodb
# oder
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Prüfen
mongosh --eval "db.adminCommand('ping')"
```

### 3. MongoDB Daten seeden

```bash
npm run seed:mongo:medium
```

### 4. Tests ausführen

```bash
npm test
```

## Troubleshooting

### MongoDB läuft nicht

**Fehler:** `ECONNREFUSED 127.0.0.1:27017`

**Lösung:**
1. Prüfe ob MongoDB läuft: `docker ps | grep mongo` oder `systemctl status mongodb`
2. Starte MongoDB (siehe oben)
3. Prüfe ob Port 27017 frei ist: `netstat -an | grep 27017`

### MongoDB nicht installiert

**Docker (empfohlen):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

## Vollständige Setup-Reihenfolge

```bash
# 1. MySQL Schema
mysql -u root < db/db.sql

# 2. MongoDB starten (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 3. MySQL Daten seeden
npm run seed:medium

# 4. MongoDB Daten seeden
npm run seed:mongo:medium

# 5. Tests ausführen
npm test
```

