import { useCallback } from 'react';
import welcomeScene from '@/assets/welcome-scene.jpg';
import '@/styles/welcome-page.css';

/** Full welcome reference art — portrait 768×1024 */
const ART_W = 768;
const ART_H = 1024;

/** Baked-in admin row — pixel coords on welcome-scene.jpg (768×1024) */
const ADMIN_HIT = { left: 96, top: 810, width: 576, height: 90 };

function artPct(value: number, base: number) {
  return `${(value / base) * 100}%`;
}

interface WelcomePageProps {
  onSelectRole: (role: 'parent' | 'child' | 'admin') => void;
}

export function WelcomePage({ onSelectRole }: WelcomePageProps) {
  const select = useCallback(
    (role: 'parent' | 'child' | 'admin') => {
      onSelectRole(role);
    },
    [onSelectRole],
  );

  return (
    <div className="welcome-screen">
      <div className="welcome-screen__stage">
        <div className="welcome-screen__frame">
          <img
            src={welcomeScene}
            alt="CyberQuest — Welcome"
            className="welcome-screen__art"
            width={ART_W}
            height={ART_H}
            draggable={false}
          />

          <div className="welcome-overlay">
            <button
              type="button"
              className="welcome-action welcome-action--parent"
              aria-label="Parent"
              onClick={() => select('parent')}
            />
            <button
              type="button"
              className="welcome-action welcome-action--child"
              aria-label="Child"
              onClick={() => select('child')}
            />
          </div>

          <button
            type="button"
            className="welcome-action welcome-action--admin"
            aria-label="Admin Access"
            style={{
              left: artPct(ADMIN_HIT.left, ART_W),
              top: artPct(ADMIN_HIT.top, ART_H),
              width: artPct(ADMIN_HIT.width, ART_W),
              height: artPct(ADMIN_HIT.height, ART_H),
            }}
            onClick={() => select('admin')}
          />
        </div>
      </div>
    </div>
  );
}
