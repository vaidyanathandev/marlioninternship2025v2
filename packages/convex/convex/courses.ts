/**
 * Course and module management functions
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new course module (Admin)
 */
export const createModule = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    duration: v.number(),
    order: v.number(),
    aiSummary: v.optional(v.string()),
    stream: v.optional(
      v.union(
        v.literal("AR_VR"),
        v.literal("FULL_STACK"),
        v.literal("AGENTIC_AI"),
        v.literal("DATA_SCIENCE")
      )
    ),
  },
  handler: async (ctx, args) => {
    const moduleId = await ctx.db.insert("courseModules", args);
    return moduleId;
  },
});

/**
 * Update a module
 */
export const updateModule = mutation({
  args: {
    moduleId: v.id("courseModules"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
    aiSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { moduleId, ...updates } = args;
    await ctx.db.patch(moduleId, updates);
    return { success: true };
  },
});

/**
 * Delete a module
 */
export const deleteModule = mutation({
  args: { moduleId: v.id("courseModules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.moduleId);
    return { success: true };
  },
});

/**
 * Get all modules
 */
export const getAllModules = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courseModules").withIndex("by_order").collect();
  },
});

/**
 * Get module by ID
 */
export const getModule = query({
  args: { moduleId: v.id("courseModules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.moduleId);
  },
});

/**
 * Start module (track progress)
 */
export const startModule = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    moduleId: v.id("courseModules"),
  },
  handler: async (ctx, args) => {
    // Check if progress exists
    const existing = await ctx.db
      .query("moduleProgress")
      .withIndex("by_student_and_module", (q) =>
        q.eq("studentId", args.studentId).eq("moduleId", args.moduleId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new progress entry
    const progressId = await ctx.db.insert("moduleProgress", {
      studentId: args.studentId,
      moduleId: args.moduleId,
      completed: false,
      attempts: 0,
    });

    return progressId;
  },
});

/**
 * Complete module
 */
export const completeModule = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    moduleId: v.id("courseModules"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("moduleProgress")
      .withIndex("by_student_and_module", (q) =>
        q.eq("studentId", args.studentId).eq("moduleId", args.moduleId)
      )
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        completed: true,
        score: args.score,
        completedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("moduleProgress", {
        studentId: args.studentId,
        moduleId: args.moduleId,
        completed: true,
        score: args.score,
        attempts: 1,
        completedAt: Date.now(),
      });
    }

    // Log activity
    const student = await ctx.db.get(args.studentId);
    if (student) {
      await ctx.db.insert("activityLogs", {
        userId: student.userId,
        type: "MODULE_COMPLETED",
        description: `Completed module with score: ${args.score}`,
        metadata: { moduleId: args.moduleId, score: args.score },
      });
    }

    return { success: true };
  },
});

/**
 * Submit knowledge check
 */
export const submitKnowledgeCheck = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    moduleId: v.id("courseModules"),
    transcript: v.string(),
    score: v.number(),
    passed: v.boolean(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const checkId = await ctx.db.insert("knowledgeChecks", args);

    // Update progress attempts
    const progress = await ctx.db
      .query("moduleProgress")
      .withIndex("by_student_and_module", (q) =>
        q.eq("studentId", args.studentId).eq("moduleId", args.moduleId)
      )
      .first();

    if (progress) {
      await ctx.db.patch(progress._id, {
        attempts: progress.attempts + 1,
        lastAttemptAt: Date.now(),
      });
    }

    return checkId;
  },
});

/**
 * Get student's module progress
 */
export const getStudentProgress = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("moduleProgress")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    // Fetch module details
    const progressWithModules = await Promise.all(
      progress.map(async (p) => {
        const module = await ctx.db.get(p.moduleId);
        return {
          ...p,
          module,
        };
      })
    );

    return progressWithModules;
  },
});

/**
 * Get overall completion percentage
 */
export const getCompletionPercentage = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    const allModules = await ctx.db.query("courseModules").collect();
    const studentProgress = await ctx.db
      .query("moduleProgress")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const completed = studentProgress.filter((p) => p.completed).length;
    const total = allModules.length;

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  },
});
