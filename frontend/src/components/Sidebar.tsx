'use client';

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-100 p-4 shadow-inner">
      {/* Här bygger vi ut navigation senare */}
      <nav className="flex flex-col space-y-4">
        <a href="/dashboard" className="text-gray-700 hover:text-indigo-600">
          Dashboard
        </a>
        <a href="/profile" className="text-gray-700 hover:text-indigo-600">
          Profile
        </a>
        {/* Lägg till fler länkar senare */}
      </nav>
    </aside>
  );
}
