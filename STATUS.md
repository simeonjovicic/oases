# Projekt-Status

## ✅ Erledigt (Pflichtaufgaben + einige Bonus-Punkte)

### Schritt 1: Relationales DB-Schema ✅
- [x] 3+ Tabellen (services, customers, bookings, booking_services)
- [x] m:n-Beziehung (bookings ↔ services)
- [x] Skalierbares Seed-Script (10 - 100.000+ Testfälle)

### Schritt 2: MongoDB-Implementierung ✅
- [x] Frontend-optimiertes Modell (embedded JSON)
- [x] CRUD-Operationen implementiert
- [x] Seed-Script für MongoDB

### Schritt 3: Performance-Tests ✅
- [x] 2 Writings (Batch & Single, verschiedene Skalierungen)
- [x] 4 Finds (ohne Filter, mit Filter, mit Projektion, mit Sortierung)
- [x] 1 Update
- [x] 1 Delete
- [x] Laufzeitvergleiche (MySQL vs MongoDB)

### Bonus-Punkte (Erledigt) ✅
- [x] **Aggregation-Query Vergleich** (0.5 Punkte)
  - SQL-Äquivalente erstellt
  - Performance-Tests implementiert
- [x] **Referencing-Variante** (1 Punkt)
  - Neues Modell mit Referenzen
  - Laufzeitvergleiche (Embedded vs Referenced)
- [x] **CRUD-Frontend** (1.5 Punkte)
  - Vue-Views für MySQL und MongoDB
  - Vollständige CRUD-Funktionalität

## ⏳ Noch offen (Optional - Bonus-Punkte)

### 1. Cloud-Vergleich (0.5 Punkte)
**Status:** Nicht implementiert

**Was zu tun ist:**
- MongoDB Atlas (Cloud) Setup
- MySQL Cloud (z.B. AWS RDS, PlanetScale, etc.)
- Performance-Tests auf Cloud-Datenbanken
- Vergleich: Lokal vs Cloud

**Aufwand:** Mittel-Hoch (Cloud-Accounts nötig, Setup-Zeit)

### 2. JSON-Schema-Validierung (0.75 Punkte)
**Status:** Nur Mongoose-Validierung vorhanden

**Was zu tun ist:**
- JSON Schema definieren (z.B. mit `ajv`)
- Validierungstests die Schema verletzen
- Fehlerbehandlung für ungültige Daten
- Vergleich: Mit vs. ohne Schema-Validierung

**Aufwand:** Mittel (JSON Schema Library, Tests)

### 3. Index-Tests (1.0 Punkte)
**Status:** Indizes existieren im Schema, aber keine Tests

**Was zu tun ist:**
- Tests ohne Indizes durchführen
- Indizes hinzufügen
- Tests mit Indizes durchführen
- Laufzeitvergleiche dokumentieren

**Aufwand:** Niedrig (Indizes existieren bereits, nur Tests fehlen)

## 📊 Punkte-Übersicht

### Pflichtaufgaben (100%)
- ✅ Schritt 1: Relationales Schema + Seed
- ✅ Schritt 2: MongoDB-Modell + CRUD
- ✅ Schritt 3: Performance-Tests

### Bonus-Punkte
- ✅ Aggregation-Query: **0.5 Punkte**
- ✅ Referencing-Variante: **1.0 Punkte**
- ✅ CRUD-Frontend: **1.5 Punkte**
- ⏳ Cloud-Vergleich: **0.5 Punkte** (offen)
- ⏳ JSON-Schema: **0.75 Punkte** (offen)
- ⏳ Index-Tests: **1.0 Punkte** (offen)

**Gesamt erreicht:** 3.0 Punkte  
**Gesamt möglich:** 5.25 Punkte  
**Noch möglich:** 2.25 Punkte

## 🎯 Empfehlung

**Am einfachsten und schnellsten:**
1. **Index-Tests** (1.0 Punkte) - Indizes existieren bereits, nur Tests hinzufügen

**Mittlerer Aufwand:**
2. **JSON-Schema-Validierung** (0.75 Punkte) - Zusätzliche Validierung implementieren

**Höchster Aufwand:**
3. **Cloud-Vergleich** (0.5 Punkte) - Cloud-Setup nötig


