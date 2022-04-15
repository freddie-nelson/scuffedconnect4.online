<script lang="ts">
import { defineComponent, onUnmounted, ref, watch } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import { PublicRoom } from "@shared/publicRoom";

import localIcon from "@iconify-icons/feather/hard-drive";
import onlineIcon from "@iconify-icons/feather/globe";

import CGradientHeading from "@/components/shared/Heading/CGradientHeading.vue";
import CButtonIcon from "@/components/shared/Button/CButtonIcon.vue";
import CModal from "@/components/shared/Modal/CModal.vue";
import CButton from "@/components/shared/Button/CButton.vue";
import CInputText from "@/components/shared/Input/CInputText.vue";

export default defineComponent({
  name: "Home",
  components: {
    CGradientHeading,
    CButtonIcon,
    CModal,
    CButton,
    CInputText,
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    store.createSocket();

    const showOnlineModal = ref(false);
    const showJoinModal = ref(false);

    const joinCode = ref("");

    const goToRoom = (type: "local" | "online", code?: string) => {
      router.push({
        name: "Room",
        params: {
          type,
        },
        query: {
          code,
        },
      });
    };

    const showPublicModal = ref(false);
    const publicRooms = ref<PublicRoom[]>([]);

    const fetchPublicRooms = () => {
      if (!store.socket || !showPublicModal.value) return;

      store.socket.socket.emit("global:publicrooms", (rooms: PublicRoom[]) => {
        publicRooms.value = rooms;
      });
    };
    const fetchPublicRoomsInterval = setInterval(fetchPublicRooms, 2000);

    watch(showPublicModal, (show) => {
      if (show) fetchPublicRooms();
    });

    onUnmounted(() => {
      clearInterval(fetchPublicRoomsInterval);
    });

    return {
      showOnlineModal,
      showJoinModal,
      joinCode,
      goToRoom,

      showPublicModal,
      publicRooms,

      icons: {
        local: localIcon,
        online: onlineIcon,
      },
    };
  },
});
</script>

<template>
  <main class="flex flex-col justify-center items-center p-5">
    <c-gradient-heading class="text-center" :size="7">
      Scuffed Connect 4
    </c-gradient-heading>

    <div class="flex flex-col gap-4 max-w-md w-full mt-8">
      <c-button-icon
        class="h-16"
        :icon="icons.local"
        @click="goToRoom('local')"
      >
        Play Local
      </c-button-icon>
      <c-button-icon
        class="h-16"
        :icon="icons.online"
        @click="showOnlineModal = true"
      >
        Play Online
      </c-button-icon>
    </div>

    <c-modal
      v-if="showOnlineModal"
      class="w-full max-w-xl flex flex-col justify-center items-center gap-4"
      closeable
      @close="showOnlineModal = false"
    >
      <c-gradient-heading class="mb-2" :size="6">
        Play Online
      </c-gradient-heading>

      <c-button
        class="h-20 w-full"
        @click="
          showOnlineModal = false;
          goToRoom('online');
        "
      >
        Create Room
      </c-button>

      <c-button
        class="h-20 w-full"
        @click="
          showOnlineModal = false;
          showJoinModal = true;
        "
      >
        Join Room
      </c-button>

      <c-button
        class="h-20 w-full"
        @click="
          showOnlineModal = false;
          showPublicModal = true;
        "
      >
        Public Rooms
      </c-button>
    </c-modal>

    <c-modal
      v-if="showJoinModal"
      class="w-full max-w-xl flex flex-col justify-center items-center gap-4"
      closeable
      @close="showJoinModal = false"
    >
      <c-gradient-heading class="mb-2" :size="6">
        Join Room
      </c-gradient-heading>

      <form
        class="w-full flex flex-col justify-center items-center gap-4"
        @submit.prevent="
          showJoinModal = false;
          goToRoom('online', joinCode);
        "
      >
        <c-input-text
          classes="w-full"
          v-model="joinCode"
          name="joinCode"
          placeholder="Enter 5 character code..."
          :size="5"
          :maxlength="5"
          :minlength="5"
          label="Room Code"
          dark
        />

        <c-button class="h-20 w-full" type="submit">Join Room</c-button>
      </form>
    </c-modal>

    <c-modal
      v-if="showPublicModal"
      class="
        w-full
        max-w-2xl
        h-full
        max-h-[38rem]
        flex flex-col
        gap-4
        items-center
      "
      closeable
      @close="showPublicModal = false"
    >
      <c-gradient-heading class="mb-2" :size="6">
        Public Rooms
      </c-gradient-heading>

      <div
        class="
          w-full
          text-bg-light
          opacity-60
          font-medium
          grid grid-cols-4
          gap-3
        "
      >
        <p>Host</p>
        <p>Code</p>
        <p>Players</p>
      </div>

      <div
        class="
          w-full
          h-full
          flex-grow
          overflow-y-scroll
          flex flex-col
          gap-4
          text-bg-light
          font-medium
        "
      >
        <p
          v-if="publicRooms.length === 0"
          class="w-full text-center text-xl mt-16"
        >
          No public rooms found.
        </p>

        <div
          v-for="room in publicRooms"
          :key="room.code"
          class="grid grid-cols-4 w-full gap-3 h-12 place-items-center"
        >
          <p class="w-full text-ellipsis overflow-hidden">{{ room.host }}</p>
          <p class="w-full text-ellipsis overflow-hidden">{{ room.code }}</p>
          <p class="w-full text-ellipsis overflow-hidden">
            {{ room.players }}/8
          </p>

          <c-button
            class="w-full h-12"
            @click="
              showPublicModal = false;
              goToRoom('online', room.code);
            "
          >
            Join
          </c-button>
        </div>
      </div>
    </c-modal>
  </main>
</template>

<style lang="scss" scoped>
*::-webkit-scrollbar {
  display: none;
}
</style>