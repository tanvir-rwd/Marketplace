import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function MarketplaceLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
