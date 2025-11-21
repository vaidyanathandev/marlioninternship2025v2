# Marlion Technologies - Winter Internship 2025 Platform

AI-powered internship management system for end-to-end operations from registration to certification.

## About

Marlion Technologies offers a free winter internship program in 4 cutting-edge domains:
1. **Immersive Tech (AR/VR)**
2. **Full Stack Apps (Web & Mobile)**
3. **Agentic AI**
4. **Data Science (AI & ML)**

**Theme:** Building assistive technologies and IEP for neurodiverse children

**Duration:** 2-12 weeks (student's discretion)
**Registration Deadline:** November 30, 2025
**Start Date:** December 2, 2025
**Office Hours:** 10 AM - 5 PM (Mon-Sat)
**Location:** Madurai, Tamil Nadu

## Architecture

This is a Turborepo monorepo with:

- **apps/student-app** - Student-facing PWA (React + Vite)
- **apps/admin-app** - Admin dashboard (React + Vite)
- **packages/ui** - Shared UI components
- **packages/convex** - Convex backend (database, auth, functions)
- **packages/firebase** - Firebase auth utilities
- **packages/types** - Shared TypeScript types
- **packages/config** - Shared configuration

## Tech Stack

- **Frontend:** React 19, TypeScript, TailwindCSS, Vite
- **Backend:** Convex (database + real-time)
- **Auth:** Firebase (Email/Phone OTP + Google SSO)
- **AI:** DigitalOcean AI API
- **Deployment:** Vercel (student app), Vercel (admin app)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development servers
npm run dev
```

### Environment Variables

Create `.env.local` in the root with:

```
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Convex
VITE_CONVEX_URL=

# DigitalOcean AI
VITE_DIGITALOCEAN_AI_API_KEY=
```

## Development

```bash
# Run all apps in development mode
npm run dev

# Build all apps
npm run build

# Lint all packages
npm run lint

# Clean all build artifacts
npm run clean
```

## Project Structure

```
marlion-internship-platform/
├── apps/
│   ├── student-app/          # Student-facing PWA
│   └── admin-app/             # Admin dashboard
├── packages/
│   ├── ui/                    # Shared components
│   ├── convex/                # Backend
│   ├── firebase/              # Auth utilities
│   ├── types/                 # TypeScript types
│   └── config/                # Shared config
├── turbo.json                 # Turborepo configuration
└── package.json               # Root package
```

## Features

### Student App
- AI-powered registration with voice interview
- Interactive bootcamp with video lectures
- AI tutor for contextual help
- Project tracker (Kanban board)
- Daily progress logging
- Offer letter & certificate download
- QR-verifiable certificates

### Admin App
- Student management dashboard
- AI interview review & selection
- Course content management (CMS)
- Project assignment system
- Progress tracking & intervention
- Announcements & moderation
- Certificate verification
- AI-powered analytics

## Contact

**Email:** social@marliontech.com
**Phone:** +91 9486734438
**Website:** https://www.marliontech.com/
**Address:** A-34, Kumarasamy Street, Thirunagar 7th Stop, Madurai 625006

## License

Proprietary - Marlion Technologies
