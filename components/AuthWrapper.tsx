"use client";

import { useState, useEffect } from "react";
import { LoginPage } from "./LoginPage";
import { MyAssistant } from "./MyAssistant";

export function AuthWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check for existing authentication on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
  }, []);

  const handleLogin = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    if (authenticated) {
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("isAuthenticated");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main app with logout button if authenticated
  return (
    <div className="h-dvh flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Sales Chat - Auto Parts Assistant</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          Logout
        </button>
      </header>
      <main className="flex-1">
        <MyAssistant />
      </main>
    </div>
  );
} 