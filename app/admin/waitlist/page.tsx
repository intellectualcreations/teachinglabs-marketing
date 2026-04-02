'use client';

import { useState, useMemo, useCallback } from 'react';

interface WaitlistEntry {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

type SortKey = 'name' | 'email' | 'role' | 'created_at';
type SortDir = 'asc' | 'desc';

const ROLES = ['All', 'Teacher', 'Student', 'Parent', 'District', 'Other'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function WaitlistAdmin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<WaitlistEntry[]>([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchData = useCallback(async (pw: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/waitlist?password=${encodeURIComponent(pw)}`);
      if (res.status === 401) {
        setError('Incorrect password.');
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('Failed to load data.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthenticated(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) fetchData(password.trim());
  };

  const filtered = useMemo(() => {
    let items = data;
    if (roleFilter !== 'All') {
      items = items.filter(
        (e) => e.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, roleFilter, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let aVal: string, bVal: string;
      switch (sortKey) {
        case 'name':
          aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
          bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'role':
          aVal = a.role.toLowerCase();
          bVal = b.role.toLowerCase();
          break;
        case 'created_at':
          aVal = a.created_at;
          bVal = b.created_at;
          break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'created_at' ? 'desc' : 'asc');
    }
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const exportCSV = () => {
    const header = 'First Name,Last Name,Email,Role,Date Joined';
    const rows = sorted.map(
      (e) =>
        `"${e.first_name}","${e.last_name}","${e.email}","${e.role}","${formatDate(e.created_at)}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <form
          onSubmit={handleLogin}
          className="bg-card-bg border border-border rounded-xl p-8 w-full max-w-sm shadow-sm"
        >
          <h1 className="text-xl font-heading font-bold text-text-primary mb-2">
            Waitlist Admin
          </h1>
          <p className="text-text-muted text-sm mb-6">
            Enter the admin password to continue.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 mb-4"
            autoFocus
          />
          {error && (
            <p className="text-danger text-sm mb-4">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-navy text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Waitlist
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {data.length} total signup{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Role filter buttons */}
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-navy text-white'
                  : 'bg-card-bg text-text-muted border border-border hover:text-text-primary'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="sm:ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="px-4 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th
                  onClick={() => toggleSort('name')}
                  className="text-left px-5 py-3 font-medium text-text-muted cursor-pointer hover:text-text-primary select-none"
                >
                  Name{sortArrow('name')}
                </th>
                <th
                  onClick={() => toggleSort('email')}
                  className="text-left px-5 py-3 font-medium text-text-muted cursor-pointer hover:text-text-primary select-none"
                >
                  Email{sortArrow('email')}
                </th>
                <th
                  onClick={() => toggleSort('role')}
                  className="text-left px-5 py-3 font-medium text-text-muted cursor-pointer hover:text-text-primary select-none"
                >
                  Role{sortArrow('role')}
                </th>
                <th
                  onClick={() => toggleSort('created_at')}
                  className="text-left px-5 py-3 font-medium text-text-muted cursor-pointer hover:text-text-primary select-none"
                >
                  Date Joined{sortArrow('created_at')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-text-muted"
                  >
                    {data.length === 0
                      ? 'No signups yet.'
                      : 'No results match your filters.'}
                  </td>
                </tr>
              ) : (
                sorted.map((entry, i) => (
                  <tr
                    key={entry.email + i}
                    className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-text-primary font-medium">
                      {entry.first_name} {entry.last_name}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {entry.email}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy/10 text-navy">
                        {entry.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Showing count */}
      {filtered.length !== data.length && (
        <p className="text-text-muted text-xs">
          Showing {filtered.length} of {data.length} signups
        </p>
      )}
    </div>
  );
}
