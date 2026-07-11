import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { fadeInUp } from './motionPresets';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={fadeInUp.transition}
    >
      {children}
    </motion.div>
  );
}
