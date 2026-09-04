import Sidebar from '@/components/layout/Sidebar';
import VaultMindChatWidget from '@/components/ui/VaultMindChatWidget';
import TopNav from '@/components/layout/TopNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <TopNav />

        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
      <VaultMindChatWidget />
    </div>
  );
}