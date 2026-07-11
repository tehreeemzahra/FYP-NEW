import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { buttonTap } from './motionPresets';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function GlowButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
}: GlowButtonProps) {
  const base = variant === 'primary' ? 'cq-btn-primary' : 'cq-btn-secondary';

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...buttonTap}
    >
      {children}
    </motion.button>
  );
}
