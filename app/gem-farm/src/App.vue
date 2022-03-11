<template>
  <div class="relative h-full min-h-screen">
    <TheNavBar />
    <div class="p-10">
      <router-view />
    </div>

    <div class="pt-10"></div>
    <TheFooter />
  </div>
</template>

<script>
import TheNavBar from '@/components/TheNavBar';
import TheFooter from '@/components/gem-farm/TheFooter';
export default {
  components: { TheFooter, TheNavBar },
};
</script>

<style>
* {
  font-family: monospace;
}
input[type='radio']:checked + span {
  @apply text-black;
}
</style>
