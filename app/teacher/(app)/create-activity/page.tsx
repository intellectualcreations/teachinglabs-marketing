'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  CloudArrowUp,
  Link as LinkIcon,
  MagicWand,
  NotePencil,
  Lightbulb,
  Books,
  CheckCircle,
  X,
  Plus,
  FilePdf,
  FileDoc,
  FilePpt,
  FileXls,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileCsv,
  File,
  ShieldCheck,
  PlusCircle as PlusCircleIcon,
  Check,
  MagnifyingGlass,
  Target,
  Sparkle,
  CaretDown,
} from '@phosphor-icons/react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Standard {
  id: string;
  code: string;
  shortCode: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  framework: string;
}

interface UploadedFile {
  name: string;
  size: number;
}

interface LinkRow {
  id: string;
  url: string;
  label: string;
}

// ─── Standards helpers ────────────────────────────────────────────────────────

function stdText(s: Standard) {
  return s.title || s.description;
}
function stdCode(s: Standard) {
  return s.shortCode || s.code;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, React.ElementType> = {
    pdf: FilePdf,
    doc: FileDoc,
    docx: FileDoc,
    ppt: FilePpt,
    pptx: FilePpt,
    xls: FileXls,
    xlsx: FileXls,
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    mp4: FileVideo,
    mov: FileVideo,
    avi: FileVideo,
    mp3: FileAudio,
    wav: FileAudio,
    txt: FileText,
    csv: FileCsv,
  };
  return map[ext] ?? File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateActivityPage() {
  // Files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Standards
  const [selectedStandards, setSelectedStandards] = useState<Standard[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedStandards, setSuggestedStandards] = useState<Standard[]>([]);
  const [standardsSearch, setStandardsSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Standard[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableFrameworks, setAvailableFrameworks] = useState<string[]>([]);
  const [showStandardsModal, setShowStandardsModal] = useState(false);

  // Links
  const [linkRows, setLinkRows] = useState<LinkRow[]>([{ id: uid(), url: '', label: '' }]);

  // Details
  const [activityName, setActivityName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [enhanced, setEnhanced] = useState(false);
  const [guidance, setGuidance] = useState('');

  // Course/Module assignment (optional — activities can be orphaned)
  const [courses, setCourses] = useState<{ id: string; title: string; subject: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  // TODO: wire to real profile data
  const [hasFrameworksSelected] = useState(false);
  const [objective, setObjective] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [essentialQuestion, setEssentialQuestion] = useState('');
  const [activityMaterials, setActivityMaterials] = useState('');
  const [vocabulary, setVocabulary] = useState('');
  const [activityDirections, setActivityDirections] = useState('');
  const [activityHook, setActivityHook] = useState('');
  const [activityAssessment, setActivityAssessment] = useState('');
  const [differentiation, setDifferentiation] = useState('');

  // Success overlay
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load courses for the current teacher
  useEffect(() => {
    async function loadCourses() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const res = await fetch(`/api/teacher/courses?teacherId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setCourses((data.courses || []).map((c: { id: string; title: string; subject: string }) => ({ id: c.id, title: c.title, subject: c.subject })));
        }
      } catch { /* courses table may not exist yet */ }
      setCoursesLoaded(true);
    }
    loadCourses();
  }, []);

  // Load modules when course changes
  useEffect(() => {
    if (!selectedCourseId) { setModules([]); setSelectedModuleId(''); return; }
    fetch(`/api/teacher/courses/${selectedCourseId}/modules`)
      .then(r => r.json())
      .then(data => setModules(data.modules || []))
      .catch(() => setModules([]));
  }, [selectedCourseId]);

  // Load filter options on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/standards?subjects=true').then((r) => r.json()),
      fetch('/api/standards?grades=true').then((r) => r.json()),
      fetch('/api/standards?frameworks=true').then((r) => r.json()),
    ]).then(([subj, gr, fw]) => {
      setAvailableSubjects(subj.subjects || []);
      setAvailableGrades(gr.grades || []);
      setAvailableFrameworks(fw.frameworks || []);
    });
  }, []);

  // Debounced search (used inside modal)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (standardsSearch.length < 2 && !subjectFilter && !gradeFilter && !frameworkFilter) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (standardsSearch.length >= 2) params.set('q', standardsSearch);
      if (subjectFilter) params.set('subject', subjectFilter);
      if (gradeFilter) params.set('grade', gradeFilter);
      if (frameworkFilter) params.set('framework', frameworkFilter);
      fetch(`/api/standards?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setSearchResults((data.standards || []).slice(0, 12));
          setSearchLoading(false);
        })
        .catch(() => setSearchLoading(false));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [standardsSearch, subjectFilter, gradeFilter, frameworkFilter]);

  // ── File handling ────────────────────────────────────────────────────────────

  function addFiles(fileList: FileList) {
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, []);

  // ── Standards ────────────────────────────────────────────────────────────────

  function isSelected(code: string) {
    return selectedStandards.some((s) => s.code === code || s.shortCode === code);
  }

  function toggleStandard(standard: Standard) {
    setSelectedStandards((prev) =>
      prev.some((s) => s.id === standard.id)
        ? prev.filter((s) => s.id !== standard.id)
        : [...prev, standard]
    );
  }

  // Mock: simulate Teaching Twin suggesting standards based on activity description
  function triggerSuggestions() {
    if (!instructions.trim()) return;
    fetch('/api/standards?q=fractions&subject=Math&grade=5')
      .then((r) => r.json())
      .then((data) => {
        setSuggestedStandards((data.standards || []).slice(0, 4));
        setShowSuggestions(true);
      })
      .catch(() => setShowSuggestions(true));
  }

  // ── Links ────────────────────────────────────────────────────────────────────

  function addLinkRow() {
    setLinkRows((prev) => [...prev, { id: uid(), url: '', label: '' }]);
  }

  function removeLinkRow(id: string) {
    setLinkRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateLink(id: string, field: 'url' | 'label', value: string) {
    setLinkRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  // ── Enhance instructions ─────────────────────────────────────────────────────

  function handleEnhance() {
    if (!instructions.trim()) {
      setInstructions(
        'Complete the worksheet by solving each problem. Show all your work, including how you found common denominators. If you get stuck, ask your teacher for help. You can use drawings or diagrams to explain your thinking.'
      );
    }
    setEnhanced(true);
    // Also trigger suggestions mock
    triggerSuggestions();
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [generatingLessonIdea, setGeneratingLessonIdea] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorSubject, setGeneratorSubject] = useState('');
  const [generatorGrade, setGeneratorGrade] = useState('');
  const [generating, setGenerating] = useState(false);

  async function generateWithAI() {
    if (!generatingLessonIdea.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/teacher/activities/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: generatingLessonIdea.trim(),
          subject: generatorSubject || undefined,
          gradeLevel: generatorGrade || undefined,
        }),
      });
      if (res.ok) {
        const { activity } = await res.json();
        // Fill all fields
        if (!activityName.trim()) setActivityName(generatingLessonIdea.trim());
        if (activity.objective) setObjective(activity.objective);
        if (activity.learning_goal) setLearningGoal(activity.learning_goal);
        if (activity.essential_question) setEssentialQuestion(activity.essential_question);
        if (activity.materials) setActivityMaterials(activity.materials);
        if (activity.vocabulary) setVocabulary(activity.vocabulary);
        if (activity.hook) setActivityHook(activity.hook);
        if (activity.directions) setActivityDirections(activity.directions);
        if (activity.assessment) setActivityAssessment(activity.assessment);
        if (activity.differentiation) setDifferentiation(activity.differentiation);
        setShowGenerator(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Generation failed: ${err.error || res.statusText}`);
      }
    } catch (e) {
      console.error('AI generation error:', e);
      alert('Something went wrong. Try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function saveActivity() {
    if (!activityName.trim()) {
      setNameError(true);
      document.getElementById('activity-name')?.focus();
      return;
    }
    setNameError(false);
    setSaving(true);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const teacherId = user?.id || 'c419128e-2868-47b7-8eaf-82c43a52c8bf';

      const payload: Record<string, unknown> = {
        title: activityName.trim(),
        description: instructions.trim() || null,
        objective: objective.trim() || null,
        learning_goal: learningGoal.trim() || null,
        essential_question: essentialQuestion.trim() || null,
        materials: activityMaterials.trim() || null,
        vocabulary: vocabulary.trim() || null,
        directions: activityDirections.trim() || null,
        hook: activityHook.trim() || null,
        assessment: activityAssessment.trim() || null,
        differentiation: differentiation.trim() || null,
        teacher_id: teacherId,
      };

      // If course + module selected, attach; otherwise create orphaned
      let url = '/api/teacher/activities';
      if (selectedCourseId && selectedModuleId) {
        url = `/api/teacher/courses/${selectedCourseId}/modules/${selectedModuleId}/activities`;
      } else if (selectedCourseId) {
        payload.course_id = selectedCourseId;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessTitle(activityName.trim());
        setSuccessVisible(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to save activity: ${err.error || res.statusText}`);
      }
    } catch (e) {
      console.error('Save activity error:', e);
      alert('Something went wrong saving the activity. Check console for details.');
    } finally {
      setSaving(false);
    }
  }

  function createAnother() {
    setSuccessVisible(false);
    setActivityName('');
    setInstructions('');
    setGuidance('');
    setObjective('');
    setLearningGoal('');
    setEssentialQuestion('');
    setActivityMaterials('');
    setVocabulary('');
    setActivityDirections('');
    setActivityHook('');
    setActivityAssessment('');
    setDifferentiation('');
    setUploadedFiles([]);
    setSelectedStandards([]);
    setLinkRows([{ id: uid(), url: '', label: '' }]);
    setShowSuggestions(false);
    setEnhanced(false);
    setNameError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openStandardsModal() {
    setStandardsSearch('');
    setSubjectFilter('');
    setGradeFilter('');
    setFrameworkFilter('');
    setSearchResults([]);
    setShowStandardsModal(true);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="font-heading font-extrabold text-2xl text-text-primary flex items-center gap-2.5 mb-1.5">
          <PlusCircle size={24} weight="fill" className="text-teal" />
          Create Activity
        </h1>
        <p className="text-sm text-text-secondary">
          Upload what you already use. Your Teaching Twin will learn it and help your students.
        </p>
      </div>

      {/* ── AI Lesson Generator ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-teal/10 border border-indigo-400/30 rounded-[14px] p-5 mb-5">
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Sparkle size={20} weight="fill" className="text-indigo-400" />
            </div>
            <div>
              <div className="font-heading font-bold text-[15px] text-text-primary flex items-center gap-2">
                ✨ AI Lesson Generator
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider">Premium</span>
              </div>
              <p className="text-[12px] text-text-secondary mt-0.5">Describe your lesson idea and AI fills in all the details</p>
            </div>
          </div>
          <CaretDown size={16} className={['text-text-secondary transition-transform', showGenerator ? 'rotate-180' : ''].join(' ')} />
        </button>

        {showGenerator && (
          <div className="mt-4 space-y-3">
            <textarea
              value={generatingLessonIdea}
              onChange={(e) => setGeneratingLessonIdea(e.target.value)}
              placeholder='e.g. "3rd grade science, layers of the Earth, hands-on model building"'
              rows={2}
              className="w-full px-3.5 py-2.5 border-[1.5px] border-indigo-400/30 rounded-lg text-sm
                bg-[#1a1f2e] text-text-primary outline-none focus:border-indigo-400 transition-colors resize-none"
            />
            <div className="flex gap-2">
              <select
                value={generatorSubject}
                onChange={(e) => setGeneratorSubject(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-[#1a1f2e] text-text-primary"
              >
                <option value="">Subject (optional)</option>
                <option value="Math">Math</option>
                <option value="English Language Arts">ELA</option>
                <option value="Science">Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Physical Education">PE</option>
              </select>
              <select
                value={generatorGrade}
                onChange={(e) => setGeneratorGrade(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-[#1a1f2e] text-text-primary"
              >
                <option value="">Grade (optional)</option>
                <option value="Kindergarten">Kindergarten</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                  <option key={g} value={`Grade ${g}`}>Grade {g}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateWithAI}
              disabled={!generatingLessonIdea.trim() || generating}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 text-white
                rounded-lg text-sm font-bold hover:bg-indigo-600 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkle size={16} weight="fill" />
              {generating ? 'Generating Lesson Plan...' : 'Generate with AI'}
            </button>
          </div>
        )}
      </div>

      {/* ── Reminder Banner ────────────────────────────────────────────────────── */}
      <div className="bg-teal/[0.06] border border-teal/20 rounded-[10px] p-4 mb-5">
        <p className="text-[13px] text-text-secondary leading-relaxed">
          💡 You can reuse this activity with multiple groups of students. Assign due dates and classes later — just focus on the activity itself for now.
        </p>
      </div>

      {/* ── Card 1: Activity Name + Description ───────────────────────────────── */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-navy" />

        <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-1.5">
          <NotePencil size={18} weight="fill" className="text-navy" />
          Activity Details
        </h2>
        <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
          Give this activity a name and describe what students will do.
        </p>

        {/* Activity Name */}
        <div className="mb-4">
          <label className="font-semibold text-[13px] text-text-primary block mb-1.5">
            Activity Name
          </label>
          <input
            id="activity-name"
            type="text"
            value={activityName}
            onChange={(e) => { setActivityName(e.target.value); setNameError(false); }}
            placeholder="e.g., Adding Fractions with Unlike Denominators"
            className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-lg text-sm bg-card-bg
              text-text-primary outline-none transition-colors
              ${nameError ? 'border-red-500' : 'border-border focus:border-teal'}`}
          />
          {nameError && (
            <p className="text-xs text-red-500 mt-1">Activity name is required.</p>
          )}
        </div>

        {/* Course & Module (optional) */}
        {coursesLoaded && courses.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-semibold text-[13px] text-text-primary block mb-1.5">
                Course <span className="font-normal text-xs text-text-secondary">(optional)</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                  bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
              >
                <option value="">No course (orphaned activity)</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-[13px] text-text-primary block mb-1.5">
                Module <span className="font-normal text-xs text-text-secondary">(optional)</span>
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                disabled={!selectedCourseId || modules.length === 0}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                  bg-card-bg text-text-primary outline-none focus:border-teal transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{selectedCourseId ? (modules.length ? 'Select a module' : 'No modules yet') : 'Select a course first'}</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Activity Description (was "Student Instructions") */}
        <div>
          <label className="font-semibold text-[13px] text-text-primary flex items-center gap-1.5 mb-1.5">
            Activity Description
            <span className="font-normal text-xs text-text-secondary">(optional)</span>
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder="Tell about the activity — what students will learn or do."
            className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
              bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
          />
          <button
            onClick={handleEnhance}
            className={`mt-2 flex items-center gap-1 px-3 py-1.5 border rounded-md text-xs font-semibold
              cursor-pointer transition-colors bg-transparent
              ${enhanced
                ? 'border-emerald-500 text-emerald-500'
                : 'border-border text-teal hover:border-teal'
              }`}
          >
            {enhanced
              ? <><Check size={14} weight="bold" /> Enhanced!</>
              : <><MagicWand size={14} weight="fill" /> Enhance with Teaching Twin</>
            }
          </button>
        </div>
      </div>

      {/* ── Activity Details (Objective, Materials, Directions, Assessment) ── */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal" />

        <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-1.5">
          📋 Activity Planning
        </h2>
        <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
          These details help your Teaching Twin guide students more effectively. All fields are optional.
        </p>

        <div className="space-y-4">
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Objective</label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={2}
              placeholder="What should students learn or accomplish?"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Learning Goal</label>
            <textarea
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              rows={2}
              placeholder="The big idea — what students will understand"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Essential Question</label>
            <textarea
              value={essentialQuestion}
              onChange={(e) => setEssentialQuestion(e.target.value)}
              rows={1}
              placeholder='e.g. &quot;What are the layers of the Earth, and how are they different?&quot;'
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Materials</label>
            <textarea
              value={activityMaterials}
              onChange={(e) => setActivityMaterials(e.target.value)}
              rows={2}
              placeholder="What materials or resources are needed?"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Vocabulary</label>
            <textarea
              value={vocabulary}
              onChange={(e) => setVocabulary(e.target.value)}
              rows={2}
              placeholder="Key terms students need to know (one per line)"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Introduction / Hook</label>
            <textarea
              value={activityHook}
              onChange={(e) => setActivityHook(e.target.value)}
              rows={2}
              placeholder="How to grab attention and set up the lesson"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Directions</label>
            <textarea
              value={activityDirections}
              onChange={(e) => setActivityDirections(e.target.value)}
              rows={3}
              placeholder="Step-by-step instructions for the activity"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Assessment</label>
            <textarea
              value={activityAssessment}
              onChange={(e) => setActivityAssessment(e.target.value)}
              rows={2}
              placeholder="How will student understanding be assessed?"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
          <div>
            <label className="font-semibold text-[13px] text-text-primary block mb-1.5">Differentiation</label>
            <textarea
              value={differentiation}
              onChange={(e) => setDifferentiation(e.target.value)}
              rows={3}
              placeholder="Support options for struggling learners + extension options for advanced learners"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
            />
          </div>
        </div>
      </div>

      {/* ── Card 2: Standards ──────────────────────────────────────────────────── */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal" />

        <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-1.5">
          <Target size={18} weight="fill" className="text-teal" />
          Standards Alignment
        </h2>
        <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
          Tag this activity with the standards it covers. Your Teaching Twin can suggest matches based on what you described above.
        </p>

        {/* Conditional: no frameworks selected in profile */}
        {!hasFrameworksSelected && (
          <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-[10px] p-3 mb-4">
            <p className="text-[13px] text-text-secondary leading-relaxed">
              For your Twin to suggest standards, select frameworks in your{' '}
              <Link href="/teacher/settings" className="text-teal font-medium hover:underline">
                profile
              </Link>.
            </p>
          </div>
        )}

        {/* Teaching Twin suggestions */}
        {showSuggestions && suggestedStandards.length > 0 && (
          <div className="bg-teal/[0.06] border border-teal/20 rounded-[10px] p-4 mb-4">
            <p className="text-[12px] text-text-secondary mb-2 leading-relaxed">
              Based on your activity details, your Teaching Twin suggests these standards.
            </p>
            <div className="flex items-center gap-2 mb-2.5 font-semibold text-[13px] text-teal">
              <MagicWand size={18} weight="fill" />
              Your Teaching Twin found these standards
            </div>
            <div className="flex flex-wrap">
              {suggestedStandards.map((s) => {
                const sel = isSelected(s.code);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStandard(s)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] rounded-lg
                      text-xs font-medium text-text-primary cursor-pointer transition-all mr-1.5 mb-1.5
                      ${sel
                        ? 'border-teal bg-teal/[0.08]'
                        : 'border-border bg-card-bg hover:border-teal'
                      }`}
                  >
                    <span className="font-bold text-teal">{stdCode(s)}</span>
                    {stdText(s)}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-text-secondary mt-2">
              Click to select. You can also search for more standards below.
            </p>
          </div>
        )}

        {/* Selected standards chips */}
        {selectedStandards.length > 0 && (
          <div className="flex flex-wrap mb-3">
            {selectedStandards.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleStandard(s)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-teal
                  bg-teal/[0.08] rounded-lg text-xs font-medium text-text-primary cursor-pointer
                  transition-all mr-1.5 mb-1.5 hover:bg-teal/[0.14]"
              >
                <span className="font-bold text-teal">{stdCode(s)}</span>
                {stdText(s)}
                <X size={12} weight="bold" className="text-text-secondary" />
              </button>
            ))}
          </div>
        )}

        {/* Search button — opens modal */}
        <button
          onClick={openStandardsModal}
          className="flex items-center gap-2 px-4 py-2.5 border-[1.5px] border-dashed border-border
            rounded-lg text-teal text-[13px] font-semibold hover:border-teal cursor-pointer
            transition-colors bg-transparent w-full justify-center"
        >
          <MagnifyingGlass size={16} weight="bold" />
          Search &amp; Add Standards
        </button>
      </div>

      {/* ── Card 3: Materials & Web Links ──────────────────────────────────────── */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal" />

        <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-1.5">
          <CloudArrowUp size={18} weight="fill" className="text-teal" />
          Materials &amp; Web Links
        </h2>
        <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
          Drop in the worksheets, handouts, videos, or anything else you already use. Your Teaching Twin reads them all to help guide students.
        </p>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragOver
              ? 'border-teal bg-teal/[0.05]'
              : 'border-border hover:border-teal hover:bg-teal/[0.03]'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <CloudArrowUp size={36} weight="fill" className="text-teal mx-auto" />
          <div className="font-semibold text-sm text-text-primary mt-2 mb-1">
            Drop any files here or click to browse
          </div>
          <div className="text-xs text-text-secondary mb-1 leading-relaxed">
            Worksheets, answer keys, rubrics, videos, audio, images, or anything else you use.
          </div>
          <div className="text-[11px] text-text-secondary opacity-70">
            Any file type, up to 25MB each
          </div>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {uploadedFiles.map((f, i) => {
              const Icon = getFileIcon(f.name);
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 bg-surface border border-border rounded-lg"
                >
                  <Icon size={20} weight="fill" className="text-teal shrink-0" />
                  <span className="flex-1 text-[13px] font-medium text-text-primary truncate">{f.name}</span>
                  <span className="text-[11px] text-text-secondary shrink-0">{formatSize(f.size)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="text-text-secondary hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remove"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Web Links */}
        <div className="mt-4">
          <label className="font-semibold text-[13px] text-text-primary flex items-center gap-1.5 mb-1">
            <LinkIcon size={16} weight="fill" className="text-teal" />
            Web Links
            <span className="font-normal text-xs text-text-secondary">(optional)</span>
          </label>
          <p className="text-xs text-text-secondary mb-2.5 leading-relaxed">
            Practice sites, videos, or references you want students to use.
          </p>

          <div className="space-y-2">
            {linkRows.map((row) => (
              <div key={row.id} className="flex gap-2">
                <input
                  type="url"
                  value={row.url}
                  onChange={(e) => updateLink(row.id, 'url', e.target.value)}
                  placeholder="https://www.khanacademy.org/..."
                  className="flex-1 px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-[13px]
                    bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
                />
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateLink(row.id, 'label', e.target.value)}
                  placeholder="Label (optional)"
                  className="w-40 px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-[13px]
                    bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
                />
                {linkRows.length > 1 && (
                  <button
                    onClick={() => removeLinkRow(row.id)}
                    className="text-text-secondary hover:text-red-500 transition-colors px-2 cursor-pointer"
                    title="Remove"
                  >
                    <X size={16} weight="bold" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addLinkRow}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3.5 py-2
              border-[1.5px] border-dashed border-border rounded-lg text-teal text-xs font-semibold
              hover:border-teal cursor-pointer transition-colors bg-transparent"
          >
            <Plus size={14} weight="bold" /> Add another link
          </button>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-2.5 p-3.5 bg-teal/[0.06] border border-teal/20 rounded-[10px] mt-4">
          <ShieldCheck size={18} weight="fill" className="text-teal shrink-0 mt-px" />
          <div className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Your materials stay private.</strong> Files you upload are only used by your Teaching Twin in your classroom. They are never shared with other teachers, schools, or used to train models.
          </div>
        </div>
      </div>

      {/* ── Card 4: Guidance ───────────────────────────────────────────────────── */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F59E0B]" />

        <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-1.5">
          <Lightbulb size={18} weight="fill" className="text-[#F59E0B]" />
          Guidance for Your Teaching Twin
          <span className="font-normal text-[13px] text-text-secondary">(optional)</span>
        </h2>
        <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
          Anything you&apos;d tell a substitute teacher about helping students with this activity. Your Twin uses this to guide students the way you would.
        </p>
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          rows={4}
          placeholder="e.g., Students usually struggle with finding common denominators. Encourage them to draw it out first. If they get stuck, remind them to find the LCD before adding."
          className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
            bg-card-bg text-text-primary outline-none focus:border-teal transition-colors resize-y"
        />
      </div>

      {/* ── Save Button ────────────────────────────────────────────────────────── */}
      <button
        onClick={saveActivity}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-7 bg-teal text-navy
          rounded-[10px] text-[15px] font-heading font-bold cursor-pointer
          hover:bg-teal/85 hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Books size={18} weight="fill" />
        {saving ? 'Saving...' : 'Save to Library'}
      </button>
      <p className="text-xs text-text-secondary text-center mt-2">
        You can assign this activity to classes after saving.
      </p>

      {/* ── Standards Search Modal ─────────────────────────────────────────────── */}
      {showStandardsModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowStandardsModal(false)}
        >
          <div
            className="bg-[#1a1f2e] border border-border rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
                <Target size={20} weight="fill" className="text-teal" />
                Add Standards
              </h3>
              <button
                onClick={() => setShowStandardsModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors p-1 cursor-pointer"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {/* Filter row */}
              <div className="flex flex-wrap gap-2 mb-3">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-2.5 py-2 border-[1.5px] border-border rounded-lg text-xs bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-2.5 py-2 border-[1.5px] border-border rounded-lg text-xs bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
                >
                  <option value="">All Grades</option>
                  {availableGrades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <select
                  value={frameworkFilter}
                  onChange={(e) => setFrameworkFilter(e.target.value)}
                  className="px-2.5 py-2 border-[1.5px] border-border rounded-lg text-xs bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
                >
                  <option value="">All Frameworks</option>
                  {availableFrameworks.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Search input */}
              <div className="relative mb-4">
                <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={standardsSearch}
                  onChange={(e) => setStandardsSearch(e.target.value)}
                  placeholder="Search standards (e.g., 5.NF or 'fractions')"
                  className="w-full pl-9 pr-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                    bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
                  autoFocus
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Results list */}
              {searchResults.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  {searchResults.map((s) => {
                    const sel = isSelected(s.code);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleStandard(s)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 cursor-pointer border-b border-border
                          text-[13px] transition-colors last:border-0
                          ${sel ? 'bg-teal/[0.06]' : 'hover:bg-teal/[0.06]'}`}
                      >
                        {sel
                          ? <CheckCircle size={16} weight="fill" className="text-teal shrink-0" />
                          : <PlusCircleIcon size={16} weight="fill" className="text-text-secondary shrink-0" />
                        }
                        <span className="flex-1">
                          <strong className="text-teal">{stdCode(s)}</strong>{' '}
                          <span className="text-text-primary">{stdText(s)}</span>
                          <span className="text-text-muted text-[11px] ml-1">({s.framework} · Grade {s.gradeLevel})</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                standardsSearch.length >= 2 && !searchLoading && (
                  <p className="text-sm text-text-secondary text-center py-6">No standards found. Try a different search.</p>
                )
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-text-secondary">
                {selectedStandards.length} standard{selectedStandards.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => setShowStandardsModal(false)}
                className="px-5 py-2.5 bg-teal text-navy rounded-lg text-[13px] font-semibold
                  cursor-pointer hover:bg-teal/85 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Overlay ────────────────────────────────────────────────────── */}
      {successVisible && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-card-bg rounded-2xl p-10 text-center max-w-md w-[90%] shadow-2xl">
            <CheckCircle size={48} weight="fill" className="text-teal mx-auto mb-4" />
            <div className="font-heading font-bold text-xl text-text-primary mb-2">
              Activity Saved to Library!
            </div>
            <div className="text-sm text-text-secondary mb-6 leading-relaxed">
              &ldquo;{successTitle}&rdquo; is now in your Library. You can assign it to any class from there.
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={createAnother}
                className="px-5 py-2.5 border-[1.5px] border-border rounded-lg text-[13px] font-semibold
                  text-text-primary cursor-pointer hover:border-teal hover:text-teal transition-colors"
              >
                Create Another
              </button>
              <a
                href="/teacher/library"
                className="px-5 py-2.5 bg-teal text-navy rounded-lg text-[13px] font-semibold
                  cursor-pointer hover:bg-teal/85 transition-colors"
              >
                Go to Library
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
