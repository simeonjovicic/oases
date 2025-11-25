const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const bookingSchema = require('../schemas/bookingSchema.json');
const path = require('path');

// Erstelle Ajv-Instanz mit Format-Unterstützung
const ajv = new Ajv({ 
  allErrors: true, 
  strict: false,
  validateFormats: true // Stelle sicher, dass Formate validiert werden
});
addFormats(ajv); // Füge Format-Validierung hinzu (email, date-time, etc.)

// Lade Schema
const validateBooking = ajv.compile(bookingSchema);

/**
 * Validiert ein Booking-Objekt gegen das JSON Schema
 * @param {Object} bookingData - Das zu validierende Booking-Objekt
 * @returns {Object} - { valid: boolean, errors: Array }
 */
function validateBookingSchema(bookingData) {
  const valid = validateBooking(bookingData);
  
  if (!valid) {
    return {
      valid: false,
      errors: validateBooking.errors.map(err => ({
        path: err.instancePath || err.schemaPath,
        message: err.message,
        params: err.params
      }))
    };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Validiert und wirft einen Fehler wenn ungültig
 * @param {Object} bookingData - Das zu validierende Booking-Objekt
 * @throws {Error} Wenn Validierung fehlschlägt
 */
function validateBookingSchemaOrThrow(bookingData) {
  const result = validateBookingSchema(bookingData);
  if (!result.valid) {
    const errorMessages = result.errors.map(e => `${e.path}: ${e.message}`).join(', ');
    throw new Error(`JSON Schema Validation failed: ${errorMessages}`);
  }
  return true;
}

module.exports = {
  validateBookingSchema,
  validateBookingSchemaOrThrow
};


