import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;

  return (
    <div className="min-h-screen bg-warm-white dark:bg-deep-navy">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          ← Back to lessons
        </Link>

        <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
          Lesson {id}
        </h1>
        <p className="text-text-secondary mb-8">
          Lesson content will appear here.
        </p>

        <div className="p-8 rounded-xl border border-border bg-surface text-center text-text-muted">
          Lesson content placeholder. Connect to your curriculum data source to display real lessons.
        </div>
      </div>
    </div>
  );
}
