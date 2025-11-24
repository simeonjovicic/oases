<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Oops! The page you're looking for doesn't exist.</p>
    <router-link to="/">Go back to Home</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}

.not-found h1 {
  font-size: 6rem;
  color: #000000;
}

.not-found p {
  font-size: 1.5rem;
  margin: 20px 0;
  padding-bottom: 3rem;
}

.not-found a {
  text-decoration: none;
  color: #007bff;
  font-size: 1.2rem;
  padding-bottom: 3rem;
  margin: 6rem;
}

.not-found a:hover {
  text-decoration: underline;
}
</style>

