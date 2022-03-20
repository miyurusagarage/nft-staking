<template>
  <div class="nes-container with-title mb-10 container mx-auto text-center" style="max-width:600px;">
    <p class="title text-center">Welcome to JuJuverse Staking!</p>
    <p class="mt-5 text-center text-lg">
      Stake your JuJuverse NFTs to receive $JU tokens!
    </p>
    <a-button type="primary" size="large" class="mt-5" href="/vault">Go to Staking Vault</a-button>
    <p class="mt-7 pb-5 text-center text-md">
      Find more in depth information on JuJuverse NFT staking
      <br/>
      <a class="text-base" href="https://jujuverse.gitbook.io/jujuverse/the-game/hold-to-earn" target="_blank"
        >
        <div class="mt-2">
          <FileTextOutlined :style="{fontSize: '15px', color: 'white'}" class="mb-2" />
          <p>Whitepaper</p>
        </div>
      </a
      >
    </p>
  </div>
</template>

<script setup lang="ts">
import { FileTextOutlined } from '@ant-design/icons-vue';
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { GEM_FARM_PROG_ID } from '@gemworks/gem-farm-ts';
export default defineComponent({
  setup() {
    return {
      GEM_FARM_PROG_ID,
    };
  },
});
</script>
<style scoped></style>
