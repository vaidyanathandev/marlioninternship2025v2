/**
 * Task management and daily logs
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a task
 */
export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    studentId: v.id("studentProfiles"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("TODO"),
      v.literal("IN_PROGRESS"),
      v.literal("IN_REVIEW"),
      v.literal("DONE")
    ),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

/**
 * Update task
 */
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("TODO"),
        v.literal("IN_PROGRESS"),
        v.literal("IN_REVIEW"),
        v.literal("DONE")
      )
    ),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    await ctx.db.patch(taskId, updates);

    const task = await ctx.db.get(taskId);
    if (task) {
      const student = await ctx.db.get(task.studentId);
      if (student) {
        await ctx.db.insert("activityLogs", {
          userId: student.userId,
          type: "TASK_UPDATED",
          description: `Task updated: ${task.title}`,
          metadata: { taskId, updates },
        });
      }
    }

    return { success: true };
  },
});

/**
 * Delete task
 */
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
    return { success: true };
  },
});

/**
 * Get tasks by project
 */
export const getTasksByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

/**
 * Get tasks by student
 */
export const getTasksByStudent = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

/**
 * Submit daily log
 */
export const submitDailyLog = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    projectId: v.id("projects"),
    date: v.string(),
    description: v.string(),
    githubUrl: v.optional(v.string()),
    attachments: v.array(v.string()),
    tasksCompleted: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if log already exists for this date
    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
      .first();

    if (existing) {
      // Update existing log
      await ctx.db.patch(existing._id, {
        description: args.description,
        githubUrl: args.githubUrl,
        attachments: args.attachments,
        tasksCompleted: args.tasksCompleted,
      });
      return existing._id;
    }

    // Create new log
    const logId = await ctx.db.insert("dailyLogs", args);

    const student = await ctx.db.get(args.studentId);
    if (student) {
      await ctx.db.insert("activityLogs", {
        userId: student.userId,
        type: "DAILY_LOG_SUBMITTED",
        description: `Daily log submitted for ${args.date}`,
        metadata: { logId, date: args.date },
      });
    }

    return logId;
  },
});

/**
 * Get daily logs by student
 */
export const getDailyLogsByStudent = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

/**
 * Get daily log by date
 */
export const getDailyLogByDate = query({
  args: {
    studentId: v.id("studentProfiles"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
      .first();
  },
});
