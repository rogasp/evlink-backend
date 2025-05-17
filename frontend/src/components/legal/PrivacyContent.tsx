export default function PrivacyContent() {
  return (
    <div className="space-y-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-2">
      <p>
        EVLinkHA is a personal hobby project operated from Sweden under EU jurisdiction. It is not
        a commercial service.
      </p>

      <h3 className="font-semibold">What data is collected?</h3>
      <ul className="list-disc pl-6">
        <li>Email and name (upon registration)</li>
        <li>Vehicle data (via Enode)</li>
        <li>Basic usage info</li>
      </ul>

      <h3 className="font-semibold">Why is it collected?</h3>
      <p>Only to provide the intended functionality. No tracking or resale occurs.</p>

      <h3 className="font-semibold">Who has access?</h3>
      <p>Only the developer. No third parties are involved.</p>

      <h3 className="font-semibold">Your rights</h3>
      <p>
        You may request access to or deletion of your data at any time by emailing{' '}
        <a href="mailto:roger.aspelin@hotmail.se" className="underline">roger.aspelin@hotmail.se</a>.
      </p>
    </div>
  );
}
