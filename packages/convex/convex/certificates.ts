/**
 * Certificate generation and verification
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate certificate
 */
export const generateCertificate = mutation({
  args: {
    studentId: v.id("studentProfiles"),
    projectId: v.id("projects"),
    certificateNumber: v.string(),
    qrCode: v.string(),
    pdfUrl: v.string(),
    aiSummary: v.string(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const certificateId = await ctx.db.insert("certificates", {
      ...args,
      issuedAt: Date.now(),
    });

    // Update student status to completed
    await ctx.db.patch(args.studentId, {
      status: "COMPLETED",
    });

    const student = await ctx.db.get(args.studentId);
    if (student) {
      await ctx.db.insert("activityLogs", {
        userId: student.userId,
        type: "CERTIFICATE_ISSUED",
        description: "Internship certificate issued",
        metadata: { certificateId, certificateNumber: args.certificateNumber },
      });
    }

    return certificateId;
  },
});

/**
 * Get certificate by student
 */
export const getCertificateByStudent = query({
  args: { studentId: v.id("studentProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .first();
  },
});

/**
 * Verify certificate by number
 */
export const verifyCertificate = query({
  args: { certificateNumber: v.string() },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("certificates")
      .withIndex("by_certificate_number", (q) =>
        q.eq("certificateNumber", args.certificateNumber)
      )
      .first();

    if (!certificate) return null;

    const student = await ctx.db.get(certificate.studentId);
    const project = await ctx.db.get(certificate.projectId);

    return {
      certificate,
      student,
      project,
    };
  },
});

/**
 * Get all issued certificates (Admin)
 */
export const getAllCertificates = query({
  args: {},
  handler: async (ctx) => {
    const certificates = await ctx.db.query("certificates").collect();

    return await Promise.all(
      certificates.map(async (cert) => ({
        ...cert,
        student: await ctx.db.get(cert.studentId),
        project: await ctx.db.get(cert.projectId),
      }))
    );
  },
});
