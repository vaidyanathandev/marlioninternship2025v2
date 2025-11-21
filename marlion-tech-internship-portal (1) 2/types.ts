export enum StreamType {
  AR_VR = 'Immersive Tech (AR/VR)',
  FULL_STACK = 'Full Stack Apps',
  AGENTIC_AI = 'Agentic AI',
  DATA_SCIENCE = 'Data Science (AI & ML)'
}

export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum ApplicationStatus {
  REGISTERED = 'REGISTERED',
  INTERVIEW_PENDING = 'INTERVIEW_PENDING',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED', // Waiting for Admin Review
  OFFER_RELEASED = 'OFFER_RELEASED', // Admin Approved, Student needs to accept
  OFFER_ACCEPTED = 'OFFER_ACCEPTED', // Student Accepted
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum ProposalStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface KanbanTask {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  description?: string;
}

export interface DailyLog {
  id: string;
  date: string;
  content: string;
  githubUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  registerNumber?: string;
  idProofLink?: string;
  college: string;
  year: string;
  department: string;
  stream: StreamType;
  startDate: string;
  endDate: string;
  status: ApplicationStatus;
  interviewScore?: number;
  interviewSummary?: string;
  interviewTranscript?: ChatMessage[];
  proposalStatus: ProposalStatus;
  proposalText?: string;
  progress: number; // 0-100
  banned: boolean;
  logs?: DailyLog[];
}