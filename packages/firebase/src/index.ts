/**
 * Firebase Authentication utilities
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  Auth,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getFirebaseConfig } from "@marlion/config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize Firebase
 */
export const initializeFirebase = () => {
  if (!app) {
    const config = getFirebaseConfig();
    app = initializeApp(config);
    auth = getAuth(app);
  }
  return { app, auth };
};

/**
 * Get Firebase auth instance
 */
export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    initializeFirebase();
  }
  return auth!;
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth();
  return auth.currentUser;
};

/**
 * Get ID token for Convex authentication
 */
export const getIdToken = async (): Promise<string | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  return await user.getIdToken();
};

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Send verification email
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }

  return userCredential;
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  return await signInWithEmailAndPassword(auth, email, password);
};

// ============================================================================
// GOOGLE SSO
// ============================================================================

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

// ============================================================================
// PHONE AUTHENTICATION
// ============================================================================

/**
 * Initialize reCAPTCHA verifier
 */
export const initializeRecaptcha = (containerId: string): RecaptchaVerifier => {
  const auth = getFirebaseAuth();

  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
  });

  return recaptchaVerifier;
};

/**
 * Send OTP to phone number
 */
export const sendPhoneOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  const auth = getFirebaseAuth();
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

/**
 * Verify phone OTP
 */
export const verifyPhoneOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string
) => {
  return await confirmationResult.confirm(otp);
};

/**
 * Sign in with phone credential (for linking)
 */
export const signInWithPhoneCredential = async (verificationId: string, verificationCode: string) => {
  const auth = getFirebaseAuth();
  const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
  return await signInWithCredential(auth, credential);
};

// ============================================================================
// EMAIL OTP (Custom Implementation)
// ============================================================================

/**
 * Generate and send email OTP
 * Note: This requires a backend function to send emails
 * For now, we'll use a simple 6-digit code
 */
export const generateEmailOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP in session storage temporarily
 */
export const storeOTP = (email: string, otp: string) => {
  sessionStorage.setItem(`otp_${email}`, JSON.stringify({ otp, timestamp: Date.now() }));
};

/**
 * Verify email OTP
 */
export const verifyEmailOTP = (email: string, inputOtp: string): boolean => {
  const stored = sessionStorage.getItem(`otp_${email}`);
  if (!stored) return false;

  const { otp, timestamp } = JSON.parse(stored);

  // OTP expires after 10 minutes
  if (Date.now() - timestamp > 10 * 60 * 1000) {
    sessionStorage.removeItem(`otp_${email}`);
    return false;
  }

  if (otp === inputOtp) {
    sessionStorage.removeItem(`otp_${email}`);
    return true;
  }

  return false;
};

// ============================================================================
// SIGN OUT
// ============================================================================

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  const auth = getFirebaseAuth();
  await signOut(auth);
};

// ============================================================================
// AUTH STATE OBSERVER
// ============================================================================

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth();
  return auth.onAuthStateChanged(callback);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if email is verified
 */
export const isEmailVerified = (): boolean => {
  const user = getCurrentUser();
  return user?.emailVerified ?? false;
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async () => {
  const user = getCurrentUser();
  if (user) {
    await sendEmailVerification(user);
  }
};

/**
 * Get user display name
 */
export const getUserDisplayName = (): string | null => {
  const user = getCurrentUser();
  return user?.displayName ?? user?.email ?? null;
};

/**
 * Get user email
 */
export const getUserEmail = (): string | null => {
  const user = getCurrentUser();
  return user?.email ?? null;
};

/**
 * Get Firebase UID
 */
export const getFirebaseUid = (): string | null => {
  const user = getCurrentUser();
  return user?.uid ?? null;
};

export { User, Auth };
