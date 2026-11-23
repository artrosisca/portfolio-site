import { useEffect, useState } from 'react';
import { sound } from '@/lib/sound';

/** Fixed sound button for the whole page. Until the visitor chooses, it invites them. */
export default function SoundToggle() {
  const [on, setOn] = useState(sound.on);
  const [asked, setAsked] = useState(true);

  useEffect(() => {
    setAsked(sound.pref !== null);
    sound.resumeOnGesture();
    return sound.subscribe((v) => {
      setOn(v);
      setAsked(true);
    });
  }, []);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // must not count as "click to speed up" during the intro
        void sound.setOn(!on);
      }}
      aria-pressed={on}
      aria-label={on ? 'Desligar som' : 'Ligar som'}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-cream/20 bg-ink/70 px-3 py-2 font-mono text-xs text-cream/80 backdrop-blur transition hover:border-accent hover:text-accent md:bottom-12 md:left-12"
    >
      {!asked && (
        <span className="absolute inset-0 -z-10 animate-ping rounded-full border border-accent/50 [animation-duration:2.2s]" aria-hidden />
      )}
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-current"
            style={{ height: on ? `${h * 100}%` : '20%', animation: on ? `eq 0.9s ${i * 0.15}s ease-in-out infinite alternate` : 'none' }}
          />
        ))}
      </span>
      {on ? 'som' : asked ? 'sem som' : 'ligar som'}
    </button>
  );
}
