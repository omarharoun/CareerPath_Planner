import { ReactNode } from "react";
import SiteHeader from "@/components/site/Header";
import SiteFooter from "@/components/site/Footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

