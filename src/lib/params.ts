export type SP = Promise<Record<string, string | string[] | undefined>>;

export async function read(sp: SP) {
  const raw = await sp;
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])) as Record<string, string | undefined>;
}

export function withParams(base: string, params: Record<string, string | undefined>, changes: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries({ ...params, ...changes }).forEach(([k, v]) => v && q.set(k, v));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}
