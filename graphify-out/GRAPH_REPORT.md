# Graph Report - portfolio-site  (2026-05-12)

## Corpus Check
- 19 files · ~34,606 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 56 nodes · 80 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a93b453`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Core Application & State|Core Application & State]]
- [[_COMMUNITY_Portfolio Sections|Portfolio Sections]]
- [[_COMMUNITY_Tech Stack Ecosystem|Tech Stack Ecosystem]]
- [[_COMMUNITY_Project Showcases|Project Showcases]]
- [[_COMMUNITY_Interactive Terminal|Interactive Terminal]]
- [[_COMMUNITY_I18n Engine|I18n Engine]]
- [[_COMMUNITY_Professional Profile|Professional Profile]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 18 edges
2. `Arthur Rosisca` - 4 edges
3. `React + Vite` - 3 edges
4. `useReactScrollSnap()` - 2 edges
5. `App()` - 2 edges
6. `HeroScene()` - 2 edges
7. `TopNavBar()` - 2 edges
8. `ProjectGallery()` - 2 edges
9. `AboutTerminal()` - 2 edges
10. `AboutSection()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Arthur Rosisca` --studied_at--> `UTFPR`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `Arthur Rosisca` --worked_at--> `Onikode Solutions`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `Arthur Rosisca` --developed--> `Predição de Risco de Doenças Crônicas`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `HeroScene()` --calls--> `useLanguage()`  [EXTRACTED]
  src/components/3D/HeroScene.jsx → src/contexts/LanguageContext.jsx
- `ProjectGallery()` --calls--> `useLanguage()`  [EXTRACTED]
  src/components/Projects/ProjectGallery.jsx → src/contexts/LanguageContext.jsx

## Communities (10 total, 1 thin omitted)

### Community 0 - "Core Application & State"
Cohesion: 0.27
Nodes (7): useLanguage(), TopNavBar(), AboutSection(), AboutTerminal(), ContactSection(), HeroSection(), TerminalWindow()

### Community 2 - "Portfolio Sections"
Cohesion: 0.29
Nodes (4): LanguageContext, LanguageProvider(), translations, ProjectGallery()

### Community 4 - "Project Showcases"
Cohesion: 0.4
Nodes (3): App(), SECTIONS, useReactScrollSnap()

### Community 5 - "Interactive Terminal"
Cohesion: 0.4
Nodes (5): Arthur Rosisca, Data Engineering, Onikode Solutions, Predição de Risco de Doenças Crônicas, UTFPR

### Community 6 - "I18n Engine"
Cohesion: 0.5
Nodes (3): ArchitectureCards(), techCategories, techCategoriesData

### Community 7 - "Professional Profile"
Cohesion: 0.5
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **10 isolated node(s):** `SECTIONS`, `techCategoriesData`, `LanguageContext`, `React Compiler`, `Expanding the ESLint configuration` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Core Application & State` to `Portfolio Sections`, `Tech Stack Ecosystem`, `I18n Engine`?**
  _High betweenness centrality (0.170) - this node is a cross-community bridge._
- **What connects `SECTIONS`, `techCategoriesData`, `LanguageContext` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._