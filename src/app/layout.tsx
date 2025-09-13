// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; // <-- Use the 'Inter' font
import "./globals.css";

// Configure the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vector Annotation Tool", // You can customize the title
  description: "A web app for verifying mosquito annotations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the font class to the body */}
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}