<template>
    <div class="bookings-view">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Buchungen (MongoDB)</h1>
            <button class="btn btn-primary" @click="showCreateModal = true">
                <i class="bi bi-plus-circle"></i> Neue Buchung
            </button>
        </div>

        <!-- Success Alert -->
        <div v-if="showSuccessAlert" class="alert alert-success alert-dismissible fade show" role="alert">
            {{ successMessage }}
            <button type="button" class="btn-close" @click="showSuccessAlert = false"></button>
        </div>

        <!-- Filter -->
        <div class="filters mb-4 d-flex gap-3 flex-wrap">
            <input type="text" v-model="searchQuery" class="form-control" placeholder="Suche nach Kunde, Email..." style="max-width: 300px;" />
            <select v-model="statusFilter" class="form-select" style="max-width: 200px;">
                <option value="">Alle Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>

        <!-- Bookings Cards (MongoDB embedded structure) -->
        <div class="row g-4">
            <div class="col-md-6 col-lg-4" v-for="booking in filteredBookings" :key="booking._id">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span class="badge" :class="getStatusClass(booking.status)">
                            {{ booking.status }}
                        </span>
                        <div>
                            <button class="btn btn-sm btn-warning me-1" @click="editBooking(booking)">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" @click="deleteBooking(booking._id)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">{{ booking.customer?.firstName }} {{ booking.customer?.lastName }}</h5>
                        <p class="card-text">
                            <strong>Email:</strong> {{ booking.customer?.email }}<br>
                            <strong>Telefon:</strong> {{ booking.customer?.phone || 'N/A' }}<br>
                            <strong>Adresse:</strong> {{ booking.customer?.address }}, {{ booking.customer?.city }}<br>
                            <strong>Datum:</strong> {{ formatDate(booking.bookingDate) }}<br>
                            <strong>Gesamtpreis:</strong> €{{ booking.totalPrice }}
                        </p>
                        <div class="services-list">
                            <strong>Services:</strong>
                            <ul class="list-unstyled mt-2">
                                <li v-for="(service, idx) in booking.services" :key="idx" class="mb-1">
                                    <span class="badge bg-secondary me-1">{{ service.name }}</span>
                                    <small>({{ service.quantity }}x) - €{{ service.priceAtBooking }}</small>
                                </li>
                            </ul>
                        </div>
                        <p v-if="booking.notes" class="mt-2">
                            <strong>Notizen:</strong> {{ booking.notes }}
                        </p>
                    </div>
                    <div class="card-footer text-muted">
                        <small>Erstellt: {{ formatDate(booking.createdAt) }}</small>
                    </div>
                </div>
            </div>
            <div v-if="filteredBookings.length === 0" class="col-12">
                <div class="alert alert-info text-center">Keine Buchungen gefunden</div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <div class="modal fade" :class="{ show: showCreateModal || showEditModal }" :style="{ display: (showCreateModal || showEditModal) ? 'block' : 'none' }" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ editingBooking ? 'Buchung bearbeiten' : 'Neue Buchung erstellen' }}</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveBooking">
                            <!-- Customer Info (Embedded) -->
                            <h6 class="mb-3">Kundeninformationen</h6>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Vorname</label>
                                    <input type="text" v-model="formData.customer.firstName" class="form-control" required />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Nachname</label>
                                    <input type="text" v-model="formData.customer.lastName" class="form-control" required />
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Email</label>
                                    <input type="email" v-model="formData.customer.email" class="form-control" required />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Telefon</label>
                                    <input type="tel" v-model="formData.customer.phone" class="form-control" />
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-8">
                                    <label class="form-label">Adresse</label>
                                    <input type="text" v-model="formData.customer.address" class="form-control" />
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">PLZ</label>
                                    <input type="text" v-model="formData.customer.postalCode" class="form-control" />
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Stadt</label>
                                <input type="text" v-model="formData.customer.city" class="form-control" />
                            </div>

                            <hr>

                            <!-- Booking Info -->
                            <h6 class="mb-3">Buchungsinformationen</h6>
                            <div class="mb-3">
                                <label class="form-label">Buchungsdatum</label>
                                <input type="datetime-local" v-model="formData.bookingDate" class="form-control" required />
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select v-model="formData.status" class="form-select" required>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <!-- Services (Embedded) -->
                            <div class="mb-3">
                                <label class="form-label">Services</label>
                                <div v-for="(service, index) in formData.services" :key="index" class="border p-3 mb-2 rounded">
                                    <div class="row">
                                        <div class="col-md-5">
                                            <label class="form-label">Service</label>
                                            <select v-model="service.serviceId" class="form-select" required @change="updateServiceData(index)">
                                                <option value="">Service auswählen</option>
                                                <option v-for="s in availableServices" :key="s.id" :value="s.id">
                                                    {{ s.name }} (€{{ s.price }})
                                                </option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label">Menge</label>
                                            <input type="number" v-model.number="service.quantity" class="form-control" min="1" required @input="calculateTotalPrice" />
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label">Preis bei Buchung</label>
                                            <input type="number" v-model.number="service.priceAtBooking" class="form-control" step="0.01" required />
                                        </div>
                                        <div class="col-md-1 d-flex align-items-end">
                                            <button type="button" class="btn btn-danger" @click="removeService(index)" v-if="formData.services.length > 1">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-sm btn-secondary" @click="addService">
                                    <i class="bi bi-plus"></i> Service hinzufügen
                                </button>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Gesamtpreis</label>
                                <input type="number" v-model.number="formData.totalPrice" class="form-control" step="0.01" required readonly />
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Notizen</label>
                                <textarea v-model="formData.notes" class="form-control" rows="3"></textarea>
                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" @click="closeModal">Abbrechen</button>
                                <button type="submit" class="btn btn-primary">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showCreateModal || showEditModal" class="modal-backdrop fade show" @click="closeModal"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const bookings = ref([]);
