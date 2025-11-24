<template>
  <!-- Footer -->
  <div class="custom-footer">
    <!-- Section: Social media -->
    <section
      class="
        d-flex
        justify-content-center justify-content-lg-between
        p-4
        border-bottom
      "
    >
      <!-- Right -->
      <div class="icons">
        <a href="https://www.facebook.com/people/Oase-Spa/100052649385825/" target="_blank" class="link me-4 text-reset">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="" target="_blank" class="me-4 text-reset">
          <i class="fab fa-twitter"></i>
        </a>
        <a href="" class="me-4 text-reset">
          <i class="fab fa-instagram"></i>
        </a>
      </div>
      <!-- Right -->
    </section>
    <!-- Section: Social media -->
    <!-- Section: Links  -->
    <section class="mt-5">
      <div class="container text-center text-md-start">
        <!-- Grid row -->
        <div class="row mt-3">
          <!-- Grid column -->
          <div class="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
            <!-- Content -->
            <h6 class="text-uppercase fw-bold mb-4">
              <img src="@/assets/image/oase-banner-logo.png" alt="Oase Spa Logo" height="200px">
            </h6>
          </div>

         <!-- Operating Hours Section -->
          <div class="col-md-3 col-lg-3 col-xl-3 mx-auto mb-4">
            <h6 class="text-uppercase fw-bold mb-4">Öffnungszeiten</h6>
            <p>Montag: Geschlossen</p>
            <p>Dienstag - Sonntag: 10:00 - 22:00</p>
            <p style="font-style: italic; color: #eaeaea;">Auch zu Feiertagen Geöffnet!</p>
          </div>

          <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4 ms-4">
            <!-- Links -->
            <h6 class="text-uppercase fw-bold mb-4">Kontakt</h6>
            <p>
              <i class="fas fa-home me-3"></i>
              <a 
                href="https://www.google.com/maps?q=Wilhelminenstraße+20,+1160+Wien" 
                target="_blank" 
                class="link"
              >
                Wilhelminenstraße 20, 1160 Wien
              </a>
            </p>
            <p>
              <i class="fas fa-envelope me-3"></i>
              <a href="mailto:oasespa@gmail.com" class="link">oasespa@gmail.com</a>
            </p>
            <p>
              <i class="fas fa-phone me-3"></i>
              <a href="tel:+4314806003" class="link">+43 1 480 6003</a>
            </p>
          </div>
          <!-- Grid column -->


          <!-- Grid column -->
        </div>
        <!-- Grid row -->
      </div>
    </section>
    <!-- Section: Links  -->
    <!-- Copyright -->
    <div class="text-center p-4 bottom">
      © 2012 Copyright: OASE SPA
    </div>
    <!-- Copyright -->
  </div>
  <!-- Footer -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
  />
</template><style scoped>
.icons {
  display: flex;
  justify-content: center; /* Centers the icons horizontally */
  align-items: center; /* Ensures vertical alignment */
  gap: 20px; /* Adds spacing between the icons */
  font-size: 1.5rem; /* Increases the icon size */
  margin: 0 auto; /* Centers the container itself */
  width: 100%; /* Ensures it spans the full width */
  text-align: center; /* Aligns content within the container */
}

/* Style the entire footer */
.custom-footer {
  background-color: rgb(28, 86, 50);
  color: rgb(255, 255, 255);
}

.bottom {
  background-color: rgb(22, 63, 37);
}

.link {
  color: white; /* Make link text white */
  text-decoration: none;
}

.link:hover {
  text-decoration: underline; /* Optional hover effect */
}

/* Treatwell Link Styling */
.treatwell-link {
  display: inline-block;
  font-size: 1rem;
  margin-top: 10px;
  text-align: left;
}

.treatwell-link i {
  color: white; /* Changed icon color to white */
}
</style>
