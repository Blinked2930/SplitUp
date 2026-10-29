import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  groups: defineTable({
    name: v.string(),
    currency: v.union(v.literal("ALL"), v.literal("EUR"), v.literal("USD")),
    description: v.optional(v.string()),
    createdBy: v.string(), // Clerk userId
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_deleted", ["deleted"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.optional(v.string()), // Optional Clerk userId
    name: v.string(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    joinedAt: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_userId", ["userId"])
    .index("by_groupId_and_userId", ["groupId", "userId"]),

  groupExpenses: defineTable({
    groupId: v.id("groups"),
    title: v.string(),
    amount: v.number(),
    currency: v.union(v.literal("ALL"), v.literal("EUR"), v.literal("USD")),
    amountInALL: v.number(),
    category: v.optional(v.string()),
    paidByMemberId: v.id("groupMembers"),
    paidByUserId: v.optional(v.string()),
    splitType: v.union(v.literal("equal"), v.literal("exact"), v.literal("shares")),
    splits: v.array(
      v.object({
        memberId: v.id("groupMembers"),
        userId: v.optional(v.string()),
        amountALL: v.number(),
      })
    ),
    timestamp: v.number(),
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_groupId", ["groupId"])
    .index("by_groupId_and_timestamp", ["groupId", "timestamp"]),

  groupSettlements: defineTable({
    groupId: v.id("groups"),
    fromMemberId: v.id("groupMembers"),
    toMemberId: v.id("groupMembers"),
    fromUserId: v.optional(v.string()),
    toUserId: v.optional(v.string()),
    amountALL: v.number(),
    currency: v.union(v.literal("ALL"), v.literal("EUR"), v.literal("USD")),
    timestamp: v.number(),
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
  })
    .index("by_groupId", ["groupId"])
    .index("by_groupId_and_timestamp", ["groupId", "timestamp"]),
});

