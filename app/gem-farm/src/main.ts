
   
import { createApp } from 'vue'
import App from './App.vue'
import { initWallet } from 'solana-wallets-vue';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import router from './router';
import './index.css';


import SolanaWallets from 'solana-wallets-vue';

// You can either import the default styles or create your own.
import 'solana-wallets-vue/styles.css';

import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

const walletOptions = {
    wallets: [
      new PhantomWalletAdapter({network: WalletAdapterNetwork.Devnet}),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet}),
    ],
    autoConnect: true,
  }

//initWallet(walletOptions);

createApp(App)
.use(router)
.use(SolanaWallets, walletOptions)
.mount('#app');