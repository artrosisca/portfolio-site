/**
 * Words rise out of a mask one after another (CSS only, see `.reveal-word` in global.css).
 * `start` defaults to true, so a statically rendered headline animates on page load.
 * Wrap a word in asterisks (`*sentido*`) to set it in italic.
 */
export function Reveal({ text, start = true, delay = 0, step = 0.07 }: { text: string; start?: boolean; delay?: number; step?: number }) {
  const words = text.split(' ');
  return (
    <span className={start ? 'reveal-on' : undefined}>
      <span className="sr-only">{text.replace(/\*/g, '')}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <span className="reveal-word">
            <span className={w.startsWith('*') ? 'italic' : undefined} style={{ animationDelay: `${delay + i * step}s` }}>{w.replace(/\*/g, '')}</span>
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}
