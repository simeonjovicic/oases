<template>
  <div class="gallery-container">
    <h1 class="gallery-title">Gallerie</h1>
    <div class="gallery-grid">
      <div v-for="(image, index) in images" :key="index" class="gallery-item">
        <img :src="image" alt="Gallery Image" class="gallery-image" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Gallerie",
  data() {
    return {
      // Dynamically reference the images
      images: Array.from({ length: 40 }, (_, i) => `/src/assets/gallerie/${i + 1}.png`),
    };
  },
};
</script>

<style scoped>
h1 {
  font-size: 80px;
}

/* Main container for the gallery */
.gallery-container {
  max-width: 1400px;
  margin: 3rem auto;
  padding: 1rem;
  text-align: center;
  font-family: Arial, sans-serif;
  color: #333;
}

/* Title styling */
.gallery-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #222;
}

/* Grid layout for images */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  /* Ensures images are responsive */
  gap: 1.5rem;
  padding: 0;
}

/* Gallery item wrapper */
.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  /* Rounded corners for all images */
  background-color: #f4f4f4;
  /* Fallback for empty spaces */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  /* Subtle shadow for images */
}

/* Styling for individual images */
.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Ensures images fill their container without distortion */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* Smooth hover effects */
}

/* Hover effects for images */
.gallery-item:hover .gallery-image {
  transform: scale(1.1);
  /* Zoom in slightly on hover */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  /* Enhance shadow effect */
}

/* Ensures hover effect is smooth */
.gallery-item:hover {
  cursor: pointer;
}
</style>
