"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "./PhoneInput"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bell, BellOff, Mail, Smartphone, AlertCircle } from "lucide-react"

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

interface NotificationSettingsPanelProps {
  phoneNumber?: string
  isPhoneVerified: boolean
  onPhoneNumberChange: (phone: string) => void
  onVerifyPhone: () => void
  preferences?: NotificationPreferences
  onPreferencesChange: (preferences: NotificationPreferences) => void
  onSave: () => Promise<void>
  isSaving?: boolean
}

export function NotificationSettingsPanel({
  phoneNumber = "",
  isPhoneVerified,
  onPhoneNumberChange,
  onVerifyPhone,
  preferences = DEFAULT_PREFERENCES,
  onPreferencesChange,
  onSave,
  isSaving = false
}: NotificationSettingsPanelProps) {
  const [localPreferences, setLocalPreferences] = useState(DEFAULT_PREFERENCES)

  useEffect(() => {
    setLocalPreferences(preferences || DEFAULT_PREFERENCES)
  }, [preferences])

  const handlePreferenceChange = (channel: keyof NotificationPreferences, type: string, value: boolean) => {
    const safePreferences = localPreferences || DEFAULT_PREFERENCES
    const updated = {
      ...safePreferences,
      [channel]: {
        ...safePreferences[channel],
        [type]: value
      }
    }
    setLocalPreferences(updated)
    onPreferencesChange(updated)
  }

  return (
    <div className="space-y-6">
      {/* Phone Number Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive SMS notifications for important events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <div className="flex gap-2">
              <PhoneInput
                value={phoneNumber}
                onChange={onPhoneNumberChange}
                placeholder="Enter phone number"
                className="flex-1"
              />
              {!isPhoneVerified && phoneNumber && (
                <Button onClick={onVerifyPhone} variant="secondary">
                  Verify
                </Button>
              )}
            </div>
            {isPhoneVerified && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                Phone number verified
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Offline Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your vehicle goes offline
                </p>
              </div>
              <Switch
                checked={localPreferences?.sms?.offlineAlert ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('sms', 'offlineAlert', checked)}
                disabled={!isPhoneVerified}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Reminder</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for scheduled maintenance
                </p>
              </div>
              <Switch
                checked={localPreferences?.sms?.maintenanceReminder ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('sms', 'maintenanceReminder', checked)}
                disabled={!isPhoneVerified}
              />
            </div>
          </div>

          {!isPhoneVerified && phoneNumber && (
            <div className="flex items-start gap-2 p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Verify your phone number to enable SMS notifications</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive email updates about your vehicle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Charging Complete</Label>
                <p className="text-sm text-muted-foreground">
                  Email when charging is finished
                </p>
              </div>
              <Switch
                checked={localPreferences?.email?.chargingComplete ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('email', 'chargingComplete', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Offline Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Email when vehicle goes offline
                </p>
              </div>
              <Switch
                checked={localPreferences?.email?.offlineAlert ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('email', 'offlineAlert', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Reminder</Label>
                <p className="text-sm text-muted-foreground">
                  Scheduled maintenance reminders
                </p>
              </div>
              <Switch
                checked={localPreferences?.email?.maintenanceReminder ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('email', 'maintenanceReminder', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly summary of charging and usage
                </p>
              </div>
              <Switch
                checked={localPreferences?.email?.weeklySummary ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('email', 'weeklySummary', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          {(Object.values(localPreferences?.email || {}).some(Boolean) || Object.values(localPreferences?.sms || {}).some(Boolean)) ? (
            <>
              <Bell className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                Notifications are enabled
              </span>
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                All notifications are disabled
              </span>
            </>
          )}
        </div>
        
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}