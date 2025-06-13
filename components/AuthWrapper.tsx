"use client";

import { useState, useEffect } from "react";
import { MyAssistant } from "./MyAssistant";
import { LoginPage } from "./LoginPage";
import { AdminProfile } from "./AdminProfile";
import { loginUser, type User } from "@/lib/db";

export function AuthWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const authenticatedUser = await loginUser(email, password);
    if (authenticatedUser) {
      // Store user without password
      const userToStore = {
        ...authenticatedUser,
        password_hash: undefined
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(authenticatedUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowAdmin(false);
  };

  const handleAdminAccess = () => {
    setShowAdmin(true);
  };

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show admin panel if admin user requested it
  if (showAdmin && user.role === 'admin') {
    return <AdminProfile />;
  }

  // Show main app with logout button if authenticated
  return (
    <div className="h-dvh flex flex-col">
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
              Sales Chat - Auto Parts Assistant
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">Welcome, {user.username}</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {user.role === 'admin' && (
              <button
                onClick={handleAdminAccess}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-black text-white hover:bg-gray-800 rounded transition-colors touch-manipulation"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <MyAssistant />
      </main>
    </div>
  );
} 