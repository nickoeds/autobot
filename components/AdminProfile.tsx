"use client"

import { useState, useEffect } from 'react'
import { type User } from '@/lib/db'
import { SystemPromptManager } from './admin/SystemPromptManager'
import { UserProfileManager } from './admin/UserProfileManager'
import { UserManager } from './admin/UserManager'
import { DriverManager } from './admin/DriverManager'
import { useRouter } from 'next/navigation'

export function AdminProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'system' | 'profile' | 'users' | 'drivers'>('system')
  const router = useRouter()

  useEffect(() => {
    checkUserAccess()
  }, [])

  const checkUserAccess = async () => {
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        router.push('/')
        return
      }

      const userData = JSON.parse(storedUser) as User
      if (userData.role !== 'admin') {
        router.push('/')
        return
      }

      setUser(userData)
    } catch (error) {
      console.error('Error checking user access:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleProfileUpdate = (updatedUser: User) => {
    // Update localStorage with new user data
    const userToStore = {
      ...updatedUser,
      password_hash: undefined
    }
    localStorage.setItem('user', JSON.stringify(userToStore))
    setUser(updatedUser)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Admin Panel</h1>
              <p className="text-gray-600 text-sm truncate">Welcome, {user.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 transition-colors rounded-md touch-manipulation"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Tab Navigation - Horizontal Scroll */}
        <nav className="border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab('system')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap touch-manipulation ${
                activeTab === 'system'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Settings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap touch-manipulation ${
                activeTab === 'profile'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap touch-manipulation ${
                activeTab === 'users'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap touch-manipulation ${
                activeTab === 'drivers'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Driver Management
            </button>
          </div>
        </nav>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'system' && (
            <SystemPromptManager userId={user.id} />
          )}
          
          {activeTab === 'profile' && (
            <UserProfileManager user={user} onProfileUpdate={handleProfileUpdate} />
          )}
          
          {activeTab === 'users' && (
            <UserManager />
          )}
          
          {activeTab === 'drivers' && (
            <DriverManager />
          )}
        </div>
      </div>
    </div>
  )
} 