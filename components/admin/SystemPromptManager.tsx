"use client"

import { useState, useEffect } from 'react'
import { getSystemSetting, updateSystemSetting } from '@/lib/db'

interface SystemPromptManagerProps {
  userId: string
}

export function SystemPromptManager({ userId }: SystemPromptManagerProps) {
  const [systemPrompt, setSystemPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSystemPrompt()
  }, [])

  const loadSystemPrompt = async () => {
    try {
      const systemSetting = await getSystemSetting('system_prompt')
      if (!systemSetting) {
        setMessage('Error loading system prompt')
      } else {
        setSystemPrompt(systemSetting.value || '')
      }
    } catch (error) {
      console.error('Error loading system prompt:', error)
      setMessage('Error loading system prompt')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const result = await updateSystemSetting('system_prompt', systemPrompt, userId)
      if (!result) {
        setMessage('Error saving system prompt')
      } else {
        setMessage('System prompt saved successfully')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error saving system prompt')
      console.error('Error saving system prompt:', error)
    } finally {
      setSaving(false)
    }
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
      <div>
        <h2 className="text-xl font-semibold mb-2">System Prompt</h2>
        <p className="text-gray-600 text-sm">
          Configure the AI assistant&apos;s behavior and instructions. This prompt will be used for all conversations.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="system-prompt" className="block text-sm font-medium mb-2">
            System Prompt
          </label>
          <textarea
            id="system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none font-mono text-sm"
            placeholder="Enter the system prompt for the AI assistant..."
          />
        </div>

        {message && (
          <div className={`p-3 text-sm ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
} 