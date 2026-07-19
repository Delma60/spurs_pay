export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const ERRORS: Record<string, string> = {
    invalid_state: "Your sign-in session expired. Please try again.",
    exchange_failed: "Couldn't complete sign-in with Spurs. Please try again.",
    access_denied: "You cancelled the Spurs sign-in.",
  };
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-neutral-50 px-4 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">S</span>
          <div>
            <div className="text-lg font-semibold leading-tight">Spurs Pay</div>
            <div className="text-xs text-neutral-500">Merchant dashboard</div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Sign in to your dashboard</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Use your Spurs account to view payments, manage API keys and settings.
        </p>

        {message && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {message}
          </div>
        )}

        <a
          href="/auth/start"
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 font-medium text-white transition hover:bg-indigo-700"
        >
          <span className="grid h-5 w-5 place-items-center rounded bg-white/20 text-[11px] font-bold">S</span>
          Continue with Spurs
        </a>

        <p className="mt-6 text-center text-xs text-neutral-400">Protected by Spurs Cloud identity</p>
      </div>
    </div>
  );
}
