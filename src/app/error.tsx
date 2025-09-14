"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md">
        An unexpected error occurred. Try again or contact support if it persists.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700">Try again</button>
      </div>
      {process.env.NODE_ENV !== "production" && error?.message ? (
        <pre className="mt-6 text-xs text-left max-w-2xl overflow-auto p-4 rounded bg-gray-100 dark:bg-gray-900">{error.message}</pre>
      ) : null}
    </div>
  );
}

