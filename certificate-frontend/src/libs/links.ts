// src/libs/links.ts
// Central place for links we show in the UI

/** Public IPFS gateway to preview an IPFS CID */
export function gatewayUrl(cid: string) {
  // you can swap to your favorite gateway here if you want
  const base = "https://ipfs.io/ipfs";
  return `${base}/${cid}`;
}

/** Block explorer URL for a transaction on Polygon Amoy */
export function txUrl(tx: string) {
  // if later you want to read from .env, replace the line below with:
  // const base = (import.meta.env.VITE_EXPLORER || "https://amoy.polygonscan.com").replace(/\/$/, "");
  const base = "https://amoy.polygonscan.com";
  return `${base}/tx/${tx}`;
}
