import { BottomNavigation } from "../_components/bottom-navigation";
import { Header } from "../_components/header";

export default function RootLayout({
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
        <footer className="fixed bottom-0 left-1/2 flex h-[106px] w-full max-w-[768px] -translate-x-1/2 bg-white pt-[14.5px] pb-[28.5px]">
          <BottomNavigation />
        </footer>
      </div>
    </div>
  );
}
