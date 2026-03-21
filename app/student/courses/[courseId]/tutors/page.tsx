'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CaretLeft, GraduationCap } from '@phosphor-icons/react';
import TutorDirectory from '@/components/social/TutorDirectory';

const DEMO_USER = { id: 'demo-student', name: 'Alex Demo' };

export default function TutorsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  function handleRequestTutor(tutorUserId: string) {
    // In a full implementation, this would create a notification or open a chat
    alert(`Tutor request sent! In the full app, ${tutorUserId} would receive a notification.`);
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link
            href={`/student/courses/${courseId}`}
            className="flex items-center gap-1 text-sm text-teal hover:text-teal/80 font-medium transition-colors mb-3"
          >
            <CaretLeft size={14} weight="bold" />
            Back to course
          </Link>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary flex items-center gap-2">
            <GraduationCap size={24} weight="fill" className="text-teal" />
            Peer Tutors
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Get help from classmates who excel in this subject.
          </p>
        </div>

        <TutorDirectory
          courseId={courseId}
          currentUserId={DEMO_USER.id}
          currentUserName={DEMO_USER.name}
          onRequestTutor={handleRequestTutor}
        />
      </div>
    </div>
  );
}
