import type { Metadata } from "next";
import { BottomNavigation } from "../_components/bottom-navigation";
import { Header } from "../_components/header";

export const metadata: Metadata = {};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <Header /> */}
      <main>{children}</main>
      <BottomNavigation />
    </>
  );
}
