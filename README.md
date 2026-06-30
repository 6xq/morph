# Morpheus (Archive)*

A personal digital archive — a space for fragments of taste, memory, and obsession.

Built with React, TypeScript, Tailwind CSS v4, GSAP, and DaisyUI.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Stack

- **Vite** + **React 18**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **GSAP** + ScrollTrigger for scroll animations
- **DaisyUI v5** component library
- **shadcn/ui** components (available in `src/app/components/ui/`)

## Structure

```
src/
  components/
    layout/      — Header, Footer, ThemeToggle
    sections/    — HeroSection, ArchiveGrid, SendForm
    ui/          — Reusable primitives (ArchiveCard, Divider)
  lib/           — gsap.ts (GSAP + ScrollTrigger), utils.ts (cn)
  styles/        — Tailwind directives, theme (dark/light), fonts
  app/           — shadcn/ui components (from Figma export)
```
