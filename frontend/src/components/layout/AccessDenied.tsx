import { ShieldX } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
      <ShieldX className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-3xl font-bold text-red-700 mb-2">Access Denied</h2>
      <p className="text-gray-500 mb-6">
        You do not have permission to view this page.
      </p>
    </div>
  );
}
