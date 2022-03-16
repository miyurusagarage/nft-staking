<template>
  <!--control buttons-->
  <!-- <div 
    v-if="
          (toWalletNFTs && toWalletNFTs.length) ||
          (toVaultNFTs && toVaultNFTs.length)
        "
    class="mb-10 flex justify-center">
    <button
      class="nes-btn is-primary mr-5"
      @click="moveNFTsOnChain"
    >
      Move Gems!
    </button>
    <slot />
  </div> -->

  <a-spin :spinning="isLoading">
  <!--wallet + vault view-->
    <div class="flex items-stretch flex-wrap gap-3">
      <!--left-->
      <div class="flex-1 self-stretch flex flex-col">
      
        <a-select
            v-model:value="collectionFilter"
            mode="multiple"
            style="width: 100%"
            placeholder="Filter by NFT collection"
            option-label-prop="label"
            class="mb-3"
            size="large"
          >
            <a-select-option value="Collection_Name" label="JuJu Devils">
              <div class="flex flex-row">
                <span><img style="width: 40px" src="../../assets/juju-logo.png"></span>
                <div class="ml-5 flex items-center">
                  <div class="text-lg">JuJu Devils</div>
                </div>
              </div>
            </a-select-option>
        </a-select>

        <NFTGrid
          class="flex-1"
          title="Your wallet"
          :nfts="computedDesiredWalletNFTs"
          @selected="handleWalletSelected"
        >

        </NFTGrid>

        <a-button
          class="w-full mt-3"
          type="primary" 
          size="large"
          block
          @click="stakeNFTs"
          :disabled="selectedWalletNFTs.length < 1"
        >
          Stake selected {{selectedWalletNFTs.length}} NFTs
        </a-button>
      </div>

      <!--right-->
      <div class="flex-1 flex flex-col self-stretch">
        <NFTGrid
          v-if="bank && vault"
          title="Staking vault"
          class="flex-1 justify-self-stretch"
          :nfts="desiredVaultNFTs"
          @selected="handleVaultSelected"
        >
        </NFTGrid>
        <a-button
          class="mt-3"
          type="primary"
          v-if="farmerState == 'unstaked' && desiredVaultNFTs.length > 0"
          @click="startStaking"
          size="large">
          Start Staking
        </a-button>
        <a-button
          size="large"
          class="w-full mt-3"
          type="primary" 
          block
          @click="unstakeNFTs"
          :left="true"
          :disabled="selectedVaultNFTs.length < 1"
        >
          Unstake selected {{selectedVaultNFTs.length}} NFTs
        </a-button>
      </div>
    </div>
  </a-spin>

</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, computed } from 'vue';
import NFTGrid from '@/components/gem-bank/NFTGrid.vue';
import ArrowButton from '@/components/ArrowButton.vue';
import useWallet from '@/composables/wallet';
import useCluster from '@/composables/cluster';
import {
  getNFTMetadataForMany,
  getNFTsByOwner,
  INFT,
} from '@/common/web3/NFTget';
import { initGemBank } from '@/common/gem-bank';
import { PublicKey } from '@solana/web3.js';
import { getListDiffBasedOnMints, removeManyFromList } from '@/common/util';
import { BN } from '@project-serum/anchor';
import { Func } from 'mocha';

