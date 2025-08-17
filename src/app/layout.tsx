import "~/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "아현젊은이교회 성경필사",
  description: "아현젊은이교회 성경필사",
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
        <TRPCReactProvider>
          <div className="mx-auto min-h-screen max-w-[768px]">{children}</div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
