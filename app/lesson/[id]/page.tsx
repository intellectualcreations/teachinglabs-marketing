import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLessonById } from '@/lib/lesson-store';
import CodePlayground from '@/components/CodePlayground';

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const lesson = getLessonById(id);

  return (
    <div className="min-h-screen bg-warm-white dark:bg-deep-navy">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          ← Back to lessons
        </Link>

        <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
          {lesson ? lesson.title : `Lesson ${id}`}
        </h1>

        {lesson?.content ? (
          <div className="prose prose-slate dark:prose-invert mb-8">
            {lesson.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-text-secondary leading-relaxed">{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary mb-8">
            Lesson content will appear here.
          </p>
        )}

        {/* Live Coding Sandbox — FLU-319 */}
        <section className="mt-8">
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
            💻 Code Playground
          </h2>
          <CodePlayground
            lessonId={id}
            starterCode={lesson?.starterCode}
          />
        </section>
      </div>
    </div>
  );
}
