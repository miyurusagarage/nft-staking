<template>
  <ConfigPane />
  <div v-if="!wallet" class="text-center text-2xl" style="padding-top:40vh">
    Please connect your wallet using the menu button
    </div>
  <div v-else>
    <!--farm address-->
    <!-- <div class="nes-container with-title mb-10">
      <p class="title">Connect to a Farm</p>
      <div class="nes-field mb-5">
        <label for="farm">Farm address:</label>
        <input id="farm" class="nes-input" v-model="farm" />
      </div>
    </div> -->

    <div v-if="farmerAcc && wallet && publicKey">
      <Vault
        :key="farmerAcc"
        class="mb-10"
        :endStake="endStaking"
        :startStake="beginStaking"
        :depositAndBeginStaking="depositAndBeginStaking"
        :withdrawAndBeginStaking="withdrawAndBeginStaking"
        :addNFTs="addGems"
        :vault="farmerAcc.vault.toBase58()"
        :farmerState="farmerState"
        :refreshFarmer="handleRefreshFarmer"
        @selected-wallet-nft="handleNewSelectedNFT"
      >
        
      </Vault>
      
      <br/>
      <br/>

      <div class="nes-container with-title">
        <p class="title">Your Staking Account</p>
        <hr/>
        <div class="card-container mt-3">

          <div class="text-lg flex flex-row flex-wrap gap-4">
            <a-button type="primary" size="large" @click="handleRefreshFarmer">
              Refresh staking account
            </a-button>
            <a-button type="primary" size="large" @click="claim" :disabled="availableB <= 0">
              Claim {{availableB}} Accrued JU
            </a-button>
          </div>
          <br/>
          <div class="text-lg capitalize">Staking Status: {{ farmerState }}</div>
          <br/>
          <div class="text-lg">Total NFTs staked: {{ farmerAcc.gemsStaked }}</div>
          <br/>
          <div class="text-lg">Reward Rate : 1.2 JU per day for one NFT</div>
          <br/>
          <div class="text-lg flex flex-row align-center">
            <div class="mr-4">JU to be paid out : {{availableB}} JU</div>
          </div>
          <br/>
          <div class="text-lg flex flex-row">
            <div class="text-lg">JU Paid out : {{farmerAcc.rewardB.paidOutReward}} JU</div>
          </div>
        </div>
      </div>


      <!-- <button
        v-if="farmerState === 'staked' && selectedNFTs.length > 0"
        class="nes-btn is-primary mr-5"
        @click="addGems"
      >
        Add Gems (resets staking)
      </button>
      <button
        v-if="farmerState === 'staked'"
        class="nes-btn is-error mr-5"
        @click="endStaking"
      >
        End staking
      </button>
      <button
        v-if="farmerState === 'pendingCooldown'"
        class="nes-btn is-error mr-5"
        @click="endStaking"
      >
        End cooldown
      </button> -->
    </div>
    <div v-else>
      <div v-if="wallet && publicKey">
        <div class="w-full text-center mb-5 text-2xl mt-20 mb-10">
          Staking account not found for Wallet.
          <br/>
          Please create a new account
        </div>
        <div class="w-full text-center">
          <a-button type="primary" size="large" @click="initFarmer">
            Create Staking Account
          </a-button>
        </div>
      </div>
      <div v-else style="padding-top:40vh">
        <div class="text-2xl w-full text-center">Connecting to Wallet in Progress</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import useWallet from '@/composables/wallet';
import useCluster from '@/composables/cluster';
import { initGemFarm } from '@/common/gem-farm';
import { PublicKey } from '@solana/web3.js';
import ConfigPane from '@/components/ConfigPane.vue';
import FarmerDisplay from '@/components/gem-farm/FarmerDisplay.vue';
import Vault from '@/components/gem-bank/Vault.vue';
import { INFT } from '@/common/web3/NFTget';
import { BN } from '@project-serum/anchor';
import { findFarmerPDA, stringifyPKsAndBNs } from '@gemworks/gem-farm-ts';

