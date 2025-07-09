"use client";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

const clientId =
  "BEQc78qNSC_nE4sh2YSf6MPK4mep2CLELdQ3jPU85y8YrRX3pGBxHV4Yx9hcEoEL_3gg8TUdTL0wST9HV0YHp3A";
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export default web3AuthContextConfig;
