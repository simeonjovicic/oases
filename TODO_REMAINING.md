# Verbleibende Aufgaben

## ✅ Erledigt

- [x] **Schritt 1:** Relationales DB-Schema (3+ Tabellen, m:n-Beziehung)
- [x] **Schritt 1:** Seed-Script (skalierbar 10-100.000)
- [x] **Schritt 2:** MongoDB-Modell (frontend-optimiert, embedded JSON)
- [x] **Schritt 2:** MongoDB CRUD-Operationen
- [x] **Schritt 3:** Performance-Tests (2 Writings, 4 Finds, 1 Update, 1 Delete)
- [x] **Schritt 3:** Laufzeitvergleiche (relational vs MongoDB)
- [x] **Bonus:** CRUD-Frontend für MongoDB (1.5 Punkte) ✅

## ⏳ Noch zu erledigen

### 1. Aggregation-Query implementieren und vergleichen (0.5 Punkte)
**Status:** Aggregation-Queries existieren bereits im `bookingService.js`, aber:
- ❌ Kein Vergleich mit relationaler DB
- ❌ Keine Performance-Tests für Aggregation

**Was zu tun ist:**
- Aggregation-Query in Tests implementieren
- Vergleich mit SQL-Äquivalent (GROUP BY, AVG, SUM)
- Laufzeitvergleiche dokumentieren

**Beispiel-Queries (bereits vorhanden):**
- `getAveragePriceByStatus()` - Durchschnittspreis pro Status
- `getBookingsByCategory()` - Buchungen nach Service-Kategorie
- `getTopCustomersByRevenue()` - Top-Kunden nach Umsatz

### 2. Referencing-Variante mit Laufzeitvergleich (1 Punkt)
**Status:** Aktuell nur embedded (denormalisiert)

**Was zu tun ist:**
- Neues MongoDB-Modell mit Referenzen (normalisiert)
- Customer und Services als separate Collections
- CRUD-Operationen für Referencing-Variante
- Laufzeitvergleiche: Embedded vs Referencing

### 3. Cloud-Vergleich implementieren (0.5 Punkte)
**Status:** Nur lokal (Docker)

**Was zu tun ist:**
- MongoDB Atlas (Cloud) Setup
- MySQL Cloud (z.B. AWS RDS, PlanetScale, etc.)
- Performance-Tests auf Cloud-Datenbanken
- Vergleich: Lokal vs Cloud

### 4. JSON-Schema-Validierung implementieren (0.75 Punkte)
**Status:** Nur Mongoose-Schema-Validierung

**Was zu tun ist:**
- JSON Schema definieren (z.B. mit `ajv`)
- Validierungstests die Schema verletzen
- Fehlerbehandlung für ungültige Daten
- Vergleich: Mit vs. ohne Schema-Validierung

### 5. Index-Tests und Laufzeitvergleiche (1.0 Punkte)
**Status:** Indizes existieren im Schema, aber:
- ❌ Keine Tests ohne Indizes
- ❌ Kein Vergleich mit/ohne Indizes

**Was zu tun ist:**
- Tests ohne Indizes durchführen
- Indizes hinzufügen
- Tests mit Indizes durchführen
- Laufzeitvergleiche dokumentieren

## Prioritäten

**Höchste Priorität (einfach, viele Punkte):**
1. **Index-Tests** (1.0 Punkte) - Indizes existieren bereits, nur Tests fehlen
2. **Aggregation-Query Vergleich** (0.5 Punkte) - Queries existieren, nur Vergleich fehlt

**Mittlere Priorität:**
3. **JSON-Schema-Validierung** (0.75 Punkte) - Zusätzliche Validierung implementieren

**Niedrigste Priorität (aufwändig):**
4. **Referencing-Variante** (1 Punkt) - Neues Modell nötig
5. **Cloud-Vergleich** (0.5 Punkte) - Cloud-Setup nötig

## Empfehlung

Starte mit **Index-Tests** (1.0 Punkte) - das ist am einfachsten und bringt die meisten Punkte!


