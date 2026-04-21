import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvoicePay — Send invoices, get paid with PayPal in 30 seconds",
  description:
    "The fastest way for freelancers to create professional invoices and collect payments via PayPal. Free to start.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