export default defineComponent({
  components: { Vault, FarmerDisplay, ConfigPane },
  setup() {
    const { wallet, publicKey } = useWallet();
    const { cluster, getConnection } = useCluster();

    let gf: any;
    watch([wallet, cluster], async () => {
      await freshStart();
    }, {deep: true});

    //needed in case we switch in from another window
    onMounted(async () => {
      await freshStart();
    });

    // --------------------------------------- farmer details
    const farm = ref<string>();
    const farmAcc = ref<any>();

    const farmerIdentity = ref<string>();
    const farmerAcc = ref<any>();
    const farmerState = ref<string>();

    const availableA = ref<string>();
    const availableB = ref<string>();

    farm.value = "EAepnxAv8dMdPnkNLCV3U2c2ZizmDqiiXYG74setQDe5";

    //auto loading for when farm changes
    watch(farm, async () => {
      await freshStart();
    });

    const updateAvailableRewards = async () => {
      availableA.value = farmerAcc.value.rewardA.accruedReward
        .sub(farmerAcc.value.rewardA.paidOutReward)
        .toString();
      
      var accrued = farmerAcc.value.rewardB.accruedReward;
      console.log("accured" + accrued);
      availableB.value = farmerAcc.value.rewardB.accruedReward
        .sub(farmerAcc.value.rewardB.paidOutReward)
        .toString();
    };

    const fetchFarn = async () => {
      farmAcc.value = await gf.fetchFarmAcc(new PublicKey(farm.value!));
      console.log(
        `farm found at ${farm.value}:`,
        stringifyPKsAndBNs(farmAcc.value)
      );
    };

    const fetchFarmer = async () => {
      const [farmerPDA] = await findFarmerPDA(
        new PublicKey(farm.value!),
        publicKey.value!
      );
      farmerIdentity.value = publicKey.value?.toBase58();
      farmerAcc.value = await gf.fetchFarmerAcc(farmerPDA);
      farmerState.value = gf.parseFarmerState(farmerAcc.value);
      await updateAvailableRewards();
      console.log(
        `farmer found at ${farmerIdentity.value}:`,
        stringifyPKsAndBNs(farmerAcc.value)
      );
    };

    const freshStart = async () => {
      if (wallet.value && getConnection()) {
        gf = await initGemFarm(getConnection(), wallet.value!);
        farmerIdentity.value = publicKey.value?.toBase58();

        //reset stuff
        farmAcc.value = undefined;
        farmerAcc.value = undefined;
        farmerState.value = undefined;
        availableA.value = undefined;
        availableB.value = undefined;

        try {
          await fetchFarn();
          await fetchFarmer();
        } catch (e) {
          console.log(`farm with PK ${farm.value} not found :(`);
        }
      }
    };

    const initFarmer = async () => {
      await gf.initFarmerWallet(new PublicKey(farm.value!));
      await fetchFarmer();
    };

    // --------------------------------------- staking
    const beginStaking = async () => {
      await gf.stakeWallet(new PublicKey(farm.value!));
      await fetchFarmer();
      selectedNFTs.value = [];
    };

    const depositAndBeginStaking = async (
      bank: PublicKey,
      vault: PublicKey,
      gemAmount: BN,
      gemMint: PublicKey,
      gemSource: PublicKey,
      creator: PublicKey
    ) => {
        const result = await gf.unstakeThenDepositAndStakeWallet(new PublicKey(farm.value!), bank, vault, gemAmount, gemMint, gemSource, creator, farmerState.value !== 'unstaked' );
        return result;
    };

    const withdrawAndBeginStaking = async (
      bank: PublicKey,
      vault: PublicKey,
      gemAmount: BN,
      gemMint: PublicKey,
      shouldStake: boolean
    ) => {
      const result = await gf.unstakeThenWithdrawAndStakeWallet(new PublicKey(farm.value!), bank, vault, gemAmount, gemMint, shouldStake);
        return result;
    }

    const endStaking = async () => {
      await gf.unstakeWallet(new PublicKey(farm.value!));
      // await fetchFarmer();
      selectedNFTs.value = [];
    };

    const claim = async () => {
      await gf.claimWallet(
        new PublicKey(farm.value!),
        new PublicKey(farmAcc.value.rewardA.rewardMint!),
        new PublicKey(farmAcc.value.rewardB.rewardMint!)
      );
      await fetchFarmer();
    };

    const handleRefreshFarmer = async () => {
      await gf.refreshFarmerWallet(
        new PublicKey(farm.value!),
        new PublicKey(publicKey.value!)
      );
      await fetchFarmer();
    };

    // --------------------------------------- adding extra gem
    const selectedNFTs = ref<INFT[]>([]);

    const handleNewSelectedNFT = (newSelectedNFTs: INFT[]) => {
      console.log(`selected ${newSelectedNFTs.length} NFTs`);
      selectedNFTs.value = newSelectedNFTs;
    };

    const addSingleGem = async (
      gemMint: PublicKey,
      gemSource: PublicKey,
      creator: PublicKey
    ) => {
      await gf.flashDepositWallet(
        new PublicKey(farm.value!),
        '1',
        gemMint,
        gemSource,
        creator
      );
      await fetchFarmer();
    };

    const addGems = async () => {
      await Promise.all(
        selectedNFTs.value.map((nft) => {
          const creator = new PublicKey(
            //todo currently simply taking the 1st creator
            (nft.onchainMetadata as any).data.creators[0].address
          );
          console.log('creator is', creator.toBase58());

          addSingleGem(nft.mint, nft.pubkey!, creator);
        })
      );
      console.log(
        `added another ${selectedNFTs.value.length} gems into staking vault`
      );
    };

    return {
      wallet,
      publicKey,
      farm,
      farmAcc,
      farmer: farmerIdentity,
      farmerAcc,
      farmerState,
      availableA,
      availableB,
      initFarmer,
      beginStaking,
      endStaking,
      depositAndBeginStaking,
      withdrawAndBeginStaking,
      claim,
      handleRefreshFarmer,
      selectedNFTs,
      handleNewSelectedNFT,
      addGems,
    };
  },
});
</script>

<style scoped></style>
