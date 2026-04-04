'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ClassPage() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router.replace(`/student/main?class=${params.id}`);
  }, [router, params.id]);
  return <div className="flex items-center justify-center min-h-[60vh] text-text-secondary">Loading class...</div>;
}
