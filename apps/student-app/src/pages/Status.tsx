import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { Loading } from "@marlion/ui";

export default function Status() {
  const navigate = useNavigate();
  const { studentProfile } = useAuth();

  // Get interview evaluation
  const interviewEvaluation = useQuery(
    api.interviews.getStudentEvaluation,
    studentProfile ? { studentId: studentProfile._id } : "skip"
  );

  // Redirect if status changes
  useEffect(() => {
    if (studentProfile) {
      if (studentProfile.status === "OFFER_RELEASED") {
        navigate("/offer");
      } else if (studentProfile.status === "REJECTED") {
        navigate("/rejected");
      } else if (studentProfile.status === "OFFER_ACCEPTED" || studentProfile.status === "ACTIVE") {
        navigate("/dashboard");
      }
    }
  }, [studentProfile, navigate]);

  if (!studentProfile) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-marlion-bg py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-marlion-warning/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-warning/20 animate-pulse">
            <i className="fa-solid fa-hourglass-half text-5xl text-marlion-warning"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Application Under Review</h1>
          <p className="text-marlion-muted">
            Thank you for completing the AI interview, {studentProfile.name}!
          </p>
        </div>

        {/* Status Card */}
        <div className="glass-card p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Your Application Status</h2>
            <div className="inline-block bg-marlion-warning/20 border border-marlion-warning/30 rounded-full px-6 py-2">
              <span className="text-marlion-warning font-bold uppercase tracking-wide">
                {studentProfile.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-marlion-success rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-check text-white"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Registration Complete</h3>
                <p className="text-sm text-marlion-muted">
                  You successfully registered for the {studentProfile.stream.replace(/_/g, " ")} stream
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-marlion-success rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-check text-white"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">AI Interview Completed</h3>
                <p className="text-sm text-marlion-muted">
                  Your interview responses have been submitted successfully
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-marlion-warning rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <i className="fa-solid fa-clock text-white"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Under Review</h3>
                <p className="text-sm text-marlion-muted">
                  Our team is currently reviewing your application and interview responses
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 opacity-50">
              <div className="w-10 h-10 bg-marlion-bg border-2 border-marlion-border rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-envelope text-marlion-muted"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-marlion-muted">Decision Notification</h3>
                <p className="text-sm text-marlion-muted">
                  You'll be notified via email once a decision is made
                </p>
              </div>
            </div>
          </div>

          {/* Interview Performance Summary */}
          {interviewEvaluation && (
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6 mb-6">
              <h3 className="font-bold text-white mb-4 flex items-center">
                <i className="fa-solid fa-chart-line text-marlion-primary mr-2"></i>
                Interview Performance Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-marlion-primary mb-1">
                    {interviewEvaluation.score || "N/A"}/100
                  </div>
                  <div className="text-sm text-marlion-muted">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-marlion-success mb-1">
                    {interviewEvaluation.technicalScore || "N/A"}/100
                  </div>
                  <div className="text-sm text-marlion-muted">Technical Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-marlion-warning mb-1">
                    {interviewEvaluation.passionScore || "N/A"}/100
                  </div>
                  <div className="text-sm text-marlion-muted">Passion & Interest</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-marlion-info mb-1">
                    {interviewEvaluation.communicationScore || "N/A"}/100
                  </div>
                  <div className="text-sm text-marlion-muted">Communication</div>
                </div>
              </div>
              {interviewEvaluation.summary && (
                <div className="mt-4 pt-4 border-t border-marlion-border">
                  <p className="text-marlion-text text-sm">{interviewEvaluation.summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-marlion-primary/10 border border-marlion-primary/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <i className="fa-solid fa-circle-info text-marlion-primary text-xl mt-1"></i>
              <div>
                <h4 className="font-bold text-white mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-marlion-muted">
                  <li>
                    <i className="fa-solid fa-check text-marlion-success mr-2"></i>
                    Our team reviews all applications carefully
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-marlion-success mr-2"></i>
                    Decisions are typically made within 3-5 business days
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-marlion-success mr-2"></i>
                    You'll receive an email notification with the decision
                  </li>
                  <li>
                    <i className="fa-solid fa-check text-marlion-success mr-2"></i>
                    Selected candidates will receive an offer letter to download and accept
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-bold text-white mb-4">Your Application Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-marlion-muted">Name:</span>
              <span className="text-white font-medium ml-2">{studentProfile.name}</span>
            </div>
            <div>
              <span className="text-marlion-muted">Email:</span>
              <span className="text-white font-medium ml-2">{studentProfile.email}</span>
            </div>
            <div>
              <span className="text-marlion-muted">College:</span>
              <span className="text-white font-medium ml-2">{studentProfile.college}</span>
            </div>
            <div>
              <span className="text-marlion-muted">Stream:</span>
              <span className="text-white font-medium ml-2">
                {studentProfile.stream.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-marlion-muted">Duration:</span>
              <span className="text-white font-medium ml-2">
                {new Date(studentProfile.internshipStartDate).toLocaleDateString()} -{" "}
                {new Date(studentProfile.internshipEndDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-marlion-muted mb-4">
            Have questions about your application status?
          </p>
          <a
            href="mailto:info@marlion.in"
            className="inline-block bg-marlion-bg border border-marlion-border hover:border-marlion-primary rounded-xl px-6 py-3 text-marlion-text hover:text-marlion-primary transition-all"
          >
            <i className="fa-solid fa-envelope mr-2"></i>
            Contact Support
          </a>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-marlion-muted hover:text-marlion-primary transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
