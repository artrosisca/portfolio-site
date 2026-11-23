import { memo } from 'react';
import { Reveal } from './Reveal';

const LINKS = ['projetos', 'experiência', 'sobre', 'contato'];

/**
 * First screen of the site. Rendered statically by Astro at the top of the page and,
 * scaled down, inside the browser window of the intro. Same component, same pixels.
 * The intro is night; this is the moment the light is on: paper, ink and one rust accent.
 */
function SiteHero() {
  return (
    <section className="relative flex h-svh flex-col bg-paper px-6 text-char md:px-12">
      <nav className="flex h-16 shrink-0 items-center justify-between font-mono text-xs md:h-20">
        <span className="tracking-[0.2em] uppercase">arthur rosisca</span>
        <div className="hidden gap-8 text-char/60 md:flex">
          {LINKS.map((l) => (
            <a key={l} href={`#${l}`} className="transition-colors hover:text-accent">{l}</a>
          ))}
        </div>
        <a href="/arthur_resume_pt-br.pdf" className="rounded-full border border-char/20 px-4 py-2 text-char/80 transition-colors hover:border-accent hover:text-accent">currículo</a>
      </nav>

      <div className="my-auto max-w-5xl">
        <p className="font-mono text-sm text-accent">$ cat sobre.md</p>
        <h1 className="mt-5 font-serif text-[clamp(3.4rem,11vw,9rem)] font-[380] leading-[0.92] tracking-[-0.035em]">
          <Reveal text="Arthur *Rosisca*" delay={0.15} step={0.12} />
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-char/70 md:text-xl">
          Desenvolvedor full-stack e de dados. Construo sistemas web de ponta a ponta e transformo dados em decisões.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-mono text-sm">
          <a href="#projetos" className="rounded-full bg-char px-5 py-3 text-paper transition-colors hover:bg-accent">ver projetos</a>
          <a href="#contato" className="rounded-full border border-char/25 px-5 py-3 text-char/80 transition-colors hover:border-accent hover:text-accent">falar comigo</a>
        </div>
      </div>

      <div className="flex h-20 shrink-0 items-center justify-center font-mono text-xs text-char/45">↓ role para continuar</div>
    </section>
  );
}

export default memo(SiteHero);
