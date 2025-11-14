// src/ipfsClient.ts
// Upload using Lighthouse (browser SDK) – super simple.
// No env variables, no CLI, just one API key.

// 1) Make sure you've run:  npm install @lighthouse-web3/sdk
import lighthouse from "@lighthouse-web3/sdk";

// 2) PASTE YOUR LIGHTHOUSE API KEY HERE
//    Example: const LIGHTHOUSE_API_KEY = "lhk_abc123...";
const LIGHTHOUSE_API_KEY = "e9db613b.c41d8208e5b54c6597b34d29ba24dcec";

/**
 * Upload a single file to Lighthouse and return the CID string.
 * Name kept as uploadToIpfsFilebase so your existing Single.tsx still works.
 */
export async function uploadToIpfsFilebase(file: File): Promise<string> {
  // Only check that it's not empty
  if (!LIGHTHOUSE_API_KEY || LIGHTHOUSE_API_KEY.length === 0) {
    throw new Error("Lighthouse API key is not set in ipfsClient.ts");
  }

  // Optional: progress callback (for debugging / future use)
  const progressCallback = (progressData: any) => {
    try {
      const percentageDone =
        100 -
        Number(
          ((progressData?.total / progressData?.uploaded) * 100).toFixed(2)
        );
      console.log("Upload progress:", percentageDone, "%");
    } catch {
      // ignore
    }
  };

  // 👇 IMPORTANT: Lighthouse expects an ARRAY of files, not a single File.
  // So we wrap the file into [file].
  const output = await lighthouse.upload(
    [file],              // array with one file
    LIGHTHOUSE_API_KEY,  // your API key
    undefined,           // deal parameters (not needed for FYP)
    progressCallback     // progress callback (optional)
  );

  console.log("Lighthouse upload result:", output);

  // The CID is usually in output.data.Hash
  const cid: string | undefined = output?.data?.Hash;

  if (!cid) {
    throw new Error("Lighthouse upload failed: CID (Hash) missing in response");
  }

  return cid;
}

/**
 * Build a gateway URL for previewing the CID.
 * Your UI already uses this.
 */
export function filebaseGatewayUrl(cid: string): string {
  // You can also use https://gateway.lighthouse.storage/ipfs/${cid}
  return `https://ipfs.io/ipfs/${cid}`;
}
