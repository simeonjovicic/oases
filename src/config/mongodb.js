const mongoose = require('mongoose');

/**
 * MongoDB-Verbindungskonfiguration
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spa-bookings';

let isConnected = false;

/**
 * Verbindet zur MongoDB-Datenbank
 */
async function connectMongoDB() {
  if (isConnected) {
    console.log('✅ MongoDB bereits verbunden');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    
    isConnected = true;
    console.log('✅ MongoDB erfolgreich verbunden:', MONGODB_URI);
    
    // Event-Handler für Verbindungsfehler
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Verbindungsfehler:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Verbindung getrennt');
      isConnected = false;
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Verbinden mit MongoDB:', error);
    isConnected = false;
    throw error;
  }
}

/**
 * Trennt die MongoDB-Verbindung
 */
async function disconnectMongoDB() {
  if (!isConnected) {
    return;
  }
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB Verbindung getrennt');
  } catch (error) {
    console.error('❌ Fehler beim Trennen der MongoDB-Verbindung:', error);
    throw error;
  }
}

/**
 * Prüft ob MongoDB verbunden ist
 */
function isMongoDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectMongoDB,
  disconnectMongoDB,
  isMongoDBConnected,
  MONGODB_URI
};

