import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { redirect } from "next/navigation";

import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "아현젊은이교회 성경필사",
  description: "아현젊은이교회 성경필사",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // get auth in server
  const session = await auth();

  // 현재 path가 로그인 페이지가 아니고 세션이 없으면 로그인 페이지로 리다이렉트

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
