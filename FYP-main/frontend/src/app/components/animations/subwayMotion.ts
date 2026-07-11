/** Bouncy spring presets inspired by endless-runner mobile games. */
export const subwaySpring = { type: 'spring' as const, stiffness: 420, damping: 22, mass: 0.8 };
export const subwayBounce = { type: 'spring' as const, stiffness: 600, damping: 14 };
export const subwayPop = { type: 'spring' as const, stiffness: 500, damping: 18 };

export const cardEntrance = (delay = 0) => ({
  initial: { opacity: 0, y: 48, scale: 0.88, rotateX: 8 },
  animate: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
  transition: { ...subwaySpring, delay },
});

export const slideInUp = {
  initial: { opacity: 0, y: 80 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
  transition: subwaySpring,
};
