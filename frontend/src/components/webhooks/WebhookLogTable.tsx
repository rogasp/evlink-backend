import { WebhookLogRow } from './WebhookLogRow'

export function WebhookLogTable({ logs }: { logs: any[] }) {
  return (
    <table className="w-full text-sm table-auto">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-2">Created</th>
          <th className="p-2">Version</th>
          <th className="p-2">Event</th>
          <th className="p-2">Details</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <WebhookLogRow key={index} log={log} />
        ))}
      </tbody>
    </table>
  )
}
