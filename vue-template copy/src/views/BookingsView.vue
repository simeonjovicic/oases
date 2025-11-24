<template>
    <div class="bookings-view">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Buchungen (MySQL)</h1>
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

        <!-- Bookings Table -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Kunde</th>
                        <th>Email</th>
                        <th>Datum</th>
                        <th>Status</th>
                        <th>Preis</th>
                        <th>Services</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="booking in filteredBookings" :key="booking.id">
                        <td>{{ booking.id }}</td>
                        <td>{{ booking.customer?.firstName }} {{ booking.customer?.lastName }}</td>
                        <td>{{ booking.customer?.email }}</td>
                        <td>{{ formatDate(booking.bookingDate) }}</td>
                        <td>
                            <span class="badge" :class="getStatusClass(booking.status)">
                                {{ booking.status }}
                            </span>
                        </td>
                        <td>€{{ booking.totalPrice }}</td>
                        <td>
                            <span v-for="(service, idx) in booking.services" :key="idx" class="badge bg-secondary me-1">
                                {{ service.name }}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-1" @click="editBooking(booking)">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" @click="deleteBooking(booking.id)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="filteredBookings.length === 0">
                        <td colspan="8" class="text-center">Keine Buchungen gefunden</td>
                    </tr>
                </tbody>
            </table>
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
                            <!-- Customer Selection -->
                            <div class="mb-3">
                                <label class="form-label">Kunde</label>
                                <select v-model="formData.customerId" class="form-select" required>
                                    <option value="">Kunde auswählen</option>
                                    <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                                        {{ customer.firstName }} {{ customer.lastName }} ({{ customer.email }})
                                    </option>
                                </select>
                            </div>

                            <!-- Booking Date -->
                            <div class="mb-3">
                                <label class="form-label">Buchungsdatum</label>
                                <input type="datetime-local" v-model="formData.bookingDate" class="form-control" required />
                            </div>

                            <!-- Status -->
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select v-model="formData.status" class="form-select" required>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <!-- Services -->
                            <div class="mb-3">
                                <label class="form-label">Services</label>
                                <div v-for="(service, index) in formData.services" :key="index" class="d-flex gap-2 mb-2">
                                    <select v-model="service.serviceId" class="form-select" required>
                                        <option value="">Service auswählen</option>
                                        <option v-for="s in availableServices" :key="s.id" :value="s.id">
                                            {{ s.name }} (€{{ s.price }})
                                        </option>
                                    </select>
                                    <input type="number" v-model.number="service.quantity" class="form-control" placeholder="Menge" min="1" style="max-width: 100px;" required />
                                    <button type="button" class="btn btn-danger" @click="removeService(index)" v-if="formData.services.length > 1">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                                <button type="button" class="btn btn-sm btn-secondary" @click="addService">
                                    <i class="bi bi-plus"></i> Service hinzufügen
                                </button>
                            </div>

                            <!-- Notes -->
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
const customers = ref([]);
const availableServices = ref([]);
const searchQuery = ref('');
const statusFilter = ref('');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingBooking = ref(null);
const showSuccessAlert = ref(false);
const successMessage = ref('');

const formData = ref({
    customerId: '',
    bookingDate: '',
    status: 'pending',
    services: [{ serviceId: '', quantity: 1 }],
    notes: ''
});

const API_BASE = 'http://localhost:5000/api';

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

const fetchCustomers = async () => {
    try {
        const response = await axios.get(`${API_BASE}/customers`);
        customers.value = response.data;
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
};

const fetchServices = async () => {
    try {
        const response = await axios.get(`${API_BASE}/services`);
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
    formData.value.services.push({ serviceId: '', quantity: 1 });
};

const removeService = (index) => {
    formData.value.services.splice(index, 1);
};

const editBooking = (booking) => {
    editingBooking.value = booking;
    formData.value = {
        customerId: booking.customerId || booking.customer?.id,
        bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().slice(0, 16) : '',
        status: booking.status,
        services: booking.services?.map(s => ({
            serviceId: s.serviceId || s.id,
            quantity: s.quantity || 1
        })) || [{ serviceId: '', quantity: 1 }],
        notes: booking.notes || ''
    };
    showEditModal.value = true;
};

const closeModal = () => {
    showCreateModal.value = false;
    showEditModal.value = false;
    editingBooking.value = null;
    formData.value = {
        customerId: '',
        bookingDate: '',
        status: 'pending',
        services: [{ serviceId: '', quantity: 1 }],
        notes: ''
    };
};

const saveBooking = async () => {
    try {
        const payload = {
            customerId: parseInt(formData.value.customerId),
            bookingDate: formData.value.bookingDate,
            status: formData.value.status,
            services: formData.value.services.map(s => ({
                serviceId: parseInt(s.serviceId),
                quantity: parseInt(s.quantity)
            })),
            notes: formData.value.notes
        };

        if (editingBooking.value) {
            await axios.put(`${API_BASE}/bookings/${editingBooking.value.id}`, payload);
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
    fetchCustomers();
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
</style>

