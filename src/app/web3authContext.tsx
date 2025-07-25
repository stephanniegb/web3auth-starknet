"use client";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

const isProduction = process.env.NODE_ENV === "production";
const clientId = isProduction
  ? process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
  : process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID_DEV;

if (!clientId) {
  throw new Error(
    "NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is not set –– need to set in .env.local for web3auth to work"
  );
}

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: isProduction
      ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
      : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export default web3AuthContextConfig;
