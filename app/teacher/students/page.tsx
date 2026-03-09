'use client';

import { useState, useMemo } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { getDemoStudents } from '@/lib/demo-data';

export default function StudentsPage() {
  const allStudents = useMemo(() => getDemoStudents(), []);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  // Get unique grades
  const grades = useMemo(() => {
    const set = new Set(allStudents.map((s) => s.grade));
    return Array.from(set).sort();
  }, [allStudents]);

  const filtered = useMemo(() => {
    return allStudents.filter((s) => {
      if (gradeFilter !== 'all' && s.grade !== gradeFilter) return false;
      if (search) {
        const name = `${s.first} ${s.last}`.toLowerCase();
        const q = search.toLowerCase();
        if (!name.includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allStudents, gradeFilter, search]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-[26px] font-bold text-text-primary">Students</h1>
        <p className="text-text-secondary text-[15px] mt-1">
          {filtered.length} of {allStudents.length} students
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-card-bg border border-border rounded-[14px] p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-navy" />

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name or Student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-[38px] pr-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-navy"
            />
          </div>
          <button
            onClick={() => setGradeFilter('all')}
            className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium cursor-pointer transition-all
              ${gradeFilter === 'all' ? 'bg-navy border-navy text-white' : 'border-border text-text-secondary hover:border-navy hover:text-navy'}`}
          >
            All
          </button>
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium cursor-pointer transition-all
                ${gradeFilter === g ? 'bg-navy border-navy text-white' : 'border-border text-text-secondary hover:border-navy hover:text-navy'}`}
            >
              {g === 'K' ? 'K' : `${g}th`}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 px-5">
            <div className="text-[32px] mb-2">🔍</div>
            <h3 className="font-heading font-bold text-[15px] text-text-primary">No students match your search</h3>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-3.5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">
                    First Name
                  </th>
                  <th className="text-left px-3.5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">
                    Last Name
                  </th>
                  <th className="text-left px-3.5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">
                    Student ID
                  </th>
                  <th className="text-left px-3.5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => window.location.href = '/teacher/students/student-detail'}
                    className="cursor-pointer hover:bg-teal/[0.03] border-b border-border last:border-b-0"
                  >
                    <td className="px-3.5 py-3 text-sm text-text-primary">{s.first}</td>
                    <td className="px-3.5 py-3 text-sm text-text-primary">{s.last}</td>
                    <td className="px-3.5 py-3 font-heading text-[13px] text-text-secondary">{s.id}</td>
                    <td className="px-3.5 py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-navy/[0.08] text-xs font-semibold text-navy">
                        {s.grade === 'K' ? 'K' : `${s.grade}th`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
