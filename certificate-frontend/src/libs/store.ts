// src/libs/store.ts

export type IssuedRecord = {
  cid: string;        // certificate CID or ID
  name: string;
  course: string;
  className?: string;
  imageCid?: string;  // certificate image CID (optional)
  txHash?: string;    // blockchain tx hash (optional)
  issuedAt: number;   // unix seconds
  revoked: boolean;   // ✅ admin can revoke
};

const KEY = "issued_v1";

function parse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getIssued(): IssuedRecord[] {
  if (typeof window === "undefined") return [];
  return parse<IssuedRecord[]>(localStorage.getItem(KEY), []);
}

function saveIssued(list: IssuedRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function pushIssued(rec: IssuedRecord) {
  const list = getIssued();
  list.unshift(rec); // newest first
  saveIssued(list.slice(0, 500));
}

export function clearIssued() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function removeIssuedByCid(cid: string) {
  const next = getIssued().filter((r) => r.cid !== cid);
  saveIssued(next);
}

// ✅ Admin can revoke / restore
export function setRevoked(cid: string, value: boolean) {
  const list = getIssued();
  const next = list.map((r) =>
    r.cid === cid ? { ...r, revoked: value } : r
  );
  saveIssued(next);
}
