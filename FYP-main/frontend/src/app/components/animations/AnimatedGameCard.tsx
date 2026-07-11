import { Lock, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cardEntrance, subwayBounce } from './subwayMotion';

export type SpriteCell = 'tl' | 'tr' | 'bl' | 'br';

const SPRITE_LAYOUT: Record<SpriteCell, { left: string; top: string }> = {
  tl: { left: '0%', top: '0%' },
  tr: { left: '-100%', top: '0%' },
  bl: { left: '0%', top: '-100%' },
  br: { left: '-100%', top: '-100%' },
};

interface AnimatedGameCardProps {
  image: string;
  alt: string;
  onClick: () => void;
  gradient?: string;
  delay?: number;
  spriteCell?: SpriteCell;
  hideLabel?: boolean;
  /** Full-bleed trimmed module artwork — fills box, title stays at top */
  moduleArt?: boolean;
  disabled?: boolean;
  featured?: boolean;
}

export function AnimatedGameCard({
  image,
  alt,
  onClick,
  gradient = '',
  delay = 0,
  spriteCell,
  hideLabel = false,
  moduleArt = false,
  disabled = false,
  featured = false,
}: AnimatedGameCardProps) {
  const isSprite = Boolean(spriteCell) && !moduleArt;
  const layout = spriteCell ? SPRITE_LAYOUT[spriteCell] : null;

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={disabled ? `${alt} — paused by admin` : alt}
      aria-disabled={disabled}
      className={`relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl ${
        moduleArt || isSprite
          ? 'bg-transparent shadow-md hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)]'
          : `shadow-xl ring-2 ring-white/25 hover:ring-cyan-400/60 ${gradient}`
      } ${disabled ? 'cursor-not-allowed opacity-55 grayscale-[0.35]' : ''}`}
      {...cardEntrance(delay)}
      whileHover={disabled ? undefined : { scale: 1.04, y: -6 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={subwayBounce}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {!isSprite && !moduleArt && (
        <>
          <motion.div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl z-30 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 20px rgba(34,211,238,0.12)' }}
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
            animate={{ x: ['-120%', '220%'] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
          />
        </>
      )}

      {moduleArt ? (
        <motion.img
          src={image}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center select-none"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.3 }}
        />
      ) : isSprite && layout ? (
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.3 }}
        >
          <img
            src={image}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute max-w-none select-none pointer-events-none"
            style={{
              width: '200%',
              height: '200%',
              left: layout.left,
              top: layout.top,
            }}
          />
        </motion.div>
      ) : (
        <motion.img
          src={image}
          alt={alt}
          className="relative z-0 h-full w-full object-cover"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.3 }}
        />
      )}

      {!isSprite && !moduleArt && (
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/25 via-transparent to-white/5 pointer-events-none" />
      )}

      {!hideLabel && !moduleArt && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
          <span className="text-white text-xs sm:text-sm font-bold drop-shadow-md">{alt}</span>
        </div>
      )}

      {featured && !disabled && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-md">
          <Star className="w-3 h-3 fill-amber-900 text-amber-900" />
          Featured
        </div>
      )}

      {disabled && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-[#0b1224]/70 backdrop-blur-[2px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <Lock className="h-5 w-5 text-white/90" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/90 px-2 text-center">
            Paused
          </span>
        </div>
      )}
    </motion.button>
  );
}
