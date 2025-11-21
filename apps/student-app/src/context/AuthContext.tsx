import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../packages/convex/convex/_generated/api";
import {
  initializeFirebase,
  onAuthStateChanged,
  getCurrentUser as getFirebaseUser,
  getFirebaseUid,
  signOutUser,
  User as FirebaseUser,
} from "@marlion/firebase";
import type { UserRole } from "@marlion/types";

interface AuthContextType {
  user: FirebaseUser | null;
  convexUser: any | null;
  studentProfile: any | null;
  loading: boolean;
  role: UserRole;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const syncUser = useMutation(api.auth.syncUser);

  // Get Convex user data
  const firebaseUid = getFirebaseUid();
  const convexUser = useQuery(
    api.auth.getCurrentUser,
    firebaseUid ? { firebaseUid } : "skip"
  );

  const studentProfile = convexUser?.studentProfile || null;
  const role: UserRole = convexUser?.role || "GUEST";

  useEffect(() => {
    // Initialize Firebase
    initializeFirebase();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Sync to Convex
        try {
          await syncUser({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            phoneNumber: firebaseUser.phoneNumber || undefined,
          });
        } catch (error) {
          console.error("Failed to sync user to Convex:", error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshTrigger]);

  const signOut = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const refreshUser = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const value: AuthContextType = {
    user,
    convexUser,
    studentProfile,
    loading,
    role,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
