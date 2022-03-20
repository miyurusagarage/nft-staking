<template>
  <nav class="flex flex-row justify-between items-center py-2 px-5">
    <a href="/">
      <img src="../assets/juju-logo.png" style="height: 70px"/>
    </a>
    <TheCat />
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import NavButton from '@/components/NavButton.vue';
import TheCat from '@/components/gem-farm/TheCat.vue';

export default defineComponent({
  components: { NavButton, TheCat },
  setup() {
    const route = useRoute();
    const path = computed(() => route.path);

    const menu = [
      { name: '/', url: '/' },
      { name: 'FARM MANAGER', url: '/manager' },
      { name: 'FARMER', url: '/farmer' },
    ];

    return {
      menu,
      path,
    };
  },
});
</script>

<style scoped>
.active {
  @apply bg-white text-black;
}

.more {
  @apply px-10 py-3 text-white
  hover:bg-white hover:text-black;
  outline: none;
}
</style>
