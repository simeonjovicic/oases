/**
 * Cloud-Datenbank-Konfiguration
 * 
 * Diese Datei verwaltet die Konfiguration für Cloud-Datenbanken.
 * Cloud-Tests werden nur ausgeführt, wenn die entsprechenden Umgebungsvariablen gesetzt sind.
 */

/**
 * MySQL Cloud-Konfiguration
 * Setze diese Umgebungsvariablen für Cloud-Tests:
 * - MYSQL_CLOUD_HOST
 * - MYSQL_CLOUD_USER
 * - MYSQL_CLOUD_PASSWORD
 * - MYSQL_CLOUD_DATABASE
 * - MYSQL_CLOUD_PORT (optional, default: 3306)
 */
function getMySQLCloudConfig() {
  if (!process.env.MYSQL_CLOUD_HOST) {
    return null; // Keine Cloud-Konfiguration vorhanden
  }

  return {
    host: process.env.MYSQL_CLOUD_HOST,
    user: process.env.MYSQL_CLOUD_USER,
    password: process.env.MYSQL_CLOUD_PASSWORD,
    database: process.env.MYSQL_CLOUD_DATABASE || 'spa-bookings',
    port: parseInt(process.env.MYSQL_CLOUD_PORT) || 3306,
    ssl: process.env.MYSQL_CLOUD_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

/**
 * MongoDB Cloud-Konfiguration
 * Setze MONGODB_CLOUD_URI für Cloud-Tests:
 * z.B. mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/spa-bookings?retryWrites=true&w=majority
 */
function getMongoDBCloudURI() {
  return process.env.MONGODB_CLOUD_URI || null;
}

/**
 * Prüft ob Cloud-Konfiguration verfügbar ist
 */
function isCloudConfigured() {
  return !!(getMySQLCloudConfig() || getMongoDBCloudURI());
}

/**
 * Prüft ob MySQL Cloud konfiguriert ist
 */
function isMySQLCloudConfigured() {
  return !!getMySQLCloudConfig();
}

/**
 * Prüft ob MongoDB Cloud konfiguriert ist
 */
function isMongoDBCloudConfigured() {
  return !!getMongoDBCloudURI();
}

module.exports = {
  getMySQLCloudConfig,
  getMongoDBCloudURI,
  isCloudConfigured,
  isMySQLCloudConfigured,
  isMongoDBCloudConfigured,
};

