import { Account, Contract, RpcProvider } from "starknet";
import { CONTRACT_ABI } from "@/abi";
import { CONTRACT_ADDRESS } from "@/address";
import { fetchAccountCompatibility } from "@avnu/gasless-sdk";

export const fetchBalance = async (
  address: string,
  starknetProvider: RpcProvider,
  setStrkBalance: (balance: string) => void
) => {
  if (!address || !starknetProvider) {
    return;
  }

  try {
    const contract = new Contract(
      CONTRACT_ABI,
      CONTRACT_ADDRESS,
      starknetProvider
    );
    const balance = await contract.balance_of(address);

    // Convert from wei to STRK (assuming 18 decimals)
    // Handle BigInt properly by converting to string first
    const balanceValue = balance.balance || balance;
    const balanceInStrk = (
      Number(balanceValue.toString()) / Math.pow(10, 18)
    ).toFixed(6);
    setStrkBalance(balanceInStrk);
  } catch (error) {
    console.log("Error fetching balance:", error);
    setStrkBalance("0");
  }
};

export const transferToken = async (
  account: Account,
  starknetProvider: RpcProvider,
  transferRecipient: string,
  transferAmount: string,
  setIsLoading: (loading: boolean) => void
) => {
  if (!account) {
    console.log("Account not initialized yet");
    return;
  }

  if (!starknetProvider) {
    console.log("starknetProvider not initialized yet");
    return;
  }

  if (!transferRecipient || !transferAmount) {
    console.log("Please enter recipient address and amount");
    return;
  }

  setIsLoading(true);
  try {
    // Convert amount to proper format (assuming 18 decimals like ETH)
    // Use BigInt for precise calculation
    const amountInWei = BigInt(
      Math.floor(parseFloat(transferAmount) * Math.pow(10, 18))
    ).toString();

    const contract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, account);
    const res = await contract.transfer(transferRecipient, amountInWei);
    await starknetProvider.waitForTransaction(res.transaction_hash);
    console.log("Transfer successful:", res);
  } catch (error) {
    console.log(error);
  } finally {
    setIsLoading(false);
  }
};

export const checkGaslessCompatibility = async (accountAddress: string) => {
  const compatibility = await fetchAccountCompatibility(accountAddress);
  console.log("Gasless Compatible:", compatibility.isCompatible);
};
