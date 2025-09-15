import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Careero",
    template: "%s • Careero",
  },
  description: "Your AI-powered career companion for skills tracking, job applications, and professional growth.",
  openGraph: {
    title: "Careero",
    description: "Your AI-powered career companion for skills tracking, job applications, and professional growth.",
    url: "https://example.com",
    siteName: "Careero",
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
