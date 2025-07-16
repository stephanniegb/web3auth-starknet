"use client";

import { Web3AuthError } from "@web3auth/modal";

interface LoggedOutProps {
  connectLoading: boolean;
  connectError?: Web3AuthError | null;
  web3AuthStatus?: string | null;
  isWeb3AuthInitializing?: boolean;
  web3AuthInitError?: Error | null;
  starknetError?: Error | null;
  hasError?: boolean;
  errorMessage?: string | null;
  isReady?: boolean;
  onConnect: () => void;
}

export default function LoggedOut({
  connectLoading,
  connectError,
  web3AuthStatus,
  isWeb3AuthInitializing,
  web3AuthInitError,
  hasError,
  errorMessage,
  isReady,
  onConnect,
}: LoggedOutProps) {
  return (
    <div className="login-section">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome to Web3Auth Demo</h2>
          <p className="login-subtitle">
            Connect your wallet to explore StarkNet functionality
          </p>
        </div>

        {/* Web3Auth Status Information */}
        {isWeb3AuthInitializing && (
          <div className="status-message info">
            <span className="status-icon">⏳</span>
            Initializing Web3Auth...
          </div>
        )}

        {web3AuthStatus && (
          <div className="status-message info">
            <span className="status-icon">ℹ️</span>
            Status: {web3AuthStatus}
          </div>
        )}

        {/* Ready status */}
        {isReady && (
          <div className="status-message success">
            <span className="status-icon">✅</span>
            Web3Auth is ready to connect
          </div>
        )}

        {/* Not ready reasons */}
        {!isReady && !isWeb3AuthInitializing && (
          <div className="status-message warning">
            <span className="status-icon">⚠️</span>
            Web3Auth not ready:{" "}
            {web3AuthStatus === "not_ready"
              ? "Not ready"
              : web3AuthInitError
              ? "Init error"
              : web3AuthStatus === null
              ? "No status"
              : "Unknown reason"}
          </div>
        )}

        {/* Error Display */}
        {hasError && errorMessage && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {errorMessage}
          </div>
        )}

        <button
          onClick={onConnect}
          className="login-button"
          disabled={connectLoading || !isReady}
        >
          {connectLoading ? (
            <>
              <span className="loading-spinner"></span>
              Connecting...
            </>
          ) : !isReady ? (
            <>
              <span className="button-icon">⏳</span>
              Initializing...
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
}
