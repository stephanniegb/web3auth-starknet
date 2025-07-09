"use client";
import React from "react";
import {
  StarknetConfig,
  jsonRpcProvider,
  publicProvider,
} from "@starknet-react/core";
import { sepolia, mainnet, Chain } from "@starknet-react/chains";

const StarknetProvider = ({ children }: { children: React.ReactNode }) => {
  const chains = [sepolia];
  const provider = jsonRpcProvider({
    rpc: (chain) => ({
      nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
    }),
  });
  return (
    <StarknetConfig chains={chains} provider={provider}>
      {children}
    </StarknetConfig>
  );
};

export default StarknetProvider;
