'use client';

import { useEffect } from 'react';
import { animate, inView } from 'framer-motion';

export default function ScrollReveal() {
  useEffect(() => {
    document.querySelectorAll('.fade-up').forEach((el) => {
      // Set initial state immediately
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(30px)';

      inView(el, () => {
        animate(
          el,
          { opacity: 1, transform: 'translateY(0px)' },
          { duration: 0.6, easing: 'ease-out' }
        );
      }, { amount: 0.15 });
    });
  }, []);

  return null;
}
