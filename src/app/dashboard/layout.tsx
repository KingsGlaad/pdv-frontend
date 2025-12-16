import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50/50">
      {/* Sidebar - Desktop: Fixa, Mobile: Hidden (controlado pelo sheet/drawer se quiseres futuramente) */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <Topbar />
        <main className="flex-1 p-4 md:p-8 pt-6">{children}</main>
      </div>
    </div>
  );
}
