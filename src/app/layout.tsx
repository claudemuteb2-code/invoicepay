import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvoiceFlow — Invoice management for freelancers and small teams",
  description:
    "Send professional invoices, track payments, and get paid via PayPal. Multi-currency, recurring invoices, beautiful PDF templates. Free tier available.",
};

const themeInitScript = `
  (function() {
    try {
      var t = localStorage.getItem('if_theme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (t === 'dark' || (!t && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch (_) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
