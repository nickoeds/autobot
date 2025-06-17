"use client"

import { useState, useEffect } from 'react'
import { getAllDrivers, createDriver, deleteDriver, type Driver } from '@/lib/db'

export function DriverManager() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [newDriverName, setNewDriverName] = useState('')
  const [newDriverDetrackId, setNewDriverDetrackId] = useState('')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    try {
      const driversData = await getAllDrivers()
      setDrivers(driversData)
    } catch (error) {
      console.error('Error loading drivers:', error)
      setMessage('Error loading drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDriver = async () => {
    if (!newDriverName || !newDriverDetrackId) {
      setMessage('Please fill in all fields')
      return
    }

    if (newDriverName.trim().length < 2) {
      setMessage('Driver name must be at least 2 characters long')
      return
    }

    if (newDriverDetrackId.trim().length < 1) {
      setMessage('Detrack ID is required')
      return
    }

    setAdding(true)
    setMessage('')

    try {
      const newDriver = await createDriver(newDriverName.trim(), newDriverDetrackId.trim())
      if (!newDriver) {
        setMessage('Error creating driver - Detrack ID may already exist')
      } else {
        setMessage('Driver created successfully')
        setNewDriverName('')
        setNewDriverDetrackId('')
        setShowAddDriver(false)
        loadDrivers() // Refresh the driver list
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error creating driver')
      console.error('Error creating driver:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteDriver = (driver: Driver) => {
    setDriverToDelete(driver)
    setShowDeleteModal(true)
  }

  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return

    setDeleting(true)
    setMessage('')

    try {
      const success = await deleteDriver(driverToDelete.id)
      if (!success) {
        setMessage('Error deleting driver')
      } else {
        setMessage(`Driver ${driverToDelete.name} deleted successfully`)
        setShowDeleteModal(false)
        setDriverToDelete(null)
        loadDrivers() // Refresh the driver list
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error deleting driver')
      console.error('Error deleting driver:', error)
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
          <h2 className="text-xl font-semibold mb-2">Driver Management</h2>
          <p className="text-gray-600 text-sm">
            Manage delivery drivers and their Detrack IDs for vehicle tracking.
          </p>
        </div>
        <button
          onClick={() => setShowAddDriver(!showAddDriver)}
          className="flex-shrink-0 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-md touch-manipulation"
        >
          {showAddDriver ? 'Cancel' : 'Add Driver'}
        </button>
      </div>

      {message && (
        <div className={`p-3 text-sm rounded-md ${
          message.includes('Error') || message.includes('Please fill') || message.includes('must be at least') || message.includes('is required')
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {showAddDriver && (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Add New Driver</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                id="driverName"
                type="text"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter driver's full name"
                disabled={adding}
              />
            </div>
            <div>
              <label htmlFor="detrackId" className="block text-sm font-medium text-gray-700 mb-1">
                Detrack ID
              </label>
              <input
                id="detrackId"
                type="text"
                value={newDriverDetrackId}
                onChange={(e) => setNewDriverDetrackId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter unique Detrack ID"
                disabled={adding}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAddDriver}
                disabled={adding}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
              >
                {adding ? 'Adding...' : 'Add Driver'}
              </button>
              <button
                onClick={() => {
                  setShowAddDriver(false)
                  setNewDriverName('')
                  setNewDriverDetrackId('')
                }}
                disabled={adding}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drivers List */}
      <div className="space-y-4">
        {drivers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No drivers found. Add your first driver to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{driver.name}</h3>
                    <p className="text-sm text-gray-600">Detrack ID: {driver.detrack_id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {formatDate(driver.created_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleDeleteDriver(driver)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors rounded-md touch-manipulation"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && driverToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Delete Driver</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{driverToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={confirmDeleteDriver}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDriverToDelete(null)
                }}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 