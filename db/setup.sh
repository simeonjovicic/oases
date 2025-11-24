#!/bin/bash

# Setup-Script für die Datenbank
# Erstellt alle Tabellen und fügt initiale Daten ein

echo "🚀 Starte Datenbank-Setup..."
echo ""

# Prüfe ob MySQL läuft
if ! mysql -u root -e "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Fehler: MySQL ist nicht erreichbar oder läuft nicht!"
    echo "   Bitte starte MySQL und versuche es erneut."
    exit 1
fi

# Führe SQL-Script aus
echo "📝 Erstelle Datenbank und Tabellen..."
mysql -u root -p < db/db.sql

if [ $? -eq 0 ]; then
    echo "✅ Datenbank-Setup erfolgreich abgeschlossen!"
    echo ""
    echo "Du kannst jetzt die Seed-Scripts ausführen:"
    echo "  npm run seed:medium"
    echo "  npm run seed:mongo:medium"
else
    echo "❌ Fehler beim Datenbank-Setup!"
    exit 1
fi

