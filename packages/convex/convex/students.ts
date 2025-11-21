/**
 * Student registration and profile management
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Register a new student
 */
export const registerStudent = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    college: v.string(),
    customCollege: v.optional(v.string()),
    year: v.number(),
    department: v.string(),
    registerNumber: v.optional(v.string()),
    idProofUrl: v.optional(v.string()),
    stream: v.union(
      v.literal("AR_VR"),
      v.literal("FULL_STACK"),
      v.literal("AGENTIC_AI"),
      v.literal("DATA_SCIENCE")
    ),
    startDate: v.string(),
    endDate: v.string(),
    specialRequests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;

    // Check if student already registered
    const existing = await ctx.db
      .query("studentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      throw new Error("Student already registered");
    }

    // Create student profile
    const studentId = await ctx.db.insert("studentProfiles", {
      ...profileData,
      userId,
      status: "REGISTERED",
    });

    // Update user role
    await ctx.db.patch(userId, { role: "STUDENT" });

    // Log activity
    await ctx.db.insert("activityLogs", {
      userId,
      type: "REGISTRATION",
      description: `Student ${profileData.name} registered for ${profileData.stream} internship`,
      metadata: { studentId },
    });

    return studentId;
  },
});

/**
 * Get student profile by user ID
 */
export const getStudentProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("studentProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return profile;
  },
});

/**
 * Get student profile by ID
 */
export const getStudentById = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

/**
 * Update student status
 */
export const updateStudentStatus = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    status: v.union(
      v.literal("REGISTERED"),
      v.literal("INTERVIEW_PENDING"),
      v.literal("INTERVIEW_COMPLETED"),
      v.literal("UNDER_REVIEW"),
      v.literal("SELECTED"),
      v.literal("REJECTED"),
      v.literal("OFFER_RELEASED"),
      v.literal("OFFER_ACCEPTED"),
      v.literal("ACTIVE"),
      v.literal("COMPLETED"),
      v.literal("BANNED")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { studentId, status, reason } = args;

    await ctx.db.patch(studentId, {
      status,
      ...(status === "BANNED" && reason ? { banReason: reason } : {}),
    });

    // Log activity
    const student = await ctx.db.get(studentId);
    if (student) {
      await ctx.db.insert("activityLogs", {
        userId: student.userId,
        type: status === "SELECTED" ? "SELECTED" : status === "REJECTED" ? "REJECTED" : status === "BANNED" ? "BANNED" : "REGISTRATION",
        description: `Student status updated to ${status}`,
        metadata: { studentId, reason },
      });
    }

    return { success: true };
  },
});

/**
 * Ban a student
 */
export const banStudent = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.studentId, {
      status: "BANNED",
      banReason: args.reason,
    });

    const student = await ctx.db.get(args.studentId);
    if (student) {
      await ctx.db.insert("activityLogs", {
        userId: student.userId,
        type: "BANNED",
        description: `Student banned: ${args.reason}`,
        metadata: { studentId: args.studentId },
      });
    }

    return { success: true };
  },
});

/**
 * Get all students (for admin)
 */
export const getAllStudents = query({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db.query("studentProfiles").collect();
    return students;
  },
});

/**
 * Get students by status
 */
export const getStudentsByStatus = query({
  args: {
    status: v.union(
      v.literal("REGISTERED"),
      v.literal("INTERVIEW_PENDING"),
      v.literal("INTERVIEW_COMPLETED"),
      v.literal("UNDER_REVIEW"),
      v.literal("SELECTED"),
      v.literal("REJECTED"),
      v.literal("OFFER_RELEASED"),
      v.literal("OFFER_ACCEPTED"),
      v.literal("ACTIVE"),
      v.literal("COMPLETED"),
      v.literal("BANNED")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentProfiles")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/**
 * Search students
 */
export const searchStudents = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const students = await ctx.db.query("studentProfiles").collect();
    const searchTerm = args.query.toLowerCase();

    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.email.toLowerCase().includes(searchTerm) ||
        s.college.toLowerCase().includes(searchTerm) ||
        s.department.toLowerCase().includes(searchTerm)
    );
  },
});

/**
 * Get student statistics (for admin dashboard)
 */
export const getStudentStats = query({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db.query("studentProfiles").collect();

    const stats = {
      totalRegistrations: students.length,
      pendingInterviews: students.filter((s) => s.status === "INTERVIEW_PENDING").length,
      underReview: students.filter((s) => s.status === "UNDER_REVIEW").length,
      selected: students.filter((s) => s.status === "SELECTED").length,
      rejected: students.filter((s) => s.status === "REJECTED").length,
      active: students.filter((s) => s.status === "ACTIVE").length,
      completed: students.filter((s) => s.status === "COMPLETED").length,
      banned: students.filter((s) => s.status === "BANNED").length,
    };

    return stats;
  },
});