const availableServices = ref([]);
const searchQuery = ref('');
const statusFilter = ref('');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingBooking = ref(null);
const showSuccessAlert = ref(false);
const successMessage = ref('');

const formData = ref({
    customer: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: ''
    },
    bookingDate: '',
    status: 'pending',
    services: [{
        serviceId: '',
        name: '',
        category: '',
        price: 0,
        timeSpan: '',
        quantity: 1,
        priceAtBooking: 0
    }],
    totalPrice: 0,
    notes: ''
});

const API_BASE = 'http://localhost:5000/api/mongo';

// Fetch all data
const fetchBookings = async () => {
    try {
        const response = await axios.get(`${API_BASE}/bookings`);
        bookings.value = response.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        alert('Fehler beim Laden der Buchungen');
    }
};

const fetchServices = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/services');
        availableServices.value = response.data;
    } catch (error) {
        console.error('Error fetching services:', error);
    }
};

// Computed
const filteredBookings = computed(() => {
    return bookings.value.filter(booking => {
        const matchesSearch = !searchQuery.value || 
            `${booking.customer?.firstName} ${booking.customer?.lastName}`.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            booking.customer?.email?.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesStatus = !statusFilter.value || booking.status === statusFilter.value;
        return matchesSearch && matchesStatus;
    });
});

// Methods
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('de-DE');
};

