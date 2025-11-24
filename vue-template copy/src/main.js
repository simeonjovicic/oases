import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import "bootstrap-icons/font/bootstrap-icons.css"

const app = createApp(App)

// Initialize Pinia before router
const pinia = createPinia()
app.use(pinia)

// Use router after Pinia is initialized
app.use(router)

app.mount('#app')