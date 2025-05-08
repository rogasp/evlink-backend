'use client';

type StatusLog = {
  id: string;
  status: boolean;
  checked_at: string;
};

type Props = {
  logs: StatusLog[];
};

export default function StatusBar({ logs }: Props) {
  return (
    <div className="flex gap-2 p-2">
      {logs.map((log) => (
        <div
          key={log.id}
          title={`Checked: ${new Date(log.checked_at).toLocaleString()}`}
          className={`w-4 h-4 rounded-full ${
            log.status ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
      ))}
    </div>
  );
}
