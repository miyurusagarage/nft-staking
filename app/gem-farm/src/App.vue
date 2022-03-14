<template>
  <div class="relative h-full min-h-screen container mx-auto" style="padding-bottom:120px">
    <TheNavBar />
    <div class="p-5 pt-5">
      <router-view />
    </div>
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
  font-family: 'Oxanium', monospace;
}
input[type='radio']:checked + span {
  @apply text-black;
}
</style>
