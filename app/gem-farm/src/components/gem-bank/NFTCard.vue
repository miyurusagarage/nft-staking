<template>
  <div
    class="p-2 card grow-0"
    :class="{ 'card-selected': selected }"
    @click="toggleSelect"
  >
    <div class="justify-center flex-col flex overflow-hidden">
      <div style="white-space: nowrap; font-weight: bold;" class="text-xl pb-2">{{nft.onchainMetadata.data.name}}</div>
      <img
        class="nft-image"
        :src="nft.externalMetadata.image"
        :alt="nft.onchainMetadata.data.name"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
  props: {
    nft: { type: Object, required: true },
  },
  emits: ['selected'],
  setup(props, ctx) {
    const selected = ref<boolean>(false);

    const toggleSelect = () => {
      selected.value = !selected.value;
      console.log('selected', props.nft.mint.toBase58());
      ctx.emit('selected', {
        nft: props.nft,
        selected: selected.value,
      });
    };

    return {
      selected,
      toggleSelect,
    };
  },
});
</script>

<style scoped>
img {
  object-fit: cover;
  aspect-ratio: 1;
}

.card {
  overflow: hidden;
  flex-basis: calc(100% - 0.25rem);
}

@media screen and (min-width: 500px) {
  .card {
    flex-basis: calc(50% - 0.25rem);
  }
}

@media screen and (min-width: 1024px) {
  .card {
    flex-basis: calc(50% - 0.25rem);
  }
}

@media screen and (min-width: 1280px) {
  .card {
    flex-basis: calc(33.2% - 0.25rem);
  }
}

@media screen and (min-width: 1536px) {
  .card {
    flex-basis: calc(25% - 0.25rem);
  }
}

.card-selected {
  @apply border-4 border-solid rounded-md;
  border-color: #e5e5e5 !important;
}

.nft-image {
  @apply rounded-md;
}

</style>
