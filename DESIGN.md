# Cyber-Noir & Neon Electric Design System

## Goal
To implement a high-contrast, premium, dark-themed developer portfolio for Arthur Rosisca, utilizing a 5-color palette consisting of black, slate, ciano/blue, and two yellows.

## Design Tokens

### Colors
- **background**: `#000000` (Obsidian Black) — Used as the main body background, absolute deep black void.
- **surface**: `#0D1520` (Dark Slate Blue) — Used for panels, glass containers, tech-stack cards, and terminal surfaces.
- **primary**: `#FFE600` (Intense Electric Cyber Yellow) — Used for the navbar background/accent, footer highlights, and primary CTA buttons.
- **secondary**: `#00D2FF` (Electric Neon Cyan/Blue) — Used for active state borders, tech icons, highlights, and subtle section accents.
- **tertiary**: `#FFF566` (Brighter Yellow highlight) — Used for hover glows, micro-interactions, and highlights.
- **on-primary**: `#000000` — High contrast black text on primary yellow buttons.
- **on-secondary**: `#000000` — High contrast black text on cyan buttons.
- **on-surface**: `#FFFFFF` — White text for optimal readability on slate blue backgrounds.
- **outline**: `rgba(0, 210, 255, 0.15)` — Electric Neon Cyan border overlay at low opacity.

### Typography
- **Font Family**: `"Space Grotesk"`, sans-serif
- **Headline XL**: 48px, Bold, -0.02em tracking
- **Headline LG**: 32px, Semi-bold, -0.01em tracking
- **Headline MD**: 24px, Semi-bold
- **Body LG**: 18px, Regular, 1.6 line-height
- **Body MD**: 16px, Regular, 1.6 line-height
- **Label MD**: 14px, Medium, 0.1em letter spacing (Uppercase)
- **Code SM**: 12px, Regular (Monospace feel)

## Component Specifications

### 1. Navigation Bar & Footer
- **Background**: Fades into `#000000` or `#0D1520` with a solid `#FFE600` top/bottom stripe or accent border.
- **Active Navigation Links**: Highlighted in Electric Cyber Yellow (`#FFE600`) with smooth transition underscores.
- **Branding Logo**: "ARTHUR ROSISCA" in bold, styled with primary `#FFE600`.

### 2. Main Hero & 3D Interactive Canvas
- **Background Grid**: Interactive dot canvas glowing in Neon Cyan (`#00D2FF`).
- **Headlines**: Large, sharp "Space Grotesk" text in white with `#FFE600` highlights.
- **Interactive Terminal**: Glass panel style using `#0D1520` with 12px backdrop blur and `#00D2FF` borders. Blinking cursor styled in `#FFE600`.

### 3. Tech Stack & Project Cards
- **Containers**: Styled as high-fidelity glass cards (`#0D1520` at 60% opacity) with a `1px` border of `#00D2FF` at `0.15` opacity.
- **Hover Interactions**: Scale up slightly (1.02x) and trigger an ambient glow of Brighter Yellow `#FFF566` (`box-shadow: 0 0 15px rgba(255, 245, 102, 0.25)`).
- **Categories/Section Headers**: Fully rendered in `#FFE600` yellow.

### 4. Interactive Forms
- **Fields**: Backgrounds of Recessed Dark Slate (`#080D14`) with a thin outline border of `#00D2FF` (15% opacity).
- **Focus States**: Border illuminates to bright Neon Cyan `#00D2FF` with a subtle outer glow.
