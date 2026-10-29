export interface MemberBalance {
  memberId: string;
  name: string;
  netALL: number; // positive = owed money, negative = owes money
}

export interface SimplifiedDebt {
  fromMemberId: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  amountALL: number;
}

/**
 * Calculates net balance for every member in a group based on expenses and settlements.
 */
export function calculateBalances(
  members: Array<{ _id: string; name: string }>,
  expenses: Array<{
    amountInALL: number;
    paidByMemberId: string;
    splits: Array<{ memberId: string; amountALL: number }>;
  }>,
  settlements: Array<{
    fromMemberId: string;
    toMemberId: string;
    amountALL: number;
  }>
): Map<string, number> {
  const balances = new Map<string, number>();

  members.forEach((m) => balances.set(m._id, 0));

  // Process expenses
  expenses.forEach((exp) => {
    // Payer gets credit
    const currentPayerBalance = balances.get(exp.paidByMemberId) ?? 0;
    balances.set(exp.paidByMemberId, currentPayerBalance + exp.amountInALL);

    // Split participants get debited
    exp.splits.forEach((split) => {
      const currentSplitterBalance = balances.get(split.memberId) ?? 0;
      balances.set(split.memberId, currentSplitterBalance - split.amountALL);
    });
  });

  // Process settlements (repayments)
  settlements.forEach((s) => {
    // Sender paid money back (+)
    const fromBal = balances.get(s.fromMemberId) ?? 0;
    balances.set(s.fromMemberId, fromBal + s.amountALL);

    // Receiver got paid (-)
    const toBal = balances.get(s.toMemberId) ?? 0;
    balances.set(s.toMemberId, toBal - s.amountALL);
  });

  return balances;
}

/**
 * Greedy algorithm to simplify pairwise debts.
 */
export function simplifyDebts(
  members: Array<{ _id: string; name: string }>,
  balances: Map<string, number>
): SimplifiedDebt[] {
  const memberMap = new Map(members.map((m) => [m._id, m.name]));

  // Separate creditors (+) and debtors (-)
  const debtors: { memberId: string; amount: number }[] = [];
  const creditors: { memberId: string; amount: number }[] = [];

  balances.forEach((bal, id) => {
    const rounded = Math.round(bal * 100) / 100;
    if (rounded < -0.01) {
      debtors.push({ memberId: id, amount: -rounded });
    } else if (rounded > 0.01) {
      creditors.push({ memberId: id, amount: rounded });
    }
  });

  const simplified: SimplifiedDebt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const transfer = Math.min(debtor.amount, creditor.amount);
    const amountRounded = Math.round(transfer * 100) / 100;

    if (amountRounded > 0) {
      simplified.push({
        fromMemberId: debtor.memberId,
        fromName: memberMap.get(debtor.memberId) ?? 'Member',
        toMemberId: creditor.memberId,
        toName: memberMap.get(creditor.memberId) ?? 'Member',
        amountALL: amountRounded,
      });
    }

    debtor.amount -= transfer;
    creditor.amount -= transfer;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return simplified;
}