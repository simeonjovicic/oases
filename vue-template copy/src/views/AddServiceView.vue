<template>
    <div class="container mt-5 mb-5">
        <div>
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h3 class="mb-0">Add Service</h3>
                </div>
                <div class="card-body">
                    <form @submit.prevent="submitService" enctype="multipart/form-data">
                        <!-- Service Name -->
                        <div class="mb-3">
                            <label for="name" class="form-label">Service Name:</label>
                            <input 
                                type="text" 
                                id="name" 
                                class="form-control" 
                                v-model="form.name"
                                @input="validateName"
                                :class="{ 'is-invalid': errors.name }"
                                placeholder="Enter service name (min 4 letters)" 
                            />
                            <div class="invalid-feedback">{{ errors.name }}</div>
                        </div>

                        <!-- Category -->
                        <div class="mb-3">
                            <label for="category" class="form-label">Category:</label>
                            <select 
                                id="category" 
                                class="form-select" 
                                v-model="form.category"
                                :class="{ 'is-invalid': errors.category }"
                            >
                                <option disabled value="">Select a category</option>
                                <option v-for="option in categories" :key="option" :value="option">
                                    {{ option }}
                                </option>
                            </select>
                            <div class="invalid-feedback">{{ errors.category }}</div>
                        </div>

                        <!-- Description -->
                        <div class="mb-3">
                            <label for="description" class="form-label">Description:</label>
                            <textarea 
                                id="description" 
                                class="form-control" 
                                rows="4" 
                                v-model="form.description"
                                @input="validateDescription"
                                :class="{ 'is-invalid': errors.description }"
                                placeholder="Enter description (min 50 letters)"
                            ></textarea>
                            <div class="invalid-feedback">{{ errors.description }}</div>
                        </div>

                        <!-- Price and Time Span -->
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="price" class="form-label">Price (€):</label>
                                <input 
                                    type="number" 
                                    id="price" 
                                    class="form-control" 
                                    v-model="form.price"
                                    @input="validatePrice"
                                    :class="{ 'is-invalid': errors.price }"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter price" 
                                />
                                <div class="invalid-feedback">{{ errors.price }}</div>
                            </div>
                            <div class="col-md-6">
                                <label for="timeSpan" class="form-label">Time Span:</label>
                                <input 
                                    type="text" 
                                    id="timeSpan" 
                                    class="form-control" 
                                    v-model="form.timeSpan"
                                    @input="validateTimeSpan"
                                    :class="{ 'is-invalid': errors.timeSpan }"
                                    placeholder="e.g., 60min" 
                                />
                                <div class="invalid-feedback">{{ errors.timeSpan }}</div>
                            </div>
                        </div>

                        <!-- Image -->
                        <div class="mb-3">
                            <label for="image" class="form-label">Image:</label>
                            <input 
                                type="file" 
                                id="image" 
                                class="form-control" 
                                @change="handleImage"
                                :class="{ 'is-invalid': errors.image }"
                                accept="image/*"
                            />
                            <div class="invalid-feedback">{{ errors.image }}</div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100">
                            Add Service
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                name: "",
                category: "",
                description: "",
                price: "",
                timeSpan: "",
                image: null,
            },
            categories: ["Nägel", "Haarentfernung", "Gesicht", "Massage", "Körper"],
            errors: {
                name: "",
                category: "",
                description: "",
                price: "",
                timeSpan: "",
                image: "",
            },
            showSuccessAlert: false,
        };
    },
    methods: {
        handleImage(event) {
            this.form.image = event.target.files[0];
            this.errors.image = !this.form.image ? "Please select an image" : "";
        },
        validateName() {
            const lettersOnly = /^[a-zA-ZäöüÄÖÜß\s]+$/;
            if (!this.form.name) {
                this.errors.name = "Service name is required";
            } else if (!lettersOnly.test(this.form.name)) {
                this.errors.name = "Only letters are allowed";
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
            this.errors.image = !this.form.image ? "Please select an image" : "";
            this.errors.category = !this.form.category ? "Category is required" : "";

            return !Object.values(this.errors).some(error => error !== "");
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
            formData.append("image", this.form.image);

            try {
                const response = await fetch("http://localhost:5000/api/services", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    this.showSuccessAlert = true;
                    setTimeout(() => {
                        this.showSuccessAlert = false;
                    }, 3000);
                    
                    // Reset form
                    this.form = {
                        name: "",
                        category: "",
                        description: "",
                        price: "",
                        timeSpan: "",
                        image: null,
                    };
                    document.getElementById('image').value = '';
                } else {
                    const error = await response.json();
                    if (response.status === 403) {
                        alert("You don't have permission to add services");
                    } else {
                        alert(`Error: ${error.error}`);
                    }
                }
            } catch (error) {
                console.error("Error adding service:", error);
                alert("An error occurred. Please try again.");
            }
        },
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

.btn-primary {
    background-color: #007bff;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-primary:hover {
    background-color: #0056b3;
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
</style>