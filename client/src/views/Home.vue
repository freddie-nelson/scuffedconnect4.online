<script lang="ts">
import { defineComponent } from "vue";

import localIcon from "@iconify-icons/feather/hard-drive";
import onlineIcon from "@iconify-icons/feather/globe";

import CGradientHeading from "@/components/shared/Heading/CGradientHeading.vue";
import CButtonIcon from "@/components/shared/Button/CButtonIcon.vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Home",
  components: {
    CGradientHeading,
    CButtonIcon,
  },
  setup() {
    const router = useRouter();

    const goToRoom = (type: "local" | "online") => {
      router.push({
        name: "Room",
        params: {
          type,
        },
      });
    };

    return {
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
        @click="goToRoom('online')"
      >
        Play Online
      </c-button-icon>
    </div>
  </main>
</template>

<style lang="scss" scoped></style>