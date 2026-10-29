import { Member, GroupExpense, GroupSettlement, MemberBalance, SimplifiedDebt } from "../types";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Calculates net balance for every member in the group.
 * Positive = owed money.
 * Negative = owes money.
 */
export function calculateMemberBalances(
  members: Member[],
  expenses: GroupExpense[],
  settlements: GroupSettlement[]
): MemberBalance[] {
  const balanceMap = new Map<
    string,
    {
      netBalanceALL: number;
      totalPaidALL: number;
      totalShareALL: number;
    }
  >();

  for (const m of members) {
    balanceMap.set(m._id, {
      netBalanceALL: 0,
      totalPaidALL: 0,
      totalShareALL: 0,
    });
  }

  // Factor in expenses
  for (const exp of expenses) {
    if (exp.deleted) continue;

    // Payer gets credited with amountInALL
    const payerStats = balanceMap.get(exp.paidByMemberId);
    if (payerStats) {
      payerStats.netBalanceALL += exp.amountInALL;
      payerStats.totalPaidALL += exp.amountInALL;
    }

    // Split participants get debited with their split share
    for (const split of exp.splits) {
      const participantStats = balanceMap.get(split.memberId);
      if (participantStats) {
        participantStats.netBalanceALL -= split.amountALL;
        participantStats.totalShareALL += split.amountALL;
      }
    }
  }

  // Factor in settlements
  for (const set of settlements) {
    if (set.deleted) continue;

    // Sender paid off debt -> net balance increases (less negative or more positive)
    const senderStats = balanceMap.get(set.fromMemberId);
    if (senderStats) {
      senderStats.netBalanceALL += set.amountALL;
    }

    // Recipient received payment -> net balance decreases
    const recipientStats = balanceMap.get(set.toMemberId);
    if (recipientStats) {
      recipientStats.netBalanceALL -= set.amountALL;
    }
  }

  return members.map((m) => {
    const stats = balanceMap.get(m._id) || {
      netBalanceALL: 0,
      totalPaidALL: 0,
      totalShareALL: 0,
    };
    return {
      memberId: m._id,
      name: m.name,
      userId: m.userId,
      email: m.email,
      avatarUrl: m.avatarUrl,
      netBalanceALL: Math.round(stats.netBalanceALL),
      totalPaidALL: Math.round(stats.totalPaidALL),
      totalShareALL: Math.round(stats.totalShareALL),
    };
  });
}

/**
 * Tricount-style Greedy Min-Cash-Flow algorithm.
 * Reduces complex N-way debt webs into the minimum possible transactions.
 */
export function simplifyDebts(memberBalances: MemberBalance[]): SimplifiedDebt[] {
  // Separate into debtors (owes money) and creditors (is owed money)
  const debtors: { id: Id<"groupMembers">; name: string; amount: number }[] = [];
  const creditors: { id: Id<"groupMembers">; name: string; amount: number }[] = [];

  for (const mb of memberBalances) {
    // Ignore small rounding errors (< 1 Lek)
    if (mb.netBalanceALL < -0.5) {
      debtors.push({
        id: mb.memberId,
        name: mb.name,
        amount: Math.abs(mb.netBalanceALL),
      });
    } else if (mb.netBalanceALL > 0.5) {
      creditors.push({
        id: mb.memberId,
        name: mb.name,
        amount: mb.netBalanceALL,
      });
    }
  }

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SimplifiedDebt[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount >= 1) {
      transactions.push({
        fromMemberId: debtor.id,
        fromMemberName: debtor.name,
        toMemberId: creditor.id,
        toMemberName: creditor.name,
        amountALL: Math.round(settleAmount),
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.5) {
      dIdx++;
    }
    if (creditor.amount < 0.5) {
      cIdx++;
    }
  }

  return transactions;
}

