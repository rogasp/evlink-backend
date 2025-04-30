'use client'

import { useEffect, useState } from 'react'

export default function WebhookLogPage() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/webhook/logs`)
      const data = await res.json()
      setLogs(data)
    }
    fetchLogs()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Webhook Logs</h1>
      <div className="space-y-4">
        {logs.map((log, index) => (
          <div key={index} className="p-4 bg-gray-100 rounded text-sm">
            <pre>{JSON.stringify(JSON.parse(log.payload), null, 2)}</pre>
            <div className="text-gray-500 text-xs mt-2">{log.timestamp}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
