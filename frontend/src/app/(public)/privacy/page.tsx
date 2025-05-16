import PrivacyContent from '@/components/legal/PrivacyContent';

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <PrivacyContent />
      <p className="text-xs text-gray-500 mt-10">Last updated: May 2025</p>
    </main>
  );
}
