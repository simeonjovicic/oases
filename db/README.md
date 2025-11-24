# Datenbank Seed-Script

Dieses Seed-Script generiert Testdaten für die relationale Datenbank.

## Schema

Das Datenbankschema besteht aus 4 Tabellen:

1. **services** - Services/Behandlungen (bereits vorhanden)
2. **customers** - Kunden
3. **bookings** - Buchungen/Termine
4. **booking_services** - m:n Beziehung zwischen Buchungen und Services

## Verwendung

### 1. Datenbank-Schema erstellen

Zuerst muss das Datenbankschema erstellt werden:

```bash
mysql -u root -p < db/db.sql
```

### 2. Seed-Script ausführen

Das Seed-Script kann mit verschiedenen Skalierungen ausgeführt werden:

#### Standard (1000 Kunden, 5000 Buchungen)
```bash
npm run seed
```

#### Kleine Skalierung (10 Kunden, 50 Buchungen)
```bash
npm run seed:small
```

#### Mittlere Skalierung (100 Kunden, 500 Buchungen)
```bash
npm run seed:medium
```

#### Große Skalierung (1000 Kunden, 5000 Buchungen)
```bash
npm run seed:large
```

#### Sehr große Skalierung (10.000 Kunden, 50.000 Buchungen)
```bash
npm run seed:huge
```

#### Maximale Skalierung (100.000 Kunden, 100.000 Buchungen)
```bash
npm run seed:max
```

### 3. Benutzerdefinierte Skalierung

Du kannst auch eigene Werte setzen:

```bash
NUM_CUSTOMERS=500 NUM_BOOKINGS=2000 node db/seed.js
```

Oder mit Umgebungsvariablen:

```bash
export NUM_CUSTOMERS=10000
export NUM_BOOKINGS=50000
export DB_PASSWORD=dein_passwort
node db/seed.js
```

## Generierte Daten

Das Script generiert:

- **Kunden**: Zufällige Namen, E-Mails, Telefonnummern, Adressen
- **Buchungen**: Zufällige Termine, Status, Gesamtpreise
- **Booking-Services**: m:n Beziehung (jede Buchung hat 1-5 Services)

## Performance

Die Daten werden in Batches eingefügt (1000 Datensätze pro Batch) für optimale Performance.

**Geschätzte Laufzeiten:**
- Small (10/50): ~1 Sekunde
- Medium (100/500): ~2-3 Sekunden
- Large (1000/5000): ~10-15 Sekunden
- Huge (10k/50k): ~2-3 Minuten
- Max (100k/100k): ~10-15 Minuten

## Voraussetzungen

- MySQL/MariaDB installiert und laufend
- Datenbank `db` existiert (wird durch db.sql erstellt)
- Node.js und npm installiert
- mysql2 Package installiert (`npm install`)

## Troubleshooting

### Fehler: "Keine Services in der Datenbank gefunden"
Lösung: Führe zuerst `db/db.sql` aus, um die Services-Tabelle zu erstellen.

### Fehler: "Access denied"
Lösung: Überprüfe deine MySQL-Credentials. Du kannst das Passwort über die Umgebungsvariable `DB_PASSWORD` setzen.

### Fehler: "Connection refused"
Lösung: Stelle sicher, dass MySQL läuft und auf Port 3306 erreichbar ist.

