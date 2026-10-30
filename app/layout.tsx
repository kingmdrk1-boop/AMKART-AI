import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMKART SELLER AI | Seller Intelligence",
  description: "Sales, profit, expenses and GST intelligence for marketplace sellers."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
