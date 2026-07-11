export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
};

export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export const cardHover = {
  whileHover: { y: -6, scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 22 },
};

export const buttonTap = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
};