export default defineComponent({
  components: { ArrowButton, NFTGrid },
  props: {
    vault: String,
    farmerState: String,
    startStake: Function,
    endStake: Function,
    refreshFarmer: Function,
    addNFTs: Function,
    depositAndBeginStaking: Function,
    withdrawAndBeginStaking: Function
  },
  emits: ['selected-wallet-nft'],
  setup(props: any, ctx) {
    const { wallet, publicKey } = useWallet();
    const { cluster, getConnection } = useCluster();

    // --------------------------------------- state

    //current walet/vault state
    const currentWalletNFTs = ref<INFT[]>([]);
    const currentVaultNFTs = ref<INFT[]>([]);
    //selected but not yet moved over in FE
    const selectedWalletNFTs = ref<INFT[]>([]);
    const selectedVaultNFTs = ref<INFT[]>([]);
    //moved over in FE but not yet onchain
    const desiredWalletNFTs = ref<INFT[]>([]);
    const desiredVaultNFTs = ref<INFT[]>([]);
    //moved over onchain
    const toWalletNFTs = ref<INFT[]>([]);
    const toVaultNFTs = ref<INFT[]>([]);

    const collectionFilter = ref<string[]>(["Collection_Name"]);
    const enabledCollections = ["Collection_Name", "numbers"];

    const isLoading = ref<boolean>(false);

    // --------------------------------------- populate initial nfts

    const populateWalletNFTs = async () => {
      // zero out to begin with
      currentWalletNFTs.value = [];
      selectedWalletNFTs.value = [];
      desiredWalletNFTs.value = [];

      if (wallet.value) {
        currentWalletNFTs.value = await getNFTsByOwner(
          publicKey.value!,
          getConnection()
        );
        desiredWalletNFTs.value = [...currentWalletNFTs.value];

        console.log(desiredWalletNFTs.value);
      }
    };

    const populateVaultNFTs = async () => {
      // zero out to begin with
      currentVaultNFTs.value = [];
      selectedVaultNFTs.value = [];
      desiredVaultNFTs.value = [];

      const foundGDRs = await gb.fetchAllGdrPDAs(vault.value);
      if (foundGDRs && foundGDRs.length) {
        gdrs.value = foundGDRs;
        console.log(`found a total of ${foundGDRs.length} gdrs`);

        const mints = foundGDRs.map((gdr: any) => {
          return { mint: gdr.account.gemMint };
        });
        currentVaultNFTs.value = await getNFTMetadataForMany(
          mints,
          getConnection()
        );
        desiredVaultNFTs.value = [...currentVaultNFTs.value];
        console.log(
          `populated a total of ${currentVaultNFTs.value.length} vault NFTs`
        );
        console.log(desiredVaultNFTs.value)
      }
    };

    const updateVaultState = async () => {
      vaultAcc.value = await gb.fetchVaultAcc(vault.value);
      bank.value = vaultAcc.value.bank;
      vaultLocked.value = vaultAcc.value.locked;
    };

    watch([wallet, cluster], async () => {
      gb = await initGemBank(getConnection(), wallet.value);

      //populate wallet + vault nfts
      await Promise.all([populateWalletNFTs(), populateVaultNFTs()]);
    });

    onMounted(async () => {
      gb = await initGemBank(getConnection(), wallet.value);

      //prep vault + bank variables
      vault.value = new PublicKey(props.vault!);
      await updateVaultState();

      //populate wallet + vault nfts
      await Promise.all([populateWalletNFTs(), populateVaultNFTs()]);
    });

    // --------------------------------------- moving nfts

    const handleWalletSelected = (e: any) => {
      if (e.selected) {
        selectedWalletNFTs.value.push(e.nft);
      } else {
        const index = selectedWalletNFTs.value.indexOf(e.nft);
        selectedWalletNFTs.value.splice(index, 1);
      }
      ctx.emit('selected-wallet-nft', selectedWalletNFTs.value);
    };

    const handleVaultSelected = (e: any) => {
      if (e.selected) {
        selectedVaultNFTs.value.push(e.nft);
      } else {
        const index = selectedVaultNFTs.value.indexOf(e.nft);
        selectedVaultNFTs.value.splice(index, 1);
      }
    };

    const moveNFTsToWallet = () => {
      //push selected vault nfts into desired wallet
      desiredWalletNFTs.value.push(...selectedVaultNFTs.value);
      //remove selected vault nfts from desired vault
      removeManyFromList(selectedVaultNFTs.value, desiredVaultNFTs.value);
    }

    const moveNFTsToVault = () => {
      //push selected wallet nfts into desired vault
      desiredVaultNFTs.value.push(...selectedWalletNFTs.value);
      //remove selected wallet nfts from desired wallet
      removeManyFromList(selectedWalletNFTs.value, desiredWalletNFTs.value);
    }

    const unstakeNFTs = () => {
      isLoading.value = true;
      moveNFTsToWallet();
      setTimeout(async () => {
        var refreshFarmer = props.refreshFarmer as Function;
        var withdrawAndBeginStaking = props.withdrawAndBeginStaking as Function;
        try {
          for (const nft of toWalletNFTs.value) {
            await withdrawAndBeginStaking(
              bank.value,
              vault.value,
              new BN(1),
              nft.mint
            );
          }
          await Promise.all([populateWalletNFTs(), populateVaultNFTs()]);
          refreshFarmer();
        } catch(e) {
          alert(e)
          console.log(e)
          selectedWalletNFTs.value = selectedVaultNFTs.value;
          moveNFTsToVault();
          selectedVaultNFTs.value = [];
        }
        
        isLoading.value = false;

      }, 1000);
    };

    const stakeNFTs = () => {
      isLoading.value = true;
      moveNFTsToVault();
      setTimeout(async () => {
        var startStake = props.startStake as Function;
        var refreshFarmer = props.refreshFarmer as Function;
        var depositAndBeginStaking = props.depositAndBeginStaking as Function;
        
        try {
          for (const nft of toVaultNFTs.value) {
            console.log(nft);
            const creator = new PublicKey(
              //todo currently simply taking the 1st creator
              (nft.onchainMetadata as any).data.creators[0].address
            );
            console.log('creator is', creator.toBase58());

            const tx = await depositAndBeginStaking(
              bank.value,
              vault.value,
              new BN(1),
              nft.mint,
              nft.pubkey!,
              creator
            );

            console.log(tx)
          }
          selectedWalletNFTs.value = [];
        } catch(e) {
          alert(e);
          console.log(e)
          selectedVaultNFTs.value = selectedWalletNFTs.value;
          moveNFTsToWallet();
          selectedWalletNFTs.value = [];
          isLoading.value = false;
        }

        if(isLoading.value) {
          await Promise.all([populateWalletNFTs(), populateVaultNFTs()]);
          await refreshFarmer();
          isLoading.value = false;
        }

      }, 1000);
    }

    const startStaking = async () => {
      var startStake = props.startStake as Function;
      await startStake();
    }

    const withdrawNFTsFromChain = async () => {
      for (const nft of toWalletNFTs.value) {
        await withdrawGem(nft.mint);
      }
    }

    //to vault = vault desired - vault current
    watch(
      desiredVaultNFTs,
      () => {
        toVaultNFTs.value = getListDiffBasedOnMints(
          desiredVaultNFTs.value,
          currentVaultNFTs.value
        );
        console.log('to vault nfts are', toVaultNFTs.value);
      },
      { deep: true }
    );

    //to wallet = wallet desired - wallet current
    watch(
      desiredWalletNFTs,
      () => {
        toWalletNFTs.value = getListDiffBasedOnMints(
          desiredWalletNFTs.value,
          currentWalletNFTs.value
        );
        console.log('to wallet nfts are', toWalletNFTs.value);
      },
      { deep: true }
    );

    // --------------------------------------- gem bank

    let gb: any;
    const bank = ref<PublicKey>();
    const vault = ref<PublicKey>();
    const vaultAcc = ref<any>();
    const gdrs = ref<PublicKey[]>([]);
    const vaultLocked = ref<boolean>(false);

    const depositGem = async (
      mint: PublicKey,
      creator: PublicKey,
      source: PublicKey
    ) => {
      const { txSig } = await gb.depositGemWallet(
        bank.value,
        vault.value,
        new BN(1),
        mint,
        source,
        creator
      );
      console.log('deposit done', txSig);
    };

    const withdrawGem = async (mint: PublicKey) => {
      const { txSig } = await gb.withdrawGemWallet(
        bank.value,
        vault.value,
        new BN(1),
        mint
      );
      console.log('withdrawal done', txSig);
    };

    // --------------------------------------- return

    const computedDesiredWalletNFTs = computed(()=> {
      // if (!collectionFilter || collectionFilter.value.length == 0 || !desiredWalletNFTs.value) return desiredWalletNFTs;
      var filteredNFTs = desiredWalletNFTs.value.filter(i => collectionFilter.value.length < 1 || (i.externalMetadata as any).collection && collectionFilter.value.indexOf((i.externalMetadata as any).collection.name) != -1);
      return filteredNFTs.filter(i => (i.externalMetadata as any).collection && enabledCollections.indexOf((i.externalMetadata as any).collection.name) != -1);
    });

    return {
      wallet,
      desiredWalletNFTs,
      desiredVaultNFTs,
      selectedWalletNFTs,
      selectedVaultNFTs,
      toVaultNFTs,
      toWalletNFTs,
      handleWalletSelected,
      handleVaultSelected,
      stakeNFTs,
      unstakeNFTs,
      withdrawNFTsFromChain,
      bank,
      // eslint-disable-next-line vue/no-dupe-keys
      vault,
      vaultLocked,
      collectionFilter,
      computedDesiredWalletNFTs,
      enabledCollections,
      isLoading,
      farmerState: props.farmerState,
      startStaking
    };
  },
});
</script>

<style scoped>
.locked {
  @apply text-center bg-black text-white;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.7;
  z-index: 10;
}
</style>
