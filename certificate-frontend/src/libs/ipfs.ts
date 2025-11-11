// Manual-CID mode: no uploads here — just a gateway helper.
export function gatewayUrl(cid: string) {
  return `https://ipfs.io/ipfs/${cid}`;
}
