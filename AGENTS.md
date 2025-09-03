# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: App Router entrypoints (`layout.tsx`, `page.tsx`) and global styles (`globals.css`).
- `public/`: Static assets served at site root (e.g., `public/next.svg`).
- Config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`.
- Build artifacts: `.next/` (ignored), optional `out/` for exports.

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js dev server with Turbopack at `http://localhost:3000`.
- `npm run build`: Create a production build in `.next/`.
- `npm start`: Serve the production build.
- `npm run lint`: Run ESLint using Next.js + TypeScript rules.

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode), ESNext modules; path alias `@/*` → `src/*`.
- React: Functional components in `.tsx`; use PascalCase for components and file names, camelCase for functions/variables, UPPER_SNAKE_CASE for constants.
- Linting: ESLint extends `next/core-web-vitals` and `next/typescript`. Fix issues or justify with comments.
- Styling: Tailwind CSS v4 via PostCSS; add utilities in `src/app/globals.css`. Prefer class utilities over custom CSS.
- Indentation & misc: 2 spaces; keep imports ordered (framework, libs, app modules, styles).

## Testing Guidelines
- No test runner is configured yet. If adding tests, prefer Vitest + React Testing Library.
- Place unit tests next to code as `*.test.ts`/`*.test.tsx` (e.g., `src/app/components/Button.test.tsx`).
- Aim for meaningful coverage of UI states and edge cases; avoid brittle snapshot tests.

## Commit & Pull Request Guidelines
- Commits: The history is minimal and not enforced. Recommended: Conventional Commits style, e.g., `feat(home): add hero section` or `fix(build): resolve lint error`.
- PRs: Small, focused changes. Include:
  - Clear description and rationale; link related issues (`Closes #123`).
  - Screenshots/GIFs for UI changes.
  - Checklist: `npm run lint` clean, `npm run build` succeeds, manual check in dev.

## Security & Configuration Tips
- Secrets: Use `.env` as the single env file for both Next.js and Prisma; never commit `.env*`. Client-exposed vars must be prefixed with `NEXT_PUBLIC_`.
- Assets: Put static files in `public/` and reference as `/file.png`.
- Accessibility: Address `next/core-web-vitals` ESLint suggestions (alt text, link semantics, headings).
