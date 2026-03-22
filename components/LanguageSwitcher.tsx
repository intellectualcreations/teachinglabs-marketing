'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace the current locale prefix in the path
    const segments = pathname.split('/');
    if (segments[1] === 'en' || segments[1] === 'es') {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 text-sm rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => switchLocale('es')}
        className={`px-2 py-1 text-sm rounded ${locale === 'es' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );
}

export default LanguageSwitcher;
