import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import {
  signInWithGoogle,
  generateEmailOTP,
  verifyEmailOTP,
  initializeRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  type ConfirmationResult,
} from "@marlion/firebase";
import { Button, Loading } from "@marlion/ui";
import { INTERNSHIP_STREAMS, type InternshipStream } from "@marlion/types";

type AuthMethod = "google" | "email" | "phone";
type Step = 1 | 2 | 3;

const COLLEGES = [
  "Thiagarajar College of Engineering",
  "Kamaraj College of Engineering",
  "SRM Madurai College of Engineering and Technology",
  "Anna University Regional Campus (Ramanathapuram)",
  "Others",
] as const;

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"] as const;

export default function Register() {
  const navigate = useNavigate();
  const { user, studentProfile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const registerStudent = useMutation(api.students.registerStudent);

  // Step management
  const [step, setStep] = useState<Step>(1);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);

  // Step 1 & 2: Auth inputs
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Step 3: Registration form
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    customCollege: "",
    year: "",
    department: "",
    stream: "" as InternshipStream | "",
    startDate: "",
    endDate: "",
    specialRequests: "",
    idProof: null as File | null,
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [recaptchaInitialized, setRecaptchaInitialized] = useState(false);

  // Redirect if already registered
  useEffect(() => {
    if (!authLoading && user && studentProfile) {
      showToast("You're already registered", "info");
      navigate("/interview");
    }
  }, [user, studentProfile, authLoading, navigate, showToast]);

  // Initialize reCAPTCHA for phone auth
  useEffect(() => {
    if (!recaptchaInitialized) {
      try {
        initializeRecaptcha("recaptcha-container");
        setRecaptchaInitialized(true);
      } catch (error) {
        console.error("reCAPTCHA initialization error:", error);
      }
    }
  }, [recaptchaInitialized]);

  // Auto-fill name from Google/Firebase user
  useEffect(() => {
    if (user && step === 3 && !formData.name) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || user.email?.split("@")[0] || "",
      }));
    }
  }, [user, step, formData.name]);

  // Step 1: Handle authentication method selection
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast("Signed in with Google successfully", "success");
      setStep(3); // Skip OTP step for Google
    } catch (error: any) {
      showToast(error.message || "Google sign-in failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!emailOrPhone.trim()) {
      showToast("Please enter your email or phone number", "error");
      return;
    }

    setLoading(true);
    try {
      const isPhone = /^\+?[0-9]{10,15}$/.test(emailOrPhone.replace(/\s/g, ""));

      if (isPhone) {
        setAuthMethod("phone");
        const phoneNumber = emailOrPhone.startsWith("+") ? emailOrPhone : `+91${emailOrPhone}`;
        const confirmation = await sendPhoneOTP(phoneNumber);
        setConfirmationResult(confirmation);
        setOtpSent(true);
        showToast("OTP sent to your phone", "success");
      } else {
        setAuthMethod("email");
        await generateEmailOTP(emailOrPhone);
        setOtpSent(true);
        showToast("OTP sent to your email", "success");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    setLoading(true);
    try {
      if (authMethod === "phone") {
        if (!confirmationResult) {
          throw new Error("No confirmation result found");
        }
        await verifyPhoneOTP(confirmationResult, otp);
      } else if (authMethod === "email") {
        await verifyEmailOTP(emailOrPhone, otp);
      }

      showToast("OTP verified successfully", "success");
      setStep(3);
    } catch (error: any) {
      showToast(error.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size must be less than 5MB", "error");
        return;
      }
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        showToast("File must be JPG, PNG, or PDF", "error");
        return;
      }
      setFormData((prev) => ({ ...prev, idProof: file }));
    }
  };

  // Step 3: Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }
    if (!formData.college) {
      showToast("Please select your college", "error");
      return;
    }
    if (formData.college === "Others" && !formData.customCollege.trim()) {
      showToast("Please enter your college name", "error");
      return;
    }
    if (!formData.year) {
      showToast("Please select your year of study", "error");
      return;
    }
    if (!formData.department.trim()) {
      showToast("Please enter your department", "error");
      return;
    }
    if (!formData.stream) {
      showToast("Please select an internship stream", "error");
      return;
    }
    if (!formData.startDate) {
      showToast("Please select internship start date", "error");
      return;
    }
    if (!formData.endDate) {
      showToast("Please select internship end date", "error");
      return;
    }

    // Date validation
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const minStartDate = new Date("2025-12-02");
    const today = new Date();

    if (startDate < minStartDate) {
      showToast("Internship cannot start before December 2, 2025", "error");
      return;
    }

    if (startDate < today) {
      showToast("Start date cannot be in the past", "error");
      return;
    }

    if (endDate <= startDate) {
      showToast("End date must be after start date", "error");
      return;
    }

    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (durationDays < 14) {
      showToast("Internship duration must be at least 14 days (2 weeks)", "error");
      return;
    }

    if (durationDays > 84) {
      showToast("Internship duration cannot exceed 84 days (12 weeks)", "error");
      return;
    }

    if (!formData.idProof) {
      showToast("Please upload your ID proof", "error");
      return;
    }

    if (!user) {
      showToast("Authentication error. Please try again.", "error");
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64 for storage (in production, use Firebase Storage)
      const reader = new FileReader();
      reader.onload = async () => {
        const base64File = reader.result as string;

        // Register student in Convex
        await registerStudent({
          firebaseUid: user.uid,
          name: formData.name,
          email: user.email || emailOrPhone,
          phoneNumber: user.phoneNumber || (authMethod === "phone" ? emailOrPhone : undefined),
          college: formData.college === "Others" ? formData.customCollege : formData.college,
          yearOfStudy: formData.year,
          department: formData.department,
          stream: formData.stream as InternshipStream,
          internshipStartDate: formData.startDate,
          internshipEndDate: formData.endDate,
          specialRequests: formData.specialRequests || undefined,
          idProofUrl: base64File, // In production, upload to Firebase Storage first
        });

        showToast("Registration successful! Redirecting to interview...", "success");

        // Small delay to show success message
        setTimeout(() => {
          navigate("/interview");
        }, 1500);
      };

      reader.onerror = () => {
        throw new Error("Failed to read file");
      };

      reader.readAsDataURL(formData.idProof);
    } catch (error: any) {
      showToast(error.message || "Registration failed", "error");
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-marlion-bg py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Register for Winter Internship 2025
          </h1>
          <p className="text-marlion-muted">
            Join Marlion Technologies in building assistive tech for neurodiverse children
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s
                      ? "bg-marlion-primary text-white"
                      : "bg-marlion-cardBg text-marlion-muted border border-marlion-border"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 transition-all ${
                      step > s ? "bg-marlion-primary" : "bg-marlion-border"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-8">
          {/* Step 1: Authentication Method */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Authentication Method</h2>

              <Button
                variant="primary"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
              >
                <i className="fa-brands fa-google mr-2"></i>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-marlion-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-marlion-cardBg text-marlion-muted">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="your.email@example.com or +919876543210"
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors"
                  disabled={loading}
                />
                <p className="text-xs text-marlion-muted mt-2">
                  Enter your email or phone number with country code
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleSendOTP}
                disabled={loading || !emailOrPhone.trim()}
                className="w-full"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>

              {/* Hidden reCAPTCHA container for phone auth */}
              <div id="recaptcha-container"></div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && otpSent && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <i className="fa-solid fa-envelope-circle-check text-6xl text-marlion-primary mb-4"></i>
                <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
                <p className="text-marlion-muted">
                  We've sent a 6-digit code to{" "}
                  <span className="text-marlion-primary font-medium">{emailOrPhone}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors"
                  disabled={loading}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <button
                onClick={() => {
                  setStep(1);
                  setOtpSent(false);
                  setOtp("");
                }}
                className="w-full text-marlion-muted hover:text-marlion-primary transition-colors text-sm"
                disabled={loading}
              >
                Change email/phone number
              </button>
            </div>
          )}

          {/* Step 3: Registration Form */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Full Name <span className="text-marlion-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  College <span className="text-marlion-danger">*</span>
                </label>
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                >
                  <option value="">Select your college</option>
                  {COLLEGES.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom College (if Others selected) */}
              {formData.college === "Others" && (
                <div>
                  <label className="block text-sm font-medium text-marlion-text mb-2">
                    College Name <span className="text-marlion-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="customCollege"
                    value={formData.customCollege}
                    onChange={handleInputChange}
                    placeholder="Enter your college name"
                    className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors"
                    required
                  />
                </div>
              )}

              {/* Year of Study */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Year of Study <span className="text-marlion-danger">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                >
                  <option value="">Select your year</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Department <span className="text-marlion-danger">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science, Electronics, etc."
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                />
              </div>

              {/* Internship Stream */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Internship Stream <span className="text-marlion-danger">*</span>
                </label>
                <select
                  name="stream"
                  value={formData.stream}
                  onChange={handleInputChange}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                >
                  <option value="">Select your preferred stream</option>
                  {Object.values(INTERNSHIP_STREAMS).map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {stream.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Internship Start Date <span className="text-marlion-danger">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min="2025-12-02"
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                />
                <p className="text-xs text-marlion-muted mt-1">
                  Official program starts December 2, 2025
                </p>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Internship End Date <span className="text-marlion-danger">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || "2025-12-02"}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                />
                <p className="text-xs text-marlion-muted mt-1">
                  Duration: 2-12 weeks (14-84 days) at your discretion
                </p>
              </div>

              {/* ID Proof Upload */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  ID Proof (College ID / Aadhar / Driving License){" "}
                  <span className="text-marlion-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-marlion-primary file:text-white file:cursor-pointer hover:file:bg-marlion-primaryHover transition-colors"
                    required
                  />
                </div>
                {formData.idProof && (
                  <p className="text-xs text-marlion-success mt-2">
                    <i className="fa-solid fa-check-circle mr-1"></i>
                    {formData.idProof.name} ({(formData.idProof.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <p className="text-xs text-marlion-muted mt-1">
                  Max file size: 5MB. Formats: JPG, PNG, PDF
                </p>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements or preferences..."
                  rows={4}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Submitting..." : "Complete Registration"}
              </Button>

              <p className="text-xs text-marlion-muted text-center">
                By registering, you agree to participate in the AI interview process and commit to
                the internship duration selected.
              </p>
            </form>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
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
    </div>
  );
}
