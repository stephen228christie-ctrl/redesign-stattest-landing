import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StatTest Selector — Find the right statistical test, instantly",
  description:
    "Answer 5 questions about your study. Get the exact statistical test, an APA 7th edition write-up, and a justification your supervisor can't argue with. Built for psychology dissertations.",
  metadataBase: new URL("https://redesign-stattest-landing.vercel.app"),
  openGraph: {
    title: "StatTest Selector — the right statistical test, instantly",
    description:
      "From research question to defensible test choice in minutes. APA 7 templates, SPSS & jamovi steps, supervisor reports.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;1,500;1,600&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-paper text-ink">{children}</body>
    </html>
  );
}
