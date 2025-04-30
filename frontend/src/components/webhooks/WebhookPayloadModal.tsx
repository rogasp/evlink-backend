'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

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

        <pre className="text-xs bg-gray-100 p-4 rounded whitespace-pre-wrap break-words">
          {JSON.stringify(payload, null, 2)}
        </pre>

        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
