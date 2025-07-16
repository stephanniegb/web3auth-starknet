"use client";

import { getDeploymentStatus } from "./starknetRPC";
import { fetchBalance, transferToken } from "./tokenOperations";
import { useState } from "react";
import { Account } from "starknet";

import LoggedIn from "./LoggedIn";
import LoggedOut from "./LoggedOut";
import { useStarknet } from "@/context/starknet";
import { useAccount } from "@/hooks/use-account";
import { useWeb3AuthStatus } from "@/hooks/use-web3auth-status";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("1");
  const [strkBalance, setStrkBalance] = useState<string>("0");

  const { provider: starknetProvider, connect, disconnect } = useStarknet();
  const {
    account,
    address,
    web3AuthConnection,
    web3AuthDisconnect,
    userInfo,
    web3AuthConnectorError,
  } = useAccount();

  // New Web3Auth status hook for better error handling and user feedback
  const {
    status: web3AuthStatus,
    isConnected: isWeb3AuthConnected,
    isInitializing: isWeb3AuthInitializing,
    initError: web3AuthInitError,
    error: starknetError,
    hasError,
    getErrorMessage,
    isReady,
  } = useWeb3AuthStatus();

  console.log("🔄 StarknetPage values:", {
    starknetProvider,
    account,
    address,
    web3AuthConnection,
    web3AuthDisconnect,
    userInfo,
    // Web3Auth status for debugging
    web3AuthStatus,
    isWeb3AuthConnected,
    isWeb3AuthInitializing,
    web3AuthInitError,
    starknetError,
    hasError,
    isReady,
  });

  const handleFetchBalance = () => {
    fetchBalance(address as string, starknetProvider, setStrkBalance);
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

  const handleGetDeploymentStatus = () => {
    getDeploymentStatus({
      contractAddress: address as string,
      starknetProvider,
    });
  };

  // Render based on connection state
  if (web3AuthConnection?.isConnected) {
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
            address={address as string}
            account={account as Account}
            strkBalance={strkBalance}
            connectorName={web3AuthConnection?.connectorName ?? null}
            transferRecipient={transferRecipient}
            transferAmount={transferAmount}
            isLoading={isLoading}
            disconnectLoading={web3AuthDisconnect?.loading ?? false}
            disconnectError={web3AuthConnectorError}
            onDeployAccount={() => {}}
            onConnectAccount={() => {}}
            onFetchBalance={handleFetchBalance}
            onTransferToken={handleTransferToken}
            onDisconnect={handleDisconnect}
            onTransferRecipientChange={handleTransferRecipientChange}
            onTransferAmountChange={handleTransferAmountChange}
            onGetDeploymentStatus={handleGetDeploymentStatus}
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
            connectLoading={web3AuthConnection?.loading ?? false}
            connectError={web3AuthConnection?.error}
            web3AuthStatus={web3AuthStatus}
            isWeb3AuthInitializing={isWeb3AuthInitializing}
            web3AuthInitError={web3AuthInitError}
            starknetError={starknetError}
            hasError={hasError}
            errorMessage={getErrorMessage()}
            isReady={isReady}
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
