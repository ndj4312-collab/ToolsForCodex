export const transactionStates = ["PLANNED", "STAGED", "VERIFIED", "APPROVED", "APPLIED", "ROLLED_BACK", "FAILED"] as const;
export type TransactionState = (typeof transactionStates)[number];
const transitions: Record<TransactionState, readonly TransactionState[]> = {
  PLANNED: ["STAGED", "FAILED"], STAGED: ["VERIFIED", "FAILED"], VERIFIED: ["APPROVED", "FAILED"], APPROVED: ["APPLIED", "FAILED"], APPLIED: ["ROLLED_BACK", "FAILED"], ROLLED_BACK: [], FAILED: []
};
export function canTransition(from: TransactionState, to: TransactionState): boolean { return transitions[from].includes(to); }
export function assertTransition(from: TransactionState, to: TransactionState): void { if (!canTransition(from, to)) throw new Error(`Invalid transaction transition: ${from} -> ${to}`); }
