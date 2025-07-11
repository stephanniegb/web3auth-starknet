import { IProvider } from "@web3auth/modal";
import {
  Account,
  CairoCustomEnum,
  CairoOption,
  CairoOptionVariant,
  CallData,
  ec,
  hash,
  PaymasterRpc,
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

// Step 3: Calculate precalculated address
// export const calculateAccountAddress = ({
//   starkKeyPub,
// }: {
//   starkKeyPub: string;
// }) => {
//   const OZaccountConstructorCallData = CallData.compile({
//     publicKey: starkKeyPub,
//   });

//   const OZcontractAddress = hash.calculateContractAddressFromHash(
//     starkKeyPub,
//     OZaccountClassHash,
//     OZaccountConstructorCallData,
//     0
//   );

//   return { OZcontractAddress, OZaccountConstructorCallData };
// };

export const calculateAccountAddress = ({
  starkKeyPubAX,
}: {
  starkKeyPubAX: string;
}) => {
  // const OZaccountConstructorCallData = CallData.compile({
  //   publicKey: starkKeyPub,
  // });

  // const OZcontractAddress = hash.calculateContractAddressFromHash(
  //   starkKeyPub,
  //   OZaccountClassHash,
  //   OZaccountConstructorCallData,
  //   0
  // );

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

// Step 4: Deploy the account
// export async function deployAccount({
//   web3authProvider,
//   starknetProvider,
//   paymasterRpc,
// }: {
//   web3authProvider: IProvider;
//   starknetProvider: RpcProvider;
//   paymasterRpc: PaymasterRpc;
// }) {
//   try {
//     // ✅ 1. Get valid Starknet-compatible private key
//     const validPrivateKey = await getValidPrivateKey({
//       provider: web3authProvider,
//     });
//     console.log("✅ Grinded private key:", validPrivateKey);

//     // ✅ 2. Derive the matching public key
//     const starkKeyPub = getStarkKey({ privateKey: validPrivateKey });
//     console.log("✅ StarkNet public key:", starkKeyPub);

//     // ✅ 3. Calculate the deterministic address
//     const { OZcontractAddress, OZaccountConstructorCallData } =
//       calculateAccountAddress({ starkKeyPub });

//     console.log("✅ Calculated address:", OZcontractAddress);

//     // ✅ 4. Create account instance with correct key
//     const OZaccount = new Account(
//       starknetProvider,
//       OZcontractAddress,
//       validPrivateKey,
//       undefined,
//       undefined,
//       paymasterRpc
//     );

//     console.log("✅ Account instance created");

//     // ✅ 5. Deploy the account with correct calldata and salt
//     const { transaction_hash, contract_address } =
//       await OZaccount.deployAccount({
//         classHash: OZaccountClassHash,
//         constructorCalldata: OZaccountConstructorCallData,
//         contractAddress: OZcontractAddress,
//         addressSalt: starkKeyPub,
//       });

//     await starknetProvider.waitForTransaction(transaction_hash);
//     console.log("🎉 Final deployed address:", contract_address);

//     return contract_address;
//   } catch (error) {
//     console.error("❌ Account deployment failed:", error);
//     throw error;
//   }
// }

export async function deployAccount({
  web3authProvider,
  starknetProvider,
  paymasterRpc,
}: {
  web3authProvider: IProvider;
  starknetProvider: RpcProvider;
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

    // ✅ 5. Deploy the account with correct calldata and salt
    // const { transaction_hash, contract_address } =
    //   await OZaccount.deployAccount({
    //     classHash: OZaccountClassHash,
    //     constructorCalldata: OZaccountConstructorCallData,
    //     contractAddress: OZcontractAddress,
    //     addressSalt: starkKeyPub,
    //   });

    const deploymentData = {
      class_hash: argentXaccountClassHash,
      salt: starkKeyPub,
      unique: "0x1",
      calldata: AXConstructorCallData.map((x) => {
        const hex = BigInt(x).toString(16);
        return `0x${hex}`;
      }),
    };

    const buildTypedDataResponse = await fetch(
      `${paymasterUrl}/paymaster/v1/build-typed-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": "874b0d50-e322-4cd4-ad3c-e8810b3d37f0",
        },
        body: JSON.stringify({
          userAddress: AXcontractAddress,
          calls: [],
          deploymentData,
          accountClassHash: argentXaccountClassHash,
        }),
      }
    );

    if (!buildTypedDataResponse.ok) {
      throw new Error("Failed to build typed data");
    }

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

    const typedData = await buildTypedDataResponse.json();
    console.log({ typedData });

    const signedTypedData = await AXaccount.signMessage(typedData);

    console.log({ signedTypedData });

    // const signature = convertSignedMessage(signedTypedData);

    // const executeResponse = await fetch(
    //   `${paymasterUrl}/paymaster/v1/execute`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "api-key": "874b0d50-e322-4cd4-ad3c-e8810b3d37f0",
    //     },
    //     body: JSON.stringify({
    //       userAddress: AXcontractAddress,
    //       typedData: JSON.stringify(typedData),
    //       signature,
    //       deploymentData,
    //     }),
    //   }
    // );

    // if (!executeResponse.ok) {
    //   throw new Error("Failed to execute deployment");
    // }

    // const executeResult = await executeResponse.json();
    // console.log(executeResult);

    // await starknetProvider.waitForTransaction(executeResult.transaction_hash);
    // console.log("🎉 Final deployed address:", AXcontractAddress);

    return AXcontractAddress;
  } catch (error) {
    console.error("❌ Account deployment failed:", error);
    throw error;
  }
}
