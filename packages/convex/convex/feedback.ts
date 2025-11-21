/**
 * Student feedback management
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit student feedback
 */
export const submitFeedback = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    rating: v.number(),
    comments: v.string(),
    suggestions: v.string(),
    wouldRecommend: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studentFeedback", args);
  },
});

/**
 * Get all feedback (Admin)
 */
export const getAllFeedback = query({
  args: {},
  handler: async (ctx) => {
    const feedback = await ctx.db.query("studentFeedback").collect();

    return await Promise.all(
      feedback.map(async (f) => ({
        ...f,
        student: await ctx.db.get(f.studentId),
      }))
    );
  },
});

/**
 * Get feedback by student
 */
export const getFeedbackByStudent = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentFeedback")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .first();
  },
});

/**
 * Get average rating
 */
export const getAverageRating = query({
  args: {},
  handler: async (ctx) => {
    const feedback = await ctx.db.query("studentFeedback").collect();

    if (feedback.length === 0) return 0;

    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    return totalRating / feedback.length;
  },
});
