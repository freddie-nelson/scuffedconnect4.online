<script lang="ts">
import { useStore } from "@/store";
import { Colors } from "@shared/colors";
import Game, { Slot } from "@shared/game";
import { useMouseInElement } from "@vueuse/core";
import {
  computed,
  ComputedRef,
  defineComponent,
  onBeforeMount,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";

import CPlayer from "@/components/app/CPlayer.vue";
import CGridPiece from "@/components/app/Game/CGridPiece.vue";
import CGridSlot from "@/components/app/Game/CGridSlot.vue";
import CGridOverlay from "@/components/app/Game/CGridOverlay.vue";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "Game",
  components: { CPlayer, CGridSlot, CGridPiece, CGridOverlay },
  setup() {
    const router = useRouter();
    const store = useStore();

    const TEST = false;

    const { game, socket } = storeToRefs(store);

    onBeforeMount(() => {
      if (TEST && !store.game) {
        store.resetGame();

        game.value?.addPlayer({
          id: "13435345",
          username: "Player",
          color: Colors.RED,
        });
        game.value?.addPlayer({
          id: "5674783",
          username: "Opponent",
          color: Colors.BLUE,
        });

        game.value?.start();
      }

      if (!game.value || game.value.getPlayerCount() < 2)
        return router.push({ name: "Home" });

      if (!game.value.isOnline) game.value.start();
    });

    const rows = computed(() => game.value?.getRows() || 6);
    const cols = computed(() => game.value?.getCols() || 7);

    const playing = computed(() => game.value?.getPlaying());
    const nextPlaying = computed(() =>
      playing.value ? game.value?.getNextPlayer(playing.value) : undefined
    );

    const showPlayingOverlay = ref(false);
    watch(playing, (playing) => {
      if (!playing) return;

      showPlayingOverlay.value = true;
    });

    const winner = computed(() => game.value?.getWinner());

    const showWinnerOverlay = ref(false);
    watch(winner, (winner) => {
      if (!winner) return;

      showWinnerOverlay.value = true;
    });

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

    const pickerTranslate: ComputedRef<number> = computed<number>(() => {
      if (showPlayingOverlay.value) return pickerTranslate.value;

      const colWidth = mouseInGrid.elementWidth.value / cols.value;
      const col = Math.floor(mouseInGrid.elementX.value / colWidth);

      const max = (cols.value - 1) * colWidth;
      const min = 0;

      return Math.max(min, Math.min(max, col * colWidth));
    });

    const dropPiece = (col: number) => {
      if (!game.value || !playing.value) return;

      if (game.value.isOnline) {
        if (!socket.value || !socket.value.canPlay) return;

        socket.value.dropPiece(playing.value, col);
      } else {
        game.value.dropPiece(playing.value, col);
      }
    };

    return {
      game,
      rows,
      cols,

      playing,
      nextPlaying,
      showPlayingOverlay,

      winner,
      showWinnerOverlay,

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
        <c-grid-piece :gridSlot="pickerSlot" noAnim />
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

        <!-- playing card overlay -->
        <c-grid-overlay
          v-if="showPlayingOverlay"
          :player="playing"
          @click="showPlayingOverlay = false"
          @animationend="showPlayingOverlay = false"
          class="playing-overlay"
        >
          <template v-slot:tag>Now Playing</template>
        </c-grid-overlay>

        <!-- winner card overlay -->
        <c-grid-overlay
          v-if="showWinnerOverlay"
          :player="winner"
          winner
          class="winner-overlay"
        >
          <template v-slot:tag>Well Done!</template>
        </c-grid-overlay>
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

.playing-overlay {
  opacity: 0;
  animation: fade-in-out 1.8s ease-in-out;
  animation-fill-mode: forwards;

  @keyframes fade-in-out {
    from {
      opacity: 0;
    }

    30% {
      opacity: 1;
    }

    70% {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }
}

.winner-overlay {
  opacity: 0;
  animation: fade-in 1s ease-in;
  animation-fill-mode: forwards;

  @keyframes fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
}
</style>