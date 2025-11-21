/**
 * Activity logging and tracking
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get activity logs by user
 */
export const getActivityLogsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get all activity logs (Admin)
 */
export const getAllActivityLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const query = ctx.db.query("activityLogs").order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

/**
 * Get recent activity (Admin dashboard)
 */
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("activityLogs").order("desc").take(50);

    return await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user,
        };
      })
    );
  },
});
