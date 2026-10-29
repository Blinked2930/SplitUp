import { FunctionReference } from "convex/server";
import { Id, Currency, Doc, SplitItem } from "./dataModel";

export type GroupSummary = {
  _id: Id<"groups">;
  name: string;
  currency: Currency;
  description?: string;
  createdBy: string;
  createdAt: number;
  memberCount: number;
  userNetPosition: number;
  lastActivityTime: number;
  members: Array<{
    _id: Id<"groupMembers">;
    name: string;
    userId?: string;
    email?: string;
  }>;
};

export type GroupDetails = {
  group: Doc<"groups">;
  members: Doc<"groupMembers">[];
  expenses: Doc<"groupExpenses">[];
  settlements: Doc<"groupSettlements">[];
  userMemberId: Id<"groupMembers"> | null;
  currentUserId: string | null;
};

export declare const api: {
  groups: {
    getMyGroups: FunctionReference<"query", "public", Record<string, never>, GroupSummary[]>;
    createGroup: FunctionReference<
      "mutation",
      "public",
      {
        name: string;
        currency: Currency;
        description?: string;
        creatorName: string;
      },
      Id<"groups">
    >;
    addMember: FunctionReference<
      "mutation",
      "public",
      {
        groupId: Id<"groups">;
        name: string;
        email?: string;
        userId?: string;
      },
      Id<"groupMembers">
    >;
    joinGroup: FunctionReference<
      "mutation",
      "public",
      {
        groupId: Id<"groups">;
        name?: string;
      },
      { memberId: Id<"groupMembers">; alreadyMember?: boolean; linked?: boolean }
    >;
    getGroupDetails: FunctionReference<
      "query",
      "public",
      { groupId: Id<"groups"> },
      GroupDetails | null
    >;
    addGroupExpense: FunctionReference<
      "mutation",
      "public",
      {
        groupId: Id<"groups">;
        title: string;
        amount: number;
        currency: Currency;
        amountInALL: number;
        category?: string;
        paidByMemberId: Id<"groupMembers">;
        splitType: "equal" | "exact" | "shares";
        splits: SplitItem[];
        timestamp: number;
      },
      Id<"groupExpenses">
    >;
    settleGroupDebt: FunctionReference<
      "mutation",
      "public",
      {
        groupId: Id<"groups">;
        fromMemberId: Id<"groupMembers">;
        toMemberId: Id<"groupMembers">;
        amountALL: number;
        currency: Currency;
        timestamp: number;
      },
      Id<"groupSettlements">
    >;
  };
};

export declare const internal: any;

