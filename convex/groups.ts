import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMyGroups = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;

    // Find all memberships for this user
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();

    const memberGroupIds = new Set(memberships.map((m: any) => m.groupId));

    // Also include groups created by this user if any
    const createdGroups = await ctx.db
      .query("groups")
      .withIndex("by_createdBy", (q: any) => q.eq("createdBy", userId))
      .filter((q: any) => q.neq(q.field("deleted"), true))
      .collect();

    for (const g of createdGroups) {
      memberGroupIds.add(g._id);
    }

    const groupList = [];

    for (const groupId of memberGroupIds) {
      const group = await ctx.db.get(groupId);
      if (!group || group.deleted) continue;

      const members = await ctx.db
        .query("groupMembers")
        .withIndex("by_groupId", (q: any) => q.eq("groupId", groupId))
        .collect();

      const userMember = members.find((m: any) => m.userId === userId);
      const userMemberId = userMember?._id;

      const expenses = await ctx.db
        .query("groupExpenses")
        .withIndex("by_groupId", (q: any) => q.eq("groupId", groupId))
        .filter((q: any) => q.neq(q.field("deleted"), true))
        .collect();

      const settlements = await ctx.db
        .query("groupSettlements")
        .withIndex("by_groupId", (q: any) => q.eq("groupId", groupId))
        .filter((q: any) => q.neq(q.field("deleted"), true))
        .collect();

      // Calculate user's net position in this group
      let userNetPosition = 0;
      let lastActivityTime = group.createdAt;

      for (const exp of expenses) {
        if (exp.timestamp > lastActivityTime) {
          lastActivityTime = exp.timestamp;
        }

        // If user paid
        if (userMemberId && exp.paidByMemberId === userMemberId) {
          userNetPosition += exp.amountInALL;
        }

        // User's split share (amount they owe towards the expense)
        const mySplit = exp.splits.find(
          (s: any) =>
            (userMemberId && s.memberId === userMemberId) ||
            (s.userId && s.userId === userId)
        );
        if (mySplit) {
          userNetPosition -= mySplit.amountALL;
        }
      }

      for (const set of settlements) {
        if (set.timestamp > lastActivityTime) {
          lastActivityTime = set.timestamp;
        }

        // If user paid to settle debt
        if (
          (userMemberId && set.fromMemberId === userMemberId) ||
          set.fromUserId === userId
        ) {
          userNetPosition += set.amountALL;
        }

        // If user received settlement money
        if (
          (userMemberId && set.toMemberId === userMemberId) ||
          set.toUserId === userId
        ) {
          userNetPosition -= set.amountALL;
        }
      }

      groupList.push({
        _id: group._id,
        name: group.name,
        currency: group.currency,
        description: group.description,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
        memberCount: members.length,
        userNetPosition,
        lastActivityTime,
        members: members.map((m: any) => ({
          _id: m._id,
          name: m.name,
          userId: m.userId,
          email: m.email,
        })),
      });
    }

    // Sort by last activity descending
    groupList.sort((a: any, b: any) => b.lastActivityTime - a.lastActivityTime);

    return groupList;
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    currency: v.union(v.literal("ALL"), v.literal("EUR"), v.literal("USD")),
    description: v.optional(v.string()),
    creatorName: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized. Please sign in to create a group.");
    }
    const userId = identity.subject;
    const now = Date.now();

    const groupId = await ctx.db.insert("groups", {
      name: args.name.trim(),
      currency: args.currency,
      description: args.description?.trim(),
      createdBy: userId,
      createdAt: now,
    });

    // Add creator as member
    await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      name: args.creatorName.trim() || identity.name || "Organizer",
      email: identity.email,
      avatarUrl: identity.pictureUrl,
      joinedAt: now,
    });

    return groupId;
  },
});

export const addMember = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    email: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const group = await ctx.db.get(args.groupId);
    if (!group || group.deleted) {
      throw new Error("Group not found");
    }

    // Check if member with same userId or exact name already exists
    const existingMembers = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q: any) => q.eq("groupId", args.groupId))
      .collect();

    if (args.userId) {
      const matchUserId = existingMembers.find((m: any) => m.userId === args.userId);
      if (matchUserId) return matchUserId._id;
    }

    const memberId = await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      name: args.name.trim(),
      email: args.email?.trim(),
      userId: args.userId,
      joinedAt: Date.now(),
    });

    return memberId;
  },
});

