<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CGridSlot",
  components: {},
});
</script>

<template>
  <svg
    viewbox="0 0 10 10"
    class="slot w-full h-full flex justify-center items-center relative"
  >
    <mask id="slotMask">
      <rect width="100%" height="100%" fill="white" />

      <circle cx="50%" cy="50%" r="40%" fill="black" />
    </mask>

    <rect
      width="100%"
      height="100%"
      fill="var(--bg-dark)"
      mask="url(#slotMask)"
    />
  </svg>
</template>

<style lang="scss" scoped></style>