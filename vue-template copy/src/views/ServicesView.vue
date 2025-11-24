<template>
    <div class="services-view text-center">
        <!-- Bootstrap Alert for Success Message -->
        <div v-if="showSuccessAlert" class="alert alert-success alert-dismissible fade show fixed-top mx-auto mt-3" style="max-width: 500px;" role="alert">
            Service deleted successfully!
            <button type="button" class="btn-close" @click="showSuccessAlert = false" aria-label="Close"></button>
        </div>

        <h1 class="mb-4">Entdecken Sie unser vielseitiges Angebot</h1>
        <div class="filters mb-4 d-flex flex-wrap justify-content-center align-items-center gap-3">
            <input type="text" v-model="searchQuery" class="form-control search-input"
                placeholder="Search for a service..." />
            <div class="category-buttons d-flex flex-wrap gap-2">
                <button v-for="category in ['All', 'Nägel', 'Haarentfernung', 'Gesicht', 'Massage', 'Körper']"
                    :key="category" class="btn category-btn" :class="{ active: selectedCategory === category }"
                    @click="selectedCategory = category">
                    {{ category }}
                </button>
            </div>
        </div>

        <p class="text-muted description-text mb-4">
            Wählen Sie ein Service und entdecken Sie, was wir für Sie tun können!
        </p>

        <div class="row justify-content-center row-cols-1 row-cols-md-3 g-4">
            <div class="col d-flex justify-content-center" v-for="service in paginatedServices" :key="service.id">
                <div class="card h-100 text-center service-card" @click="toggleModal(service.id)" role="button">
                    <img :src="getImageUrl(service.image)" class="card-img-top" :alt="service.name" />
                    <div class="card-body">
                        <h5 class="card-title">{{ service.name }}</h5>
                        <p class="card-text"><strong>Category:</strong> {{ service.category }}</p>
                        <!-- Delete Button -->
                        <div class="mt-4 d-flex justify-content-center gap-2">
                            <button class="btn btn-danger" @click.stop="deleteService(service.id)">Delete</button>
                            <router-link :to="{ name: 'EditService', params: { id: service.id } }"
                                class="btn btn-primary">
                                Edit
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="pagination mt-4 d-flex justify-content-center gap-2">
            <button class="btn" :class="{
                'btn-success': currentPage > 1,
                'btn-secondary': currentPage === 1
            }" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                < </button>
                    <button v-for="page in totalPages" :key="page" class="btn" :class="{
                        'btn-primary': page === currentPage,
                        'btn-outline-primary': page !== currentPage
                    }" @click="goToPage(page)">
                        {{ page }}
                    </button>
                    <button class="btn" :class="{
                        'btn-success': currentPage < totalPages,
                        'btn-secondary': currentPage === totalPages
                    }" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                        >
                    </button>
                    <router-link to="/services/add" class="btn btn-info me-2">Add Service</router-link>
        </div>

        <!-- Modal -->
        <div class="custom-modal" v-if="showModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">{{ selectedServiceDetails?.name }}</h2>
                    <button class="btn-close" @click="toggleModal()"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex justify-content-center gap-4 align-items-center">
                        <div class="text-center">
                            <p class="fw-bold fs-5">Dauer</p>
                            <p class="fs-5">{{ selectedServiceDetails?.timeSpan }}</p>
                        </div>
                        <div class="text-center">
                            <p class="fw-bold fs-5">Preis</p>
                            <p class="fs-5">€{{ selectedServiceDetails?.price }}</p>
                        </div>
                    </div>
                    <hr v-if="selectedServiceDetails?.description" />
                    <p v-if="selectedServiceDetails?.description" class="fw-bold">Beschreibung</p>
                    <p v-if="selectedServiceDetails?.description">{{ selectedServiceDetails?.description }}</p>

                    <!-- Buchen Button with additional text -->
                    <div class="text-center mt-4">
                        <p class="fw-bold fs-4">Buchen Sie jetzt!</p>
                        <a href="https://www.treatwell.at/ort/oase-spa-massage-beauty-wellness/" class="btn btn-success"
                            target="_blank">
                            Buchen
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
const servicesList = ref([]);
const selectedCategory = ref('All');
const searchQuery = ref('');
const showSuccessAlert = ref(false);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;

// Fetch data from the API when the component is mounted
onMounted(async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/services');
        servicesList.value = response.data; // Store the data from the backend
    } catch (error) {
        console.error("Error fetching services:", error);
    }
});

const filteredServices = computed(() => {
    return servicesList.value.filter(service => {
        const matchesCategory =
            selectedCategory.value === 'All' || service.category === selectedCategory.value;
        const matchesSearchQuery = service.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchesCategory && matchesSearchQuery;
    });
});

const paginatedServices = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredServices.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredServices.value.length / itemsPerPage));

const goToPage = (page) => {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const showModal = ref(false);
const selectedServiceId = ref(null);

const toggleModal = (id = null) => {
    selectedServiceId.value = id;
    showModal.value = !showModal.value;
};

const selectedServiceDetails = computed(() => {
    return servicesList.value.find(service => service.id === selectedServiceId.value) || null;
});

// Delete service
const deleteService = async (id) => {
    try {
        const response = await axios.delete(`http://localhost:5000/api/services/${id}`);
        
        if (response.status === 200) {
            // Remove the deleted service from the list
            servicesList.value = servicesList.value.filter(service => service.id !== id);
            // Show success alert
            showSuccessAlert.value = true;
            // Hide after 3 seconds
            setTimeout(() => {
                showSuccessAlert.value = false;
            }, 3000);
        }
    } catch (error) {
        console.error("Error deleting service:", error);
        if (error.response && error.response.status === 403) {
            alert("You don't have permission to delete services");
        } else {
            alert("Error deleting the service");
        }
    }
};

// Method to construct the full image URL
const getImageUrl = (imageName) => {
    return `http://localhost:5000${imageName}`;
};
</script>

<style scoped>
.services-view {
    padding: 2rem;
}

.filters {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.search-input {
    max-width: 300px;
    flex-grow: 1;
}

.description-text {
    font-size: 1rem;
    color: #6c757d;
    text-align: center;
    max-width: 600px;
    margin: 1rem auto;
}

.category-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.category-btn {
    border: none;
    border-radius: 50px;
    padding: 0.5rem 1.5rem;
    background-color: #f8f9fa;
    transition: all 0.3s ease;
    cursor: pointer;
}

.category-btn.active {
    border: 2px solid #28a745;
    background-color: #e9fbe9;
}

.category-btn:hover {
    background-color: #f1f1f1;
}

.service-card {
    width: 18rem;
    transition: transform 0.3s, box-shadow 0.3s;
}

.service-card .card-title {
    font-weight: bold;
}

.service-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
}

.card-img-top {
    height: 200px;
    object-fit: cover;
}

.custom-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
}

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    padding: 1rem;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
    border: 1px solid #dee2e6;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 1rem;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #343a40;
}

.modal-body {
    padding: 1rem 0;
}

.list-group-item {
    padding: 0.75rem 1rem;
    font-size: 1rem;
}

.fw-bold {
    font-weight: bold;
}

.fs-5 {
    font-size: 1.25rem;
}
</style>