import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "아현젊은이교회 성경필사",
  description: "아현젊은이교회 성경필사",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <div className="mx-auto min-h-screen max-w-[768px] bg-[#F5F1EE] px-4 py-8">
            {children}
          </div>{" "}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
