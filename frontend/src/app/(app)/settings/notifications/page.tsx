"use client"

import { useState, useEffect } from "react"
import { NotificationSettingsPanel } from "@/components/shared/NotificationSettingsPanel"
import { SMSVerificationModal } from "@/components/shared/SMSVerificationModal"
import { useNotificationSettings } from "@/hooks/useNotificationSettings"
import { toast } from "sonner"

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