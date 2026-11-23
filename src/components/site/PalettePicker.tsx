import { useEffect, useState } from 'react';

// Dev-only helper while we choose the site's accent color.
const PALETTES = [
  { id: 'ambar', name: 'âmbar', color: '#f2a33a' },
  { id: 'fosforo', name: 'fósforo', color: '#7ee2a0' },
  { id: 'lua', name: 'lua', color: '#8ecbff' },
  { id: 'lavanda', name: 'lavanda', color: '#b9a4ff' },
  { id: 'papel', name: 'papel', color: '#f3efe6' },
];

export default function PalettePicker() {
  const [cur, setCur] = useState('ambar');
  useEffect(() => setCur(document.documentElement.dataset.palette ?? 'ambar'), []);

  const pick = (id: string) => {
    localStorage.setItem('palette', id);
    if (id === 'ambar') delete document.documentElement.dataset.palette;
    else document.documentElement.dataset.palette = id;
    setCur(id);
  };

  return (
    <div
      className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2 rounded-2xl border border-cream/15 bg-ink/80 p-2 font-mono text-[10px] text-cream/70 backdrop-blur"
      onClick={(e) => e.stopPropagation()}
    >
      {PALETTES.map((p) => (
        <button key={p.id} type="button" onClick={() => pick(p.id)} className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition hover:bg-cream/10" style={{ outline: cur === p.id ? `1px solid ${p.color}` : 'none' }}>
          <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
          {p.name}
        </button>
      ))}
    </div>
  );
}
