import './teacher.css';
import Sidebar from '@/components/teacher/Sidebar';
import PostAuthHandler from '@/components/shared/PostAuthHandler';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen app-shell">
      <PostAuthHandler />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
