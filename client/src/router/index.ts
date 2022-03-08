import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import Home from "@/views/Home.vue";
import Room from "@/views/Room.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/room",
    name: "Room",
    component: Room,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
