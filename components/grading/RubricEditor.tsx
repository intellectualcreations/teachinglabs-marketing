'use client';

import { useState } from 'react';
import {
  Plus,
  Trash,
  FloppyDisk,
  ListChecks,
} from '@phosphor-icons/react';

interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

interface RubricEditorProps {
  assignmentId: string;
  initialCriteria?: RubricCriterion[];
  onSaved?: (criteria: RubricCriterion[]) => void;
}

const emptyCriterion: RubricCriterion = {
  name: '',
  description: '',
  weight: 0,
  maxScore: 100,
};

export default function RubricEditor({
  assignmentId,
  initialCriteria,
  onSaved,
}: RubricEditorProps) {
  const [criteria, setCriteria] = useState<RubricCriterion[]>(
    initialCriteria && initialCriteria.length > 0
      ? initialCriteria
      : [{ ...emptyCriterion, weight: 100 }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  function addCriterion() {
    setCriteria((prev) => [...prev, { ...emptyCriterion }]);
    setSuccess(false);
  }

  function removeCriterion(index: number) {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
    setSuccess(false);
  }

  function updateCriterion(index: number, field: keyof RubricCriterion, value: string | number) {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
    setSuccess(false);
    setError('');
  }

  async function handleSave() {
    if (criteria.some((c) => !c.name.trim())) {
      setError('All criteria must have a name');
      return;
    }
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(`Weights must sum to 100 (currently ${totalWeight})`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/rubric`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save rubric');
        return;
      }

      setSuccess(true);
      onSaved?.(criteria);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card-bg border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
          <ListChecks size={22} weight="duotone" className="text-teal" />
          Rubric Editor
        </h3>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            Math.abs(totalWeight - 100) < 0.01
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}
        >
          Weight: {totalWeight}%
        </span>
      </div>

      <div className="space-y-3">
        {criteria.map((c, idx) => (
          <div
            key={idx}
            className="border border-border rounded-lg p-4 bg-surface/50"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Criterion Name
                    </label>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCriterion(idx, 'name', e.target.value)}
                      placeholder="e.g. Conceptual Understanding"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        Weight (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={c.weight}
                        onChange={(e) => updateCriterion(idx, 'weight', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        Max Score
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={c.maxScore}
                        onChange={(e) => updateCriterion(idx, 'maxScore', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={c.description}
                    onChange={(e) => updateCriterion(idx, 'description', e.target.value)}
                    placeholder="Describe what this criterion measures..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/40 resize-none"
                  />
                </div>
              </div>

              {criteria.length > 1 && (
                <button
                  onClick={() => removeCriterion(idx)}
                  className="mt-5 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Remove criterion"
                >
                  <Trash size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={addCriterion}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-dashed border-teal/40 text-teal hover:bg-teal/5 transition-colors"
        >
          <Plus size={16} weight="bold" />
          Add Criterion
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50"
        >
          <FloppyDisk size={16} weight="fill" />
          {saving ? 'Saving...' : 'Save Rubric'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
      )}

      {success && (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          Rubric saved successfully.
        </p>
      )}
    </div>
  );
}
