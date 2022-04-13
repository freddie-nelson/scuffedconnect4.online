<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useStore } from "@/store";

import { Colors, hex } from "@shared/colors";
import Socket from "@/api/socket";

import addIcon from "@iconify-icons/feather/user";
import leaveIcon from "@iconify-icons/feather/log-out";

import Vue3Slider from "vue3-slider";

import CPlayer from "@/components/app/CPlayer.vue";
import CButtonIcon from "@/components/shared/Button/CButtonIcon.vue";
import CModal from "@/components/shared/Modal/CModal.vue";
import CButton from "@/components/shared/Button/CButton.vue";
import CGradientHeading from "@/components/shared/Heading/CGradientHeading.vue";
import CInputText from "@/components/shared/Input/CInputText.vue";
import CInputDropdown from "@/components/shared/Input/CInputDropdown.vue";
import CSpinnerCircle from "@/components/shared/Spinner/CSpinnerCircle.vue";
import Player from "@shared/player";
import CInputToggle from "@/components/shared/Input/CInputToggle.vue";

export default defineComponent({
  name: "Room",
  components: {
    CPlayer,
    CButtonIcon,
    CModal,
    CButton,
    CGradientHeading,
    CInputText,
    CInputDropdown,
    Vue3Slider,
    CSpinnerCircle,
    CInputToggle,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const { game, socket } = storeToRefs(store);

    const type = ref("local");
    const isOnline = computed(() => type.value === "online");

    const roomCode = computed(
      () => socket.value?.roomCode || (route.query.code as string) || ""
    );
    watch(roomCode, (code) => {
      if (!code) return;

      router.replace({ name: "Room", query: { code } });
    });

    onBeforeMount(() => {
      if (route.params.type && typeof route.params.type === "string") {
        type.value = route.params.type;
      }

      if (route.query.code && typeof route.query.code === "string") {
        route.params.type = "online";
        type.value = "online";

        // roomCode.value = route.query.code;
      }

      if (type.value === "online") {
        if (!store.socket) store.createSocket();
      }

      store.resetGame();
    });

    onBeforeRouteLeave((to) => {
      if (!socket.value || !isOnline.value) return;

      if (to.name !== "Game") socket.value.leaveRoom();
    });

    const isConnected = computed(() => socket.value?.isConnected || false);
    watch([isConnected, isOnline], () => {
      if (!isOnline.value || !socket.value) return;

      if (isConnected.value) {
        if (roomCode.value) socket.value.joinRoom(roomCode.value);
        else socket.value.createRoom();
      }
    });

    const copyRoomCode = () => {
      navigator.clipboard
        .writeText(roomCode.value)
        .then(() => {
          store.addToast({
            text: "Copied to clipboard!",
            duration: 1500,
          });
        })
        .catch(() => {
          store.addToast({
            text: "Error while copying to clipboard.",
            duration: 1500,
          });
        });
    };

    const players = computed<Player[]>(() => {
      return game.value ? [...game.value.players] : [];
    });

    const showAddPlayerModal = ref(false);
    const addPlayerDetails = ref({
      username: "",
      color: "red",
      bot: false,
    });

    const colorOptions = ref<string[]>([]);
    watch(showAddPlayerModal, (show) => {
      if (!show) return;

      colorOptions.value = Object.entries(Colors)
        .filter((c) => parseInt(c[0], 10) >= 0)
        .filter(
          (c) => game.value?.findPlayerByColor(Number(c[0])) === undefined
        )
        .map((c) => c[1].toString().toLowerCase());

      addPlayerDetails.value.color = colorOptions.value[0];
    });

    const hexColor = computed(() => {
      return players.value.length >= 8
        ? "#000"
        : // @ts-expect-error this works
          hex.get(Colors[addPlayerDetails.value.color.toUpperCase()]);
    });

    const clearAddPlayer = () => {
      showAddPlayerModal.value = false;

      addPlayerDetails.value.username = "";
      addPlayerDetails.value.color = colorOptions.value[0];
      addPlayerDetails.value.bot = false;
    };

    const addPlayer = () => {
      if (!addPlayerDetails.value.username) return;

      const player: Player = {
        id: Math.random().toString().split(".")[1],
        username: addPlayerDetails.value.username,
        // @ts-expect-error this works
        color: Colors[addPlayerDetails.value.color.toUpperCase()],
        bot: addPlayerDetails.value.bot,
      };

      if (type.value === "local") {
        game.value?.addPlayer(player);
      } else {
        if (!socket.value || !isConnected.value) return;

        socket.value.addPlayer(player);
      }

      clearAddPlayer();
    };

    const removePlayer = (p: Player) => {
      if (type.value === "local") {
        game.value?.removePlayer(p);
      } else {
        if (!socket.value || !isConnected.value) return;

        socket.value.removePlayer(p);
      }
    };

    const rows = ref(6);
    const cols = ref(7);

    watch([rows, cols], () => {
      if (!socket.value || !isOnline.value) return;

      socket.value.setGridSize(rows.value, cols.value);
    });

    const startGame = () => {
      if (!game.value || game.value.getPlayerCount() < 2) return;

      if (type.value === "local") {
        game.value.setGridSize(rows.value, cols.value);
        router.push({ name: "Game" });
      } else {
        if (!socket.value || !isConnected.value) return;

        socket.value.startGame();
      }
    };

    const leaveRoom = () => {
      if (type.value === "local") {
        router.push({ name: "Home" });
      } else {
        if (!socket.value || !isConnected.value) return;

        socket.value.leaveRoom();
      }
    };

    return {
      game,
      socket,

      type,
      isOnline,

      roomCode,
      copyRoomCode,

      showAddPlayerModal,
      addPlayerDetails,
      colorOptions,
      hexColor,

      players,
      clearAddPlayer,
      addPlayer,
      removePlayer,

      rows,
      cols,

      startGame,
      leaveRoom,

      Colors,
      icons: {
        add: addIcon,
        leave: leaveIcon,
      },
    };
  },
});
</script>

