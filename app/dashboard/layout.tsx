import { DashboardNav } from "@/components/dashboard-nav";
import {Toaster} from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <DashboardNav />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
      <Toaster/>
    </div>
  );
}
