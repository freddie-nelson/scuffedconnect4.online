import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import Home from "@/views/Home.vue";
import Room from "@/views/Room.vue";
import Game from "@/views/Game.vue";
import { useStore } from "@/store";

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
  {
    path: "/game",
    name: "Game",
    component: Game,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.name === "Game") {
    const store = useStore();

    if (!store.game || store.game.getPlayerCount() < 2) {
      next({ name: "Home" });
      return;
    }
  }

  next();
});

export default router;
