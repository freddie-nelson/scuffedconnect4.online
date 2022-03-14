<script lang="ts">
import { defineComponent, ref } from "vue";

import localIcon from "@iconify-icons/feather/hard-drive";
import onlineIcon from "@iconify-icons/feather/globe";

import CGradientHeading from "@/components/shared/Heading/CGradientHeading.vue";
import CButtonIcon from "@/components/shared/Button/CButtonIcon.vue";
import { useRouter } from "vue-router";
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

    return {
      showOnlineModal,
      showJoinModal,
      joinCode,
      goToRoom,

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

        <c-button class="h-20 w-full" type="submit"> Join Room </c-button>
      </form>
    </c-modal>
  </main>
</template>

<style lang="scss" scoped></style>