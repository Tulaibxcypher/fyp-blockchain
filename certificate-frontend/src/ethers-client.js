// src/ethers-client.js
import { ethers } from "ethers";
import registryMap from "./registry.json";

// Multiple public RPC fallbacks for Polygon Amoy (80002)
const AMOY_RPCS = [
  "https://rpc-amoy.polygon.technology",
  "https://polygon-amoy-bor-rpc.publicnode.com",
  "https://polygon-amoy.drpc.org",
  "https://rpc.ankr.com/polygon_amoy",
  "https://polygon-amoy.gateway.tenderly.co" // public gateway (rate limited)
];

const REGISTRY_ABI = [
  "function getAddressByString(string keyStr) view returns (address)"
];

const CERT_ABI = [
  "function certificateExists(string ipfsCid) view returns (bool)",
  "function verifyByCid(string ipfsCid) view returns (bool,address,string,string,bytes32,uint256)",
  "function issueCertificate(string,string,string,bytes32) external",
  "function isIssuer(address) view returns (bool)",
  "function paused() view returns (bool)",
  "function issueFeeWei() view returns (uint256)"
];

async function getMetaMaskBase() {
  if (!window.ethereum) return null;
  try {
    const mm = new ethers.BrowserProvider(window.ethereum);
    const net = await mm.getNetwork();
    return { provider: mm, chainId: Number(net.chainId), kind: "metamask" };
  } catch {
    return null;
  }
}

async function tryRpc(url, timeoutMs = 4000) {
  const provider = new ethers.JsonRpcProvider(url, { staticNetwork: "80002" });
  // Manual timeout for getBlockNumber()
  const p = provider.getBlockNumber();
  const t = new Promise((_, rej) =>
    setTimeout(() => rej(new Error("timeout")), timeoutMs)
  );
  await Promise.race([p, t]); // throws on timeout
  const net = await provider.getNetwork();
  if (Number(net.chainId) !== 80002) {
    throw new Error(`RPC ${url} is not Amoy (chainId=${net.chainId})`);
  }
  return provider;
}

async function getPublicBase() {
  const errors = [];
  for (const url of AMOY_RPCS) {
    try {
      const p = await tryRpc(url);
      return { provider: p, chainId: 80002, kind: "public", url };
    } catch (e) {
      errors.push(`${url}: ${e.message}`);
    }
  }
  const err = new Error(
    "Could not reach any Polygon Amoy RPC. Network may be blocking RPC traffic."
  );
  err.details = errors;
  throw err;
}

/**
 * Resolve the Certificate contract via Registry.
 * Strategy:
 *  1) If MetaMask is on Amoy (80002) -> use signer (write enabled)
 *  2) Else try public RPCs (read only)
 *  3) If registry lookup fails on primary, retry on public RPCs as last resort
 */
export async function resolveCertificate() {
  let base = await getMetaMaskBase();

  // Use MetaMask only when on 80002; otherwise ignore and go public read-only
  if (!base || base.chainId !== 80002) {
    base = await getPublicBase();
  }

  const { provider, chainId } = base;

  const registryAddress = registryMap[chainId];
  if (!registryAddress) {
    throw new Error(
      `No Registry address for chain ${chainId}. Check src/registry.json.`
    );
  }

  let registry = new ethers.Contract(registryAddress, REGISTRY_ABI, provider);

  let certAddress;
  try {
    certAddress = await registry.getAddressByString("Certificate");
  } catch (e) {
    // In case a corporate network blocks this specific RPC, retry using public base
    const pub = await getPublicBase();
    registry = new ethers.Contract(registryAddress, REGISTRY_ABI, pub.provider);
    certAddress = await registry.getAddressByString("Certificate");
  }

  if (!certAddress || certAddress === ethers.ZeroAddress) {
    throw new Error("Registry does not contain 'Certificate' address.");
  }

  // If MetaMask is actually on Amoy, return with signer (so issue works)
  const mm = await getMetaMaskBase();
  if (mm && mm.chainId === 80002) {
    const signer = await mm.provider.getSigner();
    return new ethers.Contract(certAddress, CERT_ABI, signer);
  }

  // Otherwise return read-only (verify works; issuing asks MetaMask to switch)
  return new ethers.Contract(certAddress, CERT_ABI, provider);
}
