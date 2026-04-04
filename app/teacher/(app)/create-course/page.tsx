'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash,
  DotsSixVertical,
  BookOpen,
  ListBullets,
  CheckCircle,
  SpinnerGap,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

// ─── Constants ───────────────────────────────────────────────────────────────

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

interface ModuleItem {
  id: string;
  title: string;
  description: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Course details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  // Step 2: Modules
  const [modules, setModules] = useState<ModuleItem[]>([]);

  // ─── Step navigation ────────────────────────────────────────────────────────

  function canAdvance() {
    if (step === 1) return title.trim() !== '' && subject !== '';
    if (step === 2) return true; // modules are optional
    return true;
  }

  function nextStep() {
    if (canAdvance() && step < 3) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  // ─── Module helpers ─────────────────────────────────────────────────────────

  function addModule() {
    setModules([
      ...modules,
      { id: crypto.randomUUID(), title: '', description: '' },
    ]);
  }

  function updateModule(id: string, field: 'title' | 'description', value: string) {
    setModules(modules.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  function removeModule(id: string) {
    setModules(modules.filter((m) => m.id !== id));
  }

  function moveModule(index: number, direction: 'up' | 'down') {
    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newModules.length) return;
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    setModules(newModules);
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function handleCreate() {
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // 1. Create the course
      const courseRes = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          subject,
          grade_level: gradeLevel.trim() || null,
          teacher_id: user.id,
        }),
      });

      if (!courseRes.ok) {
        const errData = await courseRes.json();
        throw new Error(errData.error || 'Failed to create course');
      }

      const { course } = await courseRes.json();

      // 2. Create modules sequentially
      const validModules = modules.filter((m) => m.title.trim() !== '');
      for (let i = 0; i < validModules.length; i++) {
        const mod = validModules[i];
        const modRes = await fetch(`/api/teacher/courses/${course.id}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: mod.title.trim(),
            description: mod.description.trim() || null,
            sort_order: i,
            teacher_id: user.id,
          }),
        });

        if (!modRes.ok) {
          console.error(`Failed to create module ${i}:`, await modRes.text());
          // Continue creating remaining modules
        }
      }

      // 3. Redirect to library
      router.push('/teacher/library');
    } catch (err: any) {
      console.error('Create course error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const subjectLabel = SUBJECTS.find((s) => s.value === subject)?.label || '';
  const validModules = modules.filter((m) => m.title.trim() !== '');

  // ─── Steps indicator ────────────────────────────────────────────────────────

  const steps = [
    { num: 1, label: 'Details', icon: BookOpen },
    { num: 2, label: 'Modules', icon: ListBullets },
    { num: 3, label: 'Review', icon: CheckCircle },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/teacher/library')}
          className="flex items-center gap-1 text-text-muted hover:text-text-primary text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} weight="bold" />
          Back to Library
        </button>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Create a Course
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Organize your activities into a structured course with modules.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`h-px w-8 ${
                    isCompleted ? 'bg-teal' : 'bg-border'
                  }`}
                />
              )}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal/10 text-teal'
                    : isCompleted
                    ? 'bg-teal/5 text-teal'
                    : 'text-text-muted'
                }`}
              >
                <Icon size={14} weight={isActive || isCompleted ? 'fill' : 'regular'} />
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6">
        {/* ─── Step 1: Course Details ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Course Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 7th Grade English Literature"
                className="w-full px-3 py-2.5 bg-card-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn in this course?"
                rows={3}
                className="w-full px-3 py-2.5 bg-card-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Subject <span className="text-red-400">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-card-bg border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              >
                <option value="">Select a subject...</option>
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Grade Level
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g. 7th Grade, K-2, 9-12"
                className="w-full px-3 py-2.5 bg-card-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>
          </div>
        )}

        {/* ─── Step 2: Modules ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  Course Modules
                </h2>
                <p className="text-text-muted text-xs mt-0.5">
                  Break your course into units or chapters. You can add activities to each module later.
                </p>
              </div>
              <button
                onClick={addModule}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal/90 transition-colors"
              >
                <Plus size={14} weight="bold" />
                Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 text-text-muted text-sm">
                <ListBullets size={32} className="mx-auto mb-2 opacity-40" />
                <p>No modules yet. Add modules to structure your course.</p>
                <p className="text-xs mt-1">Modules are optional — you can add them later too.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((mod, index) => (
                  <div
                    key={mod.id}
                    className="border border-border rounded-lg p-4 bg-card-bg"
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag handle / reorder */}
                      <div className="flex flex-col items-center gap-0.5 pt-2">
                        <button
                          onClick={() => moveModule(index, 'up')}
                          disabled={index === 0}
                          className="text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <DotsSixVertical size={16} />
                        </button>
                        <span className="text-xs text-text-muted font-medium">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => moveModule(index, 'down')}
                          disabled={index === modules.length - 1}
                          className="text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <DotsSixVertical size={16} />
                        </button>
                      </div>

                      {/* Fields */}
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => updateModule(mod.id, 'title', e.target.value)}
                          placeholder={`Module ${index + 1} title`}
                          className="w-full px-3 py-2 bg-card-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                        />
                        <textarea
                          value={mod.description}
                          onChange={(e) => updateModule(mod.id, 'description', e.target.value)}
                          placeholder="Brief description (optional)"
                          rows={2}
                          className="w-full px-3 py-2 bg-card-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted text-xs focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeModule(mod.id)}
                        className="text-text-muted hover:text-red-400 transition-colors pt-2"
                        title="Remove module"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Step 3: Review & Create ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Review Your Course
            </h2>

            <div className="space-y-3">
              <div className="bg-card-bg border border-border rounded-lg p-4">
                <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                  Course Title
                </div>
                <div className="text-text-primary font-medium">{title}</div>
              </div>

              {description && (
                <div className="bg-card-bg border border-border rounded-lg p-4">
                  <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                    Description
                  </div>
                  <div className="text-text-secondary text-sm">{description}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card-bg border border-border rounded-lg p-4">
                  <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                    Subject
                  </div>
                  <div className="text-text-primary text-sm font-medium">
                    {subjectLabel}
                  </div>
                </div>
                {gradeLevel && (
                  <div className="bg-card-bg border border-border rounded-lg p-4">
                    <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                      Grade Level
                    </div>
                    <div className="text-text-primary text-sm font-medium">
                      {gradeLevel}
                    </div>
                  </div>
                )}
              </div>

              {validModules.length > 0 && (
                <div className="bg-card-bg border border-border rounded-lg p-4">
                  <div className="text-xs text-text-muted uppercase tracking-wide mb-2">
                    Modules ({validModules.length})
                  </div>
                  <ol className="space-y-1.5">
                    {validModules.map((mod, i) => (
                      <li key={mod.id} className="flex items-start gap-2 text-sm">
                        <span className="text-teal font-medium min-w-[20px]">
                          {i + 1}.
                        </span>
                        <div>
                          <span className="text-text-primary">{mod.title}</span>
                          {mod.description && (
                            <span className="text-text-muted ml-1.5 text-xs">
                              — {mod.description}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {validModules.length === 0 && (
                <div className="bg-card-bg border border-border rounded-lg p-4">
                  <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                    Modules
                  </div>
                  <div className="text-text-muted text-sm">
                    No modules — you can add them later from your library.
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2 text-text-secondary hover:text-text-primary text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={16} weight="bold" />
          Back
        </button>

        {step < 3 ? (
          <button
            onClick={nextStep}
            disabled={!canAdvance()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continue
            <ArrowRight size={16} weight="bold" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal/90 disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <>
                <SpinnerGap size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle size={16} weight="fill" />
                Create Course
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
