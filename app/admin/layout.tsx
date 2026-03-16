import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
