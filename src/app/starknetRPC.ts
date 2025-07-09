import { IProvider } from "@web3auth/modal";

import { Account, CallData, ec as elliptic, hash, RpcProvider } from "starknet";

export const OZaccountClassHash =
  "0x540d7f5ec7ecf317e68d48564934cb99259781b1ee3cedbbc37ec5337f8e688";

export async function getPrivateKey({
  provider,
}: {
  provider: IProvider;
}): Promise<any> {
  try {
    return await provider.request({ method: "private_key" });
  } catch (error) {
    return error as string;
  }
}

export async function getStarkKey({ privateKey }: { privateKey: string }) {
  try {
    const keyPair = elliptic.starkCurve.getStarkKey(privateKey);
    return keyPair;
  } catch (error) {
    console.error("Error generating StarkNet public key:", error);
  }
}

export async function deployAccount({
  provider,
  starknetProvider,
}: {
  provider: any;
  starknetProvider: RpcProvider;
}) {
  try {
    const privateKey = await getPrivateKey({ provider });

    const validPrivateKey = `0x${privateKey}`;

    console.log("🔑 Generating StarkNet public key...");
    const starkKeyPub = await getStarkKey({ privateKey: validPrivateKey });
    console.log("✅ StarkNet public key generated:", starkKeyPub);

    const resp = await starknetProvider.getSpecVersion();
    console.log("RPC version =", resp);

    // Calculate future address of the account
    if (!starkKeyPub) {
      throw new Error("StarkNet public key is undefined or null");
    }

    const { OZcontractAddress, OZaccountConstructorCallData } =
      calculateAccountAddress({
        starkKeyPub: starkKeyPub,
      });

    console.log("✅ Calculated address:", OZcontractAddress);

    // Deployment of the new account
    console.log("🏗️ Creating Account instance...");

    const OZaccount = new Account(
      starknetProvider,
      OZcontractAddress,
      validPrivateKey
    );
    console.log("✅ Account instance created");

    console.log("📤 Deploying account to StarkNet...");

    const { transaction_hash, contract_address } =
      await OZaccount.deployAccount({
        classHash: OZaccountClassHash,
        constructorCalldata: OZaccountConstructorCallData,
        contractAddress: OZcontractAddress,
        addressSalt: starkKeyPub,
      });

    console.log("✅ Deployment transaction submitted!");

    console.log("🏠 Contract address:", contract_address);

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
