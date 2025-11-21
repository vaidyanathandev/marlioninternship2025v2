/**
 * Project and proposal management functions
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new project (Admin)
 */
export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    objectives: v.array(v.string()),
    techStack: v.array(v.string()),
    prerequisites: v.array(v.string()),
    learningResources: v.array(v.string()),
    duration: v.number(),
    stream: v.union(
      v.literal("AR_VR"),
      v.literal("FULL_STACK"),
      v.literal("AGENTIC_AI"),
      v.literal("DATA_SCIENCE")
    ),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", args);
  },
});

/**
 * Update project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    techStack: v.optional(v.array(v.string())),
    prerequisites: v.optional(v.array(v.string())),
    learningResources: v.optional(v.array(v.string())),
    duration: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args;
    await ctx.db.patch(projectId, updates);
    return { success: true };
  },
});

/**
 * Get all active projects
 */
export const getActiveProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

/**
 * Get projects by stream
 */
export const getProjectsByStream = query({
  args: {
    stream: v.union(
      v.literal("AR_VR"),
      v.literal("FULL_STACK"),
      v.literal("AGENTIC_AI"),
      v.literal("DATA_SCIENCE")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_stream", (q) => q.eq("stream", args.stream))
      .collect();
  },
});

/**
 * Submit project proposal
 */
export const submitProposal = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    title: v.string(),
    description: v.string(),
    pdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const proposalId = await ctx.db.insert("projectProposals", {
      ...args,
      status: "PENDING",
    });

    const student = await ctx.db.get(args.studentId);
    if (student) {
      await ctx.db.insert("activityLogs", {
        userId: student.userId,
        type: "PROPOSAL_SUBMITTED",
        description: `Project proposal submitted: ${args.title}`,
        metadata: { proposalId },
      });
    }

    return proposalId;
  },
});

/**
 * Review proposal (Admin)
 */
export const reviewProposal = mutation({
  args: {
    proposalId: v.id("projectProposals"),
    status: v.union(v.literal("APPROVED"), v.literal("REJECTED")),
    adminFeedback: v.optional(v.string()),
    reviewedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { proposalId, ...review } = args;

    await ctx.db.patch(proposalId, {
      ...review,
      reviewedAt: Date.now(),
    });

    const proposal = await ctx.db.get(proposalId);
    if (proposal) {
      const student = await ctx.db.get(proposal.studentId);
      if (student) {
        await ctx.db.insert("activityLogs", {
          userId: student.userId,
          type: args.status === "APPROVED" ? "PROPOSAL_APPROVED" : "PROPOSAL_REJECTED",
          description: `Project proposal ${args.status.toLowerCase()}: ${proposal.title}`,
          metadata: { proposalId, feedback: args.adminFeedback },
        });
      }
    }

    return { success: true };
  },
});

/**
 * Get proposals by student
 */
export const getProposalsByStudent = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectProposals")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

/**
 * Get pending proposals (Admin)
 */
export const getPendingProposals = query({
  args: {},
  handler: async (ctx) => {
    const proposals = await ctx.db
      .query("projectProposals")
      .withIndex("by_status", (q) => q.eq("status", "PENDING"))
      .collect();

    return await Promise.all(
      proposals.map(async (p) => ({
        ...p,
        student: await ctx.db.get(p.studentId),
      }))
    );
  },
});

/**
 * Assign project to student (Admin)
 */
export const assignProject = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    projectId: v.id("projects"),
    assignedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const assignmentId = await ctx.db.insert("projectAssignments", {
      ...args,
      assignedAt: Date.now(),
      status: "ASSIGNED",
    });

    const student = await ctx.db.get(args.studentId);
    if (student) {
      await ctx.db.insert("activityLogs", {
        userId: student.userId,
        type: "PROJECT_ASSIGNED",
        description: "Project assigned",
        metadata: { projectId: args.projectId, assignmentId },
      });
    }

    return assignmentId;
  },
});

/**
 * Get student's assigned project
 */
export const getStudentProject = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    const assignment = await ctx.db
      .query("projectAssignments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .first();

    if (!assignment) return null;

    const project = await ctx.db.get(assignment.projectId);
    return {
      assignment,
      project,
    };
  },
});

/**
 * Update project assignment status
 */
export const updateAssignmentStatus = mutation({
  args: {
    assignmentId: v.id("projectAssignments"),
    status: v.union(v.literal("ASSIGNED"), v.literal("IN_PROGRESS"), v.literal("COMPLETED")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assignmentId, {
      status: args.status,
    });
    return { success: true };
  },
});
