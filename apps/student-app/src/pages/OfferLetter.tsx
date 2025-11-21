import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Button, Loading } from "@marlion/ui";
import { INTERNSHIP_STREAMS } from "@marlion/types";

export default function OfferLetter() {
  const navigate = useNavigate();
  const { studentProfile } = useAuth();
  const { showToast } = useToast();
  const updateStudentStatus = useMutation(api.students.updateStudentStatus);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"accept" | "decline" | null>(null);

  if (!studentProfile) {
    return <Loading fullScreen />;
  }

  const streamInfo = INTERNSHIP_STREAMS[studentProfile.stream];
  const startDate = new Date(studentProfile.internshipStartDate);
  const endDate = new Date(studentProfile.internshipEndDate);
  const durationDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const acceptanceDeadline = new Date();
  acceptanceDeadline.setDate(acceptanceDeadline.getDate() + 7); // 7 days to accept

  const handleAction = async (selectedAction: "accept" | "decline") => {
    setAction(selectedAction);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!action || !studentProfile) return;

    setLoading(true);
    try {
      if (action === "accept") {
        await updateStudentStatus({
          studentId: studentProfile._id,
          status: "OFFER_ACCEPTED",
        });
        showToast("Offer accepted successfully! Welcome to Marlion!", "success");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        await updateStudentStatus({
          studentId: studentProfile._id,
          status: "REJECTED",
        });
        showToast("Offer declined. Thank you for your interest.", "info");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to process action", "error");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleDownloadPDF = () => {
    // In production, this would generate and download an actual PDF
    showToast("PDF download feature coming soon!", "info");
  };

  return (
    <div className="min-h-screen bg-marlion-bg py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-marlion-success/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-success/20 animate-bounce">
            <i className="fa-solid fa-trophy text-5xl text-marlion-success"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Congratulations!</h1>
          <p className="text-marlion-muted">You've been selected for the Marlion Winter Internship 2025</p>
        </div>

        {/* Offer Letter */}
        <div className="glass-card p-8 mb-6" id="offer-letter">
          {/* Letter Header */}
          <div className="border-b border-marlion-border pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Marlion Technologies</h2>
                <p className="text-sm text-marlion-muted">AI and XR Innovation Company</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-marlion-muted">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-marlion-muted">Ref: MINT2025/{studentProfile._id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            <div className="text-sm text-marlion-muted">
              <p>A-34, Kumarasamy Street</p>
              <p>Madurai, Tamil Nadu 625001</p>
              <p>Email: info@marlion.in</p>
              <p>Website: marlion.in</p>
            </div>
          </div>

          {/* Letter Content */}
          <div className="space-y-6 mb-8">
            <div>
              <p className="text-marlion-text mb-4">Dear <strong className="text-white">{studentProfile.name}</strong>,</p>
            </div>

            <div className="bg-marlion-success/10 border border-marlion-success/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-marlion-success mb-2">
                OFFER OF INTERNSHIP - WINTER 2025
              </h3>
              <p className="text-sm text-marlion-muted">
                We are pleased to offer you a position in our Winter Internship Program 2025
              </p>
            </div>

            <p className="text-marlion-text leading-relaxed">
              Following your successful interview, we are delighted to offer you an internship
              position at <strong className="text-white">Marlion Technologies</strong> as part of
              our Winter Internship Program 2025. We were impressed by your passion, knowledge, and
              potential, and we believe you will be a valuable addition to our team.
            </p>

            {/* Internship Details */}
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center">
                <i className="fa-solid fa-file-contract text-marlion-primary mr-2"></i>
                Internship Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-marlion-muted mb-1">Stream</p>
                  <p className="text-white font-medium">{streamInfo.title}</p>
                </div>
                <div>
                  <p className="text-sm text-marlion-muted mb-1">Duration</p>
                  <p className="text-white font-medium">{durationDays} days ({Math.ceil(durationDays / 7)} weeks)</p>
                </div>
                <div>
                  <p className="text-sm text-marlion-muted mb-1">Start Date</p>
                  <p className="text-white font-medium">{startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-marlion-muted mb-1">End Date</p>
                  <p className="text-white font-medium">{endDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-marlion-muted mb-1">Location</p>
                  <p className="text-white font-medium">Madurai, Tamil Nadu</p>
                </div>
                <div>
                  <p className="text-sm text-marlion-muted mb-1">Work Hours</p>
                  <p className="text-white font-medium">10 AM - 5 PM (Mon-Sat)</p>
                </div>
                <div>
                  <p className="text-sm text-marlion-muted mb-1">Stipend</p>
                  <p className="text-white font-medium">Unpaid (Free Internship)</p>
                </div>
                <div>
                  <p className="text-sm text-marlion-muted mb-1">Certificate</p>
                  <p className="text-white font-medium">Upon Successful Completion</p>
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <h3 className="font-bold text-white mb-3">Your Responsibilities:</h3>
              <ul className="space-y-2 text-sm text-marlion-text">
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-marlion-success mr-2 mt-0.5"></i>
                  <span>Complete the bootcamp training modules for {streamInfo.title}</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-marlion-success mr-2 mt-0.5"></i>
                  <span>Work on assistive technology projects for neurodiverse children</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-marlion-success mr-2 mt-0.5"></i>
                  <span>Submit daily progress logs and maintain project documentation</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-marlion-success mr-2 mt-0.5"></i>
                  <span>Collaborate with team members and participate in code reviews</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-marlion-success mr-2 mt-0.5"></i>
                  <span>Attend all scheduled meetings and training sessions</span>
                </li>
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-bold text-white mb-3">What You'll Gain:</h3>
              <ul className="space-y-2 text-sm text-marlion-text">
                <li className="flex items-start">
                  <i className="fa-solid fa-star text-marlion-warning mr-2 mt-0.5"></i>
                  <span>Hands-on experience with cutting-edge AI and XR technologies</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-star text-marlion-warning mr-2 mt-0.5"></i>
                  <span>Mentorship from experienced industry professionals</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-star text-marlion-warning mr-2 mt-0.5"></i>
                  <span>Certificate of completion with performance summary</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-star text-marlion-warning mr-2 mt-0.5"></i>
                  <span>Opportunity to contribute to meaningful social impact projects</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-star text-marlion-warning mr-2 mt-0.5"></i>
                  <span>Letter of recommendation for outstanding performers</span>
                </li>
              </ul>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-marlion-warning/10 border border-marlion-warning/20 rounded-xl p-4">
              <h3 className="font-bold text-white mb-3 text-sm">Terms and Conditions:</h3>
              <ul className="space-y-1 text-xs text-marlion-muted">
                <li>• This is an unpaid internship program focused on learning and skill development</li>
                <li>• Interns are expected to maintain professional conduct and adhere to company policies</li>
                <li>• Intellectual property rights for work created during the internship belong to Marlion Technologies</li>
                <li>• Certificate will only be issued upon successful completion of all assigned tasks and projects</li>
                <li>• Attendance and punctuality are mandatory; excessive absences may result in termination</li>
                <li>• Marlion Technologies reserves the right to terminate the internship for policy violations</li>
                <li>• This offer is contingent upon acceptance within 7 days from the date of this letter</li>
              </ul>
            </div>

            <p className="text-marlion-text leading-relaxed">
              We are excited about the prospect of you joining our team and contributing to our
              mission of creating innovative assistive technologies. This internship will provide you
              with valuable industry experience and the opportunity to work on impactful projects.
            </p>

            <p className="text-marlion-text leading-relaxed">
              Please indicate your acceptance of this offer by clicking the "Accept Offer" button
              below by <strong className="text-white">{acceptanceDeadline.toLocaleDateString()}</strong>.
            </p>

            <p className="text-marlion-text">
              We look forward to welcoming you to the Marlion family!
            </p>

            <div className="pt-6 border-t border-marlion-border">
              <p className="text-marlion-text mb-2">Warm regards,</p>
              <p className="text-white font-bold">Team Marlion Technologies</p>
              <p className="text-sm text-marlion-muted">AI and XR Innovation</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleDownloadPDF}
            className="sm:w-auto w-full"
          >
            <i className="fa-solid fa-download mr-2"></i>
            Download PDF
          </Button>
          <Button
            variant="success"
            size="lg"
            onClick={() => handleAction("accept")}
            disabled={loading}
            className="sm:w-auto w-full"
          >
            <i className="fa-solid fa-check mr-2"></i>
            Accept Offer
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => handleAction("decline")}
            disabled={loading}
            className="sm:w-auto w-full"
          >
            <i className="fa-solid fa-times mr-2"></i>
            Decline Offer
          </Button>
        </div>

        {/* Deadline Notice */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-clock text-marlion-warning text-2xl"></i>
            <div>
              <p className="text-sm font-bold text-white">Acceptance Deadline</p>
              <p className="text-xs text-marlion-muted">
                You have until {acceptanceDeadline.toLocaleDateString()} to accept this offer.
                After this date, the offer will expire.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-marlion-muted hover:text-marlion-primary transition-colors"
            disabled={loading}
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to Home
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {action === "accept" ? "Confirm Acceptance" : "Confirm Decline"}
            </h3>
            <p className="text-marlion-text mb-6">
              {action === "accept"
                ? "Are you sure you want to accept this internship offer? By accepting, you commit to the terms and conditions outlined in the offer letter."
                : "Are you sure you want to decline this internship offer? This action cannot be undone."}
            </p>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={action === "accept" ? "success" : "danger"}
                onClick={confirmAction}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
