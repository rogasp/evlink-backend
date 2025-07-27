"use client"

import { useState, useEffect } from "react"
import { NotificationSettingsPanel } from "@/components/shared/NotificationSettingsPanel"
import { SMSVerificationModal } from "@/components/shared/SMSVerificationModal"
import { useNotificationSettings } from "@/hooks/useNotificationSettings"
import { toast } from "sonner"

interface NotificationPreferences {
  notification_types: {
    trial_reminder_20_days: boolean
    trial_reminder_10_days: boolean
    trial_reminder_3_days: boolean
    critical_token: boolean
    monthly_allowance_80_percent: boolean
    purchased_tokens_low: boolean
    sms_credit_low: boolean
    offline_alert: boolean
    maintenance_reminder: boolean
    weekly_summary: boolean
    welcome: boolean
    trial_expired: boolean
    status_update: boolean
  }
  transport_preferences: {
    trial_reminder_20_days: string[]
    trial_reminder_10_days: string[]
    trial_reminder_3_days: string[]
    critical_token: string[]
    monthly_allowance_80_percent: string[]
    purchased_tokens_low: string[]
    sms_credit_low: string[]
    offline_alert: string[]
    maintenance_reminder: string[]
    weekly_summary: string[]
    welcome: string[]
    trial_expired: string[]
    status_update: string[]
  }
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  notification_types: {
    trial_reminder_20_days: false,
    trial_reminder_10_days: false,
    trial_reminder_3_days: false,
    critical_token: false,
    monthly_allowance_80_percent: false,
    purchased_tokens_low: false,
    sms_credit_low: false,
    offline_alert: false,
    maintenance_reminder: false,
    weekly_summary: false,
    welcome: true,
    trial_expired: true,
    status_update: false,
  },
  transport_preferences: {
    trial_reminder_20_days: ['email'],
    trial_reminder_10_days: ['email'],
    trial_reminder_3_days: ['email'],
    critical_token: ['email'],
    monthly_allowance_80_percent: ['email'],
    purchased_tokens_low: ['email'],
    sms_credit_low: ['email'],
    offline_alert: ['email'],
    maintenance_reminder: ['email'],
    weekly_summary: ['email'],
    welcome: ['email'],
    trial_expired: ['email'],
    status_update: ['email'],
  },
}

export default function NotificationSettingsPage() {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [localPhoneNumber, setLocalPhoneNumber] = useState("")
  const {
    settings,
    loading,
    saving,
    sendVerificationCode,
    verifyPhoneCode,
    updatePhoneNumber,
    updatePreferences,
  } = useNotificationSettings()

  useEffect(() => {
    if (settings?.phone_number) {
      setLocalPhoneNumber(settings.phone_number)
    }
  }, [settings?.phone_number])


  const handlePreferencesChange = (preferences: NotificationPreferences) => {
    updatePreferences(preferences)
  }

  const handleVerifyPhone = async () => {
    if (!localPhoneNumber) {
      toast.error("Please enter a phone number")
      return
    }
    
    // Validate basic format first
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(localPhoneNumber) || localPhoneNumber.replace(/\D/g, '').length < 8) {
      toast.error("Please enter a valid phone number")
      return
    }

    // Send verification code directly
    const sent = await sendVerificationCode(localPhoneNumber)
    if (sent) {
      setIsVerificationModalOpen(true)
    }
  }

  const handleVerifyCode = async (code: string) => {
    const verified = await verifyPhoneCode(code)
    if (verified) {
      // Save phone number to database only after verification
      await updatePhoneNumber(localPhoneNumber)
      setIsVerificationModalOpen(false)
    }
  }

  const handleResendCode = async () => {
    if (localPhoneNumber) {
      await sendVerificationCode(localPhoneNumber)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-6">
          Notification Settings
        </h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-6">
        Notification Settings
      </h1>

      <NotificationSettingsPanel
        phoneNumber={localPhoneNumber}
        isPhoneVerified={settings?.phone_verified || false}
        onPhoneNumberChange={setLocalPhoneNumber}
        onVerifyPhone={handleVerifyPhone}
        preferences={settings?.notification_preferences ?? DEFAULT_PREFERENCES}
        onPreferencesChange={handlePreferencesChange}
        onSave={() => updatePreferences(settings?.notification_preferences ?? DEFAULT_PREFERENCES)}
        isSaving={saving}
        smsCredits={settings?.sms_credits || 0}
      />

      <SMSVerificationModal
        open={isVerificationModalOpen}
        onOpenChange={setIsVerificationModalOpen}
        phoneNumber={localPhoneNumber}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
      />
    </div>
  )
}