"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import AdminOnboardingTour from "./AdminOnboardingTour";

interface AdminOnboardingContextType {
  openTour: () => void;
}

const AdminOnboardingContext = createContext<AdminOnboardingContextType | undefined>(
  undefined
);

export function AdminOnboardingProvider({
  children,
  userId,
  userRole,
  onOpenSidebar,
  onCloseSidebar,
}: {
  children: React.ReactNode;
  userId?: string;
  userRole?: "owner" | "admin";
  onOpenSidebar?: () => void;
  onCloseSidebar?: () => void;
}) {
  const openTour = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin:start-tour"));
    }
  };

  return (
    <AdminOnboardingContext.Provider value={{ openTour }}>
      {children}
      <AdminOnboardingTour
        userId={userId}
        userRole={userRole}
        onOpenSidebar={onOpenSidebar}
        onCloseSidebar={onCloseSidebar}
      />
    </AdminOnboardingContext.Provider>
  );
}

export function useAdminTour() {
  const context = useContext(AdminOnboardingContext);
  if (!context) {
    return {
      openTour: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("admin:start-tour"));
        }
      },
    };
  }
  return context;
}
