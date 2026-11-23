import { memo } from 'react';

const LINKS = ['projetos', 'experiência', 'sobre', 'contato'];

/**
 * First screen of the site. Rendered statically by Astro at the top of the page and,
 * scaled down, inside the browser window of the intro. Same component, same pixels.
 */
function SiteHero() {
  return (
    <section className="relative flex h-svh flex-col bg-ink px-6 text-cream md:px-12">
      <nav className="flex h-16 shrink-0 items-center justify-between font-mono text-xs md:h-20">
        <span className="tracking-[0.2em] uppercase">arthur rosisca</span>
        <div className="hidden gap-8 text-cream/60 md:flex">
          {LINKS.map((l) => (
            <a key={l} href={`#${l}`} className="transition-colors hover:text-accent">{l}</a>
          ))}
        </div>
        <a href="/arthur_resume_pt-br.pdf" className="rounded-full border border-cream/20 px-4 py-2 text-cream/80 transition-colors hover:border-accent hover:text-accent">currículo</a>
      </nav>

      <div className="my-auto max-w-4xl">
        <p className="font-mono text-sm text-accent">$ cat sobre.md</p>
        <h1 className="mt-5 text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">Arthur Rosisca</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/70 md:text-xl">
          Desenvolvedor full-stack e de dados. Construo sistemas web de ponta a ponta e transformo dados em decisões.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-mono text-sm">
          <a href="#projetos" className="rounded-full bg-accent px-5 py-3 text-ink transition-transform hover:-translate-y-0.5">ver projetos</a>
          <a href="#contato" className="rounded-full border border-cream/20 px-5 py-3 text-cream/80 transition-colors hover:border-accent hover:text-accent">falar comigo</a>
        </div>
      </div>

      <div className="flex h-20 shrink-0 items-center justify-center font-mono text-xs text-cream/40">↓ role para continuar</div>
    </section>
  );
}

export default memo(SiteHero);
