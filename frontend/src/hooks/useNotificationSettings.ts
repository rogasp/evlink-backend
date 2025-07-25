"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { authFetch } from "@/lib/authFetch"

interface NotificationPreferences {
  email: {
    chargingComplete: boolean
    offlineAlert: boolean
    maintenanceReminder: boolean
    weeklySummary: boolean
  }
  sms: {
    chargingComplete: boolean
    offlineAlert: boolean
    maintenanceReminder: boolean
  }
}

interface UserNotificationSettings {
  phone_number?: string
  phone_verified?: boolean
  notification_preferences: NotificationPreferences
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: {
    chargingComplete: true,
    offlineAlert: true,
    maintenanceReminder: true,
    weeklySummary: false,
  },
  sms: {
    chargingComplete: false,
    offlineAlert: false,
    maintenanceReminder: false,
  },
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<UserNotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user logged in")

      const { data, error } = await supabase
        .from("users")
        .select("phone_number, phone_verified, notification_preferences")
        .eq("id", user.id)
        .single()

      if (error) throw error

      setSettings({
        phone_number: data.phone_number || "",
        phone_verified: data.phone_verified || false,
        notification_preferences: data.notification_preferences || DEFAULT_PREFERENCES,
      })
    } catch (error) {
      console.error("Failed to fetch notification settings:", error)
      toast.error("Failed to load notification settings")
    } finally {
      setLoading(false)
    }
  }, [])

  // Update phone number
  const updatePhoneNumber = useCallback(async (phone: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user logged in")

      const { error } = await supabase
        .from("users")
        .update({ phone_number: phone, phone_verified: true })
        .eq("id", user.id)

      if (error) throw error

      // Refetch complete user settings to ensure all data is up to date
      await fetchSettings()
      
      toast.success("Your phone number has been updated")
    } catch {
      toast.error("Could not update phone number")
    }
  }, [fetchSettings])

  // Update preferences
  const updatePreferences = useCallback(async (preferences: NotificationPreferences) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user logged in")

      const { error } = await supabase
        .from("users")
        .update({ notification_preferences: preferences })
        .eq("id", user.id)

      if (error) throw error

      setSettings(prev => prev ? { ...prev, notification_preferences: preferences } : null)
      
      toast.success("Your notification preferences have been updated")
    } catch {
      toast.error("Could not save preferences")
    } finally {
      setSaving(false)
    }
  }, [])

  // Send verification code
  const sendVerificationCode = useCallback(async (phone: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("No active session")

      const response = await authFetch("/api/phone/send-verification-code", {
        method: "POST",
        accessToken: session.access_token,
        body: JSON.stringify({ phone }),
      })

      if (response.error) {
        throw new Error(response.error.message || "Failed to send verification code")
      }

      toast.success("A 6-digit code has been sent to your phone")
      return true
    } catch (error) {
      // Don't log validation errors as errors - these are expected user behavior
      const message = error instanceof Error ? error.message : "Could not send verification code"
      toast.error(message)
      return false
    }
  }, [])

  // Verify phone code
  const verifyPhoneCode = useCallback(async (code: string) => {
    setVerifying(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("No active session")

      const response = await authFetch("/api/phone/verify-phone", {
        method: "POST",
        accessToken: session.access_token,
        body: JSON.stringify({ code }),
      })

      if (response.error) {
        throw new Error(response.error.message || "Failed to verify phone number")
      }

      // Only update state and show success if verification actually succeeded
      if (response.data?.success) {
        // Refetch complete user settings to ensure all data is up to date
        await fetchSettings()
        toast.success("Your phone number has been successfully verified")
        return true
      } else {
        throw new Error(response.data?.message || "Verification failed")
      }
    } catch (error) {
      // Don't log validation errors as errors - these are expected user behavior
      const message = error instanceof Error ? error.message : "Could not verify phone number"
      toast.error(message)
      return false
    } finally {
      setVerifying(false)
    }
  }, [fetchSettings])

  // Resend verification code
  const resendVerificationCode = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("No active session")

      const response = await authFetch("/api/phone/resend-verification-code", {
        method: "POST",
        accessToken: session.access_token,
      })

      if (response.error) {
        throw new Error(response.error.message || "Failed to resend verification code")
      }

      toast.success("A new 6-digit code has been sent to your phone")
      return true
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error(error instanceof Error ? error.message : "Could not resend verification code")
      return false
    }
  }, [])

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    saving,
    verifying,
    fetchSettings,
    updatePhoneNumber,
    updatePreferences,
    sendVerificationCode,
    verifyPhoneCode,
    resendVerificationCode,
  }
}