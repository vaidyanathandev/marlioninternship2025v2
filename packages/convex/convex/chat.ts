/**
 * AI Chat sessions and history
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create or get chat session
 */
export const getOrCreateChatSession = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("GENERAL"),
      v.literal("COURSE"),
      v.literal("INTERVIEW"),
      v.literal("HELP")
    ),
    moduleId: v.optional(v.id("courseModules")),
  },
  handler: async (ctx, args) => {
    // Check if session exists
    const existing = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new session
    return await ctx.db.insert("chatSessions", {
      userId: args.userId,
      type: args.type,
      moduleId: args.moduleId,
      messages: [],
    });
  },
});

/**
 * Add message to chat
 */
export const addChatMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, ...messageData } = args;
    const session = await ctx.db.get(sessionId);

    if (!session) {
      throw new Error("Chat session not found");
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...messageData,
      timestamp: Date.now(),
    };

    await ctx.db.patch(sessionId, {
      messages: [...session.messages, newMessage],
    });

    return newMessage;
  },
});

/**
 * Get chat session
 */
export const getChatSession = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

/**
 * Get chat sessions by user
 */
export const getChatSessionsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Clear chat session
 */
export const clearChatSession = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      messages: [],
    });
    return { success: true };
  },
});
