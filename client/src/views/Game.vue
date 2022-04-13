<script lang="ts">
import { useStore } from "@/store";
import { Colors } from "@shared/colors";
import { Slot } from "@shared/game";
import { useMouseInElement, useResizeObserver } from "@vueuse/core";
import {
  computed,
  ComputedRef,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import leaveIcon from "@iconify-icons/feather/log-out";

import CPlayer from "@/components/app/CPlayer.vue";
import CGridPiece from "@/components/app/Game/CGridPiece.vue";
import CGridSlot from "@/components/app/Game/CGridSlot.vue";
import CGridOverlay from "@/components/app/Game/CGridOverlay.vue";
import CButton from "@/components/shared/Button/CButton.vue";
import CButtonIcon from "@/components/shared/Button/CButtonIcon.vue";

export default defineComponent({
  name: "Game",
  components: {
    CPlayer,
    CGridSlot,
    CGridPiece,
    CGridOverlay,
    CButton,
    CButtonIcon,
  },
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
          bot: false,
        });
        game.value?.addPlayer({
          id: "5674783",
          username: "Opponent",
          color: Colors.BLUE,
          bot: false,
        });

        game.value?.start();
      }

      if (store.game && !store.game.isOnline) store.game.start();
    });

    onBeforeUnmount(() => {
      if (game.value && game.value.isOnline) {
        socket.value?.leaveRoom();
      }
    });

    const rows = computed(() => game.value?.getRows() || 6);
    const cols = computed(() => game.value?.getCols() || 7);

    const playing = computed(() => game.value?.getPlaying());
    const nextPlaying = computed(() =>
      playing.value ? game.value?.getNextPlayer(playing.value) : undefined
    );

    const showPlayingOverlay = ref(false);
    let waitingForBot = false;
    let playTime = 0;

    watch(
      playing,
      (playing) => {
        if (!playing) return;

        showPlayingOverlay.value = true;
        playTime = performance.now();

        if (
          playing.bot &&
          game.value &&
          (!game.value.isOnline || playing.socketId === socket.value?.socket.id)
        ) {
          waitingForBot = true;
          const col = game.value.bestMove();
          if (col !== -1) {
            const expected = playTime;

            setTimeout(() => {
              waitingForBot = false;
              if (playTime === expected) dropPiece(col);
            }, 2000);
          }
        } else {
          waitingForBot = false;
        }
      },
      { immediate: true }
    );

    const winner = computed(() => game.value?.getWinner());

    const showWinnerOverlay = ref(false);
    watch(winner, (winner) => {
      if (!winner) showWinnerOverlay.value = false;
      else showWinnerOverlay.value = true;
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
    const colWidth = ref(100);
    useResizeObserver(gridEl, (entries) => {
      const entry = entries[0];
      colWidth.value = entry.contentRect.width / cols.value;
    });

    const pickerTranslate: ComputedRef<number> = computed<number>(() => {
      if (showPlayingOverlay.value) return pickerTranslate.value;

      const col = Math.floor(mouseInGrid.elementX.value / colWidth.value);

      const max = (cols.value - 1) * colWidth.value;
      const min = 0;

      return Math.max(min, Math.min(max, col * colWidth.value));
    });

    const dropPiece = (col: number) => {
      if (!game.value || !playing.value || waitingForBot) return;

      if (game.value.isOnline) {
        if (!socket.value) return;

        socket.value.dropPiece(playing.value, col);
      } else {
        game.value.dropPiece(playing.value, col);
      }
    };

    const leaveRoom = () => {
      if (!game.value) return;

      if (game.value.isOnline) {
        if (!socket.value) return;

        socket.value.leaveRoom();
      } else {
        router.push({ name: "Home" });
      }
    };

    const playingAgain = ref(false);
    const playAgain = () => {
      if (!game.value) return;

      if (game.value.isOnline) {
        if (!socket.value) return;

        if (socket.value.isRoomOwner) {
          socket.value.restartGame();
        } else {
          playingAgain.value = true;
        }
      } else {
        game.value.restart();
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

      leaveRoom,

      playingAgain,
      playAgain,

      icons: {
        leave: leaveIcon,
      },
    };
  },
});
</script>

<template>
  <main class="flex justify-center items-center p-10">
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
        <c-button-icon
          class="
            absolute
            left-full
            px-[0_!important]
            w-9
            h-9
            ml-4
            transform
            origin-top-left
            scale-125
            text-bg-light
          "
          :icon="icons.leave"
          @click="leaveRoom"
        ></c-button-icon>

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

          <div v-if="!playingAgain" class="flex gap-4 h-16 mt-1">
            <c-button @click="leaveRoom">Leave Room</c-button>
            <c-button @click="playAgain">Play Again</c-button>
          </div>

          <p v-else class="text-xl mt-3 font-mono font-semibold text-bg-dark">
            Waiting for room owner...
          </p>
        </c-grid-overlay>
      </div>

      <div class="h-16 w-full flex gap-2 md:gap-4">
        <c-player
          v-if="playing"
          class="h-full flex-grow"
          :username="playing.username"
          :color="playing.color"
          :isHost="playing === game.getHost()"
          :isBot="playing.bot"
          isPlaying
        />

        <c-player
          v-if="nextPlaying"
          class="h-full w-72 hidden sm:flex"
          :username="nextPlaying.username"
          :color="nextPlaying.color"
          :isHost="nextPlaying === game.getHost()"
          :isBot="nextPlaying.bot"
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