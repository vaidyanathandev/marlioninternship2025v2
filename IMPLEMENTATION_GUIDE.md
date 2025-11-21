# Marlion Internship Platform - Implementation Guide

## Overview

This guide provides step-by-step instructions for completing the implementation of the Marlion Technologies Winter Internship 2025 platform. The foundation has been set up with a Turborepo monorepo structure, but significant work remains to migrate existing code and implement new features.

## Current Status

### ✅ Completed
- [x] Turborepo monorepo structure
- [x] Convex backend schema and functions
- [x] Firebase authentication package
- [x] AI integration package (OpenAI-compatible)
- [x] Shared UI components and design system
- [x] Student app basic structure
- [x] Admin app basic structure
- [x] Environment variables template

### 🚧 In Progress / Todo
- [ ] Migrate existing student app code
- [ ] Implement all student app features
- [ ] Implement all admin app features
- [ ] Set up Convex deployment
- [ ] Set up Firebase project
- [ ] Configure AI provider
- [ ] Test end-to-end functionality
- [ ] Deploy to production

---

## Step 1: Environment Setup

### 1.1 Install Dependencies

```bash
cd marlioninternship2025v2
npm install
```

### 1.2 Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: "marlion-internship-2025"
3. Enable Authentication:
   - Email/Password
   - Phone (SMS)
   - Google Sign-In
4. Create a web app and copy configuration
5. Enable Firestore Database
6. Enable Storage

### 1.3 Set Up Convex

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Create new project: "marlion-internship-platform"
3. Link to GitHub repository (optional)
4. Copy deployment URL

### 1.4 Set Up AI Provider

**Option A: OpenAI (Recommended)**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create API key
3. Set billing limits to control costs

**Option B: Local Ollama (Free)**
1. Install Ollama: https://ollama.ai/
2. Run: `ollama run llama2`
3. Use endpoint: `http://localhost:11434/v1`

### 1.5 Configure Environment Variables

Create `.env.local` in the root:

```bash
cp .env.example .env.local
```

Fill in all values from Firebase, Convex, and AI provider setup.

---

## Step 2: Migrate Existing Code

### 2.1 Copy Existing Components

From `marlion-tech-internship-portal (1) 2/`:

1. **Components to migrate:**
   - `components/Countdown.tsx` → `packages/ui/src/components/Countdown.tsx`
   - `components/StreamCard.tsx` → `packages/ui/src/components/StreamCard.tsx`

2. **Pages to migrate:**
   - `pages/Home.tsx` → `apps/student-app/src/pages/Home.tsx`
   - `pages/Register.tsx` → `apps/student-app/src/pages/Register.tsx`
   - `pages/AIInterview.tsx` → `apps/student-app/src/pages/AIInterview.tsx`
   - `pages/Dashboard.tsx` → `apps/student-app/src/pages/Dashboard.tsx`

3. **Update imports:**
   - Replace `@google/genai` with `@marlion/ai`
   - Replace local imports with package imports
   - Update Context API usage to use Convex hooks

### 2.2 Convert Gemini to New AI Service

**Old (Gemini):**
```typescript
import { generateAIResponse } from '../services/gemini';
```

**New:**
```typescript
import { generateAIResponse } from '@marlion/ai';
```

All function signatures remain the same, so most code should work with minimal changes.

### 2.3 Replace Context API with Convex

**Old:**
```typescript
const { user, students } = useContext(AppContext);
```

**New:**
```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

const user = useQuery(api.auth.getCurrentUser, { firebaseUid });
const students = useQuery(api.students.getAllStudents);
```

---

## Step 3: Implement Student App Features

### 3.1 Home Page

**Required Elements:**
- Hero section with countdown timer
- Register Now + Explore Topics buttons
- CEO video embed (YouTube)
- 4 stream cards with collapsible video sections
- AI-powered FAQ chatbot
- Office location (Google Maps embed)
- Contact information
- Footer with social links

**Implementation:**
```typescript
// apps/student-app/src/pages/Home.tsx

import { Countdown } from '@marlion/ui';
import { StreamCard } from '@marlion/ui';
import { ChatBot } from '../components/ChatBot';
import { APP_CONFIG } from '@marlion/config';

// Implement full home page with all sections
```

### 3.2 Registration Flow

**3-step process:**

