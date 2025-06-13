"use client"

import { useState } from 'react'
import { updateUserProfile, updateUserPassword, loginUser, type User } from '@/lib/db'

interface UserProfileManagerProps {
  user: User
  onProfileUpdate: (user: User) => void
}

export function UserProfileManager({ user, onProfileUpdate }: UserProfileManagerProps) {
  const [username, setUsername] = useState(user.username)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      setMessage('Username cannot be empty')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const updatedUser = await updateUserProfile(user.id, { username })
      if (!updatedUser) {
        setMessage('Error updating username')
      } else {
        setMessage('Username updated successfully')
        onProfileUpdate(updatedUser)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error updating username')
      console.error('Error updating username:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('New password and confirmation do not match')
      return
    }

    if (newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // First verify current password by trying to login
      const verifyUser = await loginUser(user.email, currentPassword)
      if (!verifyUser) {
        setMessage('Current password is incorrect')
        setLoading(false)
        return
      }

      // Update password
      const success = await updateUserPassword(user.id, newPassword)
      if (!success) {
        setMessage('Error updating password')
      } else {
        setMessage('Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error updating password')
      console.error('Error updating password:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Manage your admin account settings and credentials.
        </p>
      </div>

      {message && (
        <div className={`p-3 text-sm rounded-md ${
          message.includes('Error') || message.includes('incorrect') || message.includes('do not match') || message.includes('cannot be empty') || message.includes('must be at least')
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Username Section */}
      <div className="border-b border-gray-200 pb-6 sm:pb-8">
        <h3 className="text-lg font-medium mb-4">Username</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full sm:max-w-md px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
              placeholder="Enter username"
            />
          </div>
          <div>
            <button
              onClick={handleUpdateUsername}
              disabled={loading || username === user.username}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
            >
              {loading ? 'Updating...' : 'Update Username'}
            </button>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium mb-2">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full sm:max-w-md px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium mb-2">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full sm:max-w-md px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full sm:max-w-md px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
              placeholder="Confirm new password"
            />
          </div>
          <div>
            <button
              onClick={handleUpdatePassword}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 