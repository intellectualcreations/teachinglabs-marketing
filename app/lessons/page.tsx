import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LessonsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-warm-white dark:bg-deep-navy">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
          My Lessons
        </h1>
        <p className="text-text-secondary mb-8">
          Browse and continue your learning journey.
        </p>

        <div className="grid gap-4">
          {/* Placeholder — replace with real lesson data */}
          {[1, 2, 3].map((id) => (
            <Link
              key={id}
              href={`/lesson/${id}`}
              className="block p-6 rounded-xl border border-border bg-surface hover:border-teal transition-colors"
            >
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                Lesson {id}
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Tap to view lesson details.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
