// src/utils/splitMath.ts

/**
 * Hamilton (Largest Remainder) allocation of `totalAmount` across
 * weighted shares. Guarantees sum(result) === totalAmount to the cent,
 * regardless of floating-point weights.
 *
 * Members with weight <= 0 are omitted from the result entirely.
 * If totalAmount is negative, distribution is applied to |amount| and
 * then negated per-member so the invariant still holds.
 */
export function allocateByShares(
  totalAmount: number,
  weights: Record<string, number>
): Record<string, number> {
  const ids = Object.keys(weights).filter((id) => (weights[id] ?? 0) > 0);
  if (ids.length === 0) return {};

  const sign = totalAmount < 0 ? -1 : 1;
  const totalCents = Math.round(Math.abs(totalAmount) * 100);
  if (totalCents === 0) {
    const zeros: Record<string, number> = {};
    for (const id of ids) zeros[id] = 0;
    return zeros;
  }

  const totalWeight = ids.reduce((s, id) => s + weights[id], 0);
  if (totalWeight <= 0) return {};

  const floors: Record<string, number> = {};
  const remainders: Array<{ id: string; rem: number }> = [];
  let allocatedCents = 0;

  for (const id of ids) {
    const exact = (totalCents * weights[id]) / totalWeight;
    const floor = Math.floor(exact);
    floors[id] = floor;
    allocatedCents += floor;
    remainders.push({ id, rem: exact - floor });
  }

  let leftover = totalCents - allocatedCents;
  remainders.sort((a, b) => {
    if (b.rem !== a.rem) return b.rem - a.rem;
    // Stable tiebreak: alphabetical by id so the same input always
    // produces the same allocation.
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  for (let i = 0; i < remainders.length && leftover > 0; i++, leftover--) {
    floors[remainders[i].id] += 1;
  }

  const result: Record<string, number> = {};
  for (const id of ids) result[id] = (floors[id] * sign) / 100;
  return result;
}

/**
 * Reconstruct a best-effort integer shares map from stored per-member
 * amounts. The smallest positive amount becomes 1 share; every other
 * member's share is `amount / smallest` rounded to the nearest integer.
 *
 * This is lossy in theory (a true 1.5x share round-trips as 2x), but is
 * exact for any shares map where all weights are integers and the total
 * was allocated by Hamilton — which is now the only way we write shares.
 */
export function reconstructSharesFromAmounts(
  splits: Array<{ memberId: string; amountALL: number }>
): Record<string, number> {
  const positive = splits.filter((s) => s.amountALL > 0);
  if (positive.length === 0) return {};

  const minAmount = Math.min(...positive.map((s) => s.amountALL));
  if (minAmount <= 0) return {};

  const map: Record<string, number> = {};
  for (const s of splits) {
    if (s.amountALL <= 0) {
      map[s.memberId] = 0;
      continue;
    }
    map[s.memberId] = Math.max(1, Math.round(s.amountALL / minAmount));
  }
  return map;
}