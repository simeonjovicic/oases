const Booking = require('../models/Booking');

/**
 * Booking Service - CRUD-Operationen für MongoDB
 * Frontend-optimierte Abfragen
 */

class BookingService {
  
  /**
   * CREATE - Erstellt eine neue Buchung
   */
  async createBooking(bookingData) {
    try {
      const booking = new Booking(bookingData);
      await booking.save();
      return booking;
    } catch (error) {
      throw new Error(`Fehler beim Erstellen der Buchung: ${error.message}`);
    }
  }

  /**
   * READ - Findet alle Buchungen (ohne Filter)
   */
  async findAllBookings() {
    try {
      return await Booking.find({}).sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Abrufen aller Buchungen: ${error.message}`);
    }
  }

  /**
   * READ - Findet eine Buchung nach ID
   */
  async findBookingById(id) {
    try {
      return await Booking.findById(id);
    } catch (error) {
      throw new Error(`Fehler beim Abrufen der Buchung: ${error.message}`);
    }
  }

  /**
   * READ - Findet Buchungen mit Filter (z.B. nach Status)
   */
  async findBookingsWithFilter(filter) {
    try {
      return await Booking.find(filter).sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Filtern der Buchungen: ${error.message}`);
    }
  }

  /**
   * READ - Findet Buchungen mit Filter und Projektion (nur bestimmte Felder)
   */
  async findBookingsWithProjection(filter, projection) {
    try {
      return await Booking.find(filter, projection).sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Abrufen mit Projektion: ${error.message}`);
    }
  }

  /**
   * READ - Findet Buchungen mit Filter, Projektion und Sortierung
   */
  async findBookingsWithSort(filter, projection, sort) {
    try {
      return await Booking.find(filter, projection).sort(sort);
    } catch (error) {
      throw new Error(`Fehler beim Abrufen mit Sortierung: ${error.message}`);
    }
  }

  /**
   * UPDATE - Aktualisiert eine Buchung
   */
  async updateBooking(id, updateData) {
    try {
      const booking = await Booking.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!booking) {
        throw new Error('Buchung nicht gefunden');
      }
      
      // Berechne totalPrice neu falls Services geändert wurden
      if (updateData.services) {
        booking.calculateTotalPrice();
        await booking.save();
      }
      
      return booking;
    } catch (error) {
      throw new Error(`Fehler beim Aktualisieren der Buchung: ${error.message}`);
    }
  }

  /**
   * DELETE - Löscht eine Buchung
   */
  async deleteBooking(id) {
    try {
      const booking = await Booking.findByIdAndDelete(id);
      if (!booking) {
        throw new Error('Buchung nicht gefunden');
      }
      return booking;
    } catch (error) {
      throw new Error(`Fehler beim Löschen der Buchung: ${error.message}`);
    }
  }

  /**
   * DELETE - Löscht mehrere Buchungen (Batch-Delete)
   */
  async deleteManyBookings(filter) {
    try {
      const result = await Booking.deleteMany(filter);
      return result;
    } catch (error) {
      throw new Error(`Fehler beim Löschen mehrerer Buchungen: ${error.message}`);
    }
  }

  /**
   * COUNT - Zählt Buchungen mit Filter
   */
  async countBookings(filter = {}) {
    try {
      return await Booking.countDocuments(filter);
    } catch (error) {
      throw new Error(`Fehler beim Zählen der Buchungen: ${error.message}`);
    }
  }

  /**
   * AGGREGATION - Beispiel: Durchschnittspreis pro Status
   */
  async getAveragePriceByStatus() {
    try {
      return await Booking.aggregate([
        {
          $group: {
            _id: '$status',
            averagePrice: { $avg: '$totalPrice' },
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' }
          }
        },
        {
          $sort: { averagePrice: -1 }
        }
      ]);
    } catch (error) {
      throw new Error(`Fehler bei Aggregation: ${error.message}`);
    }
  }

  /**
   * AGGREGATION - Beispiel: Buchungen pro Kategorie
   */
  async getBookingsByCategory() {
    try {
      return await Booking.aggregate([
        { $unwind: '$services' },
        {
          $group: {
            _id: '$services.category',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$services.priceAtBooking' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
    } catch (error) {
      throw new Error(`Fehler bei Aggregation: ${error.message}`);
    }
  }

  /**
   * AGGREGATION - Beispiel: Top-Kunden nach Umsatz
   */
  async getTopCustomersByRevenue(limit = 10) {
    try {
      return await Booking.aggregate([
        {
          $group: {
            _id: {
              customerId: '$customer.customerId',
              email: '$customer.email',
              name: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] }
            },
            totalRevenue: { $sum: '$totalPrice' },
            bookingCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: limit
        }
      ]);
    } catch (error) {
      throw new Error(`Fehler bei Aggregation: ${error.message}`);
    }
  }
}

module.exports = new BookingService();

