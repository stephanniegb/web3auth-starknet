"use client";

import { getDeploymentStatus } from "./starknetRPC";
import { fetchBalance, transferToken } from "./tokenOperations";
import { useState } from "react";
import { Account } from "starknet";

import LoggedIn from "./LoggedIn";
import LoggedOut from "./LoggedOut";
import { useStarknet } from "@/context/starknet";
import { useStarknetAccount } from "@/context/account";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("1");
  const [strkBalance, setStrkBalance] = useState<string>("0");

  const { provider: starknetProvider, connect, disconnect } = useStarknet();
  const { account, address, web3AuthConnection, web3AuthDisconnect, userInfo } =
    useStarknetAccount();

  console.log({
    starknetProvider,
    account,
    address,
    web3AuthConnection,
    web3AuthDisconnect,
    userInfo,
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
            disconnectError={web3AuthDisconnect?.error}
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
