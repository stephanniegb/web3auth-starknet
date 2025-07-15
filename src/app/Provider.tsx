import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "./web3authContext";
import { StarknetConfig } from "@/context";
import { PaymasterRpc, RpcProvider } from "starknet";
import { mainnet, sepolia } from "@starknet-react/chains";

const isProduction = process.env.NODE_ENV === "production";

const Provider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const chains = [mainnet, sepolia];
  // StarkNet provider setup
  const starknetProvider = new RpcProvider({
    nodeUrl: isProduction
      ? process.env.NEXT_PUBLIC_STARKNET_JSON_RPC_URL_MAINNET
      : process.env.NEXT_PUBLIC_STARKNET_JSON_RPC_URL_SEPOLIA,
  });

  console.log("API Key:", process.env.NEXT_PUBLIC_PAYMASTER_API_KEY);
  const paymasterRpc = new PaymasterRpc({
    nodeUrl: "https://sepolia.paymaster.avnu.fi",
    headers: {
      "x-paymaster-api-key": process.env.NEXT_PUBLIC_PAYMASTER_API_KEY,
    },
  });

  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <StarknetConfig
        chains={chains}
        provider={starknetProvider}
        paymasterProvider={paymasterRpc}
        autoConnect
      >
        {children}
      </StarknetConfig>
    </Web3AuthProvider>
  );
};

export default Provider;
