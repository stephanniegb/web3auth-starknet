import React, { useContext, useEffect, useRef } from "react";

export type Address = `0x${string}`;

import type { AccountInterface } from "starknet";
import { IUseWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { IUseWeb3AuthDisconnect } from "@web3auth/modal/react";
import { AuthUserInfo } from "@web3auth/modal";

const AccountContext = React.createContext<{
  account: AccountInterface | undefined;
  address: Address | undefined;
  web3AuthConnection: IUseWeb3AuthConnect | undefined;
  web3AuthDisconnect: IUseWeb3AuthDisconnect | undefined;
  userInfo?: Partial<AuthUserInfo> | null;
}>({
  account: undefined,
  address: undefined,
  web3AuthConnection: undefined,
  web3AuthDisconnect: undefined,
  userInfo: null,
});

export function useStarknetAccount() {
  const { account, address, web3AuthConnection, web3AuthDisconnect, userInfo } =
    useContext(AccountContext);
  return { account, address, web3AuthConnection, web3AuthDisconnect, userInfo };
}

export function AccountProvider({
  address,
  account,
  children,
  web3AuthConnection,
  web3AuthDisconnect,
}: {
  address?: Address;
  account?: AccountInterface;
  web3AuthConnection?: IUseWeb3AuthConnect;
  web3AuthDisconnect?: IUseWeb3AuthDisconnect;
  userInfo?: Partial<AuthUserInfo> | null;
  children: React.ReactNode;
}) {
  const { userInfo } = useWeb3AuthUser();
  const prevStateRef = useRef({ account, address, userInfo });

  useEffect(() => {
    const prevState = prevStateRef.current;
    const currentState = { account, address, userInfo };

    // Only log if there are meaningful changes
    const hasAccountChange = prevState.account !== account;
    const hasAddressChange = prevState.address !== address;
    const hasUserInfoChange = prevState.userInfo !== userInfo;

    if (hasAccountChange || hasAddressChange || hasUserInfoChange) {
      console.log("🔄 AccountProvider state changed:", {
        account: account ? "Account exists" : "No account",
        address: address || "No address",
        userInfo: userInfo ? "User info exists" : "No user info",
        changes: {
          account: hasAccountChange,
          address: hasAddressChange,
          userInfo: hasUserInfoChange,
        },
      });

      // Update the ref with current state
      prevStateRef.current = currentState;
    }
  }, [account, address, userInfo]);

  return (
    <AccountContext.Provider
      value={{
        account,
        address,
        web3AuthConnection,
        web3AuthDisconnect,
        userInfo,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
