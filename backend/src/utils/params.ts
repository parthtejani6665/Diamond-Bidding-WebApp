export const parseIdParam = (value: unknown): number | null => {
  if (typeof value !== "string") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

