import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Button, Loading } from "@marlion/ui";
import { INTERNSHIP_STREAMS } from "@marlion/types";

export default function Certificate() {
  const navigate = useNavigate();
  const { studentProfile } = useAuth();
  const { showToast } = useToast();

  // Fetch certificate data
  const certificate = useQuery(
    api.certificates.getStudentCertificate,
    studentProfile ? { studentId: studentProfile._id } : "skip"
  );

  // Redirect if not completed
  useEffect(() => {
    if (studentProfile && studentProfile.status !== "COMPLETED") {
      showToast("You haven't completed the internship yet", "warning");
      navigate("/dashboard");
    }
  }, [studentProfile, navigate, showToast]);

  if (!studentProfile) {
    return <Loading fullScreen />;
  }

  if (!certificate) {
    return <Loading fullScreen />;
  }

  const streamInfo = INTERNSHIP_STREAMS[studentProfile.stream];
  const startDate = new Date(studentProfile.internshipStartDate);
  const endDate = new Date(studentProfile.internshipEndDate);
  const completionDate = certificate.issuedAt
    ? new Date(certificate.issuedAt)
    : new Date();
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // QR Code for verification (in production, this would be a real QR code)
  const verificationUrl = `https://marlion.in/verify/${certificate._id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    verificationUrl
  )}`;

  const handleDownloadPDF = () => {
    // In production, this would generate and download an actual PDF
    showToast("PDF download feature coming soon!", "info");
  };

  const handleShareLinkedIn = () => {
    const text = `I'm proud to share that I've completed the ${streamInfo.title} internship at Marlion Technologies! 🎓`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      verificationUrl
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-marlion-bg py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-marlion-success/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-success/20">
            <i className="fa-solid fa-award text-5xl text-marlion-success"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Certificate of Completion</h1>
          <p className="text-marlion-muted">Congratulations on completing your internship!</p>
        </div>

        {/* Certificate Card */}
        <div className="glass-card p-12 mb-6" id="certificate">
          {/* Border Decoration */}
          <div className="border-4 border-double border-marlion-primary/30 rounded-xl p-8">
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-marlion-primary mb-2">
                MARLION TECHNOLOGIES
              </h2>
              <p className="text-sm text-marlion-muted uppercase tracking-widest">
                AI and XR Innovation Company
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-marlion-primary to-transparent mx-auto my-4"></div>
              <h3 className="text-2xl font-bold text-white mb-2">Certificate of Completion</h3>
              <p className="text-sm text-marlion-muted">
                This is to certify that
              </p>
            </div>

            {/* Student Name */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-2 py-4 border-b-2 border-t-2 border-marlion-primary/20">
                {studentProfile.name}
              </h1>
            </div>

            {/* Certificate Body */}
            <div className="text-center mb-8 space-y-4">
              <p className="text-marlion-text leading-relaxed max-w-3xl mx-auto">
                has successfully completed the <strong className="text-white">{streamInfo.title}</strong> internship
                as part of the <strong className="text-white">Winter Internship Program 2025</strong>.
              </p>
              <p className="text-marlion-text leading-relaxed max-w-3xl mx-auto">
                During the period from{" "}
                <strong className="text-white">{startDate.toLocaleDateString()}</strong> to{" "}
                <strong className="text-white">{endDate.toLocaleDateString()}</strong>, comprising{" "}
                <strong className="text-white">{durationDays} days</strong>, the intern demonstrated{" "}
                exceptional dedication, creativity, and technical proficiency in developing assistive
                technologies for neurodiverse children.
              </p>
            </div>

            {/* Performance Summary */}
            {certificate.performanceSummary && (
              <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6 mb-8">
                <h4 className="font-bold text-white mb-3 text-center">Performance Summary</h4>
                <p className="text-marlion-text text-sm text-center leading-relaxed">
                  {certificate.performanceSummary}
                </p>
              </div>
            )}

            {/* Skills Acquired */}
            {certificate.skills && certificate.skills.length > 0 && (
              <div className="mb-8">
                <h4 className="font-bold text-white mb-4 text-center">Skills Acquired</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {certificate.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-marlion-primary/10 border border-marlion-primary/20 rounded-full text-sm text-marlion-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Grid */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-marlion-border">
              {/* QR Code */}
              <div className="text-center">
                <img
                  src={qrCodeUrl}
                  alt="Verification QR Code"
                  className="w-24 h-24 mx-auto mb-2 border-2 border-marlion-border rounded"
                />
                <p className="text-xs text-marlion-muted">Scan to Verify</p>
                <p className="text-xs text-marlion-muted">ID: {certificate._id.slice(-8).toUpperCase()}</p>
              </div>

              {/* Issue Date */}
              <div className="text-center">
                <div className="mb-2">
                  <i className="fa-solid fa-calendar text-2xl text-marlion-primary"></i>
                </div>
                <p className="text-sm font-bold text-white mb-1">Issue Date</p>
                <p className="text-sm text-marlion-muted">
                  {completionDate.toLocaleDateString()}
                </p>
              </div>

              {/* Signature */}
              <div className="text-center">
                <div className="border-t-2 border-marlion-primary/30 pt-2 mb-2 mx-auto" style={{ width: "120px" }}>
                  <p className="text-lg font-signature text-marlion-primary italic">Marlion Team</p>
                </div>
                <p className="text-sm font-bold text-white mb-1">Authorized Signature</p>
                <p className="text-xs text-marlion-muted">Marlion Technologies</p>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="mt-8 pt-6 border-t border-marlion-border text-center">
              <p className="text-xs text-marlion-muted">
                A-34, Kumarasamy Street, Madurai, Tamil Nadu 625001 | info@marlion.in | marlion.in
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button variant="primary" size="lg" onClick={handleDownloadPDF}>
            <i className="fa-solid fa-download mr-2"></i>
            Download PDF
          </Button>
          <Button variant="secondary" size="lg" onClick={handleShareLinkedIn}>
            <i className="fa-brands fa-linkedin mr-2"></i>
            Share on LinkedIn
          </Button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(verificationUrl);
              showToast("Verification link copied!", "success");
            }}
            className="bg-marlion-bg border border-marlion-border hover:border-marlion-primary rounded-xl px-6 py-3 text-marlion-text hover:text-marlion-primary transition-all font-bold"
          >
            <i className="fa-solid fa-copy mr-2"></i>
            Copy Verification Link
          </button>
        </div>

        {/* Additional Information */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-bold text-white mb-4">Certificate Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-marlion-muted mb-1">Certificate ID:</p>
              <p className="text-white font-mono">{certificate._id}</p>
            </div>
            <div>
              <p className="text-marlion-muted mb-1">Verification URL:</p>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-marlion-primary hover:underline break-all"
              >
                {verificationUrl}
              </a>
            </div>
            <div>
              <p className="text-marlion-muted mb-1">Student:</p>
              <p className="text-white">{studentProfile.name}</p>
            </div>
            <div>
              <p className="text-marlion-muted mb-1">Stream:</p>
              <p className="text-white">{streamInfo.title}</p>
            </div>
            <div>
              <p className="text-marlion-muted mb-1">Duration:</p>
              <p className="text-white">
                {durationDays} days ({Math.ceil(durationDays / 7)} weeks)
              </p>
            </div>
            <div>
              <p className="text-marlion-muted mb-1">Issued:</p>
              <p className="text-white">{completionDate.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center">
            <i className="fa-solid fa-rocket text-marlion-primary mr-2"></i>
            What's Next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-4">
              <i className="fa-brands fa-linkedin text-2xl text-marlion-primary mb-2"></i>
              <h4 className="font-bold text-white mb-2 text-sm">Add to LinkedIn</h4>
              <p className="text-xs text-marlion-muted">
                Showcase your achievement on your professional profile
              </p>
            </div>
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-4">
              <i className="fa-solid fa-briefcase text-2xl text-marlion-primary mb-2"></i>
              <h4 className="font-bold text-white mb-2 text-sm">Build Portfolio</h4>
              <p className="text-xs text-marlion-muted">
                Include your project work in your portfolio
              </p>
            </div>
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-4">
              <i className="fa-solid fa-envelope text-2xl text-marlion-primary mb-2"></i>
              <h4 className="font-bold text-white mb-2 text-sm">Stay Connected</h4>
              <p className="text-xs text-marlion-muted">
                Follow us for future opportunities and updates
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-marlion-muted hover:text-marlion-primary transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
