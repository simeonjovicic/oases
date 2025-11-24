<template>
  <div class="container-fluid p-0 position-relative">
    <video  id="myVideo" autoplay muted loop playsinline preload="auto" class="w-100 h-100 position-absolute" style="object-fit: cover">
      <source src="@/assets/banner_video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    <div class="overlay"></div>

    <div class="position-absolute top-50 start-50 translate-middle text-center">
      <img src="@/assets/image/oase-banner-logo.png" alt="Oase Banner Logo" class="img-fluid"
        style="max-width: 10%; width: auto; height: auto" />
    </div>
  </div>
</template>

<script>
export default {
  name: "TheHeader",
};
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.container-fluid {
  position: relative;
  height: 100vh;
}

video {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

img {
  max-width: 80%;
  height: auto;
  transform: scale(5);
  transform-origin: center;
  z-index: 2;
}
</style>