const getStatusClass = (status) => {
    const classes = {
        pending: 'bg-warning',
        confirmed: 'bg-info',
        completed: 'bg-success',
        cancelled: 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
};

const addService = () => {
    formData.value.services.push({
        serviceId: '',
        name: '',
        category: '',
        price: 0,
        timeSpan: '',
        quantity: 1,
        priceAtBooking: 0
    });
};

const removeService = (index) => {
    formData.value.services.splice(index, 1);
    calculateTotalPrice();
};

const updateServiceData = (index) => {
    const selectedService = availableServices.value.find(s => s.id === parseInt(formData.value.services[index].serviceId));
    if (selectedService) {
        formData.value.services[index].name = selectedService.name;
        formData.value.services[index].category = selectedService.category;
        formData.value.services[index].price = parseFloat(selectedService.price);
        formData.value.services[index].timeSpan = selectedService.timeSpan;
        formData.value.services[index].priceAtBooking = parseFloat(selectedService.price);
        calculateTotalPrice();
    }
};

const calculateTotalPrice = () => {
    formData.value.totalPrice = formData.value.services.reduce((sum, service) => {
        return sum + (service.priceAtBooking * (service.quantity || 1));
    }, 0);
};

const editBooking = (booking) => {
    editingBooking.value = booking;
    formData.value = {
        customer: {
            firstName: booking.customer?.firstName || '',
            lastName: booking.customer?.lastName || '',
            email: booking.customer?.email || '',
            phone: booking.customer?.phone || '',
            address: booking.customer?.address || '',
            city: booking.customer?.city || '',
            postalCode: booking.customer?.postalCode || ''
        },
        bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().slice(0, 16) : '',
        status: booking.status,
        services: booking.services?.map(s => ({
            serviceId: s.serviceId || '',
            name: s.name || '',
            category: s.category || '',
            price: s.price || 0,
            timeSpan: s.timeSpan || '',
            quantity: s.quantity || 1,
            priceAtBooking: s.priceAtBooking || 0
        })) || [{
            serviceId: '',
            name: '',
            category: '',
            price: 0,
            timeSpan: '',
            quantity: 1,
            priceAtBooking: 0
        }],
        totalPrice: booking.totalPrice || 0,
        notes: booking.notes || ''
    };
    showEditModal.value = true;
};

const closeModal = () => {
    showCreateModal.value = false;
    showEditModal.value = false;
    editingBooking.value = null;
    formData.value = {
        customer: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            postalCode: ''
        },
        bookingDate: '',
        status: 'pending',
        services: [{
            serviceId: '',
            name: '',
            category: '',
            price: 0,
            timeSpan: '',
            quantity: 1,
            priceAtBooking: 0
        }],
        totalPrice: 0,
        notes: ''
    };
};

const saveBooking = async () => {
    try {
        // Calculate total price
        calculateTotalPrice();

        const payload = {
            customer: formData.value.customer,
            bookingDate: formData.value.bookingDate,
            status: formData.value.status,
            services: formData.value.services.map(s => ({
                serviceId: parseInt(s.serviceId),
                name: s.name,
                category: s.category,
                price: s.price,
                timeSpan: s.timeSpan,
                quantity: parseInt(s.quantity),
                priceAtBooking: parseFloat(s.priceAtBooking)
            })),
            totalPrice: parseFloat(formData.value.totalPrice),
            notes: formData.value.notes
        };

        if (editingBooking.value) {
            await axios.put(`${API_BASE}/bookings/${editingBooking.value._id}`, payload);
            successMessage.value = 'Buchung erfolgreich aktualisiert';
        } else {
            await axios.post(`${API_BASE}/bookings`, payload);
            successMessage.value = 'Buchung erfolgreich erstellt';
        }

        showSuccessAlert.value = true;
        setTimeout(() => showSuccessAlert.value = false, 3000);
        closeModal();
        await fetchBookings();
    } catch (error) {
        console.error('Error saving booking:', error);
        alert('Fehler beim Speichern der Buchung');
    }
};

const deleteBooking = async (id) => {
    if (!confirm('Möchten Sie diese Buchung wirklich löschen?')) return;

    try {
        await axios.delete(`${API_BASE}/bookings/${id}`);
        successMessage.value = 'Buchung erfolgreich gelöscht';
        showSuccessAlert.value = true;
        setTimeout(() => showSuccessAlert.value = false, 3000);
        await fetchBookings();
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Fehler beim Löschen der Buchung');
    }
};

onMounted(() => {
    fetchBookings();
    fetchServices();
});
</script>

<style scoped>
.bookings-view {
    padding: 2rem;
}

.modal.show {
    display: block;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
}

.card {
    transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>

