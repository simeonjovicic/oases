<template>
  <h1 class="m-4 mb-2" style="text-align: center;">Unsere Preisliste</h1>
  <p class="text-muted description-text mb-4" style="text-align: center;">
    Entdecken Sie unser umfassendes Angebot an Wellness- und Entspannungsbehandlungen.
  </p>
  <div class="image-container">
    <img src="@/assets/image/1.png" alt="Preisliste Seite 1" class="pricelist-image" />
    <img src="@/assets/image/2.png" alt="Preisliste Seite 2" class="pricelist-image" />
  </div>
</template>

<style scoped>
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px; /* Space between the images */
  flex-wrap: wrap; /* Ensure proper wrapping on smaller screens */
  margin: 20px 0; /* Add some margin around the images */
}

.pricelist-image {
  max-width: 42%; /* Ensure images are responsive */
  height: auto;
  border-radius: 8px; /* Optional: Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Optional: Shadow for depth */
}


@media only screen and (max-width: 600px) {
  .pricelist-image{ 
    max-width: 90%;
  }
}

</style>
