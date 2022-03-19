<template>
  <div class="flex justify-center">
    <!-- <div class="nes-select is-dark flex-1">
      <select required id="cluster" v-model="chosenCluster">
        <option :value="Cluster.Devnet">Devnet</option>
        <option :value="Cluster.Testnet">Testnet</option>
        <option :value="Cluster.Mainnet">Mainnet</option>
        <option :value="Cluster.Localnet">Localnet</option>
      </select>
    </div> -->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import useCluster, { Cluster } from '@/composables/cluster';

export default defineComponent({
  setup() {
    // cluster
    const { cluster, setCluster, getClusterURL } = useCluster();
    const chosenCluster = computed({
      get() {
        return cluster.value;
      },
      set(newVal: Cluster) {
        setCluster(newVal);
      },
    });

    setCluster(Cluster.Mainnet);

    return {
      Cluster,
      chosenCluster
    };
  },
});
</script>

<style scoped></style>
