// src/components/PrivacyContent.tsx
'use client';

export default function PrivacyContent() {
  return (
    <div className="py-8 px-10 space-y-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-2">
      <p>
        EVLinkHA is a personal hobby project operated from Sweden under EU jurisdiction. It is not
        a commercial service, although certain features (e.g. Pro subscription, SMS-packs) may be
        paid via Stripe.
      </p>

      <h3 className="font-semibold">Payment processing</h3>
      <p>
        All payments and subscriptions are processed securely by <strong>Stripe</strong>. EVLinkHA
        does not store your credit card details—these are handled directly by Stripe. You will be
        redirected to Stripe’s Billing Portal for subscription management and cancellations.
      </p>

      <h3 className="font-semibold">What data is collected?</h3>
      <ul className="list-disc pl-6">
        <li>Email and name (upon registration)</li>
        <li>Vehicle data (via Enode)</li>
        <li>Basic usage info (e.g. last seen, online status)</li>
        <li>Mobile phone number (only if you opt in to SMS notifications)</li>
        <li>Subscription &amp; payment metadata (managed by Stripe)</li>
      </ul>
      <p className="text-xs text-gray-500">
        Your mobile number is used solely for vehicle offline alerts via SMS and is not used for any other purpose.
      </p>

      <h3 className="font-semibold">Why is it collected?</h3>
      <p>
        Only to provide the intended functionality. No tracking or resale occurs. Payment data is
        used solely to manage your subscription and SMS-pack purchases. Email addresses and phone
        numbers are used only for the services you opt into.
      </p>

      <h3 className="font-semibold">Who has access?</h3>
      <ul className="list-disc pl-6">
        <li>Developer (Roger Aspelin)</li>
        <li>
          <strong>Brevo</strong> – for monthly newsletters and transactional emails
        </li>
        <li>
          <strong>Supabase (EU)</strong> – for user &amp; vehicle data hosting
        </li>
        <li>
          <strong>Contabo (EU)</strong> – for server hosting
        </li>
        <li>
          <strong>Twilio</strong> – for sending SMS notifications
        </li>
        <li>
          <strong>Stripe</strong> – for payment processing
        </li>
      </ul>

      <h3 className="font-semibold">Cookies and Local Storage</h3>
      <p>
        EVLinkHA does not use cookies or local storage for user tracking. We use
        <strong>Umami</strong> for analytics, which is fully cookie-less and does not
        collect or store any personal or identifiable data. Any localStorage entries
        (e.g. theme preference) are used purely in your browser and never transmitted
        to our servers.
      </p>

      <h3 className="font-semibold">Your rights</h3>
      <p>
        You may request access to, correction of, or deletion of your data at any time by emailing{' '}
        <a
          href="mailto:roger@evlinkha.se"
          className="underline hover:text-blue-600"
        >
          roger@evlinkha.se
        </a>
        . Under GDPR you also have rights to data portability and to lodge a complaint with your
        local supervisory authority.
      </p>
    </div>
  );
}
