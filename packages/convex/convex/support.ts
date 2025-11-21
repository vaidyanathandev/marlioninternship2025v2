/**
 * Help tickets, announcements, and messaging
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create help ticket
 */
export const createHelpTicket = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    subject: v.string(),
    description: v.string(),
    priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
  },
  handler: async (ctx, args) => {
    const ticketId = await ctx.db.insert("helpTickets", {
      ...args,
      status: "OPEN",
    });

    const student = await ctx.db.get(args.studentId);
    if (student) {
      await ctx.db.insert("activityLogs", {
        userId: student.userId,
        type: "HELP_TICKET_CREATED",
        description: `Help ticket created: ${args.subject}`,
        metadata: { ticketId, priority: args.priority },
      });
    }

    return ticketId;
  },
});

/**
 * Update ticket status
 */
export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("helpTickets"),
    status: v.union(
      v.literal("OPEN"),
      v.literal("IN_PROGRESS"),
      v.literal("RESOLVED"),
      v.literal("CLOSED")
    ),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { ticketId, ...updates } = args;
    await ctx.db.patch(ticketId, updates);
    return { success: true };
  },
});

/**
 * Assign ticket to admin
 */
export const assignTicket = mutation({
  args: {
    ticketId: v.id("helpTickets"),
    assignedTo: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      assignedTo: args.assignedTo,
      status: "IN_PROGRESS",
    });
    return { success: true };
  },
});

/**
 * Get tickets by student
 */
export const getTicketsByStudent = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("helpTickets")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
  },
});

/**
 * Get all open tickets (Admin)
 */
export const getOpenTickets = query({
  args: {},
  handler: async (ctx) => {
    const tickets = await ctx.db
      .query("helpTickets")
      .withIndex("by_status", (q) => q.eq("status", "OPEN"))
      .collect();

    return await Promise.all(
      tickets.map(async (t) => ({
        ...t,
        student: await ctx.db.get(t.studentId),
      }))
    );
  },
});

/**
 * Create announcement (Admin)
 */
export const createAnnouncement = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("announcements", args);
  },
});

/**
 * Get all announcements
 */
export const getAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("announcements").collect();
  },
});

/**
 * Delete announcement
 */
export const deleteAnnouncement = mutation({
  args: { announcementId: v.id("announcements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.announcementId);
    return { success: true };
  },
});

/**
 * Send message
 */
export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    recipientId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      ...args,
      isRead: false,
    });

    await ctx.db.insert("activityLogs", {
      userId: args.senderId,
      type: "MESSAGE_SENT",
      description: "Message sent",
      metadata: { messageId, recipientId: args.recipientId },
    });

    return messageId;
  },
});

/**
 * Mark message as read
 */
export const markMessageRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { isRead: true });
    return { success: true };
  },
});

/**
 * Get messages for user
 */
export const getMessagesByRecipient = query({
  args: { recipientId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
      .collect();
  },
});

/**
 * Get unread message count
 */
export const getUnreadCount = query({
  args: { recipientId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.recipientId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return messages.length;
  },
});
