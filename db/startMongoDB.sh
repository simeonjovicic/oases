#!/bin/bash

# Script zum Starten von MongoDB

echo "🔍 Prüfe MongoDB Status..."

# Prüfe ob MongoDB bereits läuft
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB läuft bereits!"
    exit 0
fi

# Versuche MongoDB zu starten
echo "🚀 Starte MongoDB..."

# Systemd (Linux)
if systemctl is-active --quiet mongodb 2>/dev/null || systemctl is-active --quiet mongod 2>/dev/null; then
    echo "✅ MongoDB läuft bereits (systemd)"
    exit 0
fi

if command -v systemctl > /dev/null; then
    if systemctl start mongodb 2>/dev/null; then
        echo "✅ MongoDB gestartet (systemd)"
        exit 0
    elif systemctl start mongod 2>/dev/null; then
        echo "✅ MongoDB gestartet (systemd)"
        exit 0
    fi
fi

# Service (altes System)
if command -v service > /dev/null; then
    if service mongodb start 2>/dev/null; then
        echo "✅ MongoDB gestartet (service)"
        exit 0
    elif service mongod start 2>/dev/null; then
        echo "✅ MongoDB gestartet (service)"
        exit 0
    fi
fi

# Homebrew (macOS)
if command -v brew > /dev/null; then
    if brew services start mongodb-community 2>/dev/null; then
        echo "✅ MongoDB gestartet (Homebrew)"
        exit 0
    elif brew services start mongodb 2>/dev/null; then
        echo "✅ MongoDB gestartet (Homebrew)"
        exit 0
    fi
fi

# Docker
if command -v docker > /dev/null; then
    if docker ps -a | grep -q mongodb; then
        echo "🐳 Starte MongoDB Container..."
        docker start mongodb 2>/dev/null && echo "✅ MongoDB Container gestartet" && exit 0
    else
        echo "🐳 Erstelle und starte MongoDB Container..."
        docker run -d -p 27017:27017 --name mongodb mongo:latest 2>/dev/null && echo "✅ MongoDB Container erstellt und gestartet" && exit 0
    fi
fi

# Manueller Start
if command -v mongod > /dev/null; then
    echo "⚠️  Versuche MongoDB manuell zu starten..."
    echo "   Führe aus: mongod --dbpath /data/db"
    echo "   Oder: mongod --dbpath ./data/db"
    exit 1
fi

echo "❌ MongoDB konnte nicht gestartet werden!"
echo ""
echo "📝 Optionen:"
echo "   1. Installiere MongoDB:"
echo "      - Ubuntu/Debian: sudo apt-get install mongodb"
echo "      - macOS: brew install mongodb-community"
echo "      - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
echo ""
echo "   2. Starte MongoDB manuell:"
echo "      - systemd: sudo systemctl start mongodb"
echo "      - Homebrew: brew services start mongodb-community"
echo "      - Docker: docker start mongodb"
echo ""
exit 1

