# MySQL Installation

## Option 1: MariaDB installieren (empfohlen für Linux)

MariaDB ist ein MySQL-kompatibler Fork und funktioniert genauso:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mariadb-server

# Starten
sudo systemctl start mariadb
sudo systemctl enable mariadb  # Startet automatisch beim Booten

# Sicherheitssetup (optional, aber empfohlen)
sudo mysql_secure_installation
```

## Option 2: MySQL installieren

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Starten
sudo systemctl start mysql
sudo systemctl enable mysql

# Sicherheitssetup
sudo mysql_secure_installation
```

## Option 3: Docker (einfachste Option, keine System-Installation)

```bash
# MySQL Container starten
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=db \
  -p 3306:3306 \
  mysql:latest

# Prüfen ob es läuft
docker ps | grep mysql
```

**Wichtig:** Wenn du Docker verwendest, musst du die Backend-Konfiguration anpassen:
- Host: `localhost` (bleibt gleich)
- Port: `3306` (bleibt gleich)
- User: `root`
- Password: `root` (oder was du in MYSQL_ROOT_PASSWORD gesetzt hast)

## Nach der Installation

### 1. Schema erstellen

```bash
# Lokale Installation
mysql -u root < db/db.sql

# Docker (mit Passwort)
mysql -u root -proot -h 127.0.0.1 < db/db.sql
```

### 2. Prüfen ob es funktioniert

```bash
# Lokale Installation
mysql -u root -e "SHOW DATABASES;"

# Docker
mysql -u root -proot -h 127.0.0.1 -e "SHOW DATABASES;"
```

## Empfehlung

**Für Entwicklung:** Docker ist am einfachsten - keine System-Installation nötig, einfach zu starten/stoppen.

**Für Produktion:** Lokale MariaDB/MySQL Installation.

