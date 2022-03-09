<script lang="ts">
import Player from "@shared/player";
import { defineComponent } from "vue";
import CPlayer from "../CPlayer.vue";

export default defineComponent({
  name: "CGridOverlay",
  components: { CPlayer },
  props: {
    player: {
      type: Object as () => Player,
    },
    winner: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<template>
  <div
    class="
      absolute
      top-0
      left-0
      w-full
      h-full
      flex
      justify-center
      items-center
      z-10
    "
  >
    <div
      class="bg-bg-light opacity-50 absolute top-0 left-0 w-full h-full"
    ></div>

    <div
      class="
        flex flex-col
        items-center
        justify-center
        gap-2
        absolute
        z-10
        w-full
      "
    >
      <p class="text-2xl font-mono font-semibold text-bg-dark select-none">
        <slot name="tag"></slot>
      </p>

      <c-player
        v-if="player"
        class="h-20 w-2/5"
        :username="player.username"
        :color="player.color"
        :winner="winner"
      />

      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>