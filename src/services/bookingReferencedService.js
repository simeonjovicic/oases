const { CustomerReferenced, ServiceReferenced, BookingReferenced } = require('../models/BookingReferenced');

/**
 * Booking Service für Referencing-Variante
 * Normalisierte Struktur mit Referenzen
 */
class BookingReferencedService {
  
  /**
   * CREATE - Erstellt eine neue Buchung mit Referenzen
   */
  async createBooking(bookingData) {
    try {
      // Finde oder erstelle Customer
      let customer = await CustomerReferenced.findOne({ customerId: bookingData.customer.customerId });
      if (!customer) {
        customer = new CustomerReferenced(bookingData.customer);
        await customer.save();
      }

      // Finde Services
      const serviceIds = bookingData.services.map(s => s.serviceId);
      const services = await ServiceReferenced.find({ serviceId: { $in: serviceIds } });
      const serviceMap = new Map(services.map(s => [s.serviceId, s._id]));

      // Erstelle Booking mit Referenzen
      const booking = new BookingReferenced({
        customer: customer._id,
        services: bookingData.services.map(s => ({
          service: serviceMap.get(s.serviceId),
          quantity: s.quantity || 1,
          priceAtBooking: s.priceAtBooking || s.price || 0
        })),
        bookingDate: bookingData.bookingDate,
        status: bookingData.status || 'pending',
        totalPrice: bookingData.totalPrice || 0,
        notes: bookingData.notes
      });

      await booking.save();
      
      // Populate für vollständige Daten
      return await BookingReferenced.findById(booking._id)
        .populate('customer')
        .populate('services.service');
    } catch (error) {
      throw new Error(`Fehler beim Erstellen der Buchung: ${error.message}`);
    }
  }

  /**
   * CREATE - Batch Insert (optimiert)
   */
  async createManyBookings(bookingsData) {
    try {
      // Sammle alle unique customerIds und serviceIds
      const customerIds = [...new Set(bookingsData.map(b => b.customer.customerId))];
      const serviceIds = [...new Set(bookingsData.flatMap(b => b.services.map(s => s.serviceId || s.id)))];

      // Lade alle benötigten Customers und Services
      const customers = await CustomerReferenced.find({ customerId: { $in: customerIds } });
      const services = await ServiceReferenced.find({ serviceId: { $in: serviceIds } });
      
      const customerMap = new Map(customers.map(c => [c.customerId, c._id]));
      const serviceMap = new Map(services.map(s => [s.serviceId, s._id]));

      // Erstelle fehlende Customers
      const existingCustomerIds = new Set(customers.map(c => c.customerId));
      const newCustomers = bookingsData
        .map(b => b.customer)
        .filter(c => !existingCustomerIds.has(c.customerId))
        .filter((c, index, self) => index === self.findIndex(cc => cc.customerId === c.customerId));
      
      if (newCustomers.length > 0) {
        const createdCustomers = await CustomerReferenced.insertMany(newCustomers);
        createdCustomers.forEach(c => customerMap.set(c.customerId, c._id));
      }

      // Erstelle fehlende Services
      const existingServiceIds = new Set(services.map(s => s.serviceId));
      const newServices = bookingsData
        .flatMap(b => b.services)
        .map(s => ({
          serviceId: s.serviceId || s.id,
          name: s.name || '',
          category: s.category || '',
          price: s.price || 0,
          timeSpan: s.timeSpan || '',
          image: s.image || null,
          description: s.description || null
        }))
        .filter(s => s.serviceId && !existingServiceIds.has(s.serviceId))
        .filter((s, index, self) => index === self.findIndex(ss => ss.serviceId === s.serviceId));
      
      if (newServices.length > 0) {
        const createdServices = await ServiceReferenced.insertMany(newServices);
        createdServices.forEach(s => serviceMap.set(s.serviceId, s._id));
      }

      // Erstelle Bookings
      const bookingDocs = bookingsData.map(bookingData => {
        const customerRef = customerMap.get(bookingData.customer.customerId);
        if (!customerRef) {
          throw new Error(`Customer ${bookingData.customer.customerId} nicht gefunden`);
        }

        const serviceRefs = bookingData.services.map(s => {
          const serviceId = s.serviceId || s.id;
          const serviceRef = serviceMap.get(serviceId);
          if (!serviceRef) {
            throw new Error(`Service ${serviceId} nicht gefunden`);
          }
          return {
            service: serviceRef,
            quantity: s.quantity || 1,
            priceAtBooking: s.priceAtBooking || s.price || 0
          };
        });

        return {
          customer: customerRef,
          services: serviceRefs,
          bookingDate: bookingData.bookingDate,
          status: bookingData.status || 'pending',
          totalPrice: bookingData.totalPrice || 0,
          notes: bookingData.notes
        };
      });

      // Batch-Insert
      const bookings = await BookingReferenced.insertMany(bookingDocs);
      
      // Populate für vollständige Daten
      return await BookingReferenced.find({ _id: { $in: bookings.map(b => b._id) } })
        .populate('customer')
        .populate('services.service');
    } catch (error) {
      throw new Error(`Fehler beim Batch-Erstellen: ${error.message}`);
    }
  }

