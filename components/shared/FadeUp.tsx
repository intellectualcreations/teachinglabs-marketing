'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function FadeUp({ 
  children, 
  className = '',
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className || undefined}
    >
      {children}
    </motion.div>
  );
}
