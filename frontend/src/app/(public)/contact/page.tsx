// src/app/contact/page.tsx
'use client';

import { Mail, Coffee } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Contact</h1>

      <p className="mb-4">
        Hi! I&apos;m <strong>Roger Aspelin</strong>, the founder and developer behind EVLinkHA.
        This is a <strong>personal hobby project</strong> built on evenings and weekends.
      </p>

      <p className="mb-4">
        You can reach me directly at:{' '}
        <a href="mailto:roger@evlinkha.se" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
          <Mail className="w-4 h-4" /> roger@evlinkha.se
        </a>
      </p>

      <p className="mb-4">
        EVLinkHA is intended to be an <strong>open source project</strong> with a focus on privacy, control and community.
      </p>

      <p className="mb-4">
        While free to use, the service has costs — including hosting, API usage and hardware.
        If you find value in this project, I&apos;d be grateful for your support:
      </p>

      <div className="my-6">
        <a
          href="https://www.buymeacoffee.com/rogasp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded shadow"
        >
          <Coffee className="w-5 h-5" />
          Buy Me a Coffee
        </a>
      </div>

      <p className="text-sm text-gray-500">
        Thank you for your interest – I hope you enjoy using EVLinkHA!
      </p>
    </main>
  );
}
