<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Colors, hex } from "@game/colors";

import addIcon from "@iconify-icons/feather/user";

import CPlayer from "@/components/app/CPlayer.vue";
import CButtonIcon from "@/components/shared/Button/CButtonIcon.vue";
import CModal from "@/components/shared/Modal/CModal.vue";
import CButton from "@/components/shared/Button/CButton.vue";
import CGradientHeading from "@/components/shared/Heading/CGradientHeading.vue";
import CInputText from "@/components/shared/Input/CInputText.vue";
import CInputDropdown from "@/components/shared/Input/CInputDropdown.vue";
import { useStore } from "@/store";

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
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

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
    });

    const copyRoomCode = () => {
      const url = new URL(location.href);
      url.searchParams.set("code", roomCode.value);

      navigator.clipboard
        .writeText(url.href)
        .then(() => {
          store.commit("ADD_TOAST", {
            text: "Copied to clipboard!",
            duration: 1500,
          });
        })
        .catch(() => {
          store.commit("ADD_TOAST", {
            text: "Error while copying to clipboard.",
            duration: 1500,
          });
        });
    };

    const colorOptions = Object.entries(Colors)
      .filter((c) => parseInt(c[0], 10) >= 0)
      .map((c) => c[1].toString().toLowerCase());

    const showAddPlayerModal = ref(false);
    const addPlayerDetails = ref({
      username: "",
      color: colorOptions[0],
    });

    const hexColor = computed(() => {
      // @ts-expect-error this works
      return hex.get(Colors[addPlayerDetails.value.color.toUpperCase()]);
    });

    const clearAddPlayer = () => {
      showAddPlayerModal.value = false;

      addPlayerDetails.value.username = "";
      addPlayerDetails.value.color = colorOptions[0];
    };

    const addPlayer = () => {
      clearAddPlayer();
    };

    return {
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

      Colors,
      icons: {
        add: addIcon,
      },
    };
  },
});
</script>

<template>
  <main class="flex justify-center items-center p-5">
    <div class="max-w-4xl w-full flex flex-col gap-5">
      <div class="w-full">
        <p class="text-bg-dark text-lg font-mono font-semibold mb-2 opacity-60">
          Players
        </p>

        <div class="flex flex-wrap gap-4">
          <c-player
            class="h-20 flex-grow"
            username="xd Freddie"
            :color="Colors.BLUE"
            isHost
          />

          <c-button-icon
            class="h-20 flex-grow"
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
        <c-gradient-heading class="mb-2" :size="6"
          >Add Player</c-gradient-heading
        >

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