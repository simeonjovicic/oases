# Datenbank-Setup Anleitung

## Problem: "Table 'db.customers' doesn't exist"

Dieser Fehler tritt auf, wenn die erweiterten Tabellen noch nicht erstellt wurden.

## Lösung: Datenbank-Schema erstellen

### Option 1: Manuell mit MySQL

```bash
mysql -u root -p < db/db.sql
```

Du wirst nach deinem MySQL-Passwort gefragt. Wenn du kein Passwort hast, verwende:

```bash
mysql -u root < db/db.sql
```

### Option 2: Mit npm Script

```bash
npm run db:setup
```

**Wichtig:** Du musst dein MySQL-Passwort eingeben, wenn du eines hast.

### Option 3: Mit Setup-Script

```bash
./db/setup.sh
```

## Nach dem Setup

Nachdem das Schema erstellt wurde, kannst du die Seed-Scripts ausführen:

```bash
# 1. Relationale DB seeden
npm run seed:medium

# 2. MongoDB seeden
npm run seed:mongo:medium
```

## Was wird erstellt?

Das Script `db.sql` erstellt:

1. **Datenbank `db`** (falls nicht vorhanden)
2. **Tabelle `services`** (mit initialen Daten)
3. **Tabelle `customers`** (neu)
4. **Tabelle `bookings`** (neu)
5. **Tabelle `booking_services`** (neu, m:n Beziehung)

## Troubleshooting

### Fehler: "Access denied"
- Stelle sicher, dass MySQL läuft
- Prüfe deine MySQL-Credentials
- Versuche: `mysql -u root -p` manuell

### Fehler: "Command not found: mysql"
- MySQL ist nicht installiert oder nicht im PATH
- Installiere MySQL oder füge es zum PATH hinzu

### Fehler: "Database already exists"
- Das ist OK, das Script verwendet `DROP DATABASE IF EXISTS`
- Die Datenbank wird neu erstellt

