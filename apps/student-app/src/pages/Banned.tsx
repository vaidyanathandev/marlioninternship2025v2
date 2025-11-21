import React from "react";
import { useAuth } from "../context/AuthContext";
import { Loading } from "@marlion/ui";

export default function Banned() {
  const { studentProfile } = useAuth();

  if (!studentProfile) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-marlion-bg flex items-center justify-center px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-marlion-danger/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-danger/20">
            <i className="fa-solid fa-ban text-5xl text-marlion-danger"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Account Suspended</h1>
          <p className="text-marlion-muted">
            Your access to the Marlion Internship Program has been restricted
          </p>
        </div>

        {/* Main Message Card */}
        <div className="glass-card p-8">
          <div className="bg-marlion-danger/10 border border-marlion-danger/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-marlion-danger mb-4">
              Policy Violation Detected
            </h2>
            <p className="text-marlion-text mb-4">
              Dear {studentProfile.name},
            </p>
            <p className="text-marlion-text mb-4">
              Your account has been banned from the Marlion Winter Internship 2025 program due to a
              violation of our policies during the application or interview process.
            </p>
          </div>

          {/* Reason */}
          {studentProfile.banReason && (
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6 mb-6">
              <h3 className="font-bold text-white mb-3 flex items-center">
                <i className="fa-solid fa-exclamation-circle text-marlion-warning mr-2"></i>
                Reason for Ban
              </h3>
              <p className="text-marlion-text">{studentProfile.banReason}</p>
            </div>
          )}

          {/* Policy Information */}
          <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6 mb-6">
            <h3 className="font-bold text-white mb-3">What does this mean?</h3>
            <ul className="space-y-2 text-sm text-marlion-text">
              <li className="flex items-start">
                <i className="fa-solid fa-circle text-marlion-danger text-xs mr-2 mt-1.5"></i>
                <span>You cannot proceed with the current application</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-circle text-marlion-danger text-xs mr-2 mt-1.5"></i>
                <span>Your interview responses and application data have been flagged</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-circle text-marlion-danger text-xs mr-2 mt-1.5"></i>
                <span>This ban is effective immediately and for the current program cycle</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-circle text-marlion-danger text-xs mr-2 mt-1.5"></i>
                <span>
                  Future eligibility will be determined on a case-by-case basis
                </span>
              </li>
            </ul>
          </div>

          {/* Common Violations */}
          <div className="bg-marlion-warning/10 border border-marlion-warning/20 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-white mb-3 flex items-center">
              <i className="fa-solid fa-shield-halved text-marlion-warning mr-2"></i>
              Common Policy Violations
            </h3>
            <ul className="space-y-2 text-sm text-marlion-muted">
              <li>• Copy-pasting answers during the AI interview</li>
              <li>• Switching tabs or windows during the interview</li>
              <li>• Using AI tools or external assistance during the interview</li>
              <li>• Providing false or misleading information in the application</li>
              <li>• Multiple account creation or identity fraud</li>
              <li>• Attempting to manipulate the interview process</li>
            </ul>
          </div>

          {/* Appeal Process */}
          <div className="bg-marlion-primary/10 border border-marlion-primary/20 rounded-xl p-6">
            <h3 className="font-bold text-white mb-3 flex items-center">
              <i className="fa-solid fa-gavel text-marlion-primary mr-2"></i>
              Appeal Process
            </h3>
            <p className="text-sm text-marlion-text mb-4">
              If you believe this ban was issued in error or you have additional context to share,
              you may submit an appeal to our administrative team.
            </p>
            <div className="space-y-2 text-sm text-marlion-text">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:info@marlion.in?subject=Ban Appeal - Winter Internship 2025"
                  className="text-marlion-primary hover:underline"
                >
                  info@marlion.in
                </a>
              </p>
              <p>
                <strong>Subject:</strong> Ban Appeal - Winter Internship 2025
              </p>
              <p>
                <strong>Include:</strong>
              </p>
              <ul className="ml-4 space-y-1 text-marlion-muted">
                <li>• Your full name and email address</li>
                <li>• Student ID (if applicable)</li>
                <li>• Detailed explanation of your appeal</li>
                <li>• Any supporting evidence or documentation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-marlion-muted">
            We take integrity seriously and maintain these policies to ensure fairness for all
            applicants.
          </p>
        </div>
      </div>
    </div>
  );
}
