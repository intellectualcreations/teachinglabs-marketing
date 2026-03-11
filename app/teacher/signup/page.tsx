'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChalkboardTeacher, ArrowLeft, Eye, EyeSlash, MagnifyingGlass } from '@phosphor-icons/react';

// ---- Demo data (inline) ----
const US_STATES = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' }, { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' }, { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' }, { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' }, { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' },
];

const DEMO_DISTRICTS: Record<string, { districts: string[]; schools: Record<string, string[]> }> = {
  IN: {
    districts: [
      'Corydon Central Community Schools',
      'Indianapolis Public Schools',
      'Fort Wayne Community Schools',
      'South Harrison Community Schools',
      'New Albany Floyd County Schools',
    ],
    schools: {
      'Corydon Central Community Schools': [
        'Corydon Central High School',
        'Lincoln Elementary School',
        'South Central Middle School',
        'Corydon Intermediate School',
      ],
      'Indianapolis Public Schools': [
        'Arsenal Technical High School',
        'Broad Ripple High School',
        'George Washington High School',
        'Shortridge High School',
      ],
      'Fort Wayne Community Schools': [
        'North Side High School',
        'Northrop High School',
        'South Side High School',
        'Wayne High School',
      ],
    },
  },
  TX: {
    districts: [
      'Houston Independent School District',
      'Dallas Independent School District',
      'Austin Independent School District',
      'San Antonio Independent School District',
    ],
    schools: {
      'Houston Independent School District': [
        'Lamar High School',
        'Heights High School',
        'Reagan High School',
        'Waltrip High School',
      ],
      'Dallas Independent School District': [
        'Bryan Adams High School',
        'Hillcrest High School',
        'Lake Highlands High School',
        'W.T. White High School',
      ],
    },
  },
  CA: {
    districts: [
      'Los Angeles Unified School District',
      'San Diego Unified School District',
      'San Francisco Unified School District',
    ],
    schools: {
      'Los Angeles Unified School District': [
        'Los Angeles High School',
        'Manual Arts High School',
        'Fremont High School',
        'Jefferson High School',
      ],
    },
  },
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function ClassLinkIcon() {
  return (
    <span className="flex-shrink-0" style={{
      display: 'inline-grid', gridTemplateColumns: 'repeat(3, 6px)', gap: '2px',
      width: '20px', height: '20px', placeContent: 'center',
    }}>
      {['#2196F3','#4CAF50','#FF9800','#F44336','#9C27B0','#FFEB3B','#009688','#E91E63','#607D8B'].map((c, i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
      ))}
    </span>
  );
}

interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  hint?: string;
}

function Autocomplete({ value, onChange, onSelect, options, placeholder, disabled, hint }: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    value.trim() === '' || o.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 15);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="mb-4" ref={wrapRef}>
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {open && !disabled && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-surface dark:bg-card-bg border border-border border-t-0 rounded-b-xl max-h-56 overflow-y-auto z-50 shadow-lg">
            <div className="px-3 py-2 text-[11px] text-text-muted bg-bg-secondary dark:bg-[#1E2A3A] sticky top-0 border-b border-border font-medium">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </div>
            {filtered.map((opt) => {
              const lc = opt.toLowerCase();
              const qLc = value.toLowerCase();
              const idx = lc.indexOf(qLc);
              return (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={() => { onSelect(opt); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-teal/5 border-b border-border/50 last:border-0 transition-colors"
                >
                  {value.trim() && idx !== -1 ? (
                    <>
                      {opt.slice(0, idx)}
                      <mark className="bg-teal/20 text-inherit rounded-sm px-0.5">{opt.slice(idx, idx + value.length)}</mark>
                      {opt.slice(idx + value.length)}
                    </>
                  ) : opt}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-text-muted mt-1.5">{hint}</p>}
    </div>
  );
}

export default function TeacherSignupPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<1 | 2>(1);

  // Screen 1 fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);

  const [schoolMode, setSchoolMode] = useState<'public' | 'other'>('public');

  // Public school search
  const [selectedState, setSelectedState] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [schoolQuery, setSchoolQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  // Other / manual school
  const [otherZip, setOtherZip] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [otherStateDisplay, setOtherStateDisplay] = useState('');
  const [otherSchoolType, setOtherSchoolType] = useState('');
  const [otherSchoolName, setOtherSchoolName] = useState('');

  // Screen 2 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const stateData = DEMO_DISTRICTS[selectedState];
  const districtOptions = stateData ? stateData.districts : [];
  const schoolOptions = selectedDistrict && stateData?.schools[selectedDistrict]
    ? stateData.schools[selectedDistrict]
    : [];

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedState(e.target.value);
    setDistrictQuery('');
    setSelectedDistrict('');
    setSchoolQuery('');
    setSelectedSchool('');
  }

  function handleSelectDistrict(val: string) {
    setSelectedDistrict(val);
    setDistrictQuery(val);
    setSchoolQuery('');
    setSelectedSchool('');
  }

  function validateScreen1() {
    let valid = true;
    if (!firstName.trim()) { setFirstNameError(true); valid = false; } else setFirstNameError(false);
    if (!lastName.trim()) { setLastNameError(true); valid = false; } else setLastNameError(false);
    return valid;
  }

  function goToScreen2() {
    if (!validateScreen1()) return;
    setScreen(2);
    window.scrollTo(0, 0);
  }

  function goToScreen1() {
    setScreen(1);
    window.scrollTo(0, 0);
  }

  function handleCreate() {
    router.push('/teacher/twin-onboarding');
  }

  const stepDots = [1, 2, 3];

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col items-center justify-center px-4 py-12">

      {/* Back link */}
      <div className="w-full max-w-[460px] mb-4">
        {screen === 1 ? (
          <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft weight="bold" size={16} />
            Choose a different role
          </Link>
        ) : (
          <button onClick={goToScreen1} className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft weight="bold" size={16} />
            Back
          </button>
        )}
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-6">
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

      {/* Step dots */}
      <div className="flex items-center gap-2 mb-8">
        {stepDots.map((dot) => (
          <div
            key={dot}
            className="rounded-full transition-all duration-300"
            style={{
              width: dot === screen ? 24 : 8,
              height: 8,
              background: dot <= screen ? '#1F3A5F' : '#E2E8F0',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-[460px] animate-[fadeUp_0.4s_ease-out]">

        {/* Role badge */}
        <div className="text-center mb-6">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-heading text-[13px] font-semibold"
            style={{ background: 'rgba(31,58,95,0.08)', color: '#1F3A5F' }}
          >
            <ChalkboardTeacher weight="fill" size={14} />
            Teacher Account
          </span>
        </div>

        {/* ======================== SCREEN 1 ======================== */}
        {screen === 1 && (
          <div className="animate-[fadeUp_0.3s_ease-out]">
            <h1 className="font-heading text-2xl font-bold text-text-primary text-center mb-2">
              Create your account
            </h1>
            <p className="text-text-secondary text-[15px] text-center mb-7">
              Set up your teacher profile to get started.
            </p>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">
                  First name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setFirstNameError(false); }}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v) setFirstName(v.charAt(0).toUpperCase() + v.slice(1).toLowerCase());
                  }}
                  placeholder="Jane"
                  className={`w-full px-4 py-3 rounded-xl border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-all ${
                    firstNameError ? 'border-danger' : 'border-border focus:border-teal'
                  }`}
                />
              </div>
              <div>
                <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">
                  Last name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setLastNameError(false); }}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v) setLastName(v.charAt(0).toUpperCase() + v.slice(1).toLowerCase());
                  }}
                  placeholder="Johnson"
                  className={`w-full px-4 py-3 rounded-xl border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 transition-all ${
                    lastNameError ? 'border-danger' : 'border-border focus:border-teal'
                  }`}
                />
              </div>
            </div>

            {/* Section: Choose school */}
            <div
              onClick={() => setSchoolMode('public')}
              className={`border-[1.5px] rounded-2xl p-5 mb-3 cursor-pointer transition-all duration-200 ${
                schoolMode === 'public'
                  ? 'border-navy bg-card-bg dark:bg-[#1A2332] shadow-[0_0_0_1px_#1F3A5F]'
                  : 'border-border hover:border-teal bg-surface dark:bg-card-bg'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                {/* Radio dot */}
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ borderColor: schoolMode === 'public' ? '#1F3A5F' : '#E2E8F0' }}
                >
                  {schoolMode === 'public' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-navy" />
                  )}
                </div>
                <span className="font-heading font-semibold text-[15px] text-text-primary">
                  Choose your school
                </span>
              </div>
              <p className="text-[13px] text-text-secondary ml-8 mb-0">
                Search our national database of public and private schools
              </p>

              {schoolMode === 'public' && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">State</label>
                  <select
                    value={selectedState}
                    onChange={handleStateChange}
                    className="w-full px-4 py-3 mb-4 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
                  >
                    <option value="">Select your state</option>
                    {US_STATES.map((s) => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
                  </select>

                  <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">District</label>
                  <Autocomplete
                    value={districtQuery}
                    onChange={setDistrictQuery}
                    onSelect={handleSelectDistrict}
                    options={districtOptions}
                    placeholder={selectedState ? 'Start typing your district name...' : 'Select a state first'}
                    disabled={!selectedState}
                    hint={selectedState
                      ? (selectedDistrict ? `Selected: ${selectedDistrict}` : `${districtOptions.length} districts in ${US_STATES.find(s => s.abbr === selectedState)?.name}. Type to search.`)
                      : 'Choose your state, then start typing your district name'}
                  />

                  <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">School</label>
                  <Autocomplete
                    value={schoolQuery}
                    onChange={setSchoolQuery}
                    onSelect={(val) => { setSelectedSchool(val); setSchoolQuery(val); }}
                    options={schoolOptions}
                    placeholder={selectedDistrict ? 'Start typing your school name...' : 'Find your district first'}
                    disabled={!selectedDistrict}
                    hint={selectedDistrict
                      ? (selectedSchool ? `Selected: ${selectedSchool}` : `${schoolOptions.length} schools in this district. Type to search.`)
                      : 'Choose your district, then start typing your school name'}
                  />
                </div>
              )}
            </div>

            {/* Section: Can't find school */}
            <div
              onClick={() => setSchoolMode('other')}
              className={`border-[1.5px] rounded-2xl p-5 mb-4 cursor-pointer transition-all duration-200 ${
                schoolMode === 'other'
                  ? 'border-navy bg-card-bg dark:bg-[#1A2332] shadow-[0_0_0_1px_#1F3A5F]'
                  : 'border-border hover:border-teal bg-surface dark:bg-card-bg'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ borderColor: schoolMode === 'other' ? '#1F3A5F' : '#E2E8F0' }}
                >
                  {schoolMode === 'other' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-navy" />
                  )}
                </div>
                <span className="font-heading font-semibold text-[15px] text-text-primary">
                  Can&apos;t find your school? Add it here
                </span>
              </div>
              <p className="text-[13px] text-text-secondary ml-8">
                Your school will be added to our database for others to find
              </p>

              {schoolMode === 'other' && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Zip code</label>
                  <input
                    type="text"
                    value={otherZip}
                    onChange={(e) => setOtherZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="e.g. 47112"
                    maxLength={5}
                    className="w-full px-4 py-3 mb-4 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm font-bold tracking-widest outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">City</label>
                      <input
                        type="text"
                        value={otherCity}
                        onChange={(e) => setOtherCity(e.target.value)}
                        placeholder="Auto-fills from zip"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary dark:bg-[#1E2A3A] text-text-primary text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">State</label>
                      <input
                        type="text"
                        value={otherStateDisplay}
                        onChange={(e) => setOtherStateDisplay(e.target.value)}
                        placeholder="Auto-fills from zip"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary dark:bg-[#1E2A3A] text-text-primary text-sm outline-none"
                      />
                    </div>
                  </div>
                  <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">School type</label>
                  <select
                    value={otherSchoolType}
                    onChange={(e) => setOtherSchoolType(e.target.value)}
                    className="w-full px-4 py-3 mb-4 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
                  >
                    <option value="">Select type</option>
                    <option value="private">Private School</option>
                    <option value="homeschool">Homeschool</option>
                    <option value="charter">Charter School</option>
                    <option value="other">Other</option>
                  </select>
                  <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">School or organization name</label>
                  <input
                    type="text"
                    value={otherSchoolName}
                    onChange={(e) => setOtherSchoolName(e.target.value)}
                    placeholder="e.g. St. Mary's Academy"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                  />
                </div>
              )}
            </div>

            <button
              onClick={goToScreen2}
              className="w-full py-3.5 rounded-xl bg-navy hover:bg-navy/90 text-white font-heading font-semibold text-[15px] transition-colors"
            >
              Next
            </button>

            <p className="text-center text-sm text-text-secondary mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* ======================== SCREEN 2 ======================== */}
        {screen === 2 && (
          <div className="animate-[fadeUp_0.3s_ease-out]">
            <h1 className="font-heading text-2xl font-bold text-text-primary text-center mb-2">
              Choose how to sign in
            </h1>
            <p className="text-text-secondary text-[15px] text-center mb-7">
              Connect your account to finish setup.
            </p>

            {/* SSO */}
            <div className="flex flex-col gap-3 mb-6">
              {[
                { icon: <GoogleIcon />, label: 'Continue with Google' },
                { icon: <MicrosoftIcon />, label: 'Continue with Microsoft' },
                { icon: <ClassLinkIcon />, label: 'Continue with ClassLink' },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  onClick={handleCreate}
                  className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg hover:bg-bg-secondary dark:hover:bg-[#1E2A3A] transition-colors font-heading text-sm font-medium text-text-primary"
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary font-medium">or create with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="mb-4">
              <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">School email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
              />
            </div>

            <div className="mb-2">
              <label className="block font-heading text-sm font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-surface dark:bg-card-bg text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1.5">At least 8 characters with a number and symbol</p>
            </div>

            <button
              onClick={handleCreate}
              className="w-full mt-4 py-3.5 rounded-xl bg-navy hover:bg-navy/90 text-white font-heading font-semibold text-[15px] transition-colors"
            >
              Create account
            </button>

            <p className="text-center text-sm text-text-secondary mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">Log in</Link>
            </p>
          </div>
        )}
      </div>

      {/* Legal */}
      <p className="text-xs text-text-muted text-center max-w-sm mt-10 leading-relaxed">
        By creating an account, you agree to our{' '}
        <Link href="#" className="text-teal hover:underline">Terms of Service</Link>,{' '}
        <Link href="#" className="text-teal hover:underline">Privacy Policy</Link>, and{' '}
        <Link href="#" className="text-teal hover:underline">Data Protection Addendum</Link>.
      </p>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
