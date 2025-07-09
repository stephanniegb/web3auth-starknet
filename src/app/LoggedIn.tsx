"use client";

import Image from "next/image";

interface LoggedInProps {
  userInfo?: any;
  address: string;
  account?: any;
  strkBalance: string;
  connectorName?: any;
  transferRecipient: string;
  transferAmount: string;
  isLoading: boolean;
  disconnectLoading: boolean;
  disconnectError?: any;
  onDeployAccount: () => void;
  onConnectAccount: () => void;
  onFetchBalance: () => void;
  onTransferToken: () => void;
  onDisconnect: () => void;
  onTransferRecipientChange: (value: string) => void;
  onTransferAmountChange: (value: string) => void;
}

export default function LoggedIn({
  userInfo,
  address,
  account,
  strkBalance,
  connectorName,
  transferRecipient,
  transferAmount,
  isLoading,
  disconnectLoading,
  disconnectError,
  onDeployAccount,
  onConnectAccount,
  onFetchBalance,
  onTransferToken,
  onDisconnect,
  onTransferRecipientChange,
  onTransferAmountChange,
}: LoggedInProps) {
  return (
    <div className="dashboard">
      {/* Left Column */}
      <div className="dashboard-left">
        {/* User Profile Section */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-info">
                <div className="flex items-center mb-4 gap-4">
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
                  <div>
                    <h2 className="profile-name">{userInfo?.name || "User"}</h2>
                    <p className="profile-email">{userInfo?.email}</p>
                  </div>
                </div>
                <div className="balance-display">
                  <span className="balance-label">Address:</span>
                  <span className="balance-value whitespace-normal">
                    {address || "Click 'Deploy Account' to create wallet"}
                  </span>
                </div>
                <div className="balance-display">
                  <span className="balance-label">STRK Balance:</span>
                  <span className="balance-value">{strkBalance} STRK</span>
                </div>
                <div className="connection-badge">
                  <span className="badge-icon">🔐</span>
                  Logged in via {userInfo?.authConnectionId || connectorName}
                </div>
                <div
                  className={`connection-badge ml-4 ${
                    address && account ? "connected" : "not-connected"
                  }`}
                >
                  <span className="badge-icon">
                    {address && account ? "🔗" : "❌"}
                  </span>
                  {address && account
                    ? "Connected to StarkNet"
                    : "Not Connected "}
                </div>
              </div>
            </div>
          </div>
        </div>

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
            onClick={onFetchBalance}
            className="action-button secondary"
            disabled={isLoading}
          >
            {isLoading ? "⏳ Processing..." : "🔄 Refresh Balance"}
          </button>
        </div>

        {/* Actions Section */}
        <div className="actions-section">
          {/* Transfer Input Fields */}
          <div className=" flex  gap-4 my-4">
            <div className="input-group  w-full">
              <label htmlFor="recipient" className="input-label">
                Recipient Address:
              </label>
              <input
                id="recipient"
                type="text"
                value={transferRecipient}
                onChange={(e) => onTransferRecipientChange(e.target.value)}
                placeholder="0x..."
                className="input-field"
              />
            </div>
            <div className="input-group w-full">
              <label htmlFor="amount" className="input-label">
                Amount (STRK):
              </label>
              <input
                id="amount"
                type="number"
                value={transferAmount}
                onChange={(e) => onTransferAmountChange(e.target.value)}
                placeholder="1"
                min="0.000001"
                step="0.000001"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <button
              onClick={onTransferToken}
              className="action-button accent w-full"
              disabled={isLoading || !transferRecipient || !transferAmount}
            >
              {isLoading ? "⏳ Processing..." : "💸 Transfer Token"}
            </button>
          </div>
        </div>

        {/* Disconnect Section */}
        <div className="disconnect-section">
          <button
            onClick={onDisconnect}
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

      {/* Right Column */}
      <div className="dashboard-right">
        {/* Instructions Section */}
        <div className="instructions-section">
          <h3 className="section-title">Getting Started</h3>
          <div className="instructions-card">
            <ol>
              <li>
                <p>
                  Deploy your account by clicking the &quot;Deploy Account&quot;
                  button. do this if you have not done it before with the logged
                  in account. This will create a new account on StarkNet.
                </p>
              </li>
              <li>
                <p>
                  Connect your account by clicking the &quot;Connect
                  Account&quot; button. This will connect your account to the
                  StarkNet blockchain.
                </p>
              </li>
              <li>
                <p>
                  Test the by clicking the &quot;Transfer Token&quot; button to
                  send STRK token to another address.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
