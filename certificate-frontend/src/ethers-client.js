import { BrowserProvider, Contract } from "ethers";
import abi from "./abi.json";
import conf from "./contract.json";

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not found. Install it and refresh.");
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  if (currentChainId !== conf.chainId) {
    throw new Error(`Wrong network. Please switch MetaMask to ${conf.network} (chainId ${conf.chainId}).`);
  }
  const signer = await provider.getSigner();
  return new Contract(conf.address, abi, signer);
}

export async function addCertificate(studentName, course, ipfsHash) {
  const c = await getContract();
  const tx = await c.addCertificate(studentName, course, ipfsHash);
  await tx.wait();
  return tx.hash;
}

export async function verifyCertificate(ipfsHash) {
  const c = await getContract();
  const [studentName, course, storedHash, issuedAt, exists] =
    await c.verifyCertificate(ipfsHash);
  return { studentName, course, storedHash, issuedAt: Number(issuedAt), exists };
}
