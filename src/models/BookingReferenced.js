const mongoose = require('mongoose');

/**
 * MongoDB-Modell mit Referenzen (normalisiert)
 * 
 * Unterschied zur embedded Variante:
 * - Customer und Services sind separate Collections
 * - Bookings referenzieren Customer und Services via ObjectId
 * - Normalisierte Struktur (weniger Duplikate)
 */

// Customer Collection (separate)
const CustomerSchema = new mongoose.Schema({
  customerId: {
    type: Number,
    required: true,
    unique: true,
    index: true
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
    required: true,
    unique: true,
    index: true
  },
  phone: String,
  address: String,
  city: String,
  postalCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'customers_referenced'
});

// Service Collection (separate)
const ServiceSchema = new mongoose.Schema({
  serviceId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
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
  description: String
}, {
  collection: 'services_referenced'
});

// Booking Schema mit Referenzen
const BookingReferencedSchema = new mongoose.Schema({
  // Referenz zu Customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerReferenced',
    required: true,
    index: true
  },
  
  // Referenzen zu Services (Array von ObjectIds mit zusätzlichen Feldern)
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceReferenced',
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    priceAtBooking: {
      type: Number,
      required: true
    }
  }],
  
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
  collection: 'bookings_referenced',
  timestamps: false
});

// Indizes
BookingReferencedSchema.index({ bookingDate: 1, status: 1 });
BookingReferencedSchema.index({ status: 1, bookingDate: -1 });

// Pre-save Hook: Aktualisiere updatedAt
BookingReferencedSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Models
const CustomerReferenced = mongoose.model('CustomerReferenced', CustomerSchema);
const ServiceReferenced = mongoose.model('ServiceReferenced', ServiceSchema);
const BookingReferenced = mongoose.model('BookingReferenced', BookingReferencedSchema);

module.exports = {
  CustomerReferenced,
  ServiceReferenced,
  BookingReferenced
};