1. **Step 1: Basic Info + Auth**
   - Email or phone input
   - Google SSO button
   - Send OTP

2. **Step 2: OTP Verification**
   - 6-digit code input
   - Resend button
   - Verify with Firebase

3. **Step 3: Detailed Form**
   - Name, college, year, department
   - Stream selection
   - Start/end dates (validate 14-84 days)
   - ID proof upload (Firebase Storage)
   - Special requests textarea

**Save to Convex:**
```typescript
const registerStudent = useMutation(api.students.registerStudent);

await registerStudent({
  userId: user._id,
  name,
  email,
  // ... other fields
});
```

### 3.3 AI Interview

**Features:**
- Voice-first interface (Web Speech API)
- Fallback to text input
- Progress indicator (0-100%)
- Anti-cheat detection (copy-paste monitoring)
- Auto-submit at 100%

**Flow:**
1. Start interview session (Convex)
2. AI generates first question
3. Student responds (voice or text)
4. Track response time for each answer
5. Increment progress (10-20% per question)
6. At 100%, evaluate transcript with AI
7. Save evaluation to Convex
8. Update student status to "UNDER_REVIEW"

### 3.4 Offer Letter / Rejection

**After AI evaluation (24 hours):**

- **If SELECTED:**
  - Show offer letter with terms
  - "I Agree" button
  - Download PDF
  - Redirect to Dashboard

- **If REJECTED:**
  - Show regret message
  - End experience

### 3.5 Main Dashboard

**4 Tabs:**

1. **Bootcamp Kit:**
   - Video player
   - Module list (sidebar)
   - AI tutor chat (contextual help)
   - Knowledge checks after each module
   - Progress tracking

2. **Problem Statement:**
   - Show default project for stream
   - OR submit custom proposal
   - Upload PDF + description
   - Wait 24 hours for approval

3. **Project Tracker (Kanban):**
   - TODO, IN_PROGRESS, IN_REVIEW, DONE columns
   - Drag-and-drop tasks
   - Daily journal entry form
   - GitHub URL + attachments
   - Mark tasks for review

4. **AI Help Desk:**
   - Create support tickets
   - AI-assisted responses
   - Track ticket status

**Overall Progress:**
- Calculate completion percentage
- Bootcamp: 40%
- Project: 40%
- Daily logs: 20%
- Show progress bar at top

### 3.6 Certificate Download

**When 100% complete:**
- Generate certificate PDF
- Add QR code (verification URL)
- AI-generated journey summary
- Feedback and future directions
- Download button
- Share on social media buttons

---

## Step 4: Implement Admin App Features

### 4.1 Admin Login

**Simple email/password:**
- No signup
- Firebase authentication
- Redirect to dashboard

### 4.2 Dashboard

**Stats Cards:**
- Total registrations
- Pending interviews
- Under review
- Selected / Rejected
- Active / Completed
- Banned

**Recent Activity Log:**
- Real-time feed of all activities
- Filterable by type
- Search by student name/email

### 4.3 Student Management

**Table with columns:**
- Name, Email, College, Stream
- Status badge
- Interview score
- Actions: View, Select/Reject, Ban

**Filters:**
- By status
- By stream
- By college
- Search

**Student Detail Modal:**
- Full profile
- Interview transcript + evaluation
- Bootcamp progress
- Project status
- Activity history
- Actions

### 4.4 Interview Reviews

**For each completed interview:**
- Student info
- Full transcript
- AI evaluation scores:
  - Technical (0-100)
  - Passion (0-100)
  - Curiosity (0-100)
  - Communication (0-100)
  - Overall score
- AI reasoning/summary
- Approve / Reject buttons
- Send email notification

### 4.5 Course Management (CMS)

**Module CRUD:**
- Create/Edit/Delete modules
- Fields:
  - Title
  - Description
  - Video URL (YouTube/Vimeo)
  - Duration
  - Order
  - Stream (optional filter)
- Generate AI summary button
  - Fetches video transcript
  - Creates contextual summary for AI tutor

**Module List:**
- Drag to reorder
- Toggle active/inactive

### 4.6 Project Management

**Create Projects:**
- Title, description
- Objectives (list)
- Tech stack (tags)
- Prerequisites (list)
- Learning resources (links)
- Duration (weeks)
- Stream
- Active/Inactive toggle

