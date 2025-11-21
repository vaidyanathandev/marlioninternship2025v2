/**
 * AI Interview management functions
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Start a new interview session
 */
export const startInterview = mutation({
  args: {
    studentId: v.id("studentProfiles"),
  },
  handler: async (ctx, args) => {
    // Check if interview already exists
    const existing = await ctx.db
      .query("interviewSessions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new interview session
    const interviewId = await ctx.db.insert("interviewSessions", {
      studentId: args.studentId,
      messages: [],
      transcript: "",
      progress: 0,
      status: "IN_PROGRESS",
    });

    // Update student status
    await ctx.db.patch(args.studentId, {
      status: "INTERVIEW_PENDING",
    });

    return interviewId;
  },
});

/**
 * Add message to interview
 */
export const addInterviewMessage = mutation({
  args: {
    interviewId: v.id("interviewSessions"),
    role: v.union(v.literal("ai"), v.literal("student")),
    content: v.string(),
    isVoice: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { interviewId, ...messageData } = args;
    const interview = await ctx.db.get(interviewId);

    if (!interview) {
      throw new Error("Interview not found");
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...messageData,
      timestamp: Date.now(),
    };

    const updatedMessages = [...interview.messages, newMessage];
    const transcript = updatedMessages
      .map((m) => `${m.role === "ai" ? "AI" : "Student"}: ${m.content}`)
      .join("\n\n");

    await ctx.db.patch(interviewId, {
      messages: updatedMessages,
      transcript,
    });

    return newMessage;
  },
});

/**
 * Update interview progress
 */
export const updateInterviewProgress = mutation({
  args: {
    interviewId: v.id("interviewSessions"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      progress: args.progress,
    });

    // If progress is 100%, mark as completed
    if (args.progress >= 100) {
      await ctx.db.patch(args.interviewId, {
        status: "COMPLETED",
      });

      const interview = await ctx.db.get(args.interviewId);
      if (interview) {
        await ctx.db.patch(interview.studentId, {
          status: "INTERVIEW_COMPLETED",
        });
      }
    }

    return { success: true };
  },
});

/**
 * Submit interview evaluation
 */
export const evaluateInterview = mutation({
  args: {
    interviewId: v.id("interviewSessions"),
    score: v.number(),
    summary: v.string(),
    decision: v.union(v.literal("SELECT"), v.literal("REJECT")),
    technicalScore: v.number(),
    passionScore: v.number(),
    curiosityScore: v.number(),
    communicationScore: v.number(),
    reasoning: v.string(),
  },
  handler: async (ctx, args) => {
    const { interviewId, ...evaluation } = args;

    await ctx.db.patch(interviewId, {
      ...evaluation,
      evaluatedAt: Date.now(),
      status: "EVALUATED",
    });

    const interview = await ctx.db.get(interviewId);
    if (interview) {
      await ctx.db.patch(interview.studentId, {
        status: "UNDER_REVIEW",
      });

      const student = await ctx.db.get(interview.studentId);
      if (student) {
        await ctx.db.insert("activityLogs", {
          userId: student.userId,
          type: "INTERVIEW_COMPLETED",
          description: `Interview evaluated with score: ${evaluation.score}`,
          metadata: { interviewId, evaluation },
        });
      }
    }

    return { success: true };
  },
});

/**
 * Get interview by student ID
 */
export const getInterviewByStudent = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviewSessions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .first();
  },
});

/**
 * Get all completed interviews for admin review
 */
export const getCompletedInterviews = query({
  args: {},
  handler: async (ctx) => {
    const interviews = await ctx.db
      .query("interviewSessions")
      .withIndex("by_status", (q) => q.eq("status", "COMPLETED"))
      .collect();

    // Fetch student details for each interview
    const interviewsWithStudents = await Promise.all(
      interviews.map(async (interview) => {
        const student = await ctx.db.get(interview.studentId);
        return {
          ...interview,
          student,
        };
      })
    );

    return interviewsWithStudents;
  },
});

/**
 * Get interviews under review
 */
export const getInterviewsUnderReview = query({
  args: {},
  handler: async (ctx) => {
    const interviews = await ctx.db
      .query("interviewSessions")
      .withIndex("by_status", (q) => q.eq("status", "EVALUATED"))
      .collect();

    const interviewsWithStudents = await Promise.all(
      interviews.map(async (interview) => {
        const student = await ctx.db.get(interview.studentId);
        return {
          ...interview,
          student,
        };
      })
    );

    return interviewsWithStudents;
  },
});
