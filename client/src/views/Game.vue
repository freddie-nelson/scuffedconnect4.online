<script lang="ts">
import CPlayer from "@/components/app/CPlayer.vue";
import CGridSlot from "@/components/app/Game/CGridSlot.vue";
import { useStore } from "@/store";
import { Colors } from "@shared/colors";
import Game from "@shared/game";
import { computed, defineComponent, onBeforeMount } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Game",
  components: { CPlayer, CGridSlot },
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

        game.value.start();
      }

      if (!game.value || game.value.getPlayerCount() < 2)
        return router.push({ name: "Home" });
    });

    const rows = computed(() => game.value.getRows());
    const cols = computed(() => game.value.getCols());

    const playing = computed(() => game.value.getPlaying());
    const nextPlaying = computed(() =>
      playing.value ? game.value.getNextPlayer(playing.value) : undefined
    );

    const dropPiece = (col: number) => {
      if (!playing.value) return;

      game.value.dropPiece(playing.value, col);
    };

    return {
      game,
      rows,
      cols,
      playing,
      nextPlaying,

      dropPiece,
    };
  },
});
</script>

<template>
  <main class="flex justify-center items-center">
    <div class="game flex flex-col gap-4">
      <div class="grid cursor-pointer">
        <c-grid-slot
          v-for="(slot, i) of game.getSlots()"
          :key="i"
          :gridSlot="slot"
          @click="dropPiece(slot.col)"
        />
      </div>

      <div class="h-16 w-full flex gap-4">
        <c-player
          v-if="playing"
          class="h-full flex-grow"
          :username="playing.username"
          :color="playing.color"
          :isHost="playing === game.getHost()"
          isPlaying
        />

        <c-player
          v-if="nextPlaying"
          class="h-full w-72"
          :username="nextPlaying.username"
          :color="nextPlaying.color"
          :isHost="nextPlaying === game.getHost()"
          upNext
        />
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped >
$grid-width: clamp(300px, 80vw, 80vh);
$grid-height: calc($grid-width * (v-bind(rows) / v-bind(cols)));

.game {
  width: $grid-width;
}

.grid {
  width: $grid-width;
  height: $grid-height;

  grid-template-rows: repeat(v-bind(rows), 1fr);
  grid-template-columns: repeat(v-bind(cols), 1fr);
  grid-auto-flow: column;
}
</style>