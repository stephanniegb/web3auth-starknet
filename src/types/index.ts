// These types are taken from `@wagmi/chains`, but since they don't export them
// we have to copy them here.
// All copyright belongs to weth LLC.
//
// Notice that `Chain.id` is a bigint, because Starknet chain ids are outside of
// the number safe range.

import { PaymasterRpc, ProviderInterface } from "starknet";
import { type Chain } from "@starknet-react/chains";

export type Address = `0x${string}`;

export type NativeCurrency = {
  /** Token address */
  address: Address;

  /** Human-readable name */
  name: string;

  /** Currency symbol */
  symbol: string;

  /** Number of decimals */
  decimals: number;
};

export type RpcUrls = {
  http: readonly string[];
  websocket?: readonly string[];
};

export type ChainPaymasterFactory<T extends PaymasterRpc = PaymasterRpc> = (
  chain: Chain
) => T | null;

export type ChainProviderFactory<
  T extends ProviderInterface = ProviderInterface
> = (chain: Chain) => T | null;
