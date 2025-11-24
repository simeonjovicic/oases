# MongoDB-Modell: Frontend-optimiertes Booking-Schema

## Design-Entscheidungen

### Embedded Documents (Denormalisierung)

Das Modell verwendet **embedded documents** statt Referenzen, um Frontend-Performance zu optimieren:

1. **Services sind embedded** - Alle Service-Informationen sind direkt im Booking-Document
   - Keine zusätzliche Query nötig
   - Frontend erhält alle Daten in einem Request
   - Trade-off: Datenredundanz, aber bessere Read-Performance

2. **Customer-Info ist embedded** - Kundeninformationen sind direkt im Booking
   - Keine JOIN-Operationen nötig
   - Schnellere Abfragen
   - Trade-off: Bei Customer-Update müssen alle Bookings aktualisiert werden

### Schema-Struktur

```javascript
{
  _id: ObjectId,
  customer: {
    customerId: Number,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },
  services: [
    {
      serviceId: Number,
      name: String,
      category: String,
      price: Number,
      timeSpan: String,
      image: String,
      description: String,
      quantity: Number,
      priceAtBooking: Number
    }
  ],
  bookingDate: Date,
  status: String, // 'pending', 'confirmed', 'completed', 'cancelled'
  totalPrice: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Indizes

Für optimale Query-Performance wurden folgende Indizes erstellt:

- `customer.email` - Schnelle Suche nach Kunden-E-Mail
- `customer.lastName, customer.firstName` - Sortierung nach Namen
- `bookingDate` - Sortierung nach Datum
- `status` - Filter nach Status
- `status, bookingDate` - Compound Index für häufige Filter-Kombinationen
- `services.category` - Filter nach Service-Kategorie
- `totalPrice` - Sortierung nach Preis

### Methoden

#### Instance Methods

- `calculateTotalPrice()` - Berechnet den Gesamtpreis neu basierend auf Services

#### Static Methods

- `findByCustomerEmail(email)` - Findet alle Bookings eines Kunden
- `findByStatus(status)` - Findet Bookings nach Status
- `findByCategory(category)` - Findet Bookings nach Service-Kategorie

### Vorteile für Frontend

1. **Weniger Requests** - Alle benötigten Daten in einem Document
2. **Keine JOINs** - Embedded Documents eliminieren JOIN-Operationen
3. **Optimierte Indizes** - Schnelle Abfragen für häufige Use-Cases
4. **Flexible Queries** - MongoDB's flexible Query-Syntax

### Nachteile

1. **Datenredundanz** - Customer- und Service-Info wird mehrfach gespeichert
2. **Update-Overhead** - Bei Service/Customer-Änderungen müssen alle Bookings aktualisiert werden
3. **Größere Documents** - Mehr Speicherplatz nötig

Diese Trade-offs sind für ein Frontend-optimiertes System akzeptabel, da Read-Operationen deutlich häufiger sind als Updates.

