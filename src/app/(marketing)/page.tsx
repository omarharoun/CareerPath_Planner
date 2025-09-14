import Link from "next/link";
export const dynamic = "force-dynamic";

export default function MarketingHome() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_0%,rgba(59,130,246,0.18),rgba(0,0,0,0))]" />
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Track your skills and job search with an AI coach
            </h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-300">
              Stay organized across skills, applications, and interviews. Get concise
              guidance from an AI coach tailored to your goals.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link href="/app" className="px-5 py-3 rounded bg-gray-900 text-white dark:bg-white dark:text-black">Open app</Link>
              <Link href="/login" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-700">Sign in</Link>
              <Link href="/sign-up" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-700">Create account</Link>
            </div>
            <div className="mt-8 text-xs text-gray-500">No credit card required.</div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white/30 dark:bg-black/20">
              <div className="text-sm font-semibold">Skills</div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Capture strengths and learning goals with optional levels.</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white/30 dark:bg-black/20">
              <div className="text-sm font-semibold">Jobs</div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Track applications and status like saved, applied, interview.</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white/30 dark:bg-black/20">
              <div className="text-sm font-semibold">AI Coach</div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Ask for resume feedback, outreach ideas, and interview prep.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-6 space-y-6">
            <div>
              <div className="font-medium">Is it free?</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Yes, personal use is free. AI features require an API key.</p>
            </div>
            <div>
              <div className="font-medium">Where is my data stored?</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your data lives in your Supabase project with RLS policies.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

