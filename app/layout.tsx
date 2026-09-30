import type { Metadata } from "next";
import "./globals.css";

// Internal tool, not a branded page — plain system fonts, no external
// font fetch (also avoids a build-time dependency on Google Fonts being
// reachable, which isn't guaranteed in every build environment).

export const metadata: Metadata = {
  title: "ORAGROL Vendor Dashboard",
  description: "Vendor, API and subscription cost register for ORAGROL",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
