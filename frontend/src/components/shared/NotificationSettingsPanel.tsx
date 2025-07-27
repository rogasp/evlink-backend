"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "./PhoneInput"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bell, BellOff, Mail, Smartphone, AlertCircle } from "lucide-react"

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

  const handlePreferenceChange = (type: string, value: boolean) => {
    const safePreferences = localPreferences || DEFAULT_PREFERENCES
    const updated = {
      ...safePreferences,
      notification_types: {
        ...safePreferences.notification_types,
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
                <Label className="text-base">Critical Token Low</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your API tokens are critically low
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.critical_token ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('critical_token', checked)}
                disabled={!isPhoneVerified}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">SMS Credit Low</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your SMS credits are running low
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.sms_credit_low ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('sms_credit_low', checked)}
                disabled={!isPhoneVerified}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Purchased Tokens Low</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your purchased tokens are low
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.purchased_tokens_low ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('purchased_tokens_low', checked)}
                disabled={!isPhoneVerified}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Offline Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your vehicle goes offline
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.offline_alert ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('offline_alert', checked)}
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
                checked={localPreferences?.notification_types?.maintenance_reminder ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('maintenance_reminder', checked)}
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
                <Label className="text-base">Trial Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders 20, 10, and 3 days before trial ends
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.trial_reminder_20_days ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('trial_reminder_20_days', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Critical Token Low</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your API tokens are critically low
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.critical_token ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('critical_token', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Monthly Allowance 80%</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when 80% of monthly allowance is used
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.monthly_allowance_80_percent ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('monthly_allowance_80_percent', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Purchased Tokens Low</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your purchased tokens are low
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.purchased_tokens_low ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('purchased_tokens_low', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">SMS Credit Low</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your SMS credits are running low
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.sms_credit_low ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('sms_credit_low', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Offline Alert</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when your vehicle goes offline
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.offline_alert ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('offline_alert', checked)}
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
                checked={localPreferences?.notification_types?.maintenance_reminder ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('maintenance_reminder', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly summary of your account activity
                </p>
              </div>
              <Switch
                checked={localPreferences?.notification_types?.weekly_summary ?? false}
                onCheckedChange={(checked) => handlePreferenceChange('weekly_summary', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mandatory Notifications Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Mandatory Notifications
          </CardTitle>
          <CardDescription>
            These notifications are always enabled and cannot be disabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Welcome Email</span>
              <span className="text-green-600 font-medium">Always Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Trial Expired</span>
              <span className="text-green-600 font-medium">Always Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          {(Object.values(localPreferences?.notification_types || {}).some(Boolean)) ? (
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
                All optional notifications are disabled
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