**Proposal Review:**
- List pending proposals
- View PDF + description
- Approve / Reject with feedback
- Email notification

**Project Assignment:**
- Assign student to project
- From proposal or default project list

### 4.7 Progress Tracking

**View per student:**
- Bootcamp completion %
- Module scores
- Knowledge check results
- Daily logs timeline
- Task statuses
- Project completion %

**Intervention:**
- Send direct message to student
- Add notes/comments
- Flag for follow-up

### 4.8 Announcements

**Create announcement:**
- Title
- Content (markdown)
- Priority (LOW/MEDIUM/HIGH)
- Publish to all students

**Announcement list:**
- Edit / Delete

### 4.9 Community Moderation

**Discussion board (optional):**
- Students can post questions
- Admin can moderate
- AI can suggest answers

### 4.10 Student Removal

**Ban student:**
- Reason (required)
- Confirmation dialog
- Update status to BANNED
- Sarcastic message if copy-paste detected:
  > "We'd rather work with AI directly than collaborate with a human who mindlessly copy-pastes AI-generated responses."

### 4.11 Certificate Verification

**QR code scanner:**
- Input certificate number
- Display: Student name, project, issue date
- Verify authenticity

### 4.12 Feedback Analytics

**View all feedback:**
- Table with ratings, comments, suggestions
- Would recommend: Yes/No
- Semantic search (AI-powered)
- Export to CSV

---

## Step 5: Key Implementation Details

### 5.1 Firebase Authentication Flow

```typescript
// Student registration with email OTP
const otp = generateEmailOTP();
storeOTP(email, otp);
// Send email via backend service (SendGrid, etc.)

// Verify OTP
if (verifyEmailOTP(email, inputOtp)) {
  const credential = await signUpWithEmail(email, tempPassword);
  const idToken = await credential.user.getIdToken();

  // Sync to Convex
  const userId = await syncUser({
    firebaseUid: credential.user.uid,
    email,
    name,
  });
}
```

### 5.2 Phone OTP Flow

```typescript
// Initialize reCAPTCHA
const recaptchaVerifier = initializeRecaptcha('recaptcha-container');

// Send OTP
const confirmationResult = await sendPhoneOTP(phoneNumber, recaptchaVerifier);

// Verify OTP
const credential = await verifyPhoneOTP(confirmationResult, otp);
```

### 5.3 Google SSO Flow

```typescript
const result = await signInWithGoogle();
const idToken = await result.user.getIdToken();

// Sync to Convex
const userId = await syncUser({
  firebaseUid: result.user.uid,
  email: result.user.email!,
  name: result.user.displayName!,
});
```

### 5.4 Convex Real-time Subscriptions

```typescript
// In component
const students = useQuery(api.students.getAllStudents);

// Updates automatically when data changes in Convex
```

### 5.5 AI Interview Implementation

```typescript
const [messages, setMessages] = useState<InterviewMessage[]>([]);
const [progress, setProgress] = useState(0);

const handleResponse = async (studentResponse: string) => {
  // Add student message
  await addInterviewMessage({
    interviewId,
    role: 'student',
    content: studentResponse,
  });

  // Generate AI question
  const aiQuestion = await generateInterviewQuestion(
    messages,
    progress
  );

  // Add AI message
  await addInterviewMessage({
    interviewId,
    role: 'ai',
    content: aiQuestion,
  });

  // Update progress
  const newProgress = Math.min(progress + 15, 100);
  await updateInterviewProgress({ interviewId, progress: newProgress });
  setProgress(newProgress);

  // If complete, evaluate
  if (newProgress >= 100) {
    const evaluation = await evaluateInterview(transcript);
    await evaluateInterview({ interviewId, ...evaluation });
  }
};
```

### 5.6 Anti-Cheat System

```typescript
const [lastPasteTime, setLastPasteTime] = useState<number>(0);
const [pasteCount, setPasteCount] = useState(0);

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();

  const now = Date.now();
  const timeSinceLast = now - lastPasteTime;

  // If pasting within 30 seconds of last paste
  if (timeSinceLast < 30000) {
    const newCount = pasteCount + 1;
    setPasteCount(newCount);

    // Ban after 3 pastes
    if (newCount >= 3) {
      await banStudent({
        studentId,
        reason: "Copy-paste detected during interview",
      });

      // Show sarcastic message
      alert("Banned: We'd rather work with AI directly...");
      navigate('/');
    }
  }

  setLastPasteTime(now);
};

// Add listener
useEffect(() => {
  document.addEventListener('paste', handlePaste);
  return () => document.removeEventListener('paste', handlePaste);
}, [pasteCount, lastPasteTime]);
```

### 5.7 Certificate Generation

```typescript
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const generateCertificate = async (student, project) => {
  // Generate QR code
  const certificateNumber = `MARLION-${Date.now()}-${student._id}`;
  const qrCodeData = await QRCode.toDataURL(
    `https://marliontech.com/verify/${certificateNumber}`
  );

  // Create PDF
  const doc = new jsPDF();

  // Add design, text, QR code
  doc.text(`Certificate of Completion`, 105, 50, { align: 'center' });
  doc.text(student.name, 105, 80, { align: 'center' });
  doc.addImage(qrCodeData, 'PNG', 85, 120, 40, 40);

  // Save
  const pdfBlob = doc.output('blob');

  // Upload to Firebase Storage
  const pdfUrl = await uploadCertificate(pdfBlob, certificateNumber);

  // Generate AI summary
  const { summary, feedback } = await generateCertificateSummary(
    student.name,
    project.title,
    {
      bootcampScore: 85,
      projectProgress: 100,
      dailyLogCount: 42,
    }
  );

  // Save to Convex
  await generateCertificate({
    studentId: student._id,
    projectId: project._id,
    certificateNumber,
    qrCode: qrCodeData,
    pdfUrl,
    aiSummary: summary,
    feedback,
  });
};
```

---

## Step 6: Deployment

### 6.1 Convex Deployment

```bash
cd packages/convex
npx convex deploy --prod
```

Copy production URL and update `.env.local`.

### 6.2 Student App Deployment (Vercel)

```bash
cd apps/student-app
npm run build

# Deploy to Vercel
vercel --prod
```

### 6.3 Admin App Deployment (Vercel)

```bash
cd apps/admin-app
npm run build

# Deploy to Vercel (separate project)
vercel --prod
```

### 6.4 Environment Variables in Production

Add all `.env.local` variables to Vercel project settings.

### 6.5 Firebase Security Rules

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Step 7: Testing

### 7.1 Student Flow Test

1. Register with email
2. Complete AI interview
3. Wait for selection
4. Accept offer
5. Complete bootcamp modules
6. Submit project proposal
7. Daily logging
8. Receive certificate

### 7.2 Admin Flow Test

1. Login
2. Review interviews
3. Select/reject students
4. Create course modules
5. Assign projects
6. Monitor progress
7. Issue certificates

### 7.3 Edge Cases

- OTP expiry
- Network failures
- Duplicate registrations
- Copy-paste detection false positives
- Certificate verification

---

## Step 8: Production Checklist

- [ ] All environment variables set
- [ ] Firebase security rules configured
- [ ] Convex functions tested
- [ ] Email service working (OTP, notifications)
- [ ] SMS service working (phone OTP)
- [ ] File uploads working (Firebase Storage)
- [ ] AI API limits set
- [ ] Error boundaries added
- [ ] Loading states added
- [ ] Mobile responsiveness verified
- [ ] PWA manifest configured
- [ ] Analytics integrated
- [ ] Monitoring/logging set up

---

## Troubleshooting

### Issue: Convex functions not working

**Solution:** Ensure `VITE_CONVEX_URL` is set and `npx convex dev` is running.

### Issue: Firebase auth errors

**Solution:** Check Firebase console for enabled auth methods and correct configuration.

### Issue: AI API rate limits

**Solution:** Implement request queuing and rate limiting on frontend.

### Issue: Build errors in monorepo

**Solution:** Run `npm install` at root and ensure all workspace dependencies resolve correctly.

---

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

---

## Next Steps

1. Install dependencies: `npm install`
2. Set up environment variables
3. Start Convex: `cd packages/convex && npx convex dev`
4. Start student app: `cd apps/student-app && npm run dev`
5. Start admin app: `cd apps/admin-app && npm run dev`
6. Begin migrating code from old structure
7. Implement features step by step
8. Test thoroughly
9. Deploy!

**Estimated Time to Complete:** 2-3 weeks with 1 developer, 1 week with a team.

Good luck! 🚀
