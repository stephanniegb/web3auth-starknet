"use client";

import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import {
  getPrivateKey,
  deployAccount,
  getStarkKey,
  calculateAccountAddress,
} from "./starknetRPC";
import { useEffect, useState } from "react";
import { Account, Contract, RpcProvider } from "starknet";
import { CONTRACT_ABI } from "@/abi";
import { CONTRACT_ADDRESS } from "@/address";
import Image from "next/image";

export default function Home() {
  const [account, setAccount] = useState<Account | null>(null);
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // IMP START - Login
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

  const { provider } = useWeb3Auth();
  const starknetProvider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8",
  });
  const { userInfo } = useWeb3AuthUser();

  useEffect(() => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const getAddress = async () => {
      const privateKey = await getPrivateKey({ provider });
      const validPrivateKey = `0x${privateKey}`;
      const starkKeyPub = await getStarkKey({ privateKey: validPrivateKey });
      if (!starkKeyPub) {
        console.error("Starkey is undefined or null");
        return;
      }

      const { OZcontractAddress } = calculateAccountAddress({
        starkKeyPub: starkKeyPub,
      });

      setAddress(OZcontractAddress);
    };

    getAddress();
  }, [provider]);

  const onDeployAccount = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }

    setIsLoading(true);
    try {
      const address = await deployAccount({ provider, starknetProvider });
      console.log("New account created.\n   final address =", address);
      setAddress(address);
    } catch (error) {
      console.error("Error deploying account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onConnectAccount = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }

    setIsLoading(true);
    try {
      const rawPrivateKey = await getPrivateKey({ provider });
      const privateKey = rawPrivateKey.startsWith("0x")
        ? rawPrivateKey
        : `0x${rawPrivateKey}`;
      console.log("🔑 Private key:", privateKey);

      const account = new Account(starknetProvider, address, privateKey);
      setAccount(account);

      console.log("Account instance created:", account);
    } catch (error) {
      console.error("Error connecting account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testContract = async () => {
    const contract = new Contract(
      CONTRACT_ABI,
      CONTRACT_ADDRESS,
      starknetProvider
    );

    console.log("✅ contract instance created:", contract);

    if (!starknetProvider) {
      console.log("starknetProvider not initialized yet");
      return;
    }

    try {
      const res = await contract.total_supply();
      console.log("contract response:", res);
    } catch (error) {
      console.log(error);
    }
  };

  const transferToken = async () => {
    if (!account) {
      console.log("Account not initialized yet");
      return;
    }

    if (!starknetProvider) {
      console.log("starknetProvider not initialized yet");
      return;
    }

    setIsLoading(true);
    try {
      const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, account);
      const res = await contract.transfer(
        "0x059c368766C1E9699e21A099B3AEA95abC96A67aE36096aEB27891Dd3eE89bEA",
        "1000000000000000000"
      );
      await starknetProvider.waitForTransaction(res.transaction_hash);
      console.log("Transfer successful:", res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loggedInView = (
    <div className="dashboard">
      {/* User Profile Section */}
      <div className="profile-section">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {userInfo?.profileImage ? (
                <Image
                  src={userInfo.profileImage}
                  alt={userInfo?.name || "User"}
                  className="avatar-image"
                  width={100}
                  height={100}
                  unoptimized
                />
              ) : (
                <div className="avatar-placeholder">
                  {userInfo?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{userInfo?.name || "User"}</h2>
              <p className="profile-email">{userInfo?.email}</p>
              <div className="connection-badge">
                <span className="badge-icon">🔗</span>
                Connected via {userInfo?.authConnectionId || connectorName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="wallet-section">
        <h3 className="section-title">Wallet Information</h3>
        <div className="wallet-card">
          <div className="wallet-info">
            <div className="info-item">
              <span className="info-label">Wallet Address:</span>
              <span className="info-value text-sm">
                {address || "Click 'Deploy Account' to create wallet"}
              </span>
            </div>
            {account && (
              <div className="info-item">
                <span className="info-label">Account Status:</span>
                <span className="status-connected">✅ Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="actions-section">
        <h3 className="section-title">Blockchain Actions</h3>
        <div className="actions-grid">
          <button
            onClick={onDeployAccount}
            className="action-button primary"
            disabled={isLoading}
          >
            {isLoading ? "⏳ Processing..." : "🚀 Deploy Account"}
          </button>

          <button
            onClick={onConnectAccount}
            className="action-button secondary"
            disabled={isLoading}
          >
            {isLoading ? "⏳ Processing..." : "🔗 Connect Account"}
          </button>

          <button
            onClick={testContract}
            className="action-button secondary"
            disabled={isLoading}
          >
            {isLoading ? "⏳ Processing..." : "📋 Test Contract"}
          </button>

          <button
            onClick={transferToken}
            className="action-button accent"
            disabled={isLoading}
          >
            {isLoading ? "⏳ Processing..." : "💸 Transfer 1 STRK Token"}
          </button>
        </div>
      </div>

      {/* Disconnect Section */}
      <div className="disconnect-section">
        <button
          onClick={() => disconnect()}
          className="disconnect-button"
          disabled={disconnectLoading}
        >
          {disconnectLoading ? "Disconnecting..." : "🔓 Disconnect"}
        </button>
        {disconnectError && (
          <div className="error-message">{disconnectError.message}</div>
        )}
      </div>
    </div>
  );

  const unloggedInView = (
    <div className="login-section">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome to Web3Auth Demo</h2>
          <p className="login-subtitle">
            Connect your wallet to explore StarkNet functionality
          </p>
        </div>

        <button
          onClick={() => connect()}
          className="login-button"
          disabled={connectLoading}
        >
          {connectLoading ? (
            <>
              <span className="loading-spinner"></span>
              Connecting...
            </>
          ) : (
            <>
              <span className="button-icon">🔐</span>
              Login with Web3Auth
            </>
          )}
        </button>

        {connectError && (
          <div className="error-message">{connectError.message}</div>
        )}
      </div>
    </div>
  );

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
        {isConnected ? loggedInView : unloggedInView}
      </main>

      <footer className="app-footer">
        <a
          href="https://github.com/Web3Auth/web3auth-examples/tree/main/quick-starts/react-quick-start"
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
