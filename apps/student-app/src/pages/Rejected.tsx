import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { Loading } from "@marlion/ui";

export default function Rejected() {
  const navigate = useNavigate();
  const { studentProfile } = useAuth();

  // Get interview evaluation for feedback
  const interviewEvaluation = useQuery(
    api.interviews.getStudentEvaluation,
    studentProfile ? { studentId: studentProfile._id } : "skip"
  );

  if (!studentProfile) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-marlion-bg py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-marlion-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-muted/20">
            <i className="fa-solid fa-circle-xmark text-5xl text-marlion-muted"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Thank You for Your Interest</h1>
          <p className="text-marlion-muted">
            We appreciate you taking the time to apply for the Marlion Winter Internship 2025
          </p>
        </div>

        {/* Main Message Card */}
        <div className="glass-card p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Application Status: Not Selected
            </h2>
            <p className="text-marlion-text mb-4">
              Dear {studentProfile.name},
            </p>
            <p className="text-marlion-text mb-4">
              After careful consideration of your application and interview responses, we regret to
              inform you that we are unable to offer you a position in our {studentProfile.stream.replace(/_/g, " ")} internship
              program at this time.
            </p>
            <p className="text-marlion-text mb-4">
              This decision was made after a thorough review process, and we recognize the effort
              you put into your application. Please know that the selection process was highly
              competitive, and this outcome does not diminish your potential or abilities.
            </p>
          </div>

          {/* Feedback Section */}
          {interviewEvaluation?.reasoning && (
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6 mb-6">
              <h3 className="font-bold text-white mb-3 flex items-center">
                <i className="fa-solid fa-comment-dots text-marlion-primary mr-2"></i>
                Feedback on Your Interview
              </h3>
              <p className="text-marlion-text text-sm leading-relaxed">
                {interviewEvaluation.reasoning}
              </p>
            </div>
          )}

          {/* Performance Metrics */}
          {interviewEvaluation && (
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6 mb-6">
              <h3 className="font-bold text-white mb-4">Your Interview Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-marlion-muted mb-1">Overall Score</div>
                  <div className="text-2xl font-bold text-marlion-text">
                    {interviewEvaluation.score || "N/A"}/100
                  </div>
                </div>
                <div>
                  <div className="text-sm text-marlion-muted mb-1">Technical Skills</div>
                  <div className="text-2xl font-bold text-marlion-text">
                    {interviewEvaluation.technicalScore || "N/A"}/100
                  </div>
                </div>
                <div>
                  <div className="text-sm text-marlion-muted mb-1">Passion & Interest</div>
                  <div className="text-2xl font-bold text-marlion-text">
                    {interviewEvaluation.passionScore || "N/A"}/100
                  </div>
                </div>
                <div>
                  <div className="text-sm text-marlion-muted mb-1">Communication</div>
                  <div className="text-2xl font-bold text-marlion-text">
                    {interviewEvaluation.communicationScore || "N/A"}/100
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Encouragement */}
          <div className="bg-marlion-primary/10 border border-marlion-primary/20 rounded-xl p-6">
            <h3 className="font-bold text-white mb-3 flex items-center">
              <i className="fa-solid fa-lightbulb text-marlion-primary mr-2"></i>
              Moving Forward
            </h3>
            <ul className="space-y-3 text-sm text-marlion-text">
              <li className="flex items-start">
                <i className="fa-solid fa-star text-marlion-warning mr-2 mt-1"></i>
                <span>
                  Continue building your skills in {studentProfile.stream.replace(/_/g, " ")}. Practice
                  makes perfect!
                </span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-star text-marlion-warning mr-2 mt-1"></i>
                <span>
                  Explore online courses, tutorials, and open-source projects to enhance your
                  knowledge
                </span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-star text-marlion-warning mr-2 mt-1"></i>
                <span>
                  We encourage you to apply for future internship opportunities at Marlion
                  Technologies
                </span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-star text-marlion-warning mr-2 mt-1"></i>
                <span>
                  Stay connected with us on social media for updates on upcoming programs and
                  opportunities
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Resources */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-bold text-white mb-4">Recommended Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://marlion.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-marlion-bg border border-marlion-border hover:border-marlion-primary rounded-xl p-4 transition-all group"
            >
              <i className="fa-solid fa-globe text-marlion-primary text-2xl mb-2 group-hover:scale-110 transition-transform inline-block"></i>
              <h4 className="font-bold text-white mb-1">Marlion Technologies</h4>
              <p className="text-sm text-marlion-muted">Visit our website to learn more about us</p>
            </a>
            <a
              href="mailto:info@marlion.in"
              className="bg-marlion-bg border border-marlion-border hover:border-marlion-primary rounded-xl p-4 transition-all group"
            >
              <i className="fa-solid fa-envelope text-marlion-primary text-2xl mb-2 group-hover:scale-110 transition-transform inline-block"></i>
              <h4 className="font-bold text-white mb-1">Contact Us</h4>
              <p className="text-sm text-marlion-muted">Have questions? Reach out to us</p>
            </a>
          </div>
        </div>

        {/* Final Message */}
        <div className="glass-card p-6 text-center mb-6">
          <p className="text-marlion-text mb-4">
            We wish you all the best in your academic and professional journey. Keep learning, keep
            growing, and never stop pursuing your passion for technology!
          </p>
          <p className="text-marlion-muted italic">— Team Marlion Technologies</p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
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
