'use client';

import { useRouter, usePathname } from 'next/navigation';

const LOCALES = ['en', 'es'] as const;
type Locale = typeof LOCALES[number];

function getCurrentLocale(pathname: string): Locale {
  const seg = pathname.split('/')[1];
  return (LOCALES.includes(seg as Locale) ? seg : 'en') as Locale;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    if (LOCALES.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/') || '/');
  };

  return (
    <div className="flex gap-2 items-center" role="navigation" aria-label="Language switcher">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2 py-1 text-sm rounded font-medium transition-colors ${
            locale === l
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          aria-label={l === 'en' ? 'Switch to English' : 'Cambiar a Español'}
          aria-current={locale === l ? 'true' : undefined}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
