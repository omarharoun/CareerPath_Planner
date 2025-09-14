import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <div className="mt-6">
        <Link href="/" className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700">Go home</Link>
      </div>
    </div>
  );
}

