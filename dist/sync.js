// Synchronizacja postępu między urządzeniami bez kont.
// Urządzenie losuje kod (100 bitów). Na serwer trafia tylko skrót SHA-256 kodu i postęp nauki,
// nigdy sam kod. Kto zna kod, ma dostęp do postępu, więc kod trzeba traktować jak hasło.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 znaki, bez 0/O/1/I

export function newCode(rand = (b) => crypto.getRandomValues(b)) {
  const bytes = rand(new Uint8Array(20));
  const chars = [...bytes].map((x) => ALPHABET[x % 32]);
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join('')).join('-');
}

export function normalizeCode(input) {
  const raw = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (raw.length !== 20 || [...raw].some((c) => !ALPHABET.includes(c))) return null;
  return [0, 5, 10, 15].map((i) => raw.slice(i, i + 5)).join('-');
}

export async function hashCode(code) {
  const data = new TextEncoder().encode('infectio:' + code);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Dla każdego pytania wygrywa nowszy wpis (ostatnia odpowiedź, potem termin powtórki).
export function mergeProgress(local = {}, remote = {}) {
  const out = { ...remote };
  for (const [k, v] of Object.entries(local)) {
    const r = out[k];
    if (!r) { out[k] = v; continue; }
    const a = [v.last || 0, v.due || 0], b = [r.last || 0, r.due || 0];
    if (a[0] > b[0] || (a[0] === b[0] && a[1] >= b[1])) out[k] = v;
  }
  return out;
}

export function createSync({ url, key, fetchImpl = (...a) => fetch(...a) }) {
  const enabled = Boolean(url && key);
  async function rpc(name, body) {
    const res = await fetchImpl(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) }, // nowe klucze sb_publishable_ nie są JWT
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('sync-' + res.status);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  return {
    enabled,
    pull: (id) => rpc('get_progress', { p_id: id }),
    push: (id, data) => rpc('put_progress', { p_id: id, p_data: data }),
  };
}

// Czyści wczytaną kopię postępu: tylko znane pola i typy, żeby uszkodzony plik nie popsuł aplikacji.
export function sanitizeProgress(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('To nie jest kopia postępu Infectio.');
  const keys = Object.keys(raw);
  if (keys.length > 5000) throw new Error('Kopia jest zbyt duża.');
  const num = (v) => (Number.isFinite(v) && v >= 0 ? v : undefined);
  const out = {};
  for (const k of keys) {
    const v = raw[k];
    if (!v || typeof v !== 'object') continue;
    const e = { seen: v.seen === true, attempts: num(v.attempts) ?? 0, correct: num(v.correct) ?? 0 };
    if (num(v.last) !== undefined) e.last = v.last;
    if (num(v.due) !== undefined) e.due = v.due;
    if (typeof v.lastResult === 'boolean') e.lastResult = v.lastResult;
    out[k] = e;
  }
  if (!keys.length) throw new Error('Kopia jest pusta.');
  return out;
}
