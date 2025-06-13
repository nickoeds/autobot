"use client"

import { useState, useEffect } from 'react'
import { getAllUsers, createUser, deleteUser, adminUpdateUserPassword, type User } from '@/lib/db'

export function UserManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserUsername, setNewUserUsername] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  
  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
      setMessage('Error loading users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserUsername || !newUserPassword) {
      setMessage('Please fill in all fields')
      return
    }

    if (newUserPassword.length < 6) {
      setMessage('Password must be at least 6 characters long')
      return
    }

    setAdding(true)
    setMessage('')

    try {
      const newUser = await createUser(newUserEmail, newUserUsername, newUserPassword, 'user')
      if (!newUser) {
        setMessage('Error creating user - email or username may already exist')
      } else {
        setMessage('User created successfully')
        setNewUserEmail('')
        setNewUserUsername('')
        setNewUserPassword('')
        setShowAddUser(false)
        loadUsers() // Refresh the user list
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error creating user')
      console.error('Error creating user:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleChangePassword = (user: User) => {
    setSelectedUser(user)
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordModal(true)
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in both password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long')
      return
    }

    if (!selectedUser) return

    setUpdatingPassword(true)
    setMessage('')

    try {
      const success = await adminUpdateUserPassword(selectedUser.id, newPassword)
      if (!success) {
        setMessage('Error updating password')
      } else {
        setMessage(`Password updated successfully for ${selectedUser.username}`)
        setShowPasswordModal(false)
        setSelectedUser(null)
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error updating password')
      console.error('Error updating password:', error)
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setDeleting(true)
    setMessage('')

    try {
      const success = await deleteUser(userToDelete.id)
      if (!success) {
        setMessage('Error deleting user')
      } else {
        setMessage(`User ${userToDelete.username} deleted successfully`)
        setShowDeleteModal(false)
        setUserToDelete(null)
        loadUsers() // Refresh the user list
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error deleting user')
      console.error('Error deleting user:', error)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-600 text-sm">
            Manage system users and their access permissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="flex-shrink-0 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-md touch-manipulation"
        >
          {showAddUser ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {message && (
        <div className={`p-3 text-sm rounded-md ${
          message.includes('Error') || message.includes('Please fill') || message.includes('must be at least') || message.includes('do not match')
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Add User Form */}
      {showAddUser && (
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
          <h3 className="text-lg font-medium">Add New User</h3>
          
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="new-email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="new-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="new-username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="new-username"
                type="text"
                value={newUserUsername}
                onChange={(e) => setNewUserUsername(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
                placeholder="username"
              />
            </div>
            
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
                placeholder="Password (min 6 characters)"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setShowAddUser(false)}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors rounded-md touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              disabled={adding}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
            >
              {adding ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium">System Users ({users.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                      <span className="font-medium text-gray-900 truncate">{user.username}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium self-start ${
                        user.role === 'admin' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 truncate">{user.email}</div>
                    <div className="text-xs text-gray-500 space-y-1 sm:space-y-0">
                      <div>Created: {formatDate(user.created_at)}</div>
                      <div>Updated: {formatDate(user.updated_at)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-shrink-0">
                    <button
                      onClick={() => handleChangePassword(user)}
                      className="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50 transition-colors rounded-md touch-manipulation text-center"
                    >
                      Change Password
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="px-3 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors rounded-md touch-manipulation text-center"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-medium mb-4">Change Password for {selectedUser.username}</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="modal-new-password" className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <input
                    id="modal-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label htmlFor="modal-confirm-password" className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="modal-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base sm:text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setSelectedUser(null)
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors rounded-md touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={updatingPassword || !newPassword || !confirmPassword}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-medium mb-4">Delete User</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete user <strong>{userToDelete.username}</strong>? This action cannot be undone.
              </p>
              
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors rounded-md touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
                >
                  {deleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 