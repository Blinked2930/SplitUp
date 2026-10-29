import { Id } from "../../convex/_generated/dataModel";

export type Currency = "ALL" | "EUR" | "USD";

export interface Member {
  _id: Id<"groupMembers">;
  _creationTime?: number;
  groupId: Id<"groups">;
  name: string;
  userId?: string;
  email?: string;
  avatarUrl?: string;
  joinedAt: number;
}

export interface SplitItem {
  memberId: Id<"groupMembers">;
  userId?: string;
  amountALL: number;
}

export interface GroupExpense {
  _id: Id<"groupExpenses">;
  _creationTime: number;
  groupId: Id<"groups">;
  title: string;
  amount: number;
  currency: Currency;
  amountInALL: number;
  category?: string;
  paidByMemberId: Id<"groupMembers">;
  paidByUserId?: string;
  splitType: "equal" | "exact" | "shares";
  splits: SplitItem[];
  timestamp: number;
  createdAt: number;
  deleted?: boolean;
}

export interface GroupSettlement {
  _id: Id<"groupSettlements">;
  _creationTime: number;
  groupId: Id<"groups">;
  fromMemberId: Id<"groupMembers">;
  toMemberId: Id<"groupMembers">;
  fromUserId?: string;
  toUserId?: string;
  amountALL: number;
  currency: Currency;
  timestamp: number;
  createdAt: number;
  deleted?: boolean;
}

export interface Group {
  _id: Id<"groups">;
  _creationTime?: number;
  name: string;
  currency: Currency;
  description?: string;
  createdBy: string;
  createdAt: number;
  deleted?: boolean;
  memberCount?: number;
  userNetPosition?: number;
  lastActivityTime?: number;
}

export interface SimplifiedDebt {
  fromMemberId: Id<"groupMembers">;
  fromMemberName: string;
  toMemberId: Id<"groupMembers">;
  toMemberName: string;
  amountALL: number;
}

export interface MemberBalance {
  memberId: Id<"groupMembers">;
  name: string;
  userId?: string;
  email?: string;
  avatarUrl?: string;
  netBalanceALL: number; // positive = owed money, negative = owes money
  totalPaidALL: number;
  totalShareALL: number;
}

