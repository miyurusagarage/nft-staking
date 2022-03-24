
   
import { createApp } from 'vue';
import App from './App.vue'
import Antd from 'ant-design-vue';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import router from './router';
import './index.css';


import SolanaWallets from 'solana-wallets-vue';

// You can either import the default styles or create your own.
import 'solana-wallets-vue/styles.css';
import 'ant-design-vue/dist/antd.css';

import {
  TorusWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';

const walletOptions = {
    wallets: [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet}),
      new SolletWalletAdapter({ network: WalletAdapterNetwork.Mainnet}),
      new SolletExtensionWalletAdapter({ network: WalletAdapterNetwork.Mainnet}),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    autoConnect: true,
  }

//initWallet(walletOptions);

createApp(App)
.use(router)
.use(Antd)
.use(SolanaWallets, walletOptions)
.mount('#app');