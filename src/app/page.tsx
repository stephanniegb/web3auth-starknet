"use client";

import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import {
  deployAccount,
  getStarkKey,
  calculateAccountAddress,
  getValidPrivateKey,
} from "./starknetRPC";
import { fetchBalance, transferToken } from "./tokenOperations";
import { useEffect, useState } from "react";
import { Account, RpcProvider } from "starknet";

import LoggedIn from "./LoggedIn";
import LoggedOut from "./LoggedOut";

const isProduction = process.env.NODE_ENV === "production";

export default function Home() {
  // State management
  const [account, setAccount] = useState<Account | null>(null);
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("1");
  const [strkBalance, setStrkBalance] = useState<string>("0");

  // Web3Auth hooks
  const {
    connect,
    isConnected,
    connectorName,
    loading: connectLoading,
    error: connectError,
  } = useWeb3AuthConnect();

  const {
    disconnect,
    loading: disconnectLoading,
    error: disconnectError,
  } = useWeb3AuthDisconnect();

  const { provider: web3authProvider } = useWeb3Auth();
  const { userInfo } = useWeb3AuthUser();

  // StarkNet provider setup
  const starknetProvider = new RpcProvider({
    nodeUrl: isProduction
      ? process.env.NEXT_PUBLIC_STARKNET_JSON_RPC_URL_MAINNET
      : process.env.NEXT_PUBLIC_STARKNET_JSON_RPC_URL_SEPOLIA,
  });

  console.log('API Key:', process.env.NEXT_PUBLIC_PAYMASTER_API_KEY);
  const myPaymasterRpc = new PaymasterRpc({
    nodeUrl: "https://sepolia.paymaster.avnu.fi",
    headers: {
      "x-paymaster-api-key": process.env.NEXT_PUBLIC_PAYMASTER_API_KEY,
    },
  });

  // Effect to get address when provider is available
  useEffect(() => {
    if (!web3authProvider) {
      console.log("provider not initialized yet");
      return;
    }

    const getAddress = async () => {
      const privateKey = await getValidPrivateKey({
        provider: web3authProvider,
      });

      const starkKeyPub = getStarkKey({ privateKey: privateKey });
      if (!starkKeyPub) {
        console.error("Starkey is undefined or null");
        return;
      }

      const { AXcontractAddress } = calculateAccountAddress({
        starkKeyPubAX: starkKeyPub,
      });

      setAddress(AXcontractAddress);
    };

    getAddress();
  }, [web3authProvider]);

  // Effect to fetch balance when address changes
  useEffect(() => {
    if (address) {
      fetchBalance(address, starknetProvider, setStrkBalance);
    }
  }, [address]);

  // Deploy  account functions
  const onDeployAccount = async () => {
    if (!web3authProvider) {
      console.log("provider not initialized yet");
      return;
    }

    setIsLoading(true);
    try {
      const address = await deployAccount({
        web3authProvider,
        starknetProvider,
        paymasterRpc: myPaymasterRpc,
      });
      console.log("New account created.\n   final address =", address);
      setAddress(address);
    } catch (error) {
      console.error("Error deploying account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect account function
  const onConnectAccount = async () => {
    if (!web3authProvider) {
      console.log("provider not initialized yet");
      return;
    }
    setIsLoading(true);
    try {
      const privateKey = await getValidPrivateKey({
        provider: web3authProvider,
      });

      const account = new Account(starknetProvider, address, privateKey);
      setAccount(account);
    } catch (error) {
      console.error("Error connecting account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchBalance = () => {
    fetchBalance(address, starknetProvider, setStrkBalance);
  };

  const handleTransferToken = () => {
    transferToken(
      account!,
      starknetProvider,
      transferRecipient,
      transferAmount,
      setIsLoading
    );
  };

  // Event handlers for UI
  const handleTransferRecipientChange = (value: string) => {
    setTransferRecipient(value);
  };

  const handleTransferAmountChange = (value: string) => {
    setTransferAmount(value);
  };

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Render based on connection state
  if (isConnected) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">
            <a
              target="_blank"
              href="https://web3auth.io/docs/sdk/pnp/web/modal"
              rel="noreferrer"
            >
              Web3Auth
            </a>
            <span className="title-separator">×</span>
            <span>StarkNet Demo</span>
          </h1>
        </header>

        <main className="app-main">
          <LoggedIn
            userInfo={userInfo}
            address={address}
            account={account}
            strkBalance={strkBalance}
            connectorName={connectorName}
            transferRecipient={transferRecipient}
            transferAmount={transferAmount}
            isLoading={isLoading}
            disconnectLoading={disconnectLoading}
            disconnectError={disconnectError}
            onDeployAccount={onDeployAccount}
            onConnectAccount={onConnectAccount}
            onFetchBalance={handleFetchBalance}
            onTransferToken={handleTransferToken}
            onDisconnect={handleDisconnect}
            onTransferRecipientChange={handleTransferRecipientChange}
            onTransferAmountChange={handleTransferAmountChange}
          />
        </main>

        <footer className="app-footer">
          <a
            href="https://github.com/stephanniegb/web3auth-starknet"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            📚 View Source Code
          </a>
        </footer>
      </div>
    );
  } else {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">
            <a
              target="_blank"
              href="https://web3auth.io/docs/sdk/pnp/web/modal"
              rel="noreferrer"
            >
              Web3Auth
            </a>
            <span className="title-separator">×</span>
            <span>StarkNet Demo</span>
          </h1>
        </header>

        <main className="app-main">
          <LoggedOut
            connectLoading={connectLoading}
            connectError={connectError}
            onConnect={handleConnect}
          />
        </main>

        <footer className="app-footer">
          <a
            href="https://github.com/stephanniegb/web3auth-starknet"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            📚 View Source Code
          </a>
        </footer>
      </div>
    );
  }
}
