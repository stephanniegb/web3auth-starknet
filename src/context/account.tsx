import React, { useContext } from "react";

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
