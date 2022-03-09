<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { Colors, hex } from "@shared/colors";

import { Icon } from "@iconify/vue";
import playingIcon from "@iconify-icons/feather/play";

export default defineComponent({
  name: "CPlayer",
  components: {
    Icon,
  },
  props: {
    username: {
      type: String,
      required: true,
    },
    color: {
      type: Number as () => Colors,
      required: true,
    },
    isHost: {
      type: Boolean,
      default: false,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    upNext: {
      type: Boolean,
      default: false,
    },
    winner: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const colorEl = ref(document.createElement("div"));

    useResizeObserver(colorEl, (entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;

      if (width !== height) {
        const h = `${height}px`;
        colorEl.value.style.width = h;
        colorEl.value.style.height = h;
      }
    });

    return {
      colorEl,
      hexColor: computed(() => hex.get(props.color)),

      icons: {
        playing: playingIcon,
      },
    };
  },
});
</script>

<template>
  <div
    class="
      flex
      items-center
      rounded-lg
      bg-bg-dark
      p-2.5
      min-w-[16rem]
      select-none
    "
  >
    <div
      ref="colorEl"
      class="rounded-full h-full"
      :style="{ backgroundColor: hexColor }"
    ></div>

    <div
      class="
        flex flex-col
        ml-4
        text-bg-light
        font-semibold
        text-lg
        font-mono
        max-w-[40%]
      "
    >
      <p class="whitespace-nowrap text-ellipsis overflow-hidden w-full">
        {{ username }}
      </p>

      <p v-if="isHost" class="text-base -mt-0.5 opacity-60">Host</p>
    </div>

    <div
      v-if="isPlaying"
      class="
        glowing-text
        flex
        items-center
        gap-1
        text-primary-500
        ml-auto
        mr-4
        animate-pulse
      "
    >
      <p class="font-semibold font-mono">Playing</p>
      <Icon :icon="icons.playing" class="h-7 w-7 hidden" />
    </div>

    <div
      v-if="upNext"
      class="flex items-center gap-1 text-accent-500 ml-auto mr-4 opacity-70"
    >
      <p class="font-semibold font-mono">Up Next</p>
    </div>

    <div
      v-if="winner"
      class="
        glowing-text
        flex
        items-center
        gap-1
        text-accent-500
        ml-auto
        mr-4
        animate-pulse
      "
    >
      <p class="font-semibold font-mono">Winner</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.glowing-text {
  filter: drop-shadow(0 0 14px currentColor) drop-shadow(0 0 3px currentColor);
}
</style>