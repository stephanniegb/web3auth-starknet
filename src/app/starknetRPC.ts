import { IProvider } from "@web3auth/modal";
import {
  Account,
  CairoCustomEnum,
  CairoOption,
  CairoOptionVariant,
  CallData,
  ec,
  hash,
  PaymasterDetails,
  PaymasterRpc,
  ProviderInterface,
  RpcProvider,
} from "starknet";
import { keccak256 } from "js-sha3";

export const OZaccountClassHash =
  "0x540d7f5ec7ecf317e68d48564934cb99259781b1ee3cedbbc37ec5337f8e688";

export const argentXaccountClassHash =
  "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";

const paymasterUrl = "https://sepolia.paymaster.avnu.fi";

/*
  Starknet uses a specific elliptic curve (Stark curve), which has a much smaller valid private key range than secp256k1 (used by EVM chains). The private key you receive from Web3Auth might be a random 32-byte value, which can sometimes be out of Starknet’s valid range.
  check out: https://web3auth.io/community/t/integrate-web3auth-on-starknet/11404/2?u=stephaniegb.dev for more context
  */

export async function getValidPrivateKey({
  provider,
}: {
  provider: IProvider;
}) {
  try {
    const rawPrivKey = (await provider.request({
      method: "private_key",
    })) as string;

    if (!rawPrivKey) {
      throw new Error("Private key is undefined or null");
    }

    // Hash the private key
    const hashedPrivKey = keccak256(rawPrivKey);

    // Modulo with Stark curve order to ensure it's in range
    const starkCurveOrder =
      "3618502788666131213697322783095070105526743751716087489154079457884512865583";

    const validPrivKey = BigInt("0x" + hashedPrivKey) % BigInt(starkCurveOrder);

    return `0x${validPrivKey.toString(16)}`;
  } catch (error) {
    console.error("Error getting/grinding private key:", error);
    throw new Error("Failed to retrieve or grind private key");
  }
}

// Step 2: Get StarkNet public key from a valid private key
export function getStarkKey({ privateKey }: { privateKey: string }) {
  try {
    return ec.starkCurve.getStarkKey(privateKey);
  } catch (error) {
    console.error("Error generating StarkNet public key:", error);
    throw error;
  }
}

export const calculateAccountAddress = ({
  starkKeyPubAX,
}: {
  starkKeyPubAX: string;
}) => {
  const axSigner = new CairoCustomEnum({ Starknet: { pubkey: starkKeyPubAX } });
  const axGuardian = new CairoOption<unknown>(CairoOptionVariant.None);
  const AXConstructorCallData = CallData.compile({
    owner: axSigner,
    guardian: axGuardian,
  });

  const AXcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPubAX,
    argentXaccountClassHash,
    AXConstructorCallData,
    0
  );

  return { AXcontractAddress, AXConstructorCallData };
};

export async function deployAccount({
  web3authProvider,
  starknetProvider,
  paymasterRpc,
}: {
  web3authProvider: IProvider;
  starknetProvider: ProviderInterface;
  paymasterRpc: PaymasterRpc;
}) {
  try {
    // ✅ 1. Get valid Starknet-compatible private key
    const validPrivateKey = await getValidPrivateKey({
      provider: web3authProvider,
    });
    console.log("✅ Grinded private key:", validPrivateKey);

    // ✅ 2. Derive the matching public key
    const starkKeyPub = getStarkKey({ privateKey: validPrivateKey });
    console.log("✅ StarkNet public key:", starkKeyPub);

    // ✅ 3. Calculate the deterministic address
    const { AXcontractAddress, AXConstructorCallData } =
      calculateAccountAddress({ starkKeyPubAX: starkKeyPub });

    console.log("✅ Calculated address:", AXcontractAddress);
    console.log({ AXConstructorCallData });

    // ✅ 4. Create account instance with correct key
    const AXaccount = new Account(
      starknetProvider,
      AXcontractAddress,
      validPrivateKey,
      undefined,
      undefined,
      paymasterRpc
    );
    console.log("✅ Account instance created");

    // ✅ 5. Calculate deploymentData
    const accountPayload = {
      class_hash: argentXaccountClassHash,
      calldata: AXConstructorCallData.map((x) => {
        const hex = BigInt(x).toString(16);
        return `0x${hex}`;
      }),
      address: AXcontractAddress,
      salt: starkKeyPub,
    };

    const feesDetails: PaymasterDetails = {
      feeMode: { mode: "sponsored" },
      deploymentData: { ...accountPayload, version: 1 as 1 },
    };
    const resp = AXaccount.executePaymasterTransaction([], feesDetails);
    console.log("Account deployed successfully:", resp);

    return AXcontractAddress;
  } catch (error) {
    console.error("❌ Account deployment failed:", error);
    throw error;
  }
}

export const getDeploymentStatus = async ({
  starknetProvider,
  contractAddress,
}: {
  starknetProvider: ProviderInterface;
  contractAddress: string;
}) => {
  try {
    await starknetProvider.getClassHashAt(contractAddress);

    return true;
  } catch (error) {
    console.error("❌ Error getting deployment status:", error);
    return false;
  }
};
