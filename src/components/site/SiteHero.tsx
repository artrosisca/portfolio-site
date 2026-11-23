import { memo } from 'react';
import { Reveal } from './Reveal';

const LINKS = [
  ['projetos', '#projetos'],
  ['contato', '#contato'],
] as const;

/**
 * First screen of the site. Rendered statically by Astro at the top of the page and,
 * scaled down, inside the browser window of the intro. Same component, same pixels.
 * Same room, light on: the intro's purple-black, bone text and the lamp's persimmon.
 */
function SiteHero() {
  return (
    <section className="relative flex h-svh flex-col bg-deep px-6 text-bone md:px-12">
      <nav className="flex h-16 shrink-0 items-center justify-between font-mono text-[13px] md:h-20 md:text-sm">
        <span className="tracking-[0.2em] uppercase">arthur rosisca</span>
        <div className="hidden gap-8 text-bone/65 md:flex">
          {LINKS.map(([l, href]) => (
            <a key={l} href={href} className="transition-colors hover:text-accent">{l}</a>
          ))}
        </div>
        <a href="/arthur_resume_pt-br.pdf" className="rounded-full border border-bone/20 px-4 py-2 text-bone/80 transition-colors hover:border-accent hover:text-accent">currículo.pdf</a>
      </nav>

      <div className="my-auto grid items-center gap-12 md:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <p className="font-mono text-sm text-bone/65 md:text-base">Arthur Rosisca · full-stack &amp; dados</p>
          <h1 className="mt-5 font-display text-[clamp(2.8rem,6.6vw,6.4rem)] font-[700] leading-[0.95] tracking-[-0.04em]">
            <Reveal text="Construo sistemas e dou *sentido* a dados." delay={0.15} step={0.07} />
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-bone/70 md:text-xl">
            Desenvolvedor full-stack e de dados. Sistemas web de ponta a ponta, e dados transformados em decisões.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 font-mono text-sm">
            <a href="#projetos" className="rounded-full bg-accent px-5 py-3 text-deep transition-colors hover:bg-bone">ver projetos</a>
            <a href="#contato" className="rounded-full border border-bone/25 px-5 py-3 text-bone/85 transition-colors hover:border-accent hover:text-accent">falar comigo</a>
          </div>
        </div>

        {/* the first project, as a window: real work instead of empty space */}
        <a href="#projetos" className="group hidden overflow-hidden rounded-xl border border-bone/10 bg-deep-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] transition-colors hover:border-accent/50 md:block">
          <span className="flex h-8 items-center gap-1.5 border-b border-bone/10 px-3 font-mono text-[11px] text-bone/50">
            <span className="size-2.5 rounded-full bg-bone/15" />
            <span className="size-2.5 rounded-full bg-bone/15" />
            <span className="size-2.5 rounded-full bg-bone/15" />
            <span className="ml-2">~/projetos/tcc-urbs · linha 541</span>
            <span className="ml-auto transition-colors group-hover:text-accent">abrir →</span>
          </span>
          <img src="/projetos/tcc/replay.webp" alt="TCC: replay de uma viagem da linha 541 com as paradas omitidas marcadas em laranja" className="block aspect-[16/9] w-full object-cover" width={1600} height={900} />
        </a>
      </div>

      <div className="flex h-20 shrink-0 items-center justify-center font-mono text-xs text-bone/50">↓ role para continuar</div>
    </section>
  );
}

export default memo(SiteHero);