export const joinGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to join");
    }
    const userId = identity.subject;

    const group = await ctx.db.get(args.groupId);
    if (!group || group.deleted) {
      throw new Error("Group does not exist or has been removed.");
    }

    const existingMembers = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q: any) => q.eq("groupId", args.groupId))
      .collect();

    // Already a member by userId?
    const existing = existingMembers.find((m: any) => m.userId === userId);
    if (existing) {
      return { memberId: existing._id, alreadyMember: true };
    }

    // If an unclaimed member exists with matching email, link them
    if (identity.email) {
      const emailMatch = existingMembers.find(
        (m: any) => !m.userId && m.email?.toLowerCase() === identity.email?.toLowerCase()
      );
      if (emailMatch) {
        await ctx.db.patch(emailMatch._id, {
          userId,
          avatarUrl: identity.pictureUrl || emailMatch.avatarUrl,
        });
        return { memberId: emailMatch._id, linked: true };
      }
    }

    // Create new member
    const newMemberName =
      args.name?.trim() || identity.name || identity.email?.split("@")[0] || "Friend";

    const memberId = await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId,
      name: newMemberName,
      email: identity.email,
      avatarUrl: identity.pictureUrl,
      joinedAt: Date.now(),
    });

    return { memberId, alreadyMember: false };
  },
});

export const getGroupDetails = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx: any, args: any) => {
    const group = await ctx.db.get(args.groupId);
    if (!group || group.deleted) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();
    const currentUserId = identity?.subject;

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q: any) => q.eq("groupId", args.groupId))
      .collect();

    const expenses = await ctx.db
      .query("groupExpenses")
      .withIndex("by_groupId", (q: any) => q.eq("groupId", args.groupId))
      .filter((q: any) => q.neq(q.field("deleted"), true))
      .collect();

    const settlements = await ctx.db
      .query("groupSettlements")
      .withIndex("by_groupId", (q: any) => q.eq("groupId", args.groupId))
      .filter((q: any) => q.neq(q.field("deleted"), true))
      .collect();

    // Sort expenses and settlements newest first
    expenses.sort((a: any, b: any) => b.timestamp - a.timestamp);
    settlements.sort((a: any, b: any) => b.timestamp - a.timestamp);

    const userMember = currentUserId
      ? members.find((m: any) => m.userId === currentUserId)
      : null;

    return {
      group,
      members,
      expenses,
      settlements,
      userMemberId: userMember?._id || null,
      currentUserId: currentUserId || null,
    };
  },
});

export const addGroupExpense = mutation({
  args: {
    groupId: v.id("groups"),
    title: v.string(),
    amount: v.number(),
    currency: v.union(v.literal("ALL"), v.literal("EUR"), v.literal("USD")),
    amountInALL: v.number(),
    category: v.optional(v.string()),
    paidByMemberId: v.id("groupMembers"),
    splitType: v.union(v.literal("equal"), v.literal("exact"), v.literal("shares")),
    splits: v.array(
      v.object({
        memberId: v.id("groupMembers"),
        userId: v.optional(v.string()),
        amountALL: v.number(),
      })
    ),
    timestamp: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const group = await ctx.db.get(args.groupId);
    if (!group || group.deleted) {
      throw new Error("Group not found");
    }

    const payer = await ctx.db.get(args.paidByMemberId);

    const expenseId = await ctx.db.insert("groupExpenses", {
      groupId: args.groupId,
      title: args.title.trim(),
      amount: args.amount,
      currency: args.currency,
      amountInALL: args.amountInALL,
      category: args.category?.trim(),
      paidByMemberId: args.paidByMemberId,
      paidByUserId: payer?.userId,
      splitType: args.splitType,
      splits: args.splits,
      timestamp: args.timestamp,
      createdAt: Date.now(),
    });

    return expenseId;
  },
});

export const settleGroupDebt = mutation({
  args: {
    groupId: v.id("groups"),
    fromMemberId: v.id("groupMembers"),
    toMemberId: v.id("groupMembers"),
    amountALL: v.number(),
    currency: v.union(v.literal("ALL"), v.literal("EUR"), v.literal("USD")),
    timestamp: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const group = await ctx.db.get(args.groupId);
    if (!group || group.deleted) {
      throw new Error("Group not found");
    }

    const fromMember = await ctx.db.get(args.fromMemberId);
    const toMember = await ctx.db.get(args.toMemberId);

    const settlementId = await ctx.db.insert("groupSettlements", {
      groupId: args.groupId,
      fromMemberId: args.fromMemberId,
      toMemberId: args.toMemberId,
      fromUserId: fromMember?.userId,
      toUserId: toMember?.userId,
      amountALL: args.amountALL,
      currency: args.currency,
      timestamp: args.timestamp,
      createdAt: Date.now(),
    });

    return settlementId;
  },
});
