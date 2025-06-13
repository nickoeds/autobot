"use client";

import { useState, useEffect } from "react";
import { LoginPage } from "./LoginPage";
import { MyAssistant } from "./MyAssistant";
import { loginUser, type User } from "@/lib/db";
import { useRouter } from "next/navigation";

export function AuthWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const loggedInUser = await loginUser(email, password);
    
    if (!loggedInUser) {
      throw new Error('Invalid email or password');
    }
    
    // Store user in localStorage (remove password_hash for security)
    const userToStore = {
      ...loggedInUser,
      password_hash: undefined
    };
    localStorage.setItem('user', JSON.stringify(userToStore));
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleAdminAccess = () => {
    router.push('/admin');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main app with logout button if authenticated
  return (
    <div className="h-dvh flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Sales Chat - Auto Parts Assistant</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, {user.username}</span>
          {user.role === 'admin' && (
            <button
              onClick={handleAdminAccess}
              className="px-3 py-1 text-sm bg-black text-white hover:bg-gray-800 rounded transition-colors"
            >
              Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1">
        <MyAssistant />
      </main>
    </div>
  );
} 