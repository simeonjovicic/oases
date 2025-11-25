const BookingNoIndex = require('../models/BookingNoIndex');

/**
 * Booking Service für Modell OHNE Indizes
 * Für Performance-Vergleiche
 */
class BookingNoIndexService {
  
  async createBooking(bookingData) {
    try {
      const booking = new BookingNoIndex(bookingData);
      await booking.save();
      return booking;
    } catch (error) {
      throw new Error(`Fehler beim Erstellen: ${error.message}`);
    }
  }

  async createManyBookings(bookingsData) {
    try {
      return await BookingNoIndex.insertMany(bookingsData, { ordered: false });
    } catch (error) {
      throw new Error(`Fehler beim Batch-Erstellen: ${error.message}`);
    }
  }

  async findAllBookings() {
    try {
      return await BookingNoIndex.find({}).sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Abrufen: ${error.message}`);
    }
  }

  async findBookingsWithFilter(filter) {
    try {
      return await BookingNoIndex.find(filter).sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Abrufen mit Filter: ${error.message}`);
    }
  }

  async findBookingsByEmail(email) {
    try {
      return await BookingNoIndex.find({ 'customer.email': email }).sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Abrufen nach Email: ${error.message}`);
    }
  }

  async findBookingsByStatus(status) {
    try {
      return await BookingNoIndex.find({ status }).sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Abrufen nach Status: ${error.message}`);
    }
  }
}

module.exports = new BookingNoIndexService();


