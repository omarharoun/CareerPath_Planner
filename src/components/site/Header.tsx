import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/60 dark:border-gray-800/60 backdrop-blur bg-white/70 dark:bg-black/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">Careero</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700">Sign in</Link>
          <Link href="/sign-up" className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700">Sign up</Link>
          <Link href="/app" className="text-sm px-3 py-1.5 rounded bg-gray-900 text-white dark:bg-white dark:text-black">Open app</Link>
        </div>
      </div>
    </header>
  );
}

