'use client'

import { useState } from 'react'
import { WebhookPayloadModal } from './WebhookPayloadModal'
import { Eye } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function WebhookLogRow({ log }: { log: any }) {
  const [open, setOpen] = useState(false)

  let parsed = log.payload
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
  } catch (e) {
    console.warn("⚠️ Failed to parse payload JSON:", e)
    parsed = {}
  }
}


  const first = Array.isArray(parsed) ? parsed[0] : parsed

  return (
    <>
      <tr className="border-t">
        <td className="p-2">{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</td>
        <td className="p-2">{first?.version || '-'}</td>
        <td className="p-2">{first?.event || '-'}</td>
        <td className="p-2">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Eye className="w-4 h-4" />
          </Button>
        </td>
      </tr>
      <WebhookPayloadModal open={open} setOpen={setOpen} payload={parsed} />
    </>
  )
}
