<script setup>
import { RouterLink, RouterView, useRoute } from "vue-router";
import TheNavbar from "./components/TheNavbar.vue";
import TheHeader from "./components/TheHeader.vue";
import TheFooter from "./components/TheFooter.vue";

const route = useRoute();
</script>

<template>
  <TheNavbar />

  <TheHeader v-if="route.path === '/'" />

  <div class="container">
    <RouterView />
  </div>
  <TheFooter />
</template>

<style>
body {
  background-color: #E7E0DB;
}
</style>