<template>
  <main
    v-if="!isOnline || (socket.isConnected && game.isOnline)"
    class="flex flex-col justify-center items-center p-10"
  >
    <c-gradient-heading class="mb-8 text-center">
      Waiting Room
    </c-gradient-heading>

    <div class="max-w-4xl w-full flex flex-col gap-5">
      <div class="w-full">
        <p class="text-bg-dark text-lg font-mono font-semibold mb-2 opacity-60">
          Players
        </p>

        <div class="flex flex-wrap gap-4">
          <c-player
            v-for="p of players"
            :key="p.id"
            :username="p.username"
            :color="p.color"
            :isHost="p === game.getHost()"
            :isBot="p.bot"
            :removeable="
              !isOnline ||
              p.socketId === socket.socket.id ||
              game.host.socketId === socket.socket.id
            "
            @remove="removePlayer(p)"
            class="h-20 flex-grow"
          />

          <c-button-icon
            v-if="players.length < 8"
            class="h-20 flex-grow min-w-[16rem]"
            :icon="icons.add"
            @click="showAddPlayerModal = true"
          >
            Add Player
          </c-button-icon>
        </div>
      </div>

      <div v-if="isOnline && roomCode" class="w-full">
        <p class="text-bg-dark text-lg font-mono font-semibold mb-2 opacity-60">
          Room Code
        </p>

        <button
          class="
            w-full
            h-14
            flex
            justify-center
            items-center
            bg-bg-dark
            rounded-lg
            text-bg-light
            relative
            outline-none
            overflow-hidden
            group
          "
          @click="copyRoomCode"
        >
          <p class="font-mono text-lg font-semibold">{{ roomCode }}</p>

          <div
            class="
              bg-bg-light
              text-bg-dark
              absolute
              top-0
              left-0
              w-full
              h-full
              group-hover:opacity-90
              opacity-0
              transition-opacity
              duration-300
              flex
              justify-center
              items-center
            "
          >
            <p class="font-mono text-lg font-semibold">click to copy!</p>
          </div>
        </button>
      </div>

      <div class="w-full flex flex-col gap-5">
        <p
          class="text-bg-dark text-lg font-mono font-semibold opacity-60 -mb-3"
        >
          Room Controls
        </p>

        <div
          v-if="!isOnline || socket.isRoomOwner"
          class="flex flex-col gap-5 w-full"
        >
          <div>
            <p class="text-t-sub font-medium">Rows</p>
            <vue3-slider
              color="var(--accent-500)"
              trackColor="var(--b-dark-dark)"
              tooltipColor="var(--bg-dark)"
              tooltipTextColor="var(--bg-light)"
              sticky
              :height="12"
              tooltip
              steps
              :min="4"
              :max="10"
              v-model="rows"
            />
          </div>

          <div>
            <p class="text-t-sub font-medium">Columns</p>
            <vue3-slider
              color="var(--accent-500)"
              trackColor="var(--b-dark-dark)"
              tooltipColor="var(--bg-dark)"
              tooltipTextColor="var(--bg-light)"
              sticky
              :height="12"
              tooltip
              steps
              :min="4"
              :max="10"
              v-model="cols"
            />
          </div>

          <c-button
            v-if="game.getPlayerCount() >= 2"
            class="h-20 w-full"
            @click="startGame"
          >
            Start Game
          </c-button>
        </div>

        <c-button-icon
          class="h-20 flex-grow"
          :icon="icons.leave"
          @click="leaveRoom"
        >
          Leave Room
        </c-button-icon>
      </div>
    </div>

    <c-modal
      v-if="showAddPlayerModal"
      closeable
      @close="clearAddPlayer()"
      class="max-w-xl w-full"
    >
      <form
        @submit.prevent="addPlayer"
        class="w-full flex flex-col justify-center items-center gap-4"
      >
        <c-gradient-heading class="mb-2" :size="6">
          Add Player
        </c-gradient-heading>

        <c-input-text
          classes="w-full"
          label="Username"
          name="username"
          dark
          placeholder="Enter username..."
          v-model="addPlayerDetails.username"
        />

        <div class="mr-auto w-max">
          <label class="text-t-sub font-medium">AI Controlled</label>
          <c-input-toggle class="mt-1" v-model="addPlayerDetails.bot" />
        </div>

        <c-input-dropdown
          class="w-full"
          label="Color"
          v-model="addPlayerDetails.color"
          :options="colorOptions"
        />

        <div
          class="w-full h-16 rounded-lg"
          :style="{ backgroundColor: hexColor }"
        ></div>

        <c-button type="submit" class="h-16 w-full">Add Player</c-button>
      </form>
    </c-modal>
  </main>

  <main v-else class="flex flex-col gap-8 justify-center items-center">
    <c-spinner-circle class="transform scale-75" />
    <p class="text-bg-dark font-mono text-2xl font-semibold text-center">
      Creating room...
    </p>
  </main>
</template>

<style lang="scss" scoped></style>