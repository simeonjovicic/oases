<template>
  <!-- Make sure to include Bootstrap Icons in your index.html -->
  <!-- Add this in your head tag: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"> -->
  <nav class="navbar navbar-expand-lg custom-navbar">
    <div class="container-fluid">
      <a class="navbar-brand d-flex align-items-center" href="#">
        <img src="@/assets/image/logo-white.png" alt="Logo" class="nav-logo me-3">
        <img src="@/assets/image/logo-white-menu.png" alt="Logo-Text" class="nav-logo">
      </a>
      <div class="separator"></div>
      <button class="navbar-toggler navbar-toggler-white" type="button" data-bs-toggle="collapse"
        data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav w-100">
          <li class="nav-item">
            <RouterLink class="nav-link text-white" to="/" active-class="active-link">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link text-white" to="/services" active-class="active-link">Services</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link text-white" to="/gallerie" active-class="active-link">Gallerie</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link text-white" to="/price" active-class="active-link">Preise</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link text-white" to="/contact" active-class="active-link">Kontakt</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link text-white" to="/bookings" active-class="active-link">Buchungen (MySQL)</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link text-white" to="/bookings-mongo" active-class="active-link">Buchungen (MongoDB)</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
}
</script>
<style scoped>
.custom-navbar {
  background: linear-gradient(to right, #0F533C, #07241a);
  color: white;
}

.nav-logo {
  width: auto;
  height: 50px;
  max-height: 8vh;
  object-fit: contain;
}

.nav-logo.me-3 {
  margin-right: 15px;
}

.separator {
  width: 2px;
  height: 30px;
  background-color: white;
  margin: 0 15px;
}

@media (max-width: 991.98px) {
  .separator {
    display: none;
  }
}

.d-none {
  display: none !important;
}

.navbar-toggler-white {
  border-color: rgba(255, 255, 255, 0.5);
}

.navbar-toggler-white .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath stroke='rgba(255, 255, 255, 1)' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
}

.nav-link {
  font-size: 1.25rem;
  padding: 0.5rem 1rem;
}

.nav-link.active-link {
  text-decoration: underline;
}
</style>