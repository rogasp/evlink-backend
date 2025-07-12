// src/app/success/page.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

export default function SuccessPage(): React.ReactNode {
  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen items-center justify-center bg-green-50"
    >
      <div className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-2xl text-center">
        {/* Hardcoded string */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-green-600 mb-4"
        >
          Thank You!
        </motion.h1>
        {/* Hardcoded string */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-700 mb-6"
        >
          Your payment was successful. We appreciate your business!
        </motion.p>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Hardcoded string */}
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    </motion.main>
  );
}
