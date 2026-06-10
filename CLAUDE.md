# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for **La Máquina IA**, an AI process automation company. The site showcases services related to autonomous agents, workflow automation, and enterprise process optimization.

- **Tech Stack**: Plain HTML/CSS/JavaScript (no build process needed)
- **Styling**: Inline CSS + Tailwind CDN
- **Hosting**: Vercel (deployment via `vercel.json`)
- **Dev Server**: Node.js (`serve.mjs` on port 3000)
- **Testing**: Puppeteer screenshots (`screenshot.mjs`)

## Key Files & Structure

| File | Purpose |
|------|---------|
| `index.html` | Main landing page |
| `serve.mjs` | Local dev server (handles clean URLs, video ranges, 404 fallback to .html) |
| `screenshot.mjs` | Puppeteer screenshot tool for visual testing |
| `vercel.json` | Vercel deployment config (CSP headers, security headers, HTTPS enforcement) |
| `package.json` | Dependencies only (Puppeteer); no build or test scripts |
| `servicios.html` | Services detail page (linked from index, served as `/servicios`) |
| `politica-de-privacidad.html`, `terminos-y-condiciones.html` | Legal pages |
| `sitemap.xml`, `robots.txt` | SEO files (URLs use the clean slugs) |
| `assets/` | `three.min.js` for 3D graphics |

## Dev Commands

```bash
# Start local dev server (http://localhost:3000)
node serve.mjs

# Take a screenshot of the current state
node screenshot.mjs http://localhost:3000

# Screenshot with a label (saves as screenshot-N-label.png)
node screenshot.mjs http://localhost:3000 my-feature

# Run Puppeteer with custom URL
node screenshot.mjs http://localhost:3000/servicios
```

## Always Do First (Frontend Work)

- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images

- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server

- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow

- Use Puppeteer via `screenshot.mjs` to capture full-page screenshots at **1440×900 (2x DPI)**.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

**Note on Puppeteer paths:** `screenshot.mjs` contains a hardcoded Chrome path. This may vary by machine. If screenshots fail due to "executable not found," update the `executablePath` in `screenshot.mjs` to your local Puppeteer installation (typically `~/.cache/puppeteer/`).

## Output Defaults

- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets

- The brand logo is text-based (CSS-styled "LaMáquinaIA" wordmark in the HTML). `logo.png` in the root deploys publicly but is not referenced by any page.
- **Current brand colors in use**: `--pr: #1E40AF` (primary blue), `--ct: #F97316` (accent orange)

## Anti-Generic Guardrails

- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules

- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

## Deployment & Security

The site deploys to **Vercel** via `vercel.json`. Key settings:

- **CSP (Content Security Policy)**: Restricts scripts to `'self'` and `'unsafe-inline'` (needed for inline styles). External sources allowed: Google Fonts, Formspree forms.
- **Security Headers**: HSTS (2-year max-age), X-Frame-Options (DENY), Referrer-Policy, Permissions-Policy (camera/mic/geolocation blocked).
- **Clean URLs**: `/servicios` → `servicios.html` (`cleanUrls: true` in `vercel.json` for prod; `serve.mjs` fallback in dev).
- **Redirects 301**: old slugs (`/servicios-v3`, `/terminosycondiciones`, `/politicasdeprivacidad`) redirect permanently to the new clean URLs via `vercel.json`.

## Notes

- No test or lint scripts defined — testing is manual via screenshots.
- All styling is **inline in HTML** for simplicity and performance.
- The site uses **Plus Jakarta Sans** from Google Fonts exclusively.
