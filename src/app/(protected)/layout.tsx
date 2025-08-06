import type { Metadata } from "next";
import { BottomNavigation } from "../_components/bottom-navigation";

export const metadata: Metadata = {};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <BottomNavigation />
    </>
  );
}
