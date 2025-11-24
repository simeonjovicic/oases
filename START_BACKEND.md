# Backend Start-Anleitung

## Schnellstart

### 1. MySQL starten

**Prüfen ob MySQL läuft:**
```bash
sudo systemctl status mysql
# oder
sudo systemctl status mariadb
```

**MySQL starten (falls nicht läuft):**
```bash
sudo systemctl start mysql
# oder
sudo systemctl start mariadb
```

**Datenbank-Schema erstellen:**
```bash
mysql -u root < db/db.sql
# oder mit Passwort
mysql -u root -p < db/db.sql
```

**Daten seeden (optional):**
```bash
npm run seed:medium
```

### 2. MongoDB starten

**Mit Docker (empfohlen - einfachste Methode):**

```bash
# Prüfen ob MongoDB Container läuft
docker ps | grep mongo

# Falls nicht, starten:
docker start mongodb

# Falls Container nicht existiert, erstellen:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Oder mit automatischem Script:**
```bash
./db/startMongoDB.sh
```

**MongoDB Daten seeden (optional):**
```bash
npm run seed:mongo:medium
```

### 3. Backend starten

```bash
# In das Backend-Verzeichnis wechseln (falls nötig)
cd /home/simeon/Documents/WMC/sj24-25-4chif-wmc-projekt-codelean

# Dependencies installieren (falls noch nicht gemacht)
npm install

# Backend starten
npm run dev
# oder
node src/server.js
```

## Vollständige Setup-Reihenfolge

```bash
# 1. MySQL starten
sudo systemctl start mysql

# 2. MySQL Schema erstellen
mysql -u root < db/db.sql

# 3. MongoDB starten (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 4. (Optional) Daten seeden
npm run seed:medium
npm run seed:mongo:medium

# 5. Backend starten
npm run dev
```

## Prüfen ob alles läuft

**MySQL:**
```bash
mysql -u root -e "SHOW DATABASES;"
```

**MongoDB:**
```bash
docker ps | grep mongo
# oder
mongosh --eval "db.adminCommand('ping')"
```

**Backend:**
- Öffne Browser: http://localhost:5000
- Oder teste API: `curl http://localhost:5000/api/services`

## Troubleshooting

### MySQL läuft nicht
```bash
# Status prüfen
sudo systemctl status mysql

# Starten
sudo systemctl start mysql

# Bei Fehlern: Logs prüfen
sudo journalctl -u mysql -n 50
```

### MongoDB läuft nicht
```bash
# Container Status prüfen
docker ps -a | grep mongo

# Container starten
docker start mongodb

# Logs prüfen
docker logs mongodb
```

### Backend startet nicht
```bash
# Prüfe ob Port 5000 belegt ist
lsof -i :5000

# Prüfe ob .env Datei existiert (falls benötigt)
# Prüfe ob node_modules installiert sind
npm install
```

