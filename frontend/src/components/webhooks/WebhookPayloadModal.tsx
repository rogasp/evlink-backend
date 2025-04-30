'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface WebhookPayloadModalProps {
  open: boolean
  setOpen: (value: boolean) => void
  payload: any
}

export function WebhookPayloadModal({ open, setOpen, payload }: WebhookPayloadModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Webhook Payload</DialogTitle>
        </DialogHeader>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  )
}
