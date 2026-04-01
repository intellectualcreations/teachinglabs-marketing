'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    // Enable scroll animations only after JS is ready
    document.documentElement.classList.add('scroll-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    function observeAll() {
      document.querySelectorAll('.fade-up:not(.visible)').forEach((el) => {
        observer.observe(el);
      });
    }

    observeAll();

    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
