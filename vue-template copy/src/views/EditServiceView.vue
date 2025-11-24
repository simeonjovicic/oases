<template>
    <div class="container mt-5">
        <div>
            <!-- Success Alert -->
            <div v-if="showSuccessAlert" class="alert alert-success alert-dismissible fade show fixed-top mx-auto mt-3" style="max-width: 500px;" role="alert">
                {{ isEdit ? "Service updated successfully!" : "Service added successfully!" }}
                <button type="button" class="btn-close" @click="showSuccessAlert = false" aria-label="Close"></button>
            </div>

            <div class="card shadow">
                <div class="card-header bg-warning text-white">
                    <h3 class="mb-0">{{ isEdit ? "Edit Service" : "Add Service" }}</h3>
                </div>
                <div class="card-body">
                    <form @submit.prevent="submitService" enctype="multipart/form-data">
                        <div class="mb-3">
                            <label for="name" class="form-label">Service Name:</label>
                            <input type="text" id="name" class="form-control" v-model="form.name"
                                @input="validateName"
                                :class="{ 'is-invalid': errors.name }"
                                placeholder="Enter service name" />
                            <div class="invalid-feedback">{{ errors.name }}</div>
                        </div>

                        <div class="mb-3">
                            <label for="category" class="form-label">Category:</label>
                            <select id="category" class="form-select" v-model="form.category"
                                :class="{ 'is-invalid': errors.category }">
                                <option disabled value="">Select a category</option>
                                <option v-for="option in categories" :key="option" :value="option">
                                    {{ option }}
                                </option>
                            </select>
                            <div class="invalid-feedback">{{ errors.category }}</div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Description:</label>
                            <textarea id="description" class="form-control" rows="4" v-model="form.description"
                                @input="validateDescription"
                                :class="{ 'is-invalid': errors.description }"
                                placeholder="Enter description"></textarea>
                            <div class="invalid-feedback">{{ errors.description }}</div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="price" class="form-label">Price (€):</label>
                                <input type="number" id="price" class="form-control" v-model="form.price" step="0.01"
                                    @input="validatePrice"
                                    :class="{ 'is-invalid': errors.price }"
                                    placeholder="Enter price" />
                                <div class="invalid-feedback">{{ errors.price }}</div>
                            </div>
                            <div class="col-md-6">
                                <label for="timeSpan" class="form-label">Time Span:</label>
                                <input type="text" id="timeSpan" class="form-control" v-model="form.timeSpan"
                                    @input="validateTimeSpan"
                                    :class="{ 'is-invalid': errors.timeSpan }"
                                    placeholder="e.g., 60min" />
                                <div class="invalid-feedback">{{ errors.timeSpan }}</div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="image" class="form-label">Image:</label>
                            <input type="file" id="image" class="form-control" @change="handleImage" />
                            <div v-if="isEdit && form.existingImage" class="mt-2">
                                <small>Current image:</small>
                                <img :src="getImageUrl(form.existingImage)" class="img-thumbnail mt-1" style="max-width: 150px;" />
                            </div>
                        </div>

                        <button type="submit" class="btn btn-warning w-100">
                            {{ isEdit ? "Update Service" : "Add Service" }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        serviceId: {
            type: Number,
            default: null,
        },
    },
    data() {
        return {
            form: {
                name: "",
                category: "",
                description: "",
                price: "",
                timeSpan: "",
                image: null,
                existingImage: null
            },
            categories: ["Nägel", "Haarentfernung", "Gesicht", "Massage", "Körper"],
            isEdit: false,
            showSuccessAlert: false,
            errors: {
                name: "",
                category: "",
                description: "",
                price: "",
                timeSpan: "",
            }
        };
    },
    methods: {
        getImageUrl(imageName) {
            return `http://localhost:5000${imageName}`;
        },
        validateName() {
            if (!this.form.name) {
                this.errors.name = "Service name is required";
            } else if (this.form.name.length < 4) {
                this.errors.name = "Minimum 4 characters required";
            } else {
                this.errors.name = "";
            }
        },
        validateDescription() {
            if (!this.form.description) {
                this.errors.description = "Description is required";
            } else if (this.form.description.length < 50) {
                this.errors.description = "Minimum 50 characters required";
            } else {
                this.errors.description = "";
            }
        },
        validatePrice() {
            if (!this.form.price && this.form.price !== 0) {
                this.errors.price = "Price is required";
            } else if (this.form.price < 0) {
                this.errors.price = "Price cannot be negative";
            } else {
                this.errors.price = "";
            }
        },
        validateTimeSpan() {
            const timeFormat = /^\d+min$/;
            if (!this.form.timeSpan) {
                this.errors.timeSpan = "Time span is required";
            } else if (!timeFormat.test(this.form.timeSpan)) {
                this.errors.timeSpan = "Format must be like '60min'";
            } else {
                this.errors.timeSpan = "";
            }
        },
        validateForm() {
            this.validateName();
            this.validateDescription();
            this.validatePrice();
            this.validateTimeSpan();
            this.errors.category = !this.form.category ? "Category is required" : "";

            return !Object.values(this.errors).some(error => error !== "");
        },
        async fetchService() {
            if (this.serviceId) {
                try {
                    const response = await fetch(
                        `http://localhost:5000/api/services/${this.serviceId}`
                    );
                    const service = await response.json();
                    this.form = { 
                        ...service, 
                        image: null,
                        existingImage: service.image
                    };
                    this.isEdit = true;
                } catch (error) {
                    console.error("Error fetching service:", error);
                }
            }
        },
        handleImage(event) {
            this.form.image = event.target.files[0];
        },
        async submitService() {
            if (!this.validateForm()) {
                return;
            }

            const formData = new FormData();
            formData.append("name", this.form.name);
            formData.append("category", this.form.category);
            formData.append("description", this.form.description);
            formData.append("price", this.form.price);
            formData.append("timeSpan", this.form.timeSpan);
            if (this.form.image) {
                formData.append("image", this.form.image);
            }

            try {
                const url = this.isEdit
                    ? `http://localhost:5000/api/services/${this.serviceId}`
                    : "http://localhost:5000/api/services";

                const method = this.isEdit ? "PUT" : "POST";

                const response = await fetch(url, {
                    method,
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    this.showSuccessAlert = true;
                    setTimeout(() => {
                        this.showSuccessAlert = false;
                    }, 3000);
                    
                    if (!this.isEdit) {
                        // Reset form if adding new service
                        this.form = {
                            name: "",
                            category: "",
                            description: "",
                            price: "",
                            timeSpan: "",
                            image: null,
                            existingImage: null
                        };
                        document.getElementById('image').value = '';
                    }
                } else {
                    const error = await response.json();
                    if (response.status === 403) {
                        alert("You don't have permission to modify services");
                    } else {
                        alert(`Error: ${error.error}`);
                    }
                }
            } catch (error) {
                console.error("Error submitting service:", error);
                alert("An error occurred. Please try again.");
            }
        },
    },
    mounted() {
        if (this.serviceId) {
            this.fetchService();
        }
    },
};
</script>

<style>
.container {
    max-width: 600px;
}

.card {
    border-radius: 10px;
}

.btn-warning {
    background-color: #ffc107;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-warning:hover {
    background-color: #e0a800;
}

.is-invalid {
    border-color: #dc3545;
}

.invalid-feedback {
    color: #dc3545;
    font-size: 0.875em;
}

.alert-warning {
    margin-top: 20px;
}

.alert-success {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    min-width: 300px;
    text-align: center;
}

.img-thumbnail {
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 2px;
}
</style>