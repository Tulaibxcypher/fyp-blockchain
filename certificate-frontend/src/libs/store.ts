// src/libs/store.ts
export type IssuedRecord = {
  cid: string;
  name: string;
  course: string;
  className?: string;
  imageCid?: string;     // optional: same as cid or a separate image cid
  txHash: string;
  issuedAt: number;      // unix seconds
};

const KEY = "issued_v1";

function parse<T>(raw: string | null, fallback: T): T {
  try { return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}

export function getIssued(): IssuedRecord[] {
  return parse<IssuedRecord[]>(localStorage.getItem(KEY), []);
}

export function pushIssued(rec: IssuedRecord) {
  const list = getIssued();
  list.unshift(rec);                   // newest first
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 500))); // cap
}

export function clearIssued() {
  localStorage.removeItem(KEY);
}

export function removeIssuedByCid(cid: string) {
  const next = getIssued().filter(r => r.cid !== cid);
  localStorage.setItem(KEY, JSON.stringify(next));
}
