import { converters } from "@tolar/web3-plugin-tolar";

// ERC20 function selectors
export const ERC20_SELECTORS = {
  name:      "0x06fdde03",
  symbol:    "0x95d89b41",
  decimals:  "0x313ce567",
  balanceOf: "0x70a08231",
} as const;

export function encodeBalanceOf(ethAddress: string): string {
  const addr = ethAddress.slice(2).toLowerCase().padStart(64, "0");
  return ERC20_SELECTORS.balanceOf + addr;
}

export function tolToEthAddress(tolAddress: string): string {
  return converters.toEthAddress(tolAddress);
}

export function decodeString(output: string): string {
  if (!output || output === "0x") return "";
  const data = output.startsWith("0x") ? output.slice(2) : output;
  if (data.length < 128) return "";
  const lengthHex = data.slice(64, 128);
  const length = parseInt(lengthHex, 16);
  if (length === 0) return "";
  const strHex = data.slice(128, 128 + length * 2);
  try {
    return Buffer.from(strHex, "hex").toString("utf8");
  } catch {
    return "";
  }
}

export function decodeUint(output: string): bigint {
  if (!output || output === "0x") return 0n;
  try {
    return BigInt(output);
  } catch {
    return 0n;
  }
}

export interface Erc20TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}
