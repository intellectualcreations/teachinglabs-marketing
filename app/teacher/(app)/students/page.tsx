'use client';

import { useState, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MagnifyingGlass, Plus, DotsThree, Users, FunnelSimple,
  ArrowsDownUp, Export, Robot, UserPlus, X, CheckCircle, CaretDown,
} from '@phosphor-icons/react';
import { getDemoStudents, DEMO_CLASSES, type DemoStudent } from '@/lib/demo-data';

/* ─── Types ─── */
type SortOption = 'name-az' | 'name-za' | 'last-active' | 'engagement' | 'status';
type StatusFilter = 'all' | 'active' | 'inactive';

interface DemoGroup {
  id: string;
  name: string;
  studentIds: string[];
}

const SORT_LABELS: Record<SortOption, string> = {
  'name-az': 'Name A-Z',
  'name-za': 'Name Z-A',
  'last-active': 'Last Active',
  engagement: 'Engagement',
  status: 'Status',
};

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All Status',
  active: 'Active',
  inactive: 'Inactive',
};

/* ─── Helpers ─── */

function getEngagementColor(lastSession: string): string {
  if (
    lastSession === 'Just now' ||
    lastSession.includes('m ago') ||
    lastSession.includes('h ago')
  ) return 'bg-emerald-400';
  if (lastSession === 'Yesterday') return 'bg-yellow-400';
  return 'bg-gray-400';
}

function getInitials(first: string, last: string): string {
  return `${first[0]}${last[0]}`.toUpperCase();
}

const INITIAL_GROUPS: DemoGroup[] = [
  { id: 'grp-1', name: 'Fractions Intervention', studentIds: ['STU-30001', 'STU-30003', 'STU-30007'] },
  { id: 'grp-2', name: 'Advanced Math', studentIds: ['STU-30001', 'STU-30005', 'STU-30009', 'STU-30010', 'STU-30012'] },
  { id: 'grp-3', name: 'Reading Support', studentIds: ['STU-30002', 'STU-30004'] },
];

/* ─── Main Content ─── */

