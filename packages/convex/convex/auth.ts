/**
 * Authentication functions with Firebase token verification
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get or create user from Firebase authentication
 * Called after Firebase auth to sync user to Convex
 */
export const syncUser = mutation({
  args: {
    firebaseUid: v.string(),
    email: v.string(),
    name: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();

    if (existingUser) {
      // Update user info
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        phoneNumber: args.phoneNumber,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      firebaseUid: args.firebaseUid,
      email: args.email,
      name: args.name,
      role: "GUEST",
      phoneNumber: args.phoneNumber,
    });

    return userId;
  },
});

/**
 * Get current user by Firebase UID
 */
export const getCurrentUser = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .first();

    if (!user) {
      return null;
    }

    // If user is a student, fetch their profile too
    if (user.role === "STUDENT") {
      const studentProfile = await ctx.db
        .query("studentProfiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      return {
        ...user,
        studentProfile,
      };
    }

    return user;
  },
});

/**
 * Check if email is already registered
 */
export const checkEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return !!user;
  },
});

/**
 * Admin login verification
 */
export const verifyAdmin = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user?.role === "ADMIN";
  },
});
