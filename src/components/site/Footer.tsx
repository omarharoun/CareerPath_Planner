import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200/60 dark:border-gray-800/60">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500">© {new Date().getFullYear()} Talent Tracker</div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="hover:underline">Sign in</Link>
          <Link href="/app" className="hover:underline">Open app</Link>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
    </footer>
  );
}

