import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Talent Tracker",
    template: "%s • Talent Tracker",
  },
  description: "Track skills and job applications with an AI coach.",
  openGraph: {
    title: "Talent Tracker",
    description: "Track skills and job applications with an AI coach.",
    url: "https://example.com",
    siteName: "Talent Tracker",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
