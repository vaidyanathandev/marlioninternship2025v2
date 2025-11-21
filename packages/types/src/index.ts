// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export type UserRole = "GUEST" | "STUDENT" | "ADMIN";

export type ApplicationStatus =
  | "REGISTERED"
  | "INTERVIEW_PENDING"
  | "INTERVIEW_COMPLETED"
  | "UNDER_REVIEW"
  | "SELECTED"
  | "REJECTED"
  | "OFFER_RELEASED"
  | "OFFER_ACCEPTED"
  | "ACTIVE"
  | "COMPLETED"
  | "BANNED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  college: string;
  customCollege?: string;
  year: number;
  department: string;
  registerNumber?: string;
  idProofUrl?: string;
  stream: InternshipStream;
  startDate: string;
  endDate: string;
  specialRequests?: string;
  status: ApplicationStatus;
  banReason?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// INTERNSHIP TYPES
// ============================================================================

export type InternshipStream = "AR_VR" | "FULL_STACK" | "AGENTIC_AI" | "DATA_SCIENCE";

export interface StreamInfo {
  id: InternshipStream;
  title: string;
  description: string;
  videoUrl?: string;
  icon: string;
}

export const INTERNSHIP_STREAMS: Record<InternshipStream, StreamInfo> = {
  AR_VR: {
    id: "AR_VR",
    title: "Immersive Tech (AR/VR)",
    description: "Build immersive experiences using augmented and virtual reality technologies",
    icon: "fa-vr-cardboard",
  },
  FULL_STACK: {
    id: "FULL_STACK",
    title: "Full Stack Development",
    description: "Create responsive web and mobile applications",
    icon: "fa-layer-group",
  },
  AGENTIC_AI: {
    id: "AGENTIC_AI",
    title: "Agentic AI",
    description: "Develop intelligent AI agents and autonomous systems",
    icon: "fa-robot",
  },
  DATA_SCIENCE: {
    id: "DATA_SCIENCE",
    title: "Data Science (AI/ML)",
    description: "Extract insights from data using machine learning and AI",
    icon: "fa-chart-line",
  },
};

export const COLLEGES = [
  "Thiagarajar College of Engineering",
  "Kamaraj College of Engineering",
  "SRM Madurai College of Engineering and Technology",
  "Anna University Regional Campus (Ramanathapuram)",
  "Others",
] as const;

export type College = (typeof COLLEGES)[number];

// ============================================================================
// AI INTERVIEW TYPES
// ============================================================================

export interface InterviewMessage {
  id: string;
  role: "ai" | "student";
  content: string;
  timestamp: number;
  isVoice?: boolean;
}

export interface InterviewSession {
  id: string;
  studentId: string;
  messages: InterviewMessage[];
  transcript: string;
  progress: number;
  score?: number;
  summary?: string;
  decision?: "SELECT" | "REJECT";
  evaluatedAt?: number;
  status: "IN_PROGRESS" | "COMPLETED" | "EVALUATED";
  createdAt: number;
  updatedAt: number;
}

export interface InterviewEvaluation {
  score: number;
  summary: string;
  decision: "SELECT" | "REJECT";
  technicalScore: number;
  passionScore: number;
  curiosityScore: number;
  communicationScore: number;
  reasoning: string;
}

// ============================================================================
// COURSE & LEARNING TYPES
// ============================================================================

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
  aiSummary?: string; // AI-generated summary for context
  createdAt: number;
  updatedAt: number;
}

export interface ModuleProgress {
  id: string;
  studentId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  lastAttemptAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface KnowledgeCheck {
  id: string;
  studentId: string;
  moduleId: string;
  transcript: string;
  score: number;
  passed: boolean;
  feedback: string;
  createdAt: number;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  techStack: string[];
  prerequisites: string[];
  learningResources: string[];
  duration: number; // in weeks
  stream: InternshipStream;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectProposal {
  id: string;
  studentId: string;
  title: string;
  description: string;
  pdfUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectAssignment {
  id: string;
  studentId: string;
  projectId: string;
  assignedBy: string;
  assignedAt: number;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
}

// ============================================================================
// TASK & PROGRESS TRACKING
// ============================================================================

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface DailyLog {
  id: string;
  studentId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  description: string;
  githubUrl?: string;
  attachments: string[];
  tasksCompleted: string[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// HELP & SUPPORT
// ============================================================================

export interface HelpTicket {
  id: string;
  studentId: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedTo?: string;
  resolution?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// ANNOUNCEMENTS & COMMUNITY
// ============================================================================

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: number;
}

// ============================================================================
// CERTIFICATES
// ============================================================================

export interface Certificate {
  id: string;
  studentId: string;
  projectId: string;
  certificateNumber: string;
  qrCode: string;
  pdfUrl: string;
  aiSummary: string;
  feedback: string;
  issuedAt: number;
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export type ActivityType =
  | "REGISTRATION"
  | "INTERVIEW_COMPLETED"
  | "SELECTED"
  | "REJECTED"
  | "OFFER_ACCEPTED"
  | "MODULE_COMPLETED"
  | "PROPOSAL_SUBMITTED"
  | "PROPOSAL_APPROVED"
  | "PROPOSAL_REJECTED"
  | "PROJECT_ASSIGNED"
  | "TASK_UPDATED"
  | "DAILY_LOG_SUBMITTED"
  | "HELP_TICKET_CREATED"
  | "CERTIFICATE_ISSUED"
  | "BANNED"
  | "MESSAGE_SENT";

export interface ActivityLog {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

// ============================================================================
// AI CHAT TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatContext {
  type: "GENERAL" | "COURSE" | "INTERVIEW" | "HELP";
  moduleId?: string;
  videoContext?: string;
  studentId?: string;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminStats {
  totalRegistrations: number;
  pendingInterviews: number;
  underReview: number;
  selected: number;
  rejected: number;
  active: number;
  completed: number;
  banned: number;
}

export interface StudentReview {
  student: StudentProfile;
  interview: InterviewSession;
  evaluation?: InterviewEvaluation;
  proposal?: ProjectProposal;
}

// ============================================================================
// FEEDBACK TYPES
// ============================================================================

export interface StudentFeedback {
  id: string;
  studentId: string;
  rating: number;
  comments: string;
  suggestions: string;
  wouldRecommend: boolean;
  createdAt: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AppConfig {
  registrationDeadline: string; // "2025-11-30"
  internshipStartDate: string; // "2025-12-02"
  officeHours: string; // "10 AM - 5 PM"
  officeAddress: string;
  officeMapUrl: string;
  contactEmail: string;
  contactPhone: string;
  corporateWebsite: string;
  ceoVideoUrl?: string;
  minInternshipDuration: number; // days
  maxInternshipDuration: number; // days
}

export const DEFAULT_CONFIG: AppConfig = {
  registrationDeadline: "2025-11-30",
  internshipStartDate: "2025-12-02",
  officeHours: "10 AM - 5 PM (Mon-Sat)",
  officeAddress:
    "A-34, Kumarasamy Street, (Opp to Anusha Vidhyalaya matriculation school), Thirunagar 7th Stop, Madurai 625006",
  officeMapUrl: "https://maps.app.goo.gl/hKZZX8qByEnqpQqF9",
  contactEmail: "social@marliontech.com",
  contactPhone: "+919486734438",
  corporateWebsite: "https://www.marliontech.com/",
  minInternshipDuration: 14, // 2 weeks
  maxInternshipDuration: 84, // 12 weeks
};
