const mongoose = require('mongoose');

/**
 * Frontend-optimiertes MongoDB-Modell für Bookings
 * 
 * Design-Entscheidungen für Frontend-Optimierung:
 * - Services sind embedded (nicht referenziert) -> weniger Queries
 * - Customer-Info ist embedded -> keine zusätzliche Query nötig
 * - Alle benötigten Daten in einem Document -> Frontend kann alles in einem Request holen
 */

// Service Sub-Document Schema (embedded)
const ServiceSchema = new mongoose.Schema({
  serviceId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  timeSpan: {
    type: String,
    required: true
  },
  image: String,
  description: String,
  quantity: {
    type: Number,
    default: 1
  },
  priceAtBooking: {
    type: Number,
    required: true
  }
}, { _id: false }); // _id: false weil embedded, nicht als separate Collection

// Customer Sub-Document Schema (embedded)
const CustomerSchema = new mongoose.Schema({
  customerId: {
    type: Number,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  city: {
    type: String,
    index: true
  },
  postalCode: String
}, { _id: false });

// Haupt-Booking Schema
const BookingSchema = new mongoose.Schema({
  // Embedded Customer-Info (denormalisiert für Frontend-Performance)
  customer: {
    type: CustomerSchema,
    required: true
  },
  
  // Embedded Services Array (m:n Beziehung als embedded Array)
  services: {
    type: [ServiceSchema],
    required: true,
    default: []
  },
  
  // Booking-Metadaten
  bookingDate: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  notes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'bookings', // Collection-Name
  timestamps: false // Wir verwalten timestamps manuell
});

// Indizes für häufige Queries (Frontend-optimiert)
BookingSchema.index({ 'customer.email': 1 });
BookingSchema.index({ 'customer.lastName': 1, 'customer.firstName': 1 });
BookingSchema.index({ bookingDate: 1, status: 1 });
BookingSchema.index({ status: 1, bookingDate: -1 });
BookingSchema.index({ 'services.category': 1 });
BookingSchema.index({ totalPrice: 1 });

// Compound Index für häufige Filter-Kombinationen
BookingSchema.index({ status: 1, 'customer.city': 1 });

// Virtual für Service-Anzahl (kann vom Frontend verwendet werden)
BookingSchema.virtual('serviceCount').get(function() {
  return this.services.length;
});

// Method: Berechne Gesamtpreis neu (falls Services geändert wurden)
BookingSchema.methods.calculateTotalPrice = function() {
  this.totalPrice = this.services.reduce((sum, service) => {
    return sum + (service.priceAtBooking * service.quantity);
  }, 0);
  return this.totalPrice;
};

// Static Method: Finde Bookings nach Customer-Email
BookingSchema.statics.findByCustomerEmail = function(email) {
  return this.find({ 'customer.email': email }).sort({ bookingDate: -1 });
};

// Static Method: Finde Bookings nach Status
BookingSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ bookingDate: -1 });
};

// Static Method: Finde Bookings nach Kategorie
BookingSchema.statics.findByCategory = function(category) {
  return this.find({ 'services.category': category }).sort({ bookingDate: -1 });
};

// Pre-save Hook: Aktualisiere updatedAt und berechne totalPrice
BookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isModified('services')) {
    this.calculateTotalPrice();
  }
  next();
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;

