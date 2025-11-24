# Quick Start - Backend & Datenbanken

## Status-Check

```bash
# MySQL (Docker)
docker ps | grep mysql

# MongoDB (Docker)
docker ps | grep mongo
```

## Start-Befehle

### MySQL starten (Docker)
```bash
docker start mysql
```

### MongoDB starten (Docker)
```bash
docker start mongodb
```

### Beide starten
```bash
docker start mysql mongodb
```

## Datenbank-Setup

### MySQL Schema erstellen
```bash
docker exec -i mysql mysql -uroot -proot < db/db.sql
```

### Daten seeden (optional)
```bash
# MySQL
npm run seed:medium

# MongoDB
npm run seed:mongo:medium
```

## Backend starten

```bash
npm run dev
```

## Backend-Konfiguration

Das Backend sollte folgende Konfiguration haben:

```javascript
// MySQL
{
  host: "localhost",
  user: "root",
  password: "root",  // Passwort aus Docker Container
  database: "db",
  port: 3306
}

// MongoDB
mongodb://localhost:27017/spa-bookings
```

## Nützliche Befehle

### MySQL Container neu erstellen (falls Probleme)
```bash
docker stop mysql
docker rm mysql
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=db -p 3306:3306 mysql:latest
```

### MongoDB Container neu erstellen
```bash
docker stop mongodb
docker rm mongodb
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Logs anzeigen
```bash
docker logs mysql
docker logs mongodb
```

