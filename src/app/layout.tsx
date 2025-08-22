import "~/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "아현젊은이교회 성경 필사",
  description: "아현젊은이교회 성경 정주행 - 필사편",
  icons: [{ rel: "icon", url: "/favicon.png" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`nanumsquare`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <div className="mx-auto min-h-screen max-w-[768px]">{children}</div>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
