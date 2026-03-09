'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
} from '@phosphor-icons/react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Standard {
  code: string;
  text: string;
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

// ─── Standards database ───────────────────────────────────────────────────────

const STANDARDS_DB: Standard[] = [
  { code: '5.NF.A.1', text: 'Add and subtract fractions with unlike denominators' },
  { code: '5.NF.A.2', text: 'Solve word problems involving addition and subtraction of fractions' },
  { code: '5.NF.B.3', text: 'Interpret a fraction as division of the numerator by the denominator' },
  { code: '5.NF.B.4', text: 'Apply and extend previous understandings of multiplication to multiply a fraction' },
  { code: '5.NF.B.5', text: 'Interpret multiplication as scaling (resizing)' },
  { code: '5.NF.B.6', text: 'Solve real world problems involving multiplication of fractions and mixed numbers' },
  { code: '5.NF.B.7', text: 'Apply and extend previous understandings of division to divide unit fractions' },
  { code: '5.OA.A.1', text: 'Use parentheses, brackets, or braces in numerical expressions' },
  { code: '5.OA.A.2', text: 'Write simple expressions that record calculations with numbers' },
  { code: '5.NBT.A.1', text: 'Recognize that in a multi-digit number, a digit in one place represents 10 times' },
  { code: '5.NBT.B.5', text: 'Fluently multiply multi-digit whole numbers' },
  { code: '5.NBT.B.7', text: 'Add, subtract, multiply, and divide decimals to hundredths' },
  { code: '4.NF.A.1', text: 'Explain why a fraction a/b is equivalent to (n x a)/(n x b)' },
  { code: '4.NF.A.2', text: 'Compare two fractions with different numerators and different denominators' },
  { code: '4.NF.B.3', text: 'Understand a fraction a/b with a > 1 as a sum of fractions 1/b' },
  { code: '4.NF.B.4', text: 'Apply and extend previous understandings of multiplication to multiply a fraction by a whole number' },
  { code: '6.RP.A.1', text: 'Understand the concept of a ratio' },
  { code: '6.RP.A.2', text: 'Understand the concept of a unit rate' },
  { code: '6.RP.A.3', text: 'Use ratio and rate reasoning to solve real-world problems' },
  { code: '6.EE.A.1', text: 'Write and evaluate numerical expressions involving whole-number exponents' },
  { code: '6.EE.A.2', text: 'Write, read, and evaluate expressions in which letters stand for numbers' },
  { code: 'RL.5.1', text: 'Quote accurately from a text when explaining what the text says' },
  { code: 'RL.5.2', text: 'Determine a theme of a story, drama, or poem from details in the text' },
  { code: 'RL.5.3', text: 'Compare and contrast two or more characters, settings, or events' },
  { code: 'RI.5.1', text: 'Quote accurately from a text when explaining inferences drawn from the text' },
  { code: 'W.5.1', text: 'Write opinion pieces on topics or texts, supporting a point of view with reasons' },
  { code: 'W.5.2', text: 'Write informative/explanatory texts to examine a topic' },
  { code: 'W.5.3', text: 'Write narratives to develop real or imagined experiences or events' },
  { code: '5-ESS1-1', text: 'Support an argument that the apparent brightness of the sun and stars is related to their distance' },
  { code: '5-PS1-1', text: 'Develop a model to describe that matter is made of particles too small to be seen' },
  { code: '5-LS1-1', text: 'Support an argument that plants get the materials they need for growth from water and air' },
];

const SUGGESTED_STANDARDS: Standard[] = [
  { code: '5.NF.A.1', text: 'Add and subtract fractions with unlike denominators' },
  { code: '5.NF.A.2', text: 'Solve word problems involving addition and subtraction of fractions' },
  { code: '4.NF.B.3', text: 'Understand a fraction a/b with a > 1 as a sum of fractions 1/b' },
];

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
  const [standardsSearch, setStandardsSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Links
  const [linkRows, setLinkRows] = useState<LinkRow[]>([{ id: uid(), url: '', label: '' }]);

  // Details
  const [activityName, setActivityName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [enhanced, setEnhanced] = useState(false);
  const [guidance, setGuidance] = useState('');

  // Success overlay
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── File handling ────────────────────────────────────────────────────────────

  function addFiles(fileList: FileList) {
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    // Simulate Teaching Twin analysis
    setTimeout(() => setShowSuggestions(true), 800);
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
    return selectedStandards.some((s) => s.code === code);
  }

  function toggleStandard(standard: Standard) {
    setSelectedStandards((prev) =>
      prev.some((s) => s.code === standard.code)
        ? prev.filter((s) => s.code !== standard.code)
        : [...prev, standard]
    );
  }

  const filteredStandards =
    standardsSearch.length >= 2
      ? STANDARDS_DB.filter((s) => {
          const q = standardsSearch.toLowerCase();
          return s.code.toLowerCase().includes(q) || s.text.toLowerCase().includes(q);
        }).slice(0, 8)
      : [];

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

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
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  function saveActivity() {
    if (!activityName.trim()) {
      setNameError(true);
      document.getElementById('activity-name')?.focus();
      return;
    }
    setNameError(false);
    setSuccessTitle(activityName.trim());
    setSuccessVisible(true);
  }

  function createAnother() {
    setSuccessVisible(false);
    setActivityName('');
    setInstructions('');
    setGuidance('');
    setUploadedFiles([]);
    setSelectedStandards([]);
    setLinkRows([{ id: uid(), url: '', label: '' }]);
    setShowSuggestions(false);
    setEnhanced(false);
    setNameError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page Header */}
      <div className="mb-7">
        <h1 className="font-heading font-extrabold text-2xl text-text-primary flex items-center gap-2.5 mb-1.5">
          <PlusCircle size={24} weight="fill" className="text-teal" />
          Create Activity
        </h1>
        <p className="text-sm text-text-secondary">
          Upload what you already use. Your Teaching Twin will learn it and help your students.
        </p>
      </div>

      {/* ── Card 1: Materials ──────────────────────────────────────────────────── */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6 mb-5 relative overflow-hidden">
        {/* Teal accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal" />

        <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-1.5">
          <CloudArrowUp size={18} weight="fill" className="text-teal" />
          Your Materials
        </h2>
        <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
          Drop in the worksheets, handouts, videos, or anything else you already use. Your Teaching Twin reads them all and suggests which standards they cover.
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
            {linkRows.map((row, idx) => (
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

        {/* Standards Suggestion (shown after upload) */}
        {showSuggestions && (
          <div className="mt-4 bg-teal/[0.06] border border-teal/20 rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-2.5 font-semibold text-[13px] text-teal">
              <MagicWand size={18} weight="fill" />
              Your Teaching Twin found these standards
            </div>
            <div className="flex flex-wrap">
              {SUGGESTED_STANDARDS.map((s) => {
                const sel = isSelected(s.code);
                return (
                  <button
                    key={s.code}
                    onClick={() => toggleStandard(s)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] rounded-lg
                      text-xs font-medium text-text-primary cursor-pointer transition-all mr-1.5 mb-1.5
                      ${sel
                        ? 'border-teal bg-teal/[0.08]'
                        : 'border-border bg-card-bg hover:border-teal'
                      }`}
                  >
                    <span className="font-bold text-teal">{s.code}</span>
                    {s.text}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-text-secondary mt-2">
              Click to select. You can also search for standards below.
            </p>
          </div>
        )}

        {/* Privacy notice */}
        <div className="flex items-start gap-2.5 p-3.5 bg-teal/[0.06] border border-teal/20 rounded-[10px] mt-4">
          <ShieldCheck size={18} weight="fill" className="text-teal shrink-0 mt-px" />
          <div className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Your materials stay private.</strong> Files you upload are only used by your Teaching Twin in your classroom. They are never shared with other teachers, schools, or used to train models.
          </div>
        </div>
      </div>

      {/* ── Card 2: Activity Details ───────────────────────────────────────────── */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6 mb-5 relative overflow-hidden">
        {/* Navy accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-navy" />

        <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-1.5">
          <NotePencil size={18} weight="fill" className="text-navy" />
          Activity Details
        </h2>
        <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
          Give this activity a name and tell your students what to do.
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

        {/* Standards Alignment */}
        <div className="mb-4">
          <label className="font-semibold text-[13px] text-text-primary block mb-1.5">
            Standards Alignment
          </label>

          {/* Selected chips */}
          {selectedStandards.length > 0 && (
            <div className="flex flex-wrap mb-2">
              {selectedStandards.map((s) => (
                <button
                  key={s.code}
                  onClick={() => toggleStandard(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-teal
                    bg-teal/[0.08] rounded-lg text-xs font-medium text-text-primary cursor-pointer
                    transition-all mr-1.5 mb-1.5 hover:bg-teal/[0.14]"
                >
                  <span className="font-bold text-teal">{s.code}</span>
                  {s.text}
                  <X size={12} weight="bold" className="text-text-secondary" />
                </button>
              ))}
            </div>
          )}

          {/* Search input + dropdown */}
          <div className="relative">
            <input
              ref={searchRef}
              type="text"
              value={standardsSearch}
              onChange={(e) => {
                setStandardsSearch(e.target.value);
                setShowDropdown(e.target.value.length >= 2);
              }}
              onFocus={() => {
                if (standardsSearch.length >= 2) setShowDropdown(true);
              }}
              placeholder="Search standards (e.g., 5.NF or 'fractions')"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm
                bg-card-bg text-text-primary outline-none focus:border-teal transition-colors"
            />
            {showDropdown && filteredStandards.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-1 bg-card-bg border border-border
                  rounded-lg max-h-52 overflow-y-auto z-10 shadow-lg"
              >
                {filteredStandards.map((s) => {
                  const sel = isSelected(s.code);
                  return (
                    <div
                      key={s.code}
                      onClick={() => {
                        toggleStandard(s);
                        setShowDropdown(false);
                        setStandardsSearch('');
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2.5 cursor-pointer border-b border-border
                        text-[13px] transition-colors last:border-0
                        ${sel ? 'bg-teal/[0.06]' : 'hover:bg-teal/[0.06]'}`}
                    >
                      {sel
                        ? <CheckCircle size={16} weight="fill" className="text-teal shrink-0" />
                        : <PlusCircleIcon size={16} weight="fill" className="text-text-secondary shrink-0" />
                      }
                      <span>
                        <strong className="text-teal">{s.code}</strong>{' '}
                        <span className="text-text-primary">{s.text}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Student Instructions */}
        <div>
          <label className="font-semibold text-[13px] text-text-primary flex items-center gap-1.5 mb-1.5">
            Student Instructions
            <span className="font-normal text-xs text-text-secondary">(optional)</span>
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder="What should students do? Your Teaching Twin will use these instructions to guide them."
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

      {/* ── Card 3: Guidance ───────────────────────────────────────────────────── */}
      <div className="bg-card-bg border border-border rounded-[14px] p-6 mb-5 relative overflow-hidden">
        {/* Amber accent bar */}
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
        className="w-full flex items-center justify-center gap-2 py-3.5 px-7 bg-teal text-white
          rounded-[10px] text-[15px] font-heading font-bold cursor-pointer
          hover:bg-teal/85 hover:-translate-y-px transition-all"
      >
        <Books size={18} weight="fill" />
        Save to Library
      </button>
      <p className="text-xs text-text-secondary text-center mt-2">
        You can assign this activity to classes after saving.
      </p>

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
                className="px-5 py-2.5 bg-teal text-white rounded-lg text-[13px] font-semibold
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
