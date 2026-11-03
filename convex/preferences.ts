// convex/preferences.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const currencyCode = v.string();

export const getMyPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anonymous";
    const existing = await ctx.db
      .query("userPreferences")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    // Always return the same shape — no union inference.
    const baseCurrency = existing?.baseCurrency ?? "ALL";
    const updatedAt = existing?.updatedAt ?? 0;
    return { userId, baseCurrency, updatedAt };
  },
});

export const setBaseCurrency = mutation({
  args: { baseCurrency: currencyCode },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anonymous";
    const existing = await ctx.db
      .query("userPreferences")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        baseCurrency: args.baseCurrency,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        baseCurrency: args.baseCurrency,
        updatedAt: now,
      });
    }
  },
});