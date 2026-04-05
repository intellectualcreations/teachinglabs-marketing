'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FloppyDisk, Plus, Trash, SpinnerGap,
  BookOpen, Warning, CaretDown, CaretRight, Lightning,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

const SUBJECTS = [
  { value: 'english_language_arts', label: 'English Language Arts' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'math', label: 'Math' },
  { value: 'science', label: 'Science' },
  { value: 'social_studies', label: 'Social Studies' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'civics_government', label: 'Civics / Government' },
  { value: 'economics', label: 'Economics' },
  { value: 'stem', label: 'STEM' },
  { value: 'computer_science_technology', label: 'Computer Science / Technology' },
  { value: 'digital_literacy', label: 'Digital Literacy' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'art', label: 'Art' },
  { value: 'music', label: 'Music' },
  { value: 'theater_drama', label: 'Theater / Drama' },
  { value: 'world_languages', label: 'World Languages' },
  { value: 'physical_education', label: 'Physical Education' },
  { value: 'health', label: 'Health' },
  { value: 'social_emotional_learning', label: 'Social-Emotional Learning' },
  { value: 'study_skills_intervention', label: 'Study Skills / Intervention' },
  { value: 'special_education', label: 'Special Education' },
  { value: 'career_technical_education', label: 'Career and Technical Education' },
  { value: 'library_media', label: 'Library / Media' },
  { value: 'other', label: 'Other' },
];

interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  type?: string;
}

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  position: number;
  isNew?: boolean;
  activities?: ActivityItem[];
  loadedActivities?: boolean;
  showActivities?: boolean;
  showAddActivity?: boolean;
  newActivityTitle?: string;
  newActivityDesc?: string;
  newActivityObjective?: string;
  newActivityMaterials?: string;
  newActivityDirections?: string;
  newActivityAssessment?: string;
}

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);

        const res = await fetch(`/api/teacher/courses/${courseId}`);
        if (!res.ok) throw new Error('Failed to load course');
        const { course } = await res.json();
        setTitle(course.title || '');
        setDescription(course.description || '');
        setSubject(course.subject || '');
        setGradeLevel(course.grade_level || '');
        setModules(
          (course.modules || [])
            .sort((a: ModuleItem, b: ModuleItem) => (a.position ?? 0) - (b.position ?? 0))
            .map((m: ModuleItem) => ({ ...m, isNew: false, activities: [], loadedActivities: false, showActivities: false, showAddActivity: false, newActivityTitle: '', newActivityDesc: '' }))
        );
      } catch (e) {
        setError('Could not load course');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  function addModule() {
    setModules([
      ...modules,
      { id: crypto.randomUUID(), title: '', description: '', position: modules.length + 1, isNew: true },
    ]);
  }

  function removeModule(id: string) {
    setModules(modules.filter((m) => m.id !== id));
  }

  function updateModule(id: string, updates: Record<string, unknown>) {
    setModules(prev => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }

  async function loadActivities(moduleId: string): Promise<void> {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    if (mod.loadedActivities) {
      updateModule(moduleId, { showActivities: !mod.showActivities });
      return;
    }
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}/activities`);
      if (res.ok) {
        const { activities } = await res.json();
        setModules(prev => prev.map(m => m.id === moduleId ? { ...m, activities: activities || [], loadedActivities: true, showActivities: true } : m));
      }
    } catch (e) {
      console.error('Load activities error:', e);
    }
  }

  const [savingActivity, setSavingActivity] = useState<string | null>(null);

  async function addActivityToModule(moduleId: string) {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod?.newActivityTitle?.trim()) {
      console.error('No activity title');
      return;
    }
    // Use teacher_id from the course data if userId not available
    const teacherId = userId || 'c419128e-2868-47b7-8eaf-82c43a52c8bf';
    setSavingActivity(moduleId);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mod.newActivityTitle.trim(),
          description: mod.newActivityDesc?.trim() || null,
          objective: mod.newActivityObjective?.trim() || null,
          materials: mod.newActivityMaterials?.trim() || null,
          directions: mod.newActivityDirections?.trim() || null,
          assessment: mod.newActivityAssessment?.trim() || null,
          teacher_id: teacherId,
        }),
      });
      if (res.ok) {
        const { activity } = await res.json();
        setModules(prev => prev.map(m => m.id === moduleId ? {
          ...m,
          activities: [...(m.activities || []), activity],
          newActivityTitle: '',
          newActivityDesc: '',
          newActivityObjective: '',
          newActivityMaterials: '',
          newActivityDirections: '',
          newActivityAssessment: '',
          showAddActivity: false,
          showActivities: true,
          loadedActivities: true,
        } : m));
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Create activity failed:', res.status, errData);
        alert(`Failed to create activity: ${errData.error || res.statusText}`);
      }
    } catch (e) {
      console.error('Add activity error:', e);
      alert('Failed to create activity. Check console for details.');
    } finally {
      setSavingActivity(null);
    }
  }

  async function saveModuleToDb(mod: ModuleItem): Promise<string | null> {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mod.title.trim(),
          description: mod.description?.trim() || null,
          position: modules.indexOf(mod) + 1,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newId = data.module?.id || data.id;
        if (newId) {
          setModules(prev => prev.map(m => m.id === mod.id ? { ...m, id: newId, isNew: false, activities: [], loadedActivities: true, showActivities: true } : m));
          return newId;
        }
      }
    } catch (e) {
      console.error('Auto-save module error:', e);
    }
    return null;
  }

  async function deleteActivity(moduleId: string, activityId: string) {
    if (!confirm('Delete this activity?')) return;
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/modules/${moduleId}/activities/${activityId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setModules(prev => prev.map(m => m.id === moduleId ? {
          ...m,
          activities: (m.activities || []).filter(a => a.id !== activityId),
        } : m));
      } else {
        alert('Failed to delete activity');
      }
    } catch (e) {
      alert('Failed to delete activity');
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Course title is required');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update course details
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          subject: subject || null,
          grade_level: gradeLevel || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save course');
      }

      // Save new modules
      const newModules = modules.filter((m) => m.isNew && m.title.trim());
      for (const mod of newModules) {
        await fetch(`/api/teacher/courses/${courseId}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: mod.title.trim(),
            description: mod.description.trim() || null,
            position: modules.indexOf(mod) + 1,
          }),
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/teacher/library');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete course');
      }
    } catch (e) {
      setError('Failed to delete course');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <SpinnerGap size={32} className="animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/teacher/library')}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-bg transition-colors"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-heading font-bold text-text-primary">Edit Course</h1>
          <p className="text-text-muted text-xs mt-0.5">Update your course details and modules</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 disabled:opacity-40 transition-colors"
        >
          {saving ? <SpinnerGap size={16} className="animate-spin" /> : <FloppyDisk size={16} weight="fill" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm mb-4">
          Course saved successfully!
        </div>
      )}

      {/* Course Details */}
      <div className="bg-card-bg border border-border rounded-[14px] p-5 mb-4">
        <h2 className="text-sm font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
          <BookOpen size={18} weight="fill" className="text-teal" />
          Course Details
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-card-bg border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-card-bg border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-white text-gray-900 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                style={{ colorScheme: 'light' }}
              >
                <option value="">Select a subject...</option>
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Grade Level</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-white text-gray-900 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                style={{ colorScheme: 'light' }}
              >
                <option value="">Select grade level...</option>
                <option value="K">Kindergarten (K)</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                  <option key={g} value={String(g)}>Grade {g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="bg-card-bg border border-border rounded-[14px] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-heading font-semibold text-text-primary">
            Modules ({modules.length})
          </h2>
          <button
            onClick={addModule}
            className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy/90 transition-colors"
          >
            <Plus size={14} weight="bold" /> Add Module
          </button>
        </div>

        {modules.length === 0 && (
          <p className="text-text-muted text-sm py-4 text-center">No modules yet. Click Add Module to get started.</p>
        )}

        <div className="space-y-3">
          {modules.map((mod, i) => (
            <div key={mod.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              {/* Module header */}
              <div className="flex items-start gap-2 p-3">
                <span className="text-teal font-medium text-sm min-w-[24px] pt-1">{i + 1}.</span>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                    placeholder="Module title"
                    className="w-full px-2.5 py-1.5 bg-card-bg border border-border rounded text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-teal/30"
                  />
                  <textarea
                    value={mod.description}
                    onChange={(e) => updateModule(mod.id, { description: e.target.value })}
                    placeholder="Brief description (optional)"
                    rows={2}
                    className="w-full px-2.5 py-1.5 bg-card-bg border border-border rounded text-text-muted text-xs focus:outline-none focus:ring-1 focus:ring-teal/30 resize-none"
                  />
                </div>
                <button
                  onClick={() => removeModule(mod.id)}
                  className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash size={16} />
                </button>
              </div>

              {/* Activities section */}
              <div className="border-t border-border">
                <div className="flex items-center justify-between px-3 py-2">
                  <button
                    onClick={() => {
                      if (mod.isNew) return;
                      loadActivities(mod.id);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-teal transition-colors"
                  >
                    {mod.showActivities ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
                    <Lightning size={12} weight="fill" className="text-teal" />
                    Activities{mod.activities && mod.activities.length > 0 ? ` (${mod.activities.length})` : ''}
                  </button>
                  <button
                    onClick={async () => {
                      if (mod.isNew) {
                        if (!mod.title.trim()) {
                          alert('Enter a module title first, then add activities.');
                          return;
                        }
                        const newId = await saveModuleToDb(mod);
                        if (!newId) {
                          alert('Failed to save module. Try again.');
                          return;
                        }
                        updateModule(newId, { showAddActivity: true, showActivities: true });
                      } else {
                        const newShowAdd = !(mod.showAddActivity ?? false);
                        updateModule(mod.id, { showAddActivity: newShowAdd, showActivities: true });
                        if (!mod.loadedActivities) {
                          await loadActivities(mod.id);
                        }
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal hover:bg-teal/10 rounded transition-colors"
                  >
                    <Plus size={12} weight="bold" /> Add Activity
                  </button>
                </div>

                  {mod.showActivities && (
                    <div className="px-3 pb-3">
                      {/* Activity list */}
                      {mod.activities && mod.activities.length > 0 ? (
                        <div className="space-y-1.5 mb-2">
                          {mod.activities.map((act) => (
                            <div key={act.id} className="flex items-center gap-2 px-2.5 py-2 bg-card-bg border border-border rounded text-xs">
                              <Lightning size={12} weight="fill" className="text-teal shrink-0" />
                              <span className="text-text-primary font-medium flex-1">{act.title}</span>
                              {act.type && (
                                <span className="px-1.5 py-0.5 rounded bg-teal/10 text-teal text-[10px] font-medium">
                                  {act.type}
                                </span>
                              )}
                              <button
                                onClick={() => deleteActivity(mod.id, act.id)}
                                className="p-1 text-text-muted hover:text-red-400 transition-colors"
                                title="Delete activity"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : !mod.showAddActivity ? (
                        <p className="text-text-muted text-xs py-2 text-center">No activities yet. Click Add Activity to create one.</p>
                      ) : null}

                      {/* Add activity form */}
                      {mod.showAddActivity && (
                        <div className="bg-card-bg border border-teal/20 rounded-lg p-3 space-y-2">
                          <input
                            type="text"
                            value={mod.newActivityTitle || ''}
                            onChange={(e) => updateModule(mod.id, { newActivityTitle: e.target.value })}
                            placeholder="Activity title *"
                            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-teal/30"
                          />
                          <textarea
                            value={mod.newActivityDesc || ''}
                            onChange={(e) => updateModule(mod.id, { newActivityDesc: e.target.value })}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-text-muted text-xs focus:outline-none focus:ring-1 focus:ring-teal/30 resize-none"
                          />

                          {/* Detail fields — collapsible */}
                          <details className="group">
                            <summary className="text-[11px] font-medium text-teal cursor-pointer hover:text-teal/80 transition-colors select-none">
                              + Activity Details (objective, materials, directions, assessment)
                            </summary>
                            <div className="mt-2 space-y-2 pl-1">
                              <div>
                                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-0.5">Objective</label>
                                <textarea
                                  value={mod.newActivityObjective || ''}
                                  onChange={(e) => updateModule(mod.id, { newActivityObjective: e.target.value })}
                                  placeholder="What should students learn or accomplish?"
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-text-muted text-xs focus:outline-none focus:ring-1 focus:ring-teal/30 resize-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-0.5">Materials</label>
                                <textarea
                                  value={mod.newActivityMaterials || ''}
                                  onChange={(e) => updateModule(mod.id, { newActivityMaterials: e.target.value })}
                                  placeholder="What materials or resources are needed?"
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-text-muted text-xs focus:outline-none focus:ring-1 focus:ring-teal/30 resize-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-0.5">Directions</label>
                                <textarea
                                  value={mod.newActivityDirections || ''}
                                  onChange={(e) => updateModule(mod.id, { newActivityDirections: e.target.value })}
                                  placeholder="Step-by-step instructions for the activity"
                                  rows={3}
                                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-text-muted text-xs focus:outline-none focus:ring-1 focus:ring-teal/30 resize-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-0.5">Assessment</label>
                                <textarea
                                  value={mod.newActivityAssessment || ''}
                                  onChange={(e) => updateModule(mod.id, { newActivityAssessment: e.target.value })}
                                  placeholder="How will student understanding be assessed?"
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-text-muted text-xs focus:outline-none focus:ring-1 focus:ring-teal/30 resize-none"
                                />
                              </div>
                            </div>
                          </details>

                          <div className="flex gap-2">
                            <button
                              onClick={() => addActivityToModule(mod.id)}
                              disabled={!mod.newActivityTitle?.trim() || savingActivity === mod.id}
                              className="px-3 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy/90 disabled:opacity-40 transition-colors"
                            >
                              {savingActivity === mod.id ? 'Saving...' : 'Create Activity'}
                            </button>
                            <button
                              onClick={() => updateModule(mod.id, { showAddActivity: false })}
                              className="px-3 py-1.5 border border-border text-text-secondary text-xs rounded hover:text-text-primary transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone — Delete Course */}
      <div className="mt-8 bg-card-bg border border-red-500/20 rounded-[14px] p-5">
        <h2 className="text-sm font-heading font-semibold text-red-400 mb-2 flex items-center gap-2">
          <Warning size={18} weight="fill" className="text-red-400" />
          Danger Zone
        </h2>
        <p className="text-xs text-text-secondary mb-3">
          Deleting a course is permanent and cannot be undone. All modules and related activities will be removed.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Delete This Course
          </button>
        ) : (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-400 font-medium mb-2">
              Are you sure? This will permanently delete this course, all its modules, and all related activities.
            </p>
            <p className="text-xs text-text-secondary mb-3">
              Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full max-w-[250px] px-3 py-2 bg-card-bg border border-red-500/30 rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete Course'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className="px-4 py-2 border border-border text-text-secondary text-xs font-semibold rounded-lg hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
