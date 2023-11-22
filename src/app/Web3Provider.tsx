"use client";

import { FC, PropsWithChildren } from "react";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { zora } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';


const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;


const { chains, publicClient } = configureChains(
  [zora],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://rpc.zora.energy/`,
      }),
    }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Lucky Buttons",
  projectId: PROJECT_ID,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <WagmiConfig config={wagmiConfig}>
    <RainbowKitProvider theme={darkTheme()} chains={chains}>{children}</RainbowKitProvider>
  </WagmiConfig>
);

export default Web3Provider;