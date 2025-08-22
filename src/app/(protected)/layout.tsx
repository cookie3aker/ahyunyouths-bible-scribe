import { Toaster } from "react-hot-toast";
import { BottomNavigation } from "../_components/bottom-navigation";
import { Header } from "../_components/header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 -z-10 bg-[url('/bg-community.png')] bg-cover bg-center" />

      <div className="flex min-h-screen flex-col">
        <header className="mt-[60px] mb-[34px] w-full px-[22px]">
          <Header />
        </header>
        {children}
        <footer className="fixed bottom-0 left-1/2 flex h-[52px] w-full max-w-[768px] -translate-x-1/2 border-t-1 border-[rgba(138,138,138,0.1)] bg-[#fff] py-[8px]">
          <BottomNavigation />
        </footer>
      </div>

      <Toaster />
    </div>
  );
}
