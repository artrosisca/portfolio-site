# Graph Report - portfolio-site  (2026-05-14)

## Corpus Check
- 19 files · ~46,918 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 57 nodes · 83 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b99b83d0`
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
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 20 edges
2. `Arthur Rosisca` - 4 edges
3. `React + Vite` - 3 edges
4. `BootScreen()` - 2 edges
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
- `BootScreen()` --calls--> `useLanguage()`  [EXTRACTED]
  src/App.jsx → src/contexts/LanguageContext.jsx
- `HeroScene()` --calls--> `useLanguage()`  [EXTRACTED]
  src/components/3D/HeroScene.jsx → src/contexts/LanguageContext.jsx

## Communities (11 total, 2 thin omitted)

### Community 0 - "Core Application & State"
Cohesion: 0.33
Nodes (6): useLanguage(), TopNavBar(), AboutSection(), AboutTerminal(), HeroSection(), TerminalWindow()

### Community 2 - "Portfolio Sections"
Cohesion: 0.33
Nodes (5): LanguageProvider(), App(), BootScreen(), SECTIONS, useReactScrollSnap()

### Community 4 - "Project Showcases"
Cohesion: 0.4
Nodes (3): LanguageContext, translations, ContactSection()

### Community 5 - "Interactive Terminal"
Cohesion: 0.4
Nodes (3): ArchitectureCards(), techCategories, techCategoriesData

### Community 6 - "I18n Engine"
Cohesion: 0.4
Nodes (5): Arthur Rosisca, Data Engineering, Onikode Solutions, Predição de Risco de Doenças Crônicas, UTFPR

### Community 7 - "Professional Profile"
Cohesion: 0.5
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **10 isolated node(s):** `SECTIONS`, `techCategoriesData`, `LanguageContext`, `React Compiler`, `Expanding the ESLint configuration` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Core Application & State` to `Portfolio Sections`, `Tech Stack Ecosystem`, `Project Showcases`, `Interactive Terminal`, `Community 8`?**
  _High betweenness centrality (0.210) - this node is a cross-community bridge._
- **What connects `SECTIONS`, `techCategoriesData`, `LanguageContext` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._