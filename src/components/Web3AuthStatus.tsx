import { useWeb3AuthStatus } from "@/hooks/use-web3auth-status";

/**
 * Component that displays Web3Auth connection status and errors
 * Useful for debugging and user feedback
 */
export function Web3AuthStatus() {
  const {
    status,
    isConnected,
    isInitializing,
    initError,
    error,
    hasError,
    getErrorMessage,
    isReady,
  } = useWeb3AuthStatus();

  return (
    <div className="web3auth-status">
      <h3>Web3Auth Status</h3>

      <div className="status-grid">
        <div className="status-item">
          <strong>Status:</strong> {status || "unknown"}
        </div>

        <div className="status-item">
          <strong>Connected:</strong> {isConnected ? "✅ Yes" : "❌ No"}
        </div>

        <div className="status-item">
          <strong>Initializing:</strong> {isInitializing ? "⏳ Yes" : "✅ No"}
        </div>

        <div className="status-item">
          <strong>Ready:</strong> {isReady ? "✅ Yes" : "❌ No"}
        </div>

        <div className="status-item">
          <strong>Has Error:</strong> {hasError ? "⚠️ Yes" : "✅ No"}
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="error-section">
          <h4>Errors:</h4>
          {initError && (
            <div className="error-item">
              <strong>Init Error:</strong> {initError.message}
            </div>
          )}
          {error && (
            <div className="error-item">
              <strong>Starknet Error:</strong> {error.message}
            </div>
          )}
          <div className="error-item">
            <strong>Primary Error:</strong> {getErrorMessage()}
          </div>
        </div>
      )}

      {/* Status-based actions */}
      <div className="status-actions">
        {isInitializing && (
          <div className="action-item info">
            ⏳ Web3Auth is initializing, please wait...
          </div>
        )}

        {!isReady && !isInitializing && (
          <div className="action-item warning">
            ⚠️ Web3Auth is not ready. Check for errors above.
          </div>
        )}

        {isReady && !isConnected && (
          <div className="action-item success">
            ✅ Web3Auth is ready to connect!
          </div>
        )}

        {isConnected && (
          <div className="action-item success">
            🎉 Successfully connected to Web3Auth!
          </div>
        )}
      </div>
    </div>
  );
}
