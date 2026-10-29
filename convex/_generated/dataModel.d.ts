import { GenericId } from "convex/values";

export type TableNames =
  | "groups"
  | "groupMembers"
  | "groupExpenses"
  | "groupSettlements";

export type Id<TableName extends TableNames> = GenericId<TableName>;

export type Currency = "ALL" | "EUR" | "USD";

export interface GroupDoc {
  _id: Id<"groups">;
  _creationTime: number;
  name: string;
  currency: Currency;
  description?: string;
  createdBy: string;
  createdAt: number;
  deleted?: boolean;
}

export interface GroupMemberDoc {
  _id: Id<"groupMembers">;
  _creationTime: number;
  groupId: Id<"groups">;
  userId?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  joinedAt: number;
}

export interface SplitItem {
  memberId: Id<"groupMembers">;
  userId?: string;
  amountALL: number;
}

export interface GroupExpenseDoc {
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

export interface GroupSettlementDoc {
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

export type Doc<TableName extends TableNames> = TableName extends "groups"
  ? GroupDoc
  : TableName extends "groupMembers"
  ? GroupMemberDoc
  : TableName extends "groupExpenses"
  ? GroupExpenseDoc
  : TableName extends "groupSettlements"
  ? GroupSettlementDoc
  : never;

