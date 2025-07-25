"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SMSVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
}

export function SMSVerificationModal({
  open,
  onOpenChange,
  phoneNumber,
  onVerify,
  onResend
}: SMSVerificationModalProps) {
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit verification code")
      return
    }

    setIsVerifying(true)
    try {
      const result = await onVerify(code)
      if (result) {
        // Success toast is handled by useNotificationSettings
        setCode("")
        onOpenChange(false)
      }
    } catch (error) {
      // Error is already handled by useNotificationSettings - no need to log here
      // Just ensure the UI doesn't close on error
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await onResend()
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      toast.success("A new verification code has been sent to your phone")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend verification code")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Phone Number</DialogTitle>
          <DialogDescription>
            Enter the 6-digit verification code sent to {phoneNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center text-lg tracking-widest"
            />
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {countdown > 0 ? (
              <p>Resend code in {countdown}s</p>
            ) : (
              <Button
                variant="link"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Didn't receive the code? Resend"
                )}
              </Button>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleVerify}
            disabled={isVerifying || code.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}