'use client';

import { useEffect, useState } from 'react';
import { MagnifyingGlass, FunnelSimple, Upload, BookOpen, Hash, GraduationCap } from '@phosphor-icons/react';

interface Standard {
  id: string;
  code: string;
  shortCode: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  framework: string;
  domain?: string;
}

interface ImportRecord {
  id: string;
  name: string;
  framework: string;
  importedAt: string;
  standardCount: number;
}

export default function AdminStandardsPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');

  // Import form
  const [showImport, setShowImport] = useState(false);
  const [importFramework, setImportFramework] = useState('');
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/standards?subjects=true').then((r) => r.json()),
      fetch('/api/standards?grades=true').then((r) => r.json()),
      fetch('/api/standards?frameworks=true').then((r) => r.json()),
      fetch('/api/standards?imports=true').then((r) => r.json()),
    ]).then(([subj, gr, fw, imp]) => {
      setSubjects(subj.subjects || []);
      setGrades(gr.grades || []);
      setFrameworks(fw.frameworks || []);
      setImports(imp.imports || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (subjectFilter) params.set('subject', subjectFilter);
    if (gradeFilter) params.set('grade', gradeFilter);
    if (frameworkFilter) params.set('framework', frameworkFilter);
    fetch(`/api/standards?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setStandards(data.standards || []));
  }, [query, subjectFilter, gradeFilter, frameworkFilter]);

  async function handleImport() {
    if (!importFramework.trim() || !importJson.trim()) return;
    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch('/api/standards/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ framework: importFramework, standards: parsed }),
      });
      const data = await res.json();
      if (data.imported) {
        setImportStatus(`Successfully imported ${data.imported} standards`);
        setImportJson('');
        setImportFramework('');
        // Refresh
        const imp = await fetch('/api/standards?imports=true').then((r) => r.json());
        setImports(imp.imports || []);
        const fw = await fetch('/api/standards?frameworks=true').then((r) => r.json());
        setFrameworks(fw.frameworks || []);
      } else {
        setImportStatus(data.error || 'Import failed');
      }
    } catch {
      setImportStatus('Invalid JSON format');
    }
  }

  // Count by framework
  const frameworkCounts: Record<string, number> = {};
  const subjectCounts: Record<string, number> = {};
  // We'll show these from fetched standards but also from metadata
  for (const s of standards) {
    frameworkCounts[s.framework] = (frameworkCounts[s.framework] || 0) + 1;
    subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Standards Library</h1>
          <p className="text-sm text-text-muted mt-1">
            {standards.length} standards loaded across {frameworks.length} frameworks
          </p>
        </div>
        <button
          onClick={() => setShowImport(!showImport)}
          className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors"
        >
          <Upload size={18} />
          Import Standards
        </button>
      </div>

      {/* Import Panel */}
      {showImport && (
        <div className="bg-card-bg border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Import Standards</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Framework Name</label>
              <input
                type="text"
                value={importFramework}
                onChange={(e) => setImportFramework(e.target.value)}
                placeholder="e.g. Texas TEKS, Virginia SOL"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Standards JSON
              </label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={`[\n  { "code": "TEKS.M.3.1A", "shortCode": "3.1A", "title": "...", "description": "...", "subject": "Math", "gradeLevel": "3" }\n]`}
                rows={6}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/50 font-mono"
              />
              <p className="text-xs text-text-muted mt-1">CSV import coming soon</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
              >
                Import
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:bg-surface/80 transition-colors"
              >
                Cancel
              </button>
              {importStatus && (
                <p className={`text-sm ${importStatus.includes('Success') ? 'text-teal' : 'text-coral'}`}>
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 max-md:grid-cols-2">
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} className="text-teal" />
            <span className="text-sm text-text-muted">Frameworks</span>
          </div>
          <p className="text-2xl font-heading font-bold text-text-primary">{frameworks.length}</p>
          <div className="mt-2 space-y-1">
            {frameworks.map((fw) => (
              <span key={fw} className="inline-block text-xs bg-teal/10 text-teal px-2 py-0.5 rounded-full mr-1">
                {fw}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash size={20} className="text-navy dark:text-blue-300" />
            <span className="text-sm text-text-muted">Total Standards</span>
          </div>
          <p className="text-2xl font-heading font-bold text-text-primary">{standards.length}</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FunnelSimple size={20} className="text-coral" />
            <span className="text-sm text-text-muted">Subjects</span>
          </div>
          <p className="text-2xl font-heading font-bold text-text-primary">{subjects.length}</p>
          <div className="mt-2 space-y-1">
            {subjects.map((s) => (
              <span key={s} className="inline-block text-xs bg-coral/10 text-coral px-2 py-0.5 rounded-full mr-1">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={20} className="text-gold" />
            <span className="text-sm text-text-muted">Grade Levels</span>
          </div>
          <p className="text-2xl font-heading font-bold text-text-primary">{grades.length}</p>
        </div>
      </div>

      {/* Import History */}
      {imports.length > 0 && (
        <div className="bg-card-bg border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-3">Import History</h2>
          <div className="space-y-2">
            {imports.map((imp) => (
              <div key={imp.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-text-primary">{imp.name}</span>
                  <span className="text-xs text-text-muted ml-2">({imp.framework})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">{imp.standardCount} standards</span>
                  <span className="text-xs text-text-muted">{new Date(imp.importedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-card-bg border border-border rounded-xl p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search standards..."
              className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/50"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/50"
          >
            <option value="">All Grades</option>
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/50"
          >
            <option value="">All Frameworks</option>
            {frameworks.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Standards Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-text-muted font-medium">Code</th>
                <th className="text-left py-3 px-3 text-text-muted font-medium">Title</th>
                <th className="text-left py-3 px-3 text-text-muted font-medium max-md:hidden">Subject</th>
                <th className="text-left py-3 px-3 text-text-muted font-medium max-md:hidden">Grade</th>
                <th className="text-left py-3 px-3 text-text-muted font-medium max-md:hidden">Framework</th>
              </tr>
            </thead>
            <tbody>
              {standards.slice(0, 100).map((std) => (
                <tr key={std.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-xs text-teal whitespace-nowrap">{std.shortCode}</td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-text-primary text-sm">{std.title}</p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{std.description}</p>
                  </td>
                  <td className="py-3 px-3 max-md:hidden">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      std.subject === 'Math' ? 'bg-teal/10 text-teal' :
                      std.subject === 'ELA' ? 'bg-coral/10 text-coral' :
                      std.subject === 'Science' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      'bg-navy/10 text-navy dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {std.subject}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-secondary text-xs max-md:hidden">{std.gradeLevel}</td>
                  <td className="py-3 px-3 text-text-secondary text-xs max-md:hidden">{std.framework}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {standards.length > 100 && (
            <p className="text-xs text-text-muted text-center py-3">
              Showing first 100 of {standards.length} results. Use filters to narrow down.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