function StudentsContent() {
  const searchParams = useSearchParams();
  const classParam = searchParams.get('class');
  const activeClass = DEMO_CLASSES.find((c) => c.id === classParam) ?? null;

  const allStudents = useMemo(() => getDemoStudents(), []);

  // State
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>(activeClass?.id ?? 'all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [sort, setSort] = useState<SortOption>('name-az');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inactiveIds, setInactiveIds] = useState<Set<string>>(new Set());
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addedStudentId, setAddedStudentId] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupStudentIds, setNewGroupStudentIds] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<DemoGroup[]>(INITIAL_GROUPS);

  // Derived: filtered class
  const filterClassName = useMemo(() => {
    if (classFilter === 'all') return null;
    return DEMO_CLASSES.find((c) => c.id === classFilter)?.name ?? null;
  }, [classFilter]);

  // Filtered + sorted students
  const filtered = useMemo(() => {
    let list = allStudents.filter((s) => {
      // Class filter
      if (filterClassName && !s.classNames.includes(filterClassName)) return false;
      // Status filter
      const isInactive = inactiveIds.has(s.id);
      if (statusFilter === 'active' && isInactive) return false;
      if (statusFilter === 'inactive' && !isInactive) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        const name = `${s.first} ${s.last}`.toLowerCase();
        if (!name.includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Sort
    list = [...list];
    switch (sort) {
      case 'name-az':
        list.sort((a, b) => `${a.last} ${a.first}`.localeCompare(`${b.last} ${b.first}`));
        break;
      case 'name-za':
        list.sort((a, b) => `${b.last} ${b.first}`.localeCompare(`${a.last} ${a.first}`));
        break;
      case 'last-active': {
        const order: Record<string, number> = {};
        list.forEach((s) => {
          if (s.lastSession === 'Just now') order[s.id] = 0;
          else if (s.lastSession.includes('m ago')) order[s.id] = 1;
          else if (s.lastSession.includes('h ago')) order[s.id] = 2;
          else if (s.lastSession === 'Yesterday') order[s.id] = 3;
          else order[s.id] = 4;
        });
        list.sort((a, b) => (order[a.id] ?? 5) - (order[b.id] ?? 5));
        break;
      }
      case 'engagement': {
        const parseAct = (s: string) => {
          const [done] = s.split('/');
          return parseInt(done, 10) || 0;
        };
        list.sort((a, b) => parseAct(b.activitiesComplete) - parseAct(a.activitiesComplete));
        break;
      }
      case 'status': {
        const so: Record<string, number> = { excelling: 0, 'on-track': 1, attention: 2 };
        list.sort((a, b) => (so[a.status] ?? 3) - (so[b.status] ?? 3));
        break;
      }
    }
    return list;
  }, [allStudents, filterClassName, statusFilter, search, sort, inactiveIds]);

  // Handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  }, [filtered, selectedIds.size]);

  const toggleInactive = useCallback((id: string) => {
    setInactiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setOpenActionMenu(null);
  }, []);

  const bulkSetInactive = useCallback(() => {
    setInactiveIds((prev) => {
      const next = new Set(prev);
      selectedIds.forEach((id) => next.add(id));
      return next;
    });
    setSelectedIds(new Set());
  }, [selectedIds]);

  // Students available for "Add" modal (those not in the filtered class)
  const addableStudents = useMemo(() => {
    if (!filterClassName) return allStudents;
    return allStudents.filter((s) => !s.classNames.includes(filterClassName));
  }, [allStudents, filterClassName]);

  const filteredAddable = useMemo(() => {
    if (!addSearch) return addableStudents;
    const q = addSearch.toLowerCase();
    return addableStudents.filter((s) => {
      const name = `${s.first} ${s.last}`.toLowerCase();
      return name.includes(q) || s.id.toLowerCase().includes(q);
    });
  }, [addableStudents, addSearch]);

  // Title
  const title = activeClass ? `Manage Students — ${activeClass.name}` : 'Manage Students';

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-[26px] font-bold text-text-primary">{title}</h1>
          <p className="text-text-secondary text-[15px] mt-1">
            {filtered.length} of {allStudents.length} students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Export coming soon')}
            className="flex items-center gap-2 px-4 py-2.5 border-[1.5px] border-border rounded-lg text-sm font-medium text-text-secondary hover:border-navy hover:text-navy transition-all cursor-pointer"
          >
            <Export size={16} />
            Export CSV
          </button>
          <button
            onClick={() => { setShowAddModal(true); setAddSearch(''); setAddedStudentId(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal text-white rounded-lg text-sm font-semibold hover:bg-teal/90 transition-all cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            Add Student
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card-bg border border-border rounded-[14px] p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-navy" />

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name or Student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-[38px] pr-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm bg-card-bg text-text-primary outline-none focus:border-navy"
            />
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowSortDropdown(false); }}
              className="flex items-center gap-2 px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-secondary hover:border-navy cursor-pointer"
            >
              <FunnelSimple size={16} />
              {STATUS_FILTER_LABELS[statusFilter]}
              <CaretDown size={12} />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full mt-1 right-0 bg-card-bg border border-border rounded-lg shadow-lg z-20 min-w-[150px]">
                {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setStatusFilter(key); setShowStatusDropdown(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-navy/5 cursor-pointer ${statusFilter === key ? 'text-navy font-semibold' : 'text-text-primary'}`}
                  >
                    {STATUS_FILTER_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowSortDropdown(!showSortDropdown); setShowStatusDropdown(false); }}
              className="flex items-center gap-2 px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-secondary hover:border-navy cursor-pointer"
            >
              <ArrowsDownUp size={16} />
              {SORT_LABELS[sort]}
              <CaretDown size={12} />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full mt-1 right-0 bg-card-bg border border-border rounded-lg shadow-lg z-20 min-w-[160px]">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setSort(key); setShowSortDropdown(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-navy/5 cursor-pointer ${sort === key ? 'text-navy font-semibold' : 'text-text-primary'}`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Class filter pills */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setClassFilter('all')}
            className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium cursor-pointer transition-all
              ${classFilter === 'all' ? 'bg-navy border-navy text-white' : 'border-border text-text-secondary hover:border-navy hover:text-navy'}`}
          >
            All Classes
          </button>
          {DEMO_CLASSES.map((c) => (
            <button
              key={c.id}
              onClick={() => setClassFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium cursor-pointer transition-all
                ${classFilter === c.id ? 'bg-navy border-navy text-white' : 'border-border text-text-secondary hover:border-navy hover:text-navy'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 px-5">
            <div className="text-[32px] mb-2">🔍</div>
            <h3 className="font-heading font-bold text-[15px] text-text-primary">No students match your filters</h3>
            <p className="text-text-secondary text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border accent-teal cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Student</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">ID</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Grade</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Classes</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Activities</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Last Active</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border">Status</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] border-b-2 border-border w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const isInactive = inactiveIds.has(s.id);
                  return (
                    <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-teal/[0.03]">
                      {/* Checkbox */}
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          className="w-4 h-4 rounded border-border accent-teal cursor-pointer"
                        />
                      </td>
                      {/* Avatar + Name */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                          >
                            {getInitials(s.first, s.last)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-text-primary">{s.first} {s.last}</span>
                            {s.concern && (
                              <span title={s.concern} className="cursor-help">
                                <Robot size={15} weight="fill" className="text-teal" />
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Student ID */}
                      <td className="px-3 py-3 font-heading text-[13px] text-text-secondary">{s.id}</td>
                      {/* Grade */}
                      <td className="px-3 py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-navy/[0.08] text-xs font-semibold text-navy">
                          {s.grade === 'K' ? 'K' : `${s.grade}th`}
                        </span>
                      </td>
                      {/* Class tags */}
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.classNames.map((cn) => (
                            <span key={cn} className="px-2 py-0.5 rounded-full bg-teal/10 text-[11px] font-medium text-teal whitespace-nowrap">
                              {cn}
                            </span>
                          ))}
                        </div>
                      </td>
                      {/* Activities */}
                      <td className="px-3 py-3 text-sm text-text-primary">{s.activitiesComplete}</td>
                      {/* Last Active + engagement dot */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getEngagementColor(s.lastSession)}`} />
                          <span className="text-sm text-text-secondary">{s.lastSession}</span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3">
                        {isInactive ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-500/10 text-xs font-semibold text-gray-400">Inactive</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-500">Active</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-3 relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenu(openActionMenu === s.id ? null : s.id); }}
                          className="p-1 rounded hover:bg-navy/5 cursor-pointer"
                        >
                          <DotsThree size={20} weight="bold" className="text-text-secondary" />
                        </button>
                        {openActionMenu === s.id && (
                          <div className="absolute right-0 top-full mt-1 bg-card-bg border border-border rounded-lg shadow-lg z-30 min-w-[170px]">
                            <button
                              onClick={() => { window.location.href = '/teacher/students/student-detail'; setOpenActionMenu(null); }}
                              className="block w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-navy/5 cursor-pointer"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => setOpenActionMenu(null)}
                              className="block w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-navy/5 cursor-pointer"
                            >
                              Move to Group
                            </button>
                            <button
                              onClick={() => toggleInactive(s.id)}
                              className="block w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-navy/5 cursor-pointer"
                            >
                              {isInactive ? 'Set Active' : 'Set Inactive'}
                            </button>
                            {filterClassName && (
                              <button
                                onClick={() => setOpenActionMenu(null)}
                                className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 cursor-pointer"
                              >
                                Remove from Class
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Small Groups Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-[20px] font-bold text-text-primary flex items-center gap-2">
            <Users size={22} className="text-teal" />
            Small Groups
          </h2>
          <button
            onClick={() => { setShowCreateGroup(true); setNewGroupName(''); setNewGroupStudentIds(new Set()); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg text-sm font-semibold hover:bg-teal/90 transition-all cursor-pointer"
          >
            <Plus size={14} weight="bold" />
            Create Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const groupStudents = allStudents.filter((s) => group.studentIds.includes(s.id));
            return (
              <div key={group.id} className="bg-card-bg border border-border rounded-[14px] p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-bold text-[15px] text-text-primary">{group.name}</h3>
                    <p className="text-text-secondary text-xs mt-0.5">{groupStudents.length} students</p>
                  </div>
                  <button className="px-3 py-1.5 border-[1.5px] border-border rounded-lg text-xs font-medium text-text-secondary hover:border-navy hover:text-navy transition-all cursor-pointer">
                    Edit Group
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {groupStudents.map((s) => (
                    <span key={s.id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-navy/[0.06] text-xs text-text-primary">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: s.color }}>
                        {getInitials(s.first, s.last)}
                      </span>
                      {s.first} {s.last[0]}.
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Bulk Actions Bar ─── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-border px-6 py-3.5 flex items-center justify-between">
          <span className="text-white text-sm font-medium">{selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-lg cursor-pointer transition-all">
              Move to Group
            </button>
            <button
              onClick={bulkSetInactive}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-lg cursor-pointer transition-all"
            >
              Set Inactive
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-lg cursor-pointer transition-all">
              Message Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-lg cursor-pointer transition-all"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* ─── Add Student Modal ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-[14px] p-7 shadow-2xl max-h-[80vh] flex flex-col"
            style={{ backgroundColor: '#1a2744' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold text-white">
                {activeClass ? `Add Student to ${activeClass.name}` : 'Add Student'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Success message */}
            {addedStudentId && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm">
                <CheckCircle size={18} weight="fill" />
                Student added successfully
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search students..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="w-full pl-[38px] pr-3.5 py-2.5 border-[1.5px] border-white/10 rounded-lg text-sm bg-white/5 text-white outline-none focus:border-teal placeholder:text-white/40"
              />
            </div>

            {/* Student list */}
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              {filteredAddable.length === 0 ? (
                <p className="text-white/50 text-sm text-center py-6">No students found</p>
              ) : (
                filteredAddable.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: s.color }}>
                        {getInitials(s.first, s.last)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{s.first} {s.last}</p>
                        <p className="text-xs text-white/50">{s.grade === 'K' ? 'Kindergarten' : `${s.grade}th Grade`}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAddedStudentId(s.id)}
                      className="px-3 py-1.5 bg-teal text-white rounded-lg text-xs font-semibold hover:bg-teal/90 cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Group Modal ─── */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowCreateGroup(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-[14px] p-7 shadow-2xl max-h-[80vh] flex flex-col"
            style={{ backgroundColor: '#1a2744' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold text-white">Create Group</h2>
              <button onClick={() => setShowCreateGroup(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Group name */}
            <input
              type="text"
              placeholder="Group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-white/10 rounded-lg text-sm bg-white/5 text-white outline-none focus:border-teal placeholder:text-white/40 mb-4"
            />

            {/* Student picker */}
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Select Students</p>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 mb-5">
              {allStudents.map((s) => (
                <label key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newGroupStudentIds.has(s.id)}
                    onChange={() => {
                      setNewGroupStudentIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(s.id)) next.delete(s.id);
                        else next.add(s.id);
                        return next;
                      });
                    }}
                    className="w-4 h-4 rounded accent-teal"
                  />
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: s.color }}>
                    {getInitials(s.first, s.last)}
                  </div>
                  <span className="text-sm text-white">{s.first} {s.last}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                if (!newGroupName.trim()) return;
                const newGroup: DemoGroup = {
                  id: `grp-${Date.now()}`,
                  name: newGroupName.trim(),
                  studentIds: Array.from(newGroupStudentIds),
                };
                setGroups((prev) => [...prev, newGroup]);
                setShowCreateGroup(false);
              }}
              disabled={!newGroupName.trim() || newGroupStudentIds.size === 0}
              className="w-full py-3 bg-teal text-white rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Save Group ({newGroupStudentIds.size} students)
            </button>
          </div>
        </div>
      )}

      {/* Close dropdowns on outside click */}
      {(openActionMenu || showStatusDropdown || showSortDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setOpenActionMenu(null); setShowStatusDropdown(false); setShowSortDropdown(false); }}
        />
      )}
    </div>
  );
}

/* ─── Page Export ─── */

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-secondary">Loading...</div>}>
      <StudentsContent />
    </Suspense>
  );
}
