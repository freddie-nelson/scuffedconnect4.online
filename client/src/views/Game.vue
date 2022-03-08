<script lang="ts">
import { useStore } from "@/store";
import { Colors } from "@shared/colors";
import Game from "@shared/game";
import { computed, defineComponent, onBeforeMount } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Game",
  components: {},
  setup() {
    const router = useRouter();
    const store = useStore();

    const TEST = true;

    const game = computed(() => store.state.game as Game);
    onBeforeMount(() => {
      if (TEST && !store.state.game) {
        store.commit("RESET_GAME");

        game.value.addPlayer({
          id: "13435345",
          username: "Freddie",
          color: Colors.RED,
        });
        game.value.addPlayer({
          id: "5674783",
          username: "Andrew",
          color: Colors.BLUE,
        });
      }

      if (!game.value || game.value.getPlayerCount() < 2)
        return router.push({ name: "Home" });
    });
  },
});
</script>

<template>
  <main class="flex justify-center items-center"></main>
</template>

<style lang="scss" scoped></style>