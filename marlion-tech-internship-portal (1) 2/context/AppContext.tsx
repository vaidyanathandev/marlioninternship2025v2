import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, UserRole, ApplicationStatus, StreamType, ProposalStatus, DailyLog } from '../types';

interface AppState {
  currentUser: Student | null;
  role: UserRole;
  isAuthenticated: boolean;
  students: Student[]; // Admin view simulation
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
  registerStudent: (data: Partial<Student>) => void;
  updateStudentStatus: (id: string, status: ApplicationStatus, data?: Partial<Student>) => void;
  banStudent: (id: string) => void;
  addLog: (id: string, log: DailyLog) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Mock Data for Admin View
const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    registerNumber: '917719C001',
    idProofLink: 'id_alice.pdf',
    college: 'Thiagarajar college of engineering',
    year: '3',
    department: 'CSE',
    stream: StreamType.AGENTIC_AI,
    startDate: '2025-12-02',
    endDate: '2026-01-15',
    status: ApplicationStatus.IN_PROGRESS,
    proposalStatus: ProposalStatus.APPROVED,
    progress: 45,
    banned: false,
    interviewScore: 85,
    interviewSummary: "Strong candidate with good Python skills.",
    logs: [
        { id: 'l1', date: '2025-12-02', content: 'Started environment setup.' }
    ]
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    registerNumber: '917719C002',
    idProofLink: 'id_bob.pdf',
    college: 'Anna University',
    year: '4',
    department: 'IT',
    stream: StreamType.FULL_STACK,
    startDate: '2025-12-02',
    endDate: '2025-12-30',
    status: ApplicationStatus.INTERVIEW_COMPLETED, // Ready for review
    proposalStatus: ProposalStatus.NOT_SUBMITTED,
    progress: 0,
    banned: false,
    interviewScore: 72,
    interviewSummary: "Good potential but needs more React practice.",
    interviewTranscript: [
        { role: 'model', text: 'Tell me about yourself.', timestamp: 1 },
        { role: 'user', text: 'I love coding.', timestamp: 2 }
    ],
    logs: []
  },
  {
    id: '3',
    name: 'Charlie Day',
    email: 'charlie@example.com',
    registerNumber: '917719C003',
    idProofLink: 'id_charlie.jpg',
    college: 'SRM',
    year: '2',
    department: 'ECE',
    stream: StreamType.AR_VR,
    startDate: '2025-12-05',
    endDate: '2026-01-05',
    status: ApplicationStatus.INTERVIEW_PENDING, // Test Interview
    proposalStatus: ProposalStatus.NOT_SUBMITTED,
    progress: 0,
    banned: false,
    logs: []
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

  const login = (email: string, targetRole: UserRole): boolean => {
    if (targetRole === UserRole.ADMIN) {
      setRole(UserRole.ADMIN);
      setCurrentUser(null);
      return true;
    } else {
      const existing = students.find(s => s.email === email);
      if (existing) {
        setCurrentUser(existing);
        setRole(UserRole.STUDENT);
        return true;
      } else {
        alert("User not found. Please register.");
        return false;
      }
    }
  };

  const registerStudent = (data: Partial<Student>) => {
    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      status: ApplicationStatus.INTERVIEW_PENDING,
      progress: 0,
      banned: false,
      proposalStatus: ProposalStatus.NOT_SUBMITTED,
      email: data.email || '',
      name: data.name || '',
      registerNumber: data.registerNumber || '',
      idProofLink: data.idProofLink || '',
      college: data.college || '',
      year: data.year || '',
      department: data.department || '',
      stream: data.stream || StreamType.FULL_STACK,
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      logs: []
    };
    setStudents([...students, newStudent]);
    setCurrentUser(newStudent);
    setRole(UserRole.STUDENT);
  };

  const updateStudentStatus = (id: string, status: ApplicationStatus, data?: Partial<Student>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, status, ...data };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return s;
    }));
  };

  const banStudent = (id: string) => {
      setStudents(prev => prev.map(s => s.id === id ? {...s, banned: true} : s));
      if(currentUser?.id === id) setCurrentUser({...currentUser!, banned: true});
  }

  const addLog = (id: string, log: DailyLog) => {
      setStudents(prev => prev.map(s => {
          if (s.id === id) {
              const updated = { ...s, logs: [...(s.logs || []), log] };
              if (currentUser?.id === id) setCurrentUser(updated);
              return updated;
          }
          return s;
      }));
  }

  const logout = () => {
    setCurrentUser(null);
    setRole(UserRole.GUEST);
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      role, 
      isAuthenticated: role !== UserRole.GUEST, 
      students,
      login, 
      logout,
      registerStudent,
      updateStudentStatus,
      banStudent,
      addLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};