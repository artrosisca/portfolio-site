# Graph Report - portfolio-site  (2026-05-20)

## Corpus Check
- 24 files · ~196,820 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 76 nodes · 101 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bedb60d1`
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
1. `useLanguage()` - 21 edges
2. `Component Specifications` - 5 edges
3. `Cyber-Noir & Neon Electric Design System` - 4 edges
4. `Arthur Rosisca` - 4 edges
5. `Design Tokens` - 3 edges
6. `React + Vite` - 3 edges
7. `BootScreen()` - 2 edges
8. `App()` - 2 edges
9. `ScrollIndicator()` - 2 edges
10. `HeroScene()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Arthur Rosisca` --studied_at--> `UTFPR`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `Arthur Rosisca` --worked_at--> `Onikode Solutions`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `Arthur Rosisca` --developed--> `Predição de Risco de Doenças Crônicas`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `BootScreen()` --calls--> `useLanguage()`  [EXTRACTED]
  src/App.jsx → src/contexts/LanguageContext.jsx
- `ScrollIndicator()` --calls--> `useLanguage()`  [EXTRACTED]
  src/components/3D/HeroScene.jsx → src/contexts/LanguageContext.jsx

## Communities (13 total, 2 thin omitted)

### Community 0 - "Core Application & State"
Cohesion: 0.21
Nodes (9): LanguageContext, useLanguage(), translations, TopNavBar(), ProjectGallery(), AboutSection(), AboutTerminal(), HeroSection() (+1 more)

### Community 2 - "Portfolio Sections"
Cohesion: 0.18
Nodes (10): 1. Navigation Bar & Footer, 2. Main Hero & 3D Interactive Canvas, 3. Tech Stack & Project Cards, 4. Interactive Forms, Colors, Component Specifications, Cyber-Noir & Neon Electric Design System, Design Tokens (+2 more)

### Community 3 - "Tech Stack Ecosystem"
Cohesion: 0.33
Nodes (5): LanguageProvider(), App(), BootScreen(), SECTIONS, useReactScrollSnap()

### Community 5 - "Interactive Terminal"
Cohesion: 0.4
Nodes (3): ArchitectureCards(), techCategories, techCategoriesData

### Community 6 - "I18n Engine"
Cohesion: 0.4
Nodes (5): Arthur Rosisca, Data Engineering, Onikode Solutions, Predição de Risco de Doenças Crônicas, UTFPR

### Community 8 - "Community 8"
Cohesion: 0.5
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **17 isolated node(s):** `SECTIONS`, `techCategoriesData`, `LanguageContext`, `Goal`, `Colors` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Core Application & State` to `Tech Stack Ecosystem`, `Project Showcases`, `Interactive Terminal`, `Professional Profile`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **What connects `SECTIONS`, `techCategoriesData`, `LanguageContext` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._