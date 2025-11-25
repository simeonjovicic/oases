const mongoose = require('mongoose');

/**
 * MongoDB-Modell OHNE Indizes (für Performance-Vergleich)
 * Identisch zu Booking.js, aber ohne Index-Definitionen
 */

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
}, { _id: false });

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
  city: String,
  postalCode: String
}, { _id: false });

// Haupt-Booking Schema OHNE Indizes
const BookingNoIndexSchema = new mongoose.Schema({
  customer: {
    type: CustomerSchema,
    required: true
  },
  services: {
    type: [ServiceSchema],
    required: true,
    default: []
  },
  bookingDate: {
    type: Date,
    required: true
    // KEIN Index!
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    required: true
    // KEIN Index!
  },
  totalPrice: {
    type: Number,
    required: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'bookings_no_index', // Separate Collection
  timestamps: false
});

// KEINE Indizes definiert!

const BookingNoIndex = mongoose.model('BookingNoIndex', BookingNoIndexSchema);

module.exports = BookingNoIndex;


