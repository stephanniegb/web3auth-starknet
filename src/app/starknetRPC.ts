import { IProvider } from "@web3auth/modal";

import { Account, CallData, ec, hash, RpcProvider } from "starknet";

export const OZaccountClassHash =
  "0x540d7f5ec7ecf317e68d48564934cb99259781b1ee3cedbbc37ec5337f8e688";

export async function getPrivateKey({
  provider,
}: {
  provider: IProvider;
}): Promise<string> {
  try {
    return (await provider.request({ method: "private_key" })) as string;
  } catch (error) {
    return error as string;
  }
}

export async function getStarkKey({ privateKey }: { privateKey: string }) {
  try {
    const keyPair = ec.starkCurve.getStarkKey(privateKey);
    return keyPair;
  } catch (error) {
    console.error("Error generating StarkNet public key:", error);
  }
}

export async function deployAccount({
  web3authProvider,
  starknetProvider,
}: {
  web3authProvider: IProvider;
  starknetProvider: RpcProvider;
}) {
  try {
    // 1. Generate public and private key pair.

    // use the web3auth provider to get the private key of the user.
    const privateKey = await getPrivateKey({ provider: web3authProvider });

    const validPrivateKey = `0x${privateKey}`;

    const starkKeyPub = await getStarkKey({ privateKey: validPrivateKey });

    console.log("publicKey=", starkKeyPub);

    // make sure to use the right rpc version (using RPC 0.8 provider)
    // const resp = await starknetProvider.getSpecVersion();
    // console.log("RPC version =", resp);

    if (!starkKeyPub) {
      throw new Error("StarkNet public key is undefined or null");
    }

    // 2. Calculate future address of the account (Then you have to fund this address!)
    const { OZcontractAddress, OZaccountConstructorCallData } =
      calculateAccountAddress({
        starkKeyPub: starkKeyPub,
      });

    console.log("✅ Calculated address:", OZcontractAddress);

    // 3. Deployment of the new account

    const OZaccount = new Account(
      starknetProvider,
      OZcontractAddress,
      validPrivateKey
    );
    console.log("✅ Account instance created");

    const { transaction_hash, contract_address } =
      await OZaccount.deployAccount({
        classHash: OZaccountClassHash,
        constructorCalldata: OZaccountConstructorCallData,
        contractAddress: OZcontractAddress,
        addressSalt: starkKeyPub,
      });

    await starknetProvider.waitForTransaction(transaction_hash);

    console.log("🎉 Final deployed address:", contract_address);

    return contract_address;
  } catch (error) {
    console.error("❌ Account deployment failed:", error);
    throw error;
  }
}

export const calculateAccountAddress = ({
  starkKeyPub,
}: {
  starkKeyPub: string;
}) => {
  const OZaccountConstructorCallData = CallData.compile({
    publicKey: starkKeyPub,
  });
  const OZcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    OZaccountClassHash,
    OZaccountConstructorCallData,
    0
  );
  console.log("Precalculated account address=", OZcontractAddress);
  return { OZcontractAddress, OZaccountConstructorCallData };
};
