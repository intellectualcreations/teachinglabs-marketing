'use client';

import Link from 'next/link';
import {
  GraduationCap,
  ChalkboardTeacher,
  Buildings,
  UsersThree,
  ArrowRight,
} from '@phosphor-icons/react';

interface RoleCard {
  href: string;
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
  cta: string;
  accentColor: string;
  bgColor: string;
  iconBg: string;
  btnBg: string;
  roleClass: string;
}

const ROLES: RoleCard[] = [
  {
    href: '/student/signup',
    icon: GraduationCap,
    title: 'Student',
    desc: 'Jump into your personalized learning experience.',
    cta: "Let's go",
    accentColor: '#4FA3A5',
    bgColor: 'rgba(79,163,165,0.06)',
    iconBg: 'rgba(79,163,165,0.1)',
    btnBg: '#4FA3A5',
    roleClass: 'student',
  },
  {
    href: '/teacher/signup',
    icon: ChalkboardTeacher,
    title: 'Teacher',
    desc: 'Build an AI teaching assistant that teaches like you.',
    cta: 'Get started',
    accentColor: '#1F3A5F',
    bgColor: 'rgba(31,58,95,0.04)',
    iconBg: 'rgba(31,58,95,0.08)',
    btnBg: '#1F3A5F',
    roleClass: 'teacher',
  },
  {
    href: '/admin/signup',
    icon: Buildings,
    title: 'Administrator',
    desc: 'Manage your district, monitor progress, scale what works.',
    cta: 'Get started',
    accentColor: '#D97706',
    bgColor: 'rgba(245,158,11,0.05)',
    iconBg: 'rgba(245,158,11,0.1)',
    btnBg: '#D97706',
    roleClass: 'admin',
  },
  {
    href: '/parent/signup',
    icon: UsersThree,
    title: 'Parent',
    desc: "Stay connected to your child's learning journey.",
    cta: 'Get started',
    accentColor: '#E8836B',
    bgColor: 'rgba(232,131,107,0.05)',
    iconBg: 'rgba(232,131,107,0.1)',
    btnBg: '#E8836B',
    roleClass: 'parent',
  },
];

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col items-center justify-center px-4 py-16">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 512 512" fill="none" className="w-6 h-6">
            <g transform="translate(156,106)">
              <rect x="60" y="0" width="80" height="300" fill="#FFF" />
              <rect x="40" y="0" width="160" height="80" fill="#FFF" />
              <circle cx="160" cy="200" r="40" fill="#4FA3A5" />
            </g>
          </svg>
        </div>
        <span className="font-heading font-bold text-xl text-text-primary">TeachingLabs</span>
      </Link>

      {/* Heading */}
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary text-center mb-2">
        How will you be using TeachingLabs?
      </h1>
      <p className="text-text-secondary text-[15px] text-center mb-10">
        Choose your role to get started.
      </p>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-[960px] mb-10">
        {ROLES.map((role, idx) => {
          const Icon = role.icon;
          return (
            <Link
              key={role.roleClass}
              href={role.href}
              className="group relative flex flex-col items-center text-center rounded-[18px] p-8 border-[1.5px] border-border bg-surface dark:bg-card-bg cursor-pointer no-underline transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-transparent overflow-hidden"
              style={{
                animationDelay: `${0.08 + idx * 0.08}s`,
              }}
            >
              {/* Top accent bar on hover */}
              <span
                className="absolute top-0 left-0 right-0 h-1 rounded-t-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: role.accentColor }}
              />

              {/* Hover background tint */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: role.bgColor }}
              />

              {/* Icon */}
              <div
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
                style={{ background: role.iconBg }}
              >
                <Icon weight="fill" size={30} style={{ color: role.accentColor }} />
              </div>

              {/* Title */}
              <h3 className="relative font-heading text-lg font-semibold text-text-primary mb-2">
                {role.title}
              </h3>

              {/* Desc */}
              <p className="relative text-sm text-text-secondary leading-relaxed flex-1 mb-5">
                {role.desc}
              </p>

              {/* CTA Button */}
              <span
                className="relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-heading text-sm font-medium text-white transition-shadow duration-200 group-hover:shadow-md"
                style={{ background: role.btnBg }}
              >
                {role.cta}
                <ArrowRight
                  weight="bold"
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Already have account */}
      <p className="text-sm text-text-secondary mb-4">
        Already have an account?{' '}
        <Link href="/login" className="text-teal font-medium hover:underline">
          Log in
        </Link>
      </p>

      {/* Legal */}
      <p className="text-xs text-text-muted text-center max-w-md leading-relaxed">
        By continuing, you agree to our{' '}
        <Link href="#" className="text-teal hover:underline">Terms of Service</Link>,{' '}
        <Link href="#" className="text-teal hover:underline">Privacy Policy</Link>, and{' '}
        <Link href="#" className="text-teal hover:underline">Data Protection Addendum</Link>.
      </p>
    </div>
  );
}
