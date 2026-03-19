import { NextResponse } from 'next/server';

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  coursesCompleted: number;
}

export async function GET() {
  // Leaderboard - returns top students by courses completed
  // Uses seeded demo data for now; real implementation would query enrollment store
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, studentId: 'demo-student', coursesCompleted: 3 },
    { rank: 2, studentId: 'student-2', coursesCompleted: 2 },
    { rank: 3, studentId: 'student-3', coursesCompleted: 1 },
  ];
  return NextResponse.json(leaderboard);
}
