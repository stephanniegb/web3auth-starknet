import { IProvider } from "@web3auth/modal";
import { keccak256 } from "js-sha3";

export async function getPrivateKey({ provider }: { provider: IProvider }) {
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
