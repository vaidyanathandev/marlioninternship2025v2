import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

export default defineSchema({
  // ==========================================================================
  // USERS & PROFILES
  // ==========================================================================
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("GUEST"), v.literal("STUDENT"), v.literal("ADMIN")),
    phoneNumber: v.optional(v.string()),
    firebaseUid: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_firebase_uid", ["firebaseUid"]),

  studentProfiles: defineTable({
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
    banReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // ==========================================================================
  // AI INTERVIEWS
  // ==========================================================================
  interviewSessions: defineTable({
    studentId: v.id("studentProfiles"),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.union(v.literal("ai"), v.literal("student")),
        content: v.string(),
        timestamp: v.number(),
        isVoice: v.optional(v.boolean()),
      })
    ),
    transcript: v.string(),
    progress: v.number(),
    score: v.optional(v.number()),
    summary: v.optional(v.string()),
    decision: v.optional(v.union(v.literal("SELECT"), v.literal("REJECT"))),
    evaluatedAt: v.optional(v.number()),
    status: v.union(
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED"),
      v.literal("EVALUATED")
    ),
    // Detailed evaluation scores
    technicalScore: v.optional(v.number()),
    passionScore: v.optional(v.number()),
    curiosityScore: v.optional(v.number()),
    communicationScore: v.optional(v.number()),
    reasoning: v.optional(v.string()),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"]),

  // ==========================================================================
  // COURSES & MODULES
  // ==========================================================================
  courseModules: defineTable({
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    duration: v.number(), // in minutes
    order: v.number(),
    aiSummary: v.optional(v.string()), // AI-generated summary for context
    stream: v.optional(
      v.union(
        v.literal("AR_VR"),
        v.literal("FULL_STACK"),
        v.literal("AGENTIC_AI"),
        v.literal("DATA_SCIENCE")
      )
    ),
  }).index("by_order", ["order"]),

  moduleProgress: defineTable({
    studentId: v.id("studentProfiles"),
    moduleId: v.id("courseModules"),
    completed: v.boolean(),
    score: v.optional(v.number()),
    attempts: v.number(),
    lastAttemptAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_module", ["moduleId"])
    .index("by_student_and_module", ["studentId", "moduleId"]),

  knowledgeChecks: defineTable({
    studentId: v.id("studentProfiles"),
    moduleId: v.id("courseModules"),
    transcript: v.string(),
    score: v.number(),
    passed: v.boolean(),
    feedback: v.string(),
  })
    .index("by_student", ["studentId"])
    .index("by_module", ["moduleId"]),

  // ==========================================================================
  // PROJECTS
  // ==========================================================================
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    objectives: v.array(v.string()),
    techStack: v.array(v.string()),
    prerequisites: v.array(v.string()),
    learningResources: v.array(v.string()),
    duration: v.number(), // in weeks
    stream: v.union(
      v.literal("AR_VR"),
      v.literal("FULL_STACK"),
      v.literal("AGENTIC_AI"),
      v.literal("DATA_SCIENCE")
    ),
    isActive: v.boolean(),
  })
    .index("by_stream", ["stream"])
    .index("by_active", ["isActive"]),

  projectProposals: defineTable({
    studentId: v.id("studentProfiles"),
    title: v.string(),
    description: v.string(),
    pdfUrl: v.optional(v.string()),
    status: v.union(v.literal("PENDING"), v.literal("APPROVED"), v.literal("REJECTED")),
    adminFeedback: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"]),

  projectAssignments: defineTable({
    studentId: v.id("studentProfiles"),
    projectId: v.id("projects"),
    assignedBy: v.id("users"),
    assignedAt: v.number(),
    status: v.union(v.literal("ASSIGNED"), v.literal("IN_PROGRESS"), v.literal("COMPLETED")),
  })
    .index("by_student", ["studentId"])
    .index("by_project", ["projectId"]),

  // ==========================================================================
  // TASKS & DAILY LOGS
  // ==========================================================================
  tasks: defineTable({
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
  })
    .index("by_project", ["projectId"])
    .index("by_student", ["studentId"]),

  dailyLogs: defineTable({
    studentId: v.id("studentProfiles"),
    projectId: v.id("projects"),
    date: v.string(), // YYYY-MM-DD
    description: v.string(),
    githubUrl: v.optional(v.string()),
    attachments: v.array(v.string()),
    tasksCompleted: v.array(v.string()),
  })
    .index("by_student", ["studentId"])
    .index("by_project", ["projectId"])
    .index("by_date", ["date"]),

  // ==========================================================================
  // HELP & SUPPORT
  // ==========================================================================
  helpTickets: defineTable({
    studentId: v.id("studentProfiles"),
    subject: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("OPEN"),
      v.literal("IN_PROGRESS"),
      v.literal("RESOLVED"),
      v.literal("CLOSED")
    ),
    priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    assignedTo: v.optional(v.id("users")),
    resolution: v.optional(v.string()),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_assigned", ["assignedTo"]),

  // ==========================================================================
  // ANNOUNCEMENTS & MESSAGES
  // ==========================================================================
  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
    createdBy: v.id("users"),
  }).index("by_priority", ["priority"]),

  messages: defineTable({
    senderId: v.id("users"),
    recipientId: v.id("users"),
    content: v.string(),
    isRead: v.boolean(),
  })
    .index("by_sender", ["senderId"])
    .index("by_recipient", ["recipientId"]),

  // ==========================================================================
  // CERTIFICATES
  // ==========================================================================
  certificates: defineTable({
    studentId: v.id("studentProfiles"),
    projectId: v.id("projects"),
    certificateNumber: v.string(),
    qrCode: v.string(),
    pdfUrl: v.string(),
    aiSummary: v.string(),
    feedback: v.string(),
    issuedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_certificate_number", ["certificateNumber"]),

  // ==========================================================================
  // ACTIVITY LOGS
  // ==========================================================================
  activityLogs: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("REGISTRATION"),
      v.literal("INTERVIEW_COMPLETED"),
      v.literal("SELECTED"),
      v.literal("REJECTED"),
      v.literal("OFFER_ACCEPTED"),
      v.literal("MODULE_COMPLETED"),
      v.literal("PROPOSAL_SUBMITTED"),
      v.literal("PROPOSAL_APPROVED"),
      v.literal("PROPOSAL_REJECTED"),
      v.literal("PROJECT_ASSIGNED"),
      v.literal("TASK_UPDATED"),
      v.literal("DAILY_LOG_SUBMITTED"),
      v.literal("HELP_TICKET_CREATED"),
      v.literal("CERTIFICATE_ISSUED"),
      v.literal("BANNED"),
      v.literal("MESSAGE_SENT")
    ),
    description: v.string(),
    metadata: v.optional(v.any()),
  }).index("by_user", ["userId"]),

  // ==========================================================================
  // FEEDBACK
  // ==========================================================================
  studentFeedback: defineTable({
    studentId: v.id("studentProfiles"),
    rating: v.number(),
    comments: v.string(),
    suggestions: v.string(),
    wouldRecommend: v.boolean(),
  }).index("by_student", ["studentId"]),

  // ==========================================================================
  // CHAT HISTORY (for AI assistance)
  // ==========================================================================
  chatSessions: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("GENERAL"), v.literal("COURSE"), v.literal("INTERVIEW"), v.literal("HELP")),
    moduleId: v.optional(v.id("courseModules")),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),
});
