import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barricade",
  description: "A 2-player race to the opposite side of the board",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
