<script lang="ts">
import CPlayer from "@/components/app/CPlayer.vue";
import CGridPiece from "@/components/app/Game/CGridPiece.vue";
import CGridSlot from "@/components/app/Game/CGridSlot.vue";
import { useStore } from "@/store";
import { Colors } from "@shared/colors";
import Game, { Slot } from "@shared/game";
import { useMouseInElement } from "@vueuse/core";
import { computed, defineComponent, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Game",
  components: { CPlayer, CGridSlot, CGridPiece },
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

    const winner = computed(() => game.value.getWinner());

    const pickerSlot = computed<Slot>(() => {
      return {
        color: playing.value?.color || Colors.RED,
        win: false,
        col: 0,
        row: 0,
      };
    });

    const gridEl = ref<HTMLDivElement>();
    const mouseInGrid = useMouseInElement(gridEl);

    const pickerTranslate = computed(() => {
      const colWidth = mouseInGrid.elementWidth.value / cols.value;
      const col = Math.floor(mouseInGrid.elementX.value / colWidth);

      const max = (cols.value - 1) * colWidth;
      const min = 0;

      return Math.max(min, Math.min(max, col * colWidth));
    });

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
      winner,

      gridEl,
      pickerSlot,
      pickerTranslate,
      dropPiece,
    };
  },
});
</script>

<template>
  <main class="flex justify-center items-center">
    <div class="game flex flex-col gap-4 relative">
      <!-- picker -->
      <div
        v-if="playing"
        id="picker"
        class="
          picker
          absolute
          opacity-60
          transform
          transition-transform
          duration-100
        "
        :style="{ '--tw-translate-x': `${pickerTranslate}px` }"
      >
        <c-grid-piece :gridSlot="pickerSlot" />
      </div>

      <div ref="gridEl" class="grid-container">
        <!-- pieces -->
        <div class="grid">
          <c-grid-piece
            v-for="(slot, i) of game.getSlots()"
            :key="i"
            :gridSlot="slot"
          />
        </div>

        <!-- holder -->
        <div class="grid cursor-pointer rounded-lg overflow-hidden z-10">
          <c-grid-slot
            v-for="(slot, i) of game.getSlots()"
            :key="i"
            :mask="i === 0"
            @click="dropPiece(slot.col)"
          />
        </div>
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

        <c-player
          v-if="winner"
          class="h-full flex-grow"
          :username="winner.username"
          :color="winner.color"
          :isHost="winner === game.getHost()"
          winner
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

.picker {
  $height: calc($grid-height / v-bind(rows));

  width: calc($grid-width / v-bind(cols));
  height: $height;
  left: 0;
  top: calc($height * -0.5);
}

.grid-container {
  position: relative;
  width: $grid-width;
  height: $grid-height;
}

.grid {
  position: absolute;
  top: 0;
  left: 0;
  width: $grid-width;
  height: $grid-height;

  grid-template-rows: repeat(v-bind(rows), 1fr);
  grid-template-columns: repeat(v-bind(cols), 1fr);
  grid-auto-flow: column;
}
</style>