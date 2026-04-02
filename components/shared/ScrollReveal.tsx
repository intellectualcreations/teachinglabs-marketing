'use client';

import { useEffect, useRef } from 'react';
import { animate, inView } from 'framer-motion';

export default function ScrollReveal() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    function reveal(el: Element) {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      htmlEl.style.opacity = '1';
      htmlEl.style.transform = 'translateY(0px)';
    }

    function setup(el: Element) {
      const htmlEl = el as HTMLElement;
      if (htmlEl.dataset.framerReady) return;
      htmlEl.dataset.framerReady = '1';
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(30px)';

      // Check if already in viewport — animate immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        reveal(el);
      } else {
        inView(el, () => { reveal(el); }, { amount: 0.1 });
      }
    }

    document.querySelectorAll('.fade-up').forEach(setup);

    const observer = new MutationObserver(() => {
      document.querySelectorAll('.fade-up:not([data-framer-ready])').forEach(setup);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
