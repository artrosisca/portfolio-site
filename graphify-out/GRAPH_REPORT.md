# Graph Report - .  (2026-05-08)

## Corpus Check
- Corpus is ~33,486 words - fits in a single context window. You may not need a graph.

## Summary
- 45 nodes · 68 edges · 8 communities (5 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core Application & State|Core Application & State]]
- [[_COMMUNITY_Global Layout & Navigation|Global Layout & Navigation]]
- [[_COMMUNITY_Portfolio Sections|Portfolio Sections]]
- [[_COMMUNITY_Tech Stack Ecosystem|Tech Stack Ecosystem]]
- [[_COMMUNITY_Project Showcases|Project Showcases]]
- [[_COMMUNITY_Interactive Terminal|Interactive Terminal]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 17 edges
2. `Arthur Rosisca` - 4 edges
3. `HeroScene()` - 2 edges
4. `TopNavBar()` - 2 edges
5. `ProjectGallery()` - 2 edges
6. `AboutSection()` - 2 edges
7. `ContactSection()` - 2 edges
8. `HeroSection()` - 2 edges
9. `ArchitectureCards()` - 2 edges
10. `TerminalWindow()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Arthur Rosisca` --studied_at--> `UTFPR`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `Arthur Rosisca` --worked_at--> `Onikode Solutions`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `Arthur Rosisca` --developed--> `Predição de Risco de Doenças Crônicas`  [EXTRACTED]
  README.md → public/arthur_resume_pt-br.pdf
- `HeroScene()` --calls--> `useLanguage()`  [EXTRACTED]
  src/components/3D/HeroScene.jsx → src/contexts/LanguageContext.jsx
- `HeroSection()` --calls--> `useLanguage()`  [EXTRACTED]
  src/components/Sections/HeroSection.jsx → src/contexts/LanguageContext.jsx

## Communities (8 total, 3 thin omitted)

### Community 1 - "Global Layout & Navigation"
Cohesion: 0.29
Nodes (6): useLanguage(), TopNavBar(), ProjectGallery(), AboutSection(), ContactSection(), TerminalWindow()

### Community 2 - "Portfolio Sections"
Cohesion: 0.32
Nodes (3): LanguageContext, LanguageProvider(), translations

### Community 4 - "Project Showcases"
Cohesion: 0.4
Nodes (5): Arthur Rosisca, Data Engineering, Onikode Solutions, Predição de Risco de Doenças Crônicas, UTFPR

## Knowledge Gaps
- **6 isolated node(s):** `techCategories`, `LanguageContext`, `UTFPR`, `Onikode Solutions`, `Predição de Risco de Doenças Crônicas` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Global Layout & Navigation` to `Core Application & State`, `Portfolio Sections`, `Tech Stack Ecosystem`, `Interactive Terminal`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **What connects `techCategories`, `LanguageContext`, `UTFPR` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._