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
      // Validate required fields
      if (!bookingData.customer) {
        throw new Error('Customer information is required');
      }
      
      if (!bookingData.customer.firstName || !bookingData.customer.lastName || !bookingData.customer.email) {
        throw new Error('Customer firstName, lastName, and email are required');
      }
      
      if (!bookingData.services || !Array.isArray(bookingData.services) || bookingData.services.length === 0) {
        throw new Error('At least one service is required');
      }
      
      if (!bookingData.bookingDate) {
        throw new Error('bookingDate is required');
      }
      
      // Ensure customerId is set
      if (!bookingData.customer.customerId) {
        bookingData.customer.customerId = 0;
      }
      
      // Normalize services
      bookingData.services = bookingData.services.map(service => ({
        serviceId: parseInt(service.serviceId) || parseInt(service.id) || 0,
        name: service.name || '',
        category: service.category || '',
        price: parseFloat(service.price) || 0,
        timeSpan: service.timeSpan || '',
        image: service.image || null,
        description: service.description || null,
        quantity: parseInt(service.quantity) || 1,
        priceAtBooking: parseFloat(service.priceAtBooking) || parseFloat(service.price) || 0
      }));
      
      // Calculate total price if not provided
      if (!bookingData.totalPrice) {
        bookingData.totalPrice = bookingData.services.reduce((sum, s) => {
          return sum + (parseFloat(s.priceAtBooking) * parseInt(s.quantity || 1));
        }, 0);
      }
      
      // Set default status
      if (!bookingData.status) {
        bookingData.status = 'pending';
      }
      
      // Set timestamps
      bookingData.createdAt = new Date();
      bookingData.updatedAt = new Date();
      
      const booking = new Booking(bookingData);
      await booking.save();
      return booking;
    } catch (error) {
      console.error('Create booking error:', error);
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
      // Check if booking exists first
      const existing = await Booking.findById(id);
      if (!existing) {
        throw new Error('Buchung nicht gefunden');
      }
      
      // Ensure customerId is set in customer object if not present
      if (updateData.customer && !updateData.customer.customerId && existing.customer) {
        updateData.customer.customerId = existing.customer.customerId;
      }
      
      // Ensure services have all required fields
      if (updateData.services && Array.isArray(updateData.services)) {
        updateData.services = updateData.services.map(service => ({
          serviceId: service.serviceId || service.id || 0,
          name: service.name || '',
          category: service.category || '',
          price: parseFloat(service.price) || 0,
          timeSpan: service.timeSpan || '',
          image: service.image || null,
          description: service.description || null,
          quantity: parseInt(service.quantity) || 1,
          priceAtBooking: parseFloat(service.priceAtBooking) || parseFloat(service.price) || 0
        }));
      }
      
      // Ensure totalPrice is calculated
      if (updateData.services && Array.isArray(updateData.services)) {
        updateData.totalPrice = updateData.services.reduce((sum, s) => {
          return sum + (parseFloat(s.priceAtBooking) * parseInt(s.quantity || 1));
        }, 0);
      }
      
      const booking = await Booking.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!booking) {
        throw new Error('Buchung konnte nicht aktualisiert werden');
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

