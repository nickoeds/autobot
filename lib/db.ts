import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  username: string
  password_hash: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  updated_by: string
  updated_at: string
}

// Simple authentication functions
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, data.password_hash)
    if (!isValidPassword) {
      return null
    }

    return data as User
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

export const createUser = async (email: string, username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User | null> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash: hashedPassword,
        role
      })
      .select()
      .single()

    if (error) {
      console.error('Create user error:', error)
      return null
    }

    return data as User
  } catch (error) {
    console.error('Create user error:', error)
    return null
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<Pick<User, 'username' | 'email'>>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update user error:', error)
      return null
    }

    return data as User
  } catch (error) {
    console.error('Update user error:', error)
    return null
  }
}

export const updateUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId)

    if (error) {
      console.error('Update password error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Update password error:', error)
    return false
  }
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get users error:', error)
      return []
    }

    return data as User[]
  } catch (error) {
    console.error('Get users error:', error)
    return []
  }
}

export const getSystemSetting = async (key: string): Promise<SystemSetting | null> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) {
      console.error('Get system setting error:', error)
      return null
    }

    return data as SystemSetting
  } catch (error) {
    console.error('Get system setting error:', error)
    return null
  }
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Delete user error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete user error:', error)
    return false
  }
}

export const adminUpdateUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId)

    if (error) {
      console.error('Admin update password error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Admin update password error:', error)
    return false
  }
}

export const updateSystemSetting = async (key: string, value: string, updatedBy: string): Promise<SystemSetting | null> => {
  try {
    // First, try to update the existing record
    const { data: updateData, error: updateError } = await supabase
      .from('system_settings')
      .update({
        value,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single()

    if (updateError) {
      // If update fails (record doesn't exist), try to insert
      const { data: insertData, error: insertError } = await supabase
        .from('system_settings')
        .insert({
          key,
          value,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert system setting error:', insertError)
        return null
      }

      return insertData as SystemSetting
    }

    return updateData as SystemSetting
  } catch (error) {
    console.error('Update system setting error:', error)
    return null
  }
} 