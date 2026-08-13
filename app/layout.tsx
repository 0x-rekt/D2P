import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavBar from "@/components/NavBar";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D2P — AI-Powered Code Reviews & CI Diagnosis",
  description:
    "D2P automates code reviews, diagnoses CI failures, and ships fixes with confidence. AI-powered development that doesn't just comment—it fixes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans", plusJakartaSans.variable)}>
      <body
        className={`${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#0B0A12", color: "#F8F7FA" }}
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}
