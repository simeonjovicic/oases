# Backend Status prüfen

## 1. Console Output prüfen

Wenn du `npm run dev` startest, solltest du sehen:

```
Server is running on http://localhost:5000
```

**✅ Wenn du das siehst:** Backend läuft!

**❌ Wenn du Fehler siehst:** 
- MySQL-Verbindungsfehler → Prüfe ob MySQL Container läuft: `docker ps | grep mysql`
- MongoDB-Verbindungsfehler → Prüfe ob MongoDB Container läuft: `docker ps | grep mongo`
- Port bereits belegt → Ein anderer Prozess nutzt Port 5000

## 2. Port prüfen

```bash
# Prüfe ob Port 5000 belegt ist
lsof -i :5000
# oder
netstat -tuln | grep 5000
# oder
ss -tuln | grep 5000
```

**✅ Wenn du einen Node.js Prozess siehst:** Backend läuft!

## 3. API testen

### Mit curl:
```bash
# Test Services Endpoint
curl http://localhost:5000/api/services

# Sollte JSON zurückgeben (Array von Services)
```

### Im Browser:
```
http://localhost:5000/api/services
```

**✅ Wenn du Daten siehst:** Backend läuft und funktioniert!

## 4. Prozess prüfen

```bash
# Alle Node-Prozesse anzeigen
ps aux | grep node

# Oder spezifisch nach server.js
ps aux | grep "server.js"
```

## 5. Logs prüfen

Wenn `npm run dev` läuft, siehst du:
- ✅ `Server is running on http://localhost:5000` → Läuft
- ✅ `✅ MongoDB verbunden` → MongoDB OK
- ❌ `❌ MySQL Verbindungsfehler` → MySQL Problem
- ❌ `❌ MongoDB Verbindungsfehler` → MongoDB Problem

## Troubleshooting

### Port 5000 bereits belegt
```bash
# Finde Prozess auf Port 5000
lsof -i :5000

# Prozess beenden (ersetze PID)
kill -9 <PID>
```

### Backend startet nicht
```bash
# Prüfe ob Dependencies installiert sind
npm install

# Prüfe ob MySQL läuft
docker ps | grep mysql

# Prüfe ob MongoDB läuft
docker ps | grep mongo
```

### Backend läuft aber API gibt Fehler
```bash
# Teste direkt
curl http://localhost:5000/api/services

# Prüfe Backend-Logs für Fehlermeldungen
```

