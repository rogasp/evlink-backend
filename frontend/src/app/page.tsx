// src/app/page.tsx
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative bg-gradient-to-br from-indigo-100 via-white to-white py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-indigo-700 mb-6">
            EVLink – your smart EV gateway
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Control, monitor and automate your electric vehicle with Home Assistant and Enode.
          </p>
          <div className="space-x-4">
            <a
              href="/register"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="inline-block px-6 py-3 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition"
            >
              Log In
            </a>
          </div>
        </div>

        {/* Dekorativ bild */}
        <div className="absolute right-10 bottom-0 w-96 opacity-20">
          <Image src="/ev_car.png" alt="EV Car" width={400} height={300} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8 text-center">
        <div>
          <h3 className="text-xl font-semibold mb-2">🔌 Real-time Charging</h3>
          <p className="text-gray-600">Monitor your EV battery, charging speed and range in real time.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">📊 Insights & Automation</h3>
          <p className="text-gray-600">Integrate seamlessly with Home Assistant and smart home automation.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">🔒 Secure & Scalable</h3>
          <p className="text-gray-600">Built with FastAPI and Next.js. Safe, fast and open-source.</p>
        </div>
      </section>
    </main>
  );
}
