export function StatusLegend() {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-green-500 rounded-sm" /> OK
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-red-500 rounded-sm" /> Outage
      </div>
    </div>
  );
}
