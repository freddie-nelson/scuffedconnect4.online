<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeMount,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/store";

import { Colors, hex } from "@shared/colors";

import addIcon from "@iconify-icons/feather/user";

import CPlayer from "@/components/app/CPlayer.vue";
import CButtonIcon from "@/components/shared/Button/CButtonIcon.vue";
import CModal from "@/components/shared/Modal/CModal.vue";
import CButton from "@/components/shared/Button/CButton.vue";
import CGradientHeading from "@/components/shared/Heading/CGradientHeading.vue";
import CInputText from "@/components/shared/Input/CInputText.vue";
import CInputDropdown from "@/components/shared/Input/CInputDropdown.vue";
import Vue3Slider from "vue3-slider";
import { storeToRefs } from "pinia";

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
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const { game, socket } = storeToRefs(store);
    onBeforeMount(() => {
      store.resetGame();
    });

    watch(socket, () => {
      console.log(socket.value?.isConnected);
    });

    const type = ref("local");
    const isOnline = computed(() => type.value === "online");

    const roomCode = ref("abc123");

    onBeforeMount(() => {
      if (route.params.type && typeof route.params.type === "string") {
        type.value = route.params.type;
      }

      if (route.query.code && typeof route.query.code === "string") {
        route.params.type = "online";
        type.value = "online";

        roomCode.value = route.query.code;
      }

      if (type.value === "online") {
        store.createSocket();
      }
    });

    const copyRoomCode = () => {
      const url = new URL(location.href);
      url.searchParams.set("code", roomCode.value);

      navigator.clipboard
        .writeText(url.href)
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

    const colorOptions = computed(() => {
      return Object.entries(Colors)
        .filter((c) => parseInt(c[0], 10) >= 0)
        .filter(
          (c) => game.value?.findPlayerByColor(Number(c[0])) === undefined
        )
        .map((c) => c[1].toString().toLowerCase());
    });

    const showAddPlayerModal = ref(false);
    const addPlayerDetails = ref({
      username: "",
      color: colorOptions.value[0],
    });

    const hexColor = computed(() => {
      // @ts-expect-error this works
      return hex.get(Colors[addPlayerDetails.value.color.toUpperCase()]);
    });

    const clearAddPlayer = () => {
      showAddPlayerModal.value = false;

      addPlayerDetails.value.username = "";
      addPlayerDetails.value.color = colorOptions.value[0];
    };

    const addPlayer = () => {
      if (!addPlayerDetails.value.username) return;

      if (type.value === "local") {
        game.value?.addPlayer({
          id: Math.random().toString().split(".")[1],
          username: addPlayerDetails.value.username,
          // @ts-expect-error this works
          color: Colors[addPlayerDetails.value.color.toUpperCase()],
        });
      } else {
        console.log("add player online");
      }

      clearAddPlayer();
    };

    const rows = ref(6);
    const cols = ref(7);

    const startGame = () => {
      if (!game.value || game.value.getPlayerCount() < 2) return;

      game.value.setGridSize(rows.value, cols.value);
      router.push({ name: "Game" });
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

      clearAddPlayer,
      addPlayer,

      rows,
      cols,
      startGame,

      Colors,
      icons: {
        add: addIcon,
      },
    };
  },
});
</script>

<template>
  <main
    v-if="!isOnline || socket.isConnected"
    class="flex flex-col justify-center items-center p-5"
  >
    <c-gradient-heading class="mb-8">Waiting Room</c-gradient-heading>

    <div class="max-w-4xl w-full flex flex-col gap-5">
      <div class="w-full">
        <p class="text-bg-dark text-lg font-mono font-semibold mb-2 opacity-60">
          Players
        </p>

        <div class="flex flex-wrap gap-4">
          <c-player
            v-for="p of game.players"
            :key="p.id"
            :username="p.username"
            :color="p.color"
            :isHost="p === game.getHost()"
            class="h-20 flex-grow"
          />

          <c-button-icon
            class="h-20 flex-grow min-w-[16rem]"
            :icon="icons.add"
            @click="showAddPlayerModal = true"
          >
            Add Player
          </c-button-icon>
        </div>
      </div>

      <div v-if="isOnline" class="w-full">
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

      <div v-if="!isOnline" class="w-full flex flex-col gap-4">
        <p
          class="text-bg-dark text-lg font-mono font-semibold opacity-60 -mb-2"
        >
          Room Controls
        </p>

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
</template>

<style lang="scss" scoped></style>