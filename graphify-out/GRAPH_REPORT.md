# Graph Report - portfolio-site  (2026-05-08)

## Corpus Check
- 19 files · ~33,767 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 51 nodes · 73 edges · 9 communities (7 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca395df9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Core Application & State|Core Application & State]]
- [[_COMMUNITY_Global Layout & Navigation|Global Layout & Navigation]]
- [[_COMMUNITY_Tech Stack Ecosystem|Tech Stack Ecosystem]]
- [[_COMMUNITY_Project Showcases|Project Showcases]]
- [[_COMMUNITY_Interactive Terminal|Interactive Terminal]]
- [[_COMMUNITY_I18n Engine|I18n Engine]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 17 edges
2. `Arthur Rosisca` - 4 edges
3. `React + Vite` - 3 edges
4. `HeroScene()` - 2 edges
5. `TopNavBar()` - 2 edges
6. `ProjectGallery()` - 2 edges
7. `AboutSection()` - 2 edges
8. `ContactSection()` - 2 edges
9. `HeroSection()` - 2 edges
10. `ArchitectureCards()` - 2 edges

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

## Communities (9 total, 2 thin omitted)

### Community 0 - "Core Application & State"
Cohesion: 0.23
Nodes (5): LanguageContext, LanguageProvider(), translations, AboutSection(), TerminalWindow()

### Community 1 - "Global Layout & Navigation"
Cohesion: 0.29
Nodes (6): useLanguage(), TopNavBar(), ContactSection(), HeroSection(), ArchitectureCards(), techCategories

### Community 4 - "Project Showcases"
Cohesion: 0.4
Nodes (5): Arthur Rosisca, Data Engineering, Onikode Solutions, Predição de Risco de Doenças Crônicas, UTFPR

### Community 5 - "Interactive Terminal"
Cohesion: 0.5
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **8 isolated node(s):** `techCategories`, `LanguageContext`, `React Compiler`, `Expanding the ESLint configuration`, `UTFPR` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Global Layout & Navigation` to `Core Application & State`, `Tech Stack Ecosystem`, `I18n Engine`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **What connects `techCategories`, `LanguageContext`, `React Compiler` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._