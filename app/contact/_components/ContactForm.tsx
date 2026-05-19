'use client';

import { useState } from 'react';

const SUBJECT_OPTIONS = [
  'Early access',
  'District partnerships',
  'Platform partnerships',
  'Speaking / press',
  'Product feedback or question',
  'Other',
];

const inputClass =
  'px-4 py-3 border-[1.5px] border-[#4b5b73] dark:border-[#1a5276] rounded-xl font-body text-[15px] text-text-primary placeholder:text-[#64748b] dark:placeholder:text-white/55 bg-white dark:bg-[#0e1a35] outline-none focus:border-indigo dark:focus:border-teal focus:shadow-[0_0_0_3px_rgba(64,86,244,0.14)] dark:focus:shadow-[0_0_0_3px_rgba(0,246,237,0.12)] transition-all w-full';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(false);
    setError('');
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          role: formData.get('role'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Message could not be sent.');
      }

      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Message could not be sent. Please email hello@teachinglabs.com directly.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-heading text-[28px] font-bold text-text-primary mb-2">
        Send us a message
      </h2>
      <p className="text-sm text-[#4b5b73] dark:text-text-muted mb-8">
        Tell us what you&apos;re working on, and we&apos;ll route it to the right person.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4 max-md:grid-cols-1">
          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="firstName" className="font-heading text-[13px] font-semibold text-text-primary">
              First Name
            </label>
            <input type="text" id="firstName" name="firstName" placeholder="First Name" required className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="lastName" className="font-heading text-[13px] font-semibold text-text-primary">
              Last Name
            </label>
            <input type="text" id="lastName" name="lastName" placeholder="Last Name" required className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="email" className="font-heading text-[13px] font-semibold text-text-primary">
            Email Address
          </label>
          <input type="email" id="email" name="email" placeholder="you@school.edu" required className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="role" className="font-heading text-[13px] font-semibold text-text-primary">
            Your Role
          </label>
          <input
            type="text"
            id="role"
            name="role"
            placeholder="How would you describe yourself?"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="subject" className="font-heading text-[13px] font-semibold text-text-primary">
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            defaultValue=""
            required
            className={`${inputClass} appearance-none`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238896A6' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              paddingRight: '40px',
            }}
          >
            <option value="" disabled>
              Select a topic...
            </option>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="message" className="font-heading text-[13px] font-semibold text-text-primary">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us a little more..."
            required
            rows={6}
            className={`${inputClass} resize-y min-h-[130px]`}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || submitted}
          className={`w-full mt-2 py-[15px] rounded-full font-heading text-sm font-semibold tracking-[2px] uppercase text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed ${
            submitted
              ? 'bg-success shadow-none'
              : 'bg-deep-navy shadow-[0_6px_20px_rgba(20,33,61,0.28)] hover:bg-indigo'
          }`}
        >
          {submitted ? '✓ Message Sent!' : isSubmitting ? 'Sending…' : 'Send Message'}
        </button>

        {error && (
          <p className="mt-3.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-700 dark:text-red-200">
            {error}
          </p>
        )}

        <p className="text-xs text-text-muted text-center mt-3.5 leading-relaxed">
          🔒 Your information is private and will never be sold or shared. By submitting this form, you agree that Teaching Labs may contact you by email about your request and related Teaching Labs updates. You can unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}
