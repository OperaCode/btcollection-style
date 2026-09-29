// Flat sales-tax rate by 2-letter US state code. Starts with NY only, since
// that's the only state this business currently has sales-tax nexus in —
// add another state here only once nexus is actually established there
// (confirm with an accountant first: collecting tax in a state without
// nexus, or failing to collect where nexus exists, are both compliance
// problems, not just a code change).
//
// This is a flat combined rate, not a true address-level lookup. NY sales
// tax technically varies by county/city (roughly 7%–8.875% depending on
// where in the state). The rate below is the combined NYC rate (state +
// city + MCTD surcharge). Orders shipping elsewhere in NY State will be
// charged slightly more than the technically-correct local rate until this
// is broken out into a real per-county table.
//
// No secrets in this file — safe to import from both server and client code
// (checkout.tsx uses it to mirror the server's math for display).
const TAX_RATES: Record<string, number> = {
  NY: 0.08875,
};

export function resolveTaxRate(state: string | null | undefined): number {
  if (!state) return 0;
  return TAX_RATES[state.trim().toUpperCase()] ?? 0;
}
