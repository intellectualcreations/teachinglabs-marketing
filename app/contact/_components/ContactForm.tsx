'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      (e.target as HTMLFormElement).reset();
    }, 4000);
  }

  return (
    <div>
      <h2 className="font-heading text-[28px] font-bold text-text-primary mb-2">
        Send us a message
      </h2>
      <p className="text-sm text-text-muted mb-8">
        We&apos;ll get back to you within one business day.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4 mb-4 max-md:grid-cols-1">
          <div className="flex flex-col gap-1.5 mb-4">
            <label
              htmlFor="firstName"
              className="font-heading text-[13px] font-semibold text-text-primary"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              required
              className="px-4 py-3 border-[1.5px] border-[rgba(128,128,128,0.2)] rounded-xl font-body text-[15px] text-text-primary bg-white dark:bg-[#0e1a35] outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,246,237,0.12)] transition-all w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            <label
              htmlFor="lastName"
              className="font-heading text-[13px] font-semibold text-text-primary"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              required
              className="px-4 py-3 border-[1.5px] border-[rgba(128,128,128,0.2)] rounded-xl font-body text-[15px] text-text-primary bg-white dark:bg-[#0e1a35] outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,246,237,0.12)] transition-all w-full"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label
            htmlFor="email"
            className="font-heading text-[13px] font-semibold text-text-primary"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@school.edu"
            required
              className="px-4 py-3 border-[1.5px] border-[rgba(128,128,128,0.2)] rounded-xl font-body text-[15px] text-text-primary bg-white dark:bg-[#0e1a35] outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,246,237,0.12)] transition-all w-full"
            />
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label
            htmlFor="role"
            className="font-heading text-[13px] font-semibold text-text-primary"
          >
            Your Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue=""
            className="px-4 py-3 border-[1.5px] border-[rgba(128,128,128,0.2)] rounded-xl font-body text-[15px] text-text-primary bg-white dark:bg-[#0e1a35] outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,246,237,0.12)] transition-all w-full appearance-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238896A6' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              paddingRight: '40px',
            }}
          >
            <option value="" disabled>
              Select your role...
            </option>
            <option>Classroom Teacher</option>
            <option>School Administrator</option>
            <option>District Leader / Superintendent</option>
            <option>EdTech Investor</option>
            <option>Parent</option>
            <option>Student</option>
            <option>Researcher / Academic</option>
            <option>Press / Media</option>
            <option>Other</option>
          </select>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label
            htmlFor="subject"
            className="font-heading text-[13px] font-semibold text-text-primary"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="What&apos;s on your mind?"
            required
              className="px-4 py-3 border-[1.5px] border-[rgba(128,128,128,0.2)] rounded-xl font-body text-[15px] text-text-primary bg-white dark:bg-[#0e1a35] outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,246,237,0.12)] transition-all w-full"
            />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label
            htmlFor="message"
            className="font-heading text-[13px] font-semibold text-text-primary"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us a bit about your school, your students, or what you're hoping Teaching Labs can help with..."
            required
            rows={6}
            className="px-4 py-3 border-[1.5px] border-[rgba(128,128,128,0.2)] rounded-xl font-body text-[15px] text-text-primary bg-white dark:bg-[#0e1a35] outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,246,237,0.12)] transition-all w-full resize-y min-h-[130px]"
          />
        </div>

        <button
          type="submit"
          disabled={submitted}
          className="w-full mt-2 py-[15px] rounded-full font-heading text-sm font-semibold tracking-[2px] uppercase text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed"
          style={{
            background: submitted ? '#2D9B6F' : 'var(--teal, #00F6ED)',
            boxShadow: submitted ? 'none' : '0 4px 16px rgba(0,246,237,0.35)',
          }}
        >
          {submitted ? '✓ Message Sent!' : 'Send Message'}
        </button>

        <p className="text-xs text-text-muted text-center mt-3.5 leading-relaxed">
          🔒 Your information is private and will never be sold or shared.
        </p>
      </form>
    </div>
  );
}
