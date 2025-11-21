import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { generateInterviewQuestion, evaluateInterview, detectCopyPaste } from "@marlion/ai";
import { Button, Loading } from "@marlion/ui";

type InterviewState = "not_started" | "in_progress" | "completed" | "evaluating";

interface Message {
  role: "ai" | "student";
  content: string;
  timestamp: number;
}

// Anti-cheat detection
let copyPasteAttempts = 0;
let tabSwitchCount = 0;

export default function AIInterview() {
  const navigate = useNavigate();
  const { user, studentProfile } = useAuth();
  const { showToast } = useToast();

  // Convex mutations
  const startInterviewMutation = useMutation(api.interviews.startInterview);
  const addMessage = useMutation(api.interviews.addInterviewMessage);
  const updateProgress = useMutation(api.interviews.updateInterviewProgress);
  const evaluateInterviewMutation = useMutation(api.interviews.evaluateInterview);
  const updateStudentStatus = useMutation(api.students.updateStudentStatus);
  const banStudent = useMutation(api.students.banStudent);

  // Query current interview session
  const currentInterview = useQuery(
    api.interviews.getCurrentInterview,
    studentProfile ? { studentId: studentProfile._id } : "skip"
  );

  // State management
  const [interviewState, setInterviewState] = useState<InterviewState>("not_started");
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [studentResponse, setStudentResponse] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [useVoice, setUseVoice] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banned, setBanned] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MAX_QUESTIONS = 15;
  const MIN_QUESTIONS = 10;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setStudentResponse(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "no-speech") {
          showToast("No speech detected. Please try again or use text input.", "warning");
        } else {
          showToast("Voice recognition failed. Please use text input.", "error");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [showToast]);

  // Anti-cheat: Detect tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && interviewState === "in_progress") {
        tabSwitchCount++;
        if (tabSwitchCount >= 3) {
          handleBan("Multiple tab switches detected during interview");
        } else {
          showToast(
            `Warning: Tab switching is not allowed. ${3 - tabSwitchCount} warnings remaining.`,
            "warning"
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interviewState]);

  // Anti-cheat: Detect copy-paste
  const handlePaste = async (e: React.ClipboardEvent) => {
    if (interviewState === "in_progress") {
      const pastedText = e.clipboardData.getData("text");
      copyPasteAttempts++;

      // Use AI to detect copy-paste
      try {
        const isCopyPaste = await detectCopyPaste(pastedText, currentQuestion);
        if (isCopyPaste) {
          e.preventDefault();
          if (copyPasteAttempts >= 2) {
            handleBan("Copy-paste detected during interview");
          } else {
            showToast(
              `Warning: Copy-pasting is not allowed. ${2 - copyPasteAttempts} warnings remaining.`,
              "warning"
            );
          }
        }
      } catch (error) {
        console.error("Copy-paste detection error:", error);
      }
    }
  };

  // Handle ban
  const handleBan = async (reason: string) => {
    if (!studentProfile || banned) return;

    setBanned(true);
    setInterviewState("completed");

    try {
      await banStudent({
        studentId: studentProfile._id,
        reason,
      });

      showToast("You have been banned from the program for violating interview policies.", "error");

      setTimeout(() => {
        navigate("/banned");
      }, 3000);
    } catch (error) {
      console.error("Ban error:", error);
    }
  };

  // Text-to-speech for AI questions
  const speakText = (text: string) => {
    if ("speechSynthesis" in window && useVoice) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start voice listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start recognition:", error);
        showToast("Failed to start voice recognition", "error");
      }
    }
  };

  // Stop voice listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Start interview
  const handleStartInterview = async () => {
    if (!studentProfile) {
      showToast("Student profile not found", "error");
      return;
    }

    setLoading(true);
    try {
      // Create interview session in Convex
      const sessionId = await startInterviewMutation({
        studentId: studentProfile._id,
      });

      setInterviewId(sessionId);
      setInterviewState("in_progress");

      // Generate first question
      const firstQuestion = await generateInterviewQuestion(
        studentProfile.stream,
        [],
        studentProfile.name
      );

      setCurrentQuestion(firstQuestion);
      const aiMessage: Message = {
        role: "ai",
        content: firstQuestion,
        timestamp: Date.now(),
      };
      setMessages([aiMessage]);

      // Save to Convex
      await addMessage({
        interviewId: sessionId,
        role: "ai",
        content: firstQuestion,
      });

      // Speak the question
      speakText(firstQuestion);

      setQuestionCount(1);
      setProgress(0);
    } catch (error: any) {
      showToast(error.message || "Failed to start interview", "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit student response
  const handleSubmitResponse = async () => {
    if (!studentResponse.trim() || !interviewId || !studentProfile) {
      showToast("Please provide a response", "error");
      return;
    }

    setLoading(true);
    window.speechSynthesis.cancel(); // Stop any speaking

    try {
      // Add student message
      const studentMessage: Message = {
        role: "student",
        content: studentResponse,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, studentMessage]);

      // Save to Convex
      await addMessage({
        interviewId,
        role: "student",
        content: studentResponse,
      });

      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);

      // Calculate progress
      const newProgress = Math.min(100, Math.round((newQuestionCount / MAX_QUESTIONS) * 100));
      setProgress(newProgress);

      await updateProgress({
        interviewId,
        progress: newProgress,
      });

      // Check if interview should end
      if (newQuestionCount >= MAX_QUESTIONS) {
        await handleCompleteInterview();
        return;
      }

      // Generate next question based on conversation history
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const nextQuestion = await generateInterviewQuestion(
        studentProfile.stream,
        [...conversationHistory, { role: "student", content: studentResponse }],
        studentProfile.name
      );

      setCurrentQuestion(nextQuestion);
      const aiMessage: Message = {
        role: "ai",
        content: nextQuestion,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Save to Convex
      await addMessage({
        interviewId,
        role: "ai",
        content: nextQuestion,
      });

      // Speak the next question
      speakText(nextQuestion);

      // Clear response
      setStudentResponse("");
    } catch (error: any) {
      showToast(error.message || "Failed to submit response", "error");
    } finally {
      setLoading(false);
    }
  };

  // Complete interview and evaluate
  const handleCompleteInterview = async () => {
    if (!interviewId || !studentProfile) return;

    setInterviewState("evaluating");
    setLoading(true);

    try {
      // Prepare conversation for evaluation
      const conversation = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Get AI evaluation
      const evaluation = await evaluateInterview(conversation, studentProfile.stream);

      // Save evaluation to Convex
      await evaluateInterviewMutation({
        interviewId,
        ...evaluation,
      });

      // Update student status based on decision
      const newStatus = evaluation.decision === "SELECT" ? "UNDER_REVIEW" : "REJECTED";
      await updateStudentStatus({
        studentId: studentProfile._id,
        status: newStatus,
      });

      setInterviewState("completed");

      // Show result message
      if (evaluation.decision === "SELECT") {
        showToast(
          "Interview completed successfully! Your application is under review.",
          "success"
        );
      } else {
        showToast("Interview completed. Thank you for your time.", "info");
      }

      // Redirect after delay
      setTimeout(() => {
        if (evaluation.decision === "SELECT") {
          navigate("/status");
        } else {
          navigate("/rejected");
        }
      }, 3000);
    } catch (error: any) {
      showToast(error.message || "Failed to complete interview", "error");
      setInterviewState("in_progress");
    } finally {
      setLoading(false);
    }
  };

  if (!studentProfile) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-marlion-bg py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">AI Interview</h1>
          <p className="text-marlion-muted">
            Voice-first conversational interview with AI • Be honest and stay focused
          </p>
        </div>

        {/* Progress Bar */}
        {interviewState === "in_progress" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-marlion-text">
                Question {questionCount} of {MAX_QUESTIONS}
              </span>
              <span className="text-sm font-medium text-marlion-text">{progress}%</span>
            </div>
            <div className="w-full bg-marlion-bg border border-marlion-border rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-marlion-primary to-marlion-success h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="glass-card p-8">
          {/* Not Started */}
          {interviewState === "not_started" && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-marlion-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-primary/20">
                <i className="fa-solid fa-microphone text-5xl text-marlion-primary"></i>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">Ready to Begin?</h2>

              <div className="max-w-2xl mx-auto space-y-4 text-left">
                <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-4">
                  <h3 className="font-bold text-white mb-2">
                    <i className="fa-solid fa-circle-info text-marlion-primary mr-2"></i>
                    Interview Guidelines
                  </h3>
                  <ul className="space-y-2 text-sm text-marlion-muted">
                    <li>
                      <i className="fa-solid fa-check text-marlion-success mr-2"></i>
                      Voice-first interview (text fallback available)
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-marlion-success mr-2"></i>
                      10-15 questions based on your stream
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-marlion-success mr-2"></i>
                      Be honest and show your passion
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-marlion-success mr-2"></i>
                      No time limit per question
                    </li>
                  </ul>
                </div>

                <div className="bg-marlion-danger/10 border border-marlion-danger/20 rounded-xl p-4">
                  <h3 className="font-bold text-marlion-danger mb-2">
                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                    Anti-Cheat Policies
                  </h3>
                  <ul className="space-y-2 text-sm text-marlion-muted">
                    <li>
                      <i className="fa-solid fa-ban text-marlion-danger mr-2"></i>
                      No tab switching (3 warnings = automatic ban)
                    </li>
                    <li>
                      <i className="fa-solid fa-ban text-marlion-danger mr-2"></i>
                      No copy-pasting answers (2 warnings = automatic ban)
                    </li>
                    <li>
                      <i className="fa-solid fa-ban text-marlion-danger mr-2"></i>
                      AI will detect dishonest responses
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4 pt-6">
                <label className="flex items-center space-x-2 text-marlion-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useVoice}
                    onChange={(e) => setUseVoice(e.target.checked)}
                    className="w-5 h-5 rounded border-marlion-border bg-marlion-bg text-marlion-primary focus:ring-marlion-primary"
                  />
                  <span>Enable voice recognition</span>
                </label>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleStartInterview}
                disabled={loading}
                className="mx-auto"
              >
                {loading ? "Starting Interview..." : "Start Interview"}
              </Button>
            </div>
          )}

          {/* In Progress */}
          {interviewState === "in_progress" && (
            <div className="space-y-6">
              {/* Conversation History */}
              <div className="bg-marlion-bg border border-marlion-border rounded-xl p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "student" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === "ai"
                            ? "bg-marlion-primary/10 border border-marlion-primary/20"
                            : "bg-marlion-success/10 border border-marlion-success/20"
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <i
                            className={`${
                              message.role === "ai" ? "fa-solid fa-robot" : "fa-solid fa-user"
                            } mr-2 ${
                              message.role === "ai" ? "text-marlion-primary" : "text-marlion-success"
                            }`}
                          ></i>
                          <span className="text-xs font-bold text-marlion-text uppercase">
                            {message.role === "ai" ? "AI Interviewer" : "You"}
                          </span>
                        </div>
                        <p className="text-white">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Current Question Display */}
              {currentQuestion && (
                <div className="bg-gradient-to-r from-marlion-primary/20 to-marlion-primary/10 border border-marlion-primary/30 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-marlion-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-robot text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2">Current Question:</h3>
                      <p className="text-marlion-text">{currentQuestion}</p>
                      {isSpeaking && (
                        <div className="flex items-center mt-3 text-marlion-primary text-sm">
                          <i className="fa-solid fa-volume-high mr-2 animate-pulse"></i>
                          Speaking...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Response Input */}
              <div className="space-y-4">
                {useVoice && (
                  <div className="flex justify-center">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        isListening
                          ? "bg-marlion-danger animate-pulse shadow-lg shadow-marlion-danger/50"
                          : "bg-marlion-primary hover:bg-marlion-primaryHover shadow-lg"
                      }`}
                      disabled={loading}
                    >
                      <i
                        className={`fa-solid ${
                          isListening ? "fa-stop" : "fa-microphone"
                        } text-white text-3xl`}
                      ></i>
                    </button>
                  </div>
                )}

                {isListening && (
                  <p className="text-center text-marlion-primary animate-pulse">
                    Listening... Speak now
                  </p>
                )}

                <div>
                  <label className="block text-sm font-medium text-marlion-text mb-2">
                    Your Response {!useVoice && <span className="text-marlion-danger">*</span>}
                  </label>
                  <textarea
                    value={studentResponse}
                    onChange={(e) => setStudentResponse(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Type your answer here or use voice input above..."
                    rows={4}
                    className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-marlion-muted">
                    {studentResponse.length} characters
                  </span>
                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                      }}
                      disabled={loading || !isSpeaking}
                    >
                      <i className="fa-solid fa-volume-xmark mr-2"></i>
                      Stop Speaking
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitResponse}
                      disabled={loading || !studentResponse.trim()}
                    >
                      {loading ? "Submitting..." : "Submit Response"}
                      <i className="fa-solid fa-arrow-right ml-2"></i>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Early completion option */}
              {questionCount >= MIN_QUESTIONS && (
                <div className="border-t border-marlion-border pt-4 text-center">
                  <p className="text-sm text-marlion-muted mb-3">
                    You've answered {questionCount} questions. You can continue or finish now.
                  </p>
                  <Button variant="success" onClick={handleCompleteInterview} disabled={loading}>
                    <i className="fa-solid fa-check mr-2"></i>
                    Finish Interview
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Evaluating */}
          {interviewState === "evaluating" && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-marlion-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-primary/20 animate-pulse">
                <i className="fa-solid fa-brain text-5xl text-marlion-primary"></i>
              </div>
              <h2 className="text-2xl font-bold text-white">Evaluating Your Responses...</h2>
              <p className="text-marlion-muted">
                Our AI is analyzing your interview. This may take a moment.
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marlion-primary"></div>
              </div>
            </div>
          )}

          {/* Completed */}
          {interviewState === "completed" && !banned && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-marlion-success/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-success/20">
                <i className="fa-solid fa-check-circle text-5xl text-marlion-success"></i>
              </div>
              <h2 className="text-2xl font-bold text-white">Interview Completed!</h2>
              <p className="text-marlion-muted">Redirecting to status page...</p>
            </div>
          )}
        </div>

        {/* Back button (only when not in progress) */}
        {interviewState === "not_started" && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="text-marlion-muted hover:text-marlion-primary transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
