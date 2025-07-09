"use client";

import { Web3AuthError } from "@web3auth/modal";

interface LoggedOutProps {
  connectLoading: boolean;
  connectError?: Web3AuthError | null;
  onConnect: () => void;
}

export default function LoggedOut({
  connectLoading,
  connectError,
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

        <button
          onClick={onConnect}
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
}
