'use client';

interface Props {
  email: string;
}

export default function RegisterSuccess({ email }: Props) {
  return (
    <div className="text-center space-y-4 text-sm text-gray-700">
      <h2 className="text-lg font-semibold text-indigo-700">Almost there!</h2>
      <p>
        We&apos;ve sent a magic login link to <strong>{email}</strong>.
      </p>
      <p>Don’t forget to check your spam folder.</p>
      <p className="text-xs text-gray-500">
        Sent from <em>Supabase Auth &lt;noreply@mail.app.supabase.io&gt;</em>
      </p>
    </div>
  );
}
