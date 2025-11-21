export const APP_NAME = "Marlion Internship Platform";
export const APP_VERSION = "1.0.0";

// Firebase config (populated from env variables)
export const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

// Convex config
export const getConvexUrl = () => import.meta.env.VITE_CONVEX_URL;

// AI config (OpenAI-compatible API)
export const getAIConfig = () => ({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  endpoint: import.meta.env.VITE_AI_ENDPOINT || "https://api.openai.com/v1",
  model: import.meta.env.VITE_AI_MODEL || "gpt-4-turbo-preview",
});

// App configuration
export const APP_CONFIG = {
  registrationDeadline: "2025-11-30",
  internshipStartDate: "2025-12-02",
  minInternshipDays: 14,
  maxInternshipDays: 84,
  officeHours: "10 AM - 5 PM (Mon-Sat)",
  officeAddress:
    "A-34, Kumarasamy Street, (Opp to Anusha Vidhyalaya matriculation school), Thirunagar 7th Stop, Madurai 625006",
  officeMapUrl: "https://maps.app.goo.gl/hKZZX8qByEnqpQqF9",
  contactEmail: "social@marliontech.com",
  contactPhone: "+919486734438",
  corporateWebsite: "https://www.marliontech.com/",
};
