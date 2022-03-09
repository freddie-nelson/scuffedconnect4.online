<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import Game, { Slot } from "@shared/game";
import { hex } from "@shared/colors";
import { useStore } from "@/store";

export default defineComponent({
  name: "CGridPiece",
  components: {},
  props: {
    gridSlot: {
      type: Object as () => Slot,
      required: true,
    },
    noAnim: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const store = useStore();
    const game = computed(() => store.state.game as Game);

    const rows = computed(() => game.value.getRows());
    // const cols = computed(() => game.value.getcols());

    const row = computed(() => props.gridSlot.row);
    // const col = computed(() => props.gridSlot.col);

    const hexColor = computed(() => {
      return props.gridSlot.color !== null ? hex.get(props.gridSlot.color) : "";
    });
    const win = computed(() => props.gridSlot.win);

    const pieceEl = ref<HTMLDivElement>();
    const color = computed(() => props.gridSlot.color);
    const translate = ref(0);

    watch(color, () => {
      if (props.noAnim || color.value === null || !pieceEl.value) return;

      const rect = pieceEl.value.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      const pickerY = centerY - rect.height * (rows.value - row.value - 1);

      translate.value = pickerY - centerY;
      requestAnimationFrame(() => (translate.value = 0));
    });

    const transitionDuration = computed(
      () => `${40 * (rows.value - row.value) + 40}ms`
    );

    return {
      hexColor,
      win,

      pieceEl,
      translate,
      transitionDuration,
    };
  },
});
</script>

<template>
  <div
    ref="pieceEl"
    class="w-full h-full flex justify-center items-center relative"
  >
    <div
      class="
        absolute
        w-[85%]
        h-[85%]
        rounded-full
        overflow-hidden
        transform
        ease-in
      "
      :class="{
        'transition-transform': translate === 0,
        'transition-none': translate !== 0,
      }"
      :style="{
        backgroundColor: hexColor,
        '--tw-translate-y': `${translate}px`,
        transitionDuration,
      }"
    >
      <div
        v-if="win"
        class="absolute w-full h-full bg-white bg-opacity-50 animate-pulse"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>