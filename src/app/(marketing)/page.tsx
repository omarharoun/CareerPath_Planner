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
              Your AI-powered career companion
            </h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-300">
              Careero helps you track your skills, manage job applications, and grow professionally with personalized AI guidance tailored to your career goals.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link href="/app" className="px-5 py-3 rounded bg-gray-900 text-white dark:bg-white dark:text-black">Get Started</Link>
              <Link href="/login" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-700">Sign in</Link>
              <Link href="/sign-up" className="px-5 py-3 rounded border border-gray-300 dark:border-gray-700">Create account</Link>
            </div>
            <div className="mt-8 text-xs text-gray-500">Free to use • No credit card required</div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">Why Careero?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Career development shouldn&apos;t be overwhelming. Careero simplifies your professional journey with intelligent tools and personalized insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Skills Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">Organize and track your skills with levels, progress monitoring, and learning recommendations.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Job Application Management</h3>
              <p className="text-gray-600 dark:text-gray-300">Keep track of all your job applications, interviews, and follow-ups in one organized place.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Career Coach</h3>
              <p className="text-gray-600 dark:text-gray-300">Get personalized advice on resumes, cover letters, interview prep, and career strategy.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

