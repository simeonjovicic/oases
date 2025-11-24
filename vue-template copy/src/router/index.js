import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ServicesView from "@/views/ServicesView.vue";
import ContactView from "@/views/ContactView.vue";
import GallerieView from "@/views/GallerieView.vue";
import PriceView from "@/views/PriceView.vue";
import NotFound from "@/views/NotFound.vue";
import AddServiceView from "@/views/AddServiceView.vue";
import EditServiceView from "@/views/EditServiceView.vue";
import BookingsView from "@/views/BookingsView.vue";
import BookingsMongoView from "@/views/BookingsMongoView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/services",
      name: "services",
      component: ServicesView,
    },
    {
      path: "/contact",
      name: "contact",
      component: ContactView,
    },
    {
      path: "/price",
      name: "price",
      component: PriceView,
    },
    {
      path: "/gallerie",
      name: "gallerie",
      component: GallerieView,
    },
    {
      path: "/services/add",
      component: AddServiceView,
    },
    {
      path: "/services/edit/:id",
      name: "EditService",
      component: EditServiceView,
      props: (route) => ({ serviceId: parseInt(route.params.id) }),
    },
    {
      path: "/bookings",
      name: "bookings",
      component: BookingsView,
    },
    {
      path: "/bookings-mongo",
      name: "bookingsMongo",
      component: BookingsMongoView,
    },
    {
      path: "/:pathMatch(.*)*",
      component: NotFound,
    },
  ],
});

export default router;