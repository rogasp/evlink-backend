'use client';

import { useEffect, useRef } from 'react';

const STATUS_URL = 'https://status.evlinkha.se/status/evlinkha';

export default function StatusPage() {
  const opened = useRef(false);

  useEffect(() => {
    if (!opened.current) {
      window.open(STATUS_URL, '_blank');
      opened.current = true;
    }
  }, []);

  return (
    <div className="min-h-[40vh] flex flex-col justify-center items-center gap-4 p-8">
      <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <h1 className="text-xl font-semibold text-indigo-700">The status page has moved!</h1>
      <p className="text-gray-700 text-center max-w-lg">
        You are now being redirected to our new public status page.<br />
        If nothing happens, the page should open automatically in a new tab.<br />
        You can always check the EVLink system status at the link below.
      </p>
      <a
        href={STATUS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Go to EVLink Status
      </a>
    </div>
  );
}
