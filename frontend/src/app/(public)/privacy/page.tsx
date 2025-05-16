export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        This privacy policy explains how EVLinkHA handles your data. EVLinkHA is a personal hobby
        project operated by a private individual in Sweden, within the EU. It is not a company or
        commercial service at this time.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What data is collected?</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Email and name (only if you register for an account)</li>
        <li>Connected vehicle information via Enode API</li>
        <li>Basic usage data (e.g. when your vehicle updates)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Why is data collected?</h2>
      <p className="mb-4">
        Your data is only used to provide the EVLinkHA functionality: to show and sync your vehicle
        information with Home Assistant. No tracking, advertising, or resale is involved.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Who can access the data?</h2>
      <p className="mb-4">
        Only the developer (Roger Aspelin) can access the database. No third parties are involved.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">How is data protected?</h2>
      <p className="mb-4">
        Data is stored securely using Supabase. Industry-standard best practices are followed to
        protect access and avoid breaches.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Your rights</h2>
      <p className="mb-4">
        You have the right to request access to or deletion of your data at any time. Contact me
        directly at <a href="mailto:roger.aspelin@hotmail.se" className="underline">roger.aspelin@hotmail.se</a>.
      </p>

      <p className="text-sm text-gray-500 mt-10">
        Last updated: May 2025 – This policy will evolve as EVLinkHA grows.
      </p>
    </main>
  );
}