  /**
   * READ - Findet alle Buchungen (mit populate)
   */
  async findAllBookings() {
    try {
      return await BookingReferenced.find({})
        .populate('customer')
        .populate('services.service')
        .sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Abrufen aller Buchungen: ${error.message}`);
    }
  }

  /**
   * READ - Findet eine Buchung nach ID
   */
  async findBookingById(id) {
    try {
      return await BookingReferenced.findById(id)
        .populate('customer')
        .populate('services.service');
    } catch (error) {
      throw new Error(`Fehler beim Abrufen der Buchung: ${error.message}`);
    }
  }

  /**
   * READ - Findet Buchungen mit Filter
   */
  async findBookingsWithFilter(filter) {
    try {
      return await BookingReferenced.find(filter)
        .populate('customer')
        .populate('services.service')
        .sort({ bookingDate: -1 });
    } catch (error) {
      throw new Error(`Fehler beim Abrufen mit Filter: ${error.message}`);
    }
  }

  /**
   * UPDATE - Aktualisiert eine Buchung
   */
  async updateBooking(id, updateData) {
    try {
      const existing = await BookingReferenced.findById(id);
      if (!existing) {
        throw new Error('Buchung nicht gefunden');
      }

      // Update customer if needed
      if (updateData.customer) {
        let customer = await CustomerReferenced.findOne({ customerId: updateData.customer.customerId });
        if (!customer) {
          customer = new CustomerReferenced(updateData.customer);
          await customer.save();
        }
        updateData.customer = customer._id;
      }

      // Update services if needed
      if (updateData.services) {
        const serviceIds = updateData.services.map(s => s.serviceId);
        const services = await ServiceReferenced.find({ serviceId: { $in: serviceIds } });
        const serviceMap = new Map(services.map(s => [s.serviceId, s._id]));
        
        updateData.services = updateData.services.map(s => ({
          service: serviceMap.get(s.serviceId),
          quantity: s.quantity || 1,
          priceAtBooking: s.priceAtBooking || s.price || 0
        }));
      }

      updateData.updatedAt = new Date();

      const booking = await BookingReferenced.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('customer').populate('services.service');

      if (!booking) {
        throw new Error('Buchung konnte nicht aktualisiert werden');
      }

      return booking;
    } catch (error) {
      throw new Error(`Fehler beim Aktualisieren: ${error.message}`);
    }
  }

  /**
   * DELETE - Löscht eine Buchung
   */
  async deleteBooking(id) {
    try {
      return await BookingReferenced.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Fehler beim Löschen: ${error.message}`);
    }
  }
}

module.exports = new BookingReferencedService();

