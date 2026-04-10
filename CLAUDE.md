# CLAUDE.md — AI Fitness Trainer

> This file is the source of truth for Claude Code when working on this project.
> Read this before making any changes.

---

## Project Goals

AI Fitness Trainer is a web app that coaches solo gym-goers and home workout enthusiasts through real-time pose detection, rep counting, and AI-powered voice feedback — giving anyone the experience of a personal trainer without the cost or intimidation, entirely in-browser with no data leaving the device.

- **Current phase:** MVP (web-first, Chrome primary target)
- **Approach:** Test-Driven Development (TDD) — write tests first, then implement
- **Milestone strategy:** Multiple milestones, each with GitHub issues. See [project_spec_v1.md](project_spec_v1.md) for full milestone breakdown.

### Active Milestone

**Milestone 1 — UI & Frontend (mock data)**
All screens with navigation wired up using mock data. No camera, no AI, no pose detection yet.
- Onboarding flow (welcome, setup guide, quiz, AI recommendations review)
- Home screen
- Pre-workout queue customisation screen
- Workout screen (mock exercise display, rep counter UI, skeletal overlay placeholder)
- Rest timer screen
- Post-workout summary screen

---

## Architecture Overview

Fully client-side web app. No backend server in the MVP. See [docs/architecture.md](docs/architecture.md) for detailed architecture.

**Key components:**
1. **Camera + MediaPipe JS** — WebRTC camera, MediaPipe WASM pose detection, Canvas overlay
2. **Rep Counter + Form Analyser** — Joint angle calculations, rep detection, form feedback
3. **AI Coaching Engine** — LLM API calls between sets for contextual coaching
4. **Audio Manager** — Audio ducking, mute state, output routing
5. **Workout Queue Manager** — Session exercise queue, set/rep tracking, rest timer
6. **Local Storage** — localStorage / IndexedDB for all persistent data

**Tech stack:** TypeScript, Next.js, Tailwind CSS, Vitest + React Testing Library, MediaPipe JS, Web Speech API, ESLint + Prettier

---

## Design, Style, UX Guides

- **Theme:** Light, warm, and approachable — think ClassPass meets a modern wellness dashboard
- **Aesthetic:** Clean, friendly, confidence-inspiring. Airy layouts with generous spacing. The app should feel inviting, not intimidating.
- **Styling:** Tailwind CSS utility-first. No custom CSS unless absolutely necessary.
- **Design reference:** See `.claude/design-reference.png` for the visual direction.
- **Camera feed** dominates the workout screen. Skeletal overlay sits on top.
- **Rep counter** must be bold, high-contrast, readable at a glance — always showing progress toward the goal ("3 more to go!").
- **Popups and prompts** are minimal and non-intrusive — the workout should never feel interrupted.
- **On-screen text feedback** appears briefly and fades, never blocking the camera view.
- **Rest timer** must be bold and readable — large countdown numbers.
- **Cards:** Rounded corners, soft shadows, clean image containers.
- **Typography:** Clean sans-serif. Dark text on light backgrounds. Generous line height.
- **Colour palette:**
  - Background: white / light cream (`#FFFFFF`, `#FAFAFA`)
  - Primary accent: green (`#4CAF50` or similar) — buttons, active states, tags
  - Secondary accent: soft purple/lavender (`#E8DEF8` or similar) — sidebar, surfaces, subtle highlights
  - Badges/labels: warm coral/orange gradient — difficulty levels, categories
  - Text: dark grey/near-black (`#1A1A1A`) for body, medium grey for secondary text
  - Error/warning: red for form corrections
  - Success: green for completed sets/reps

---

## Constraints and Policies

- **Privacy is non-negotiable.** All pose detection and camera processing runs fully in-browser. No camera data, frames, or images are ever sent to a server.
- **TDD is mandatory.** Every feature must have tests written before implementation. The workflow is: write test → run test (expect fail) → implement → run test (expect pass).
- **Web-first.** Chrome is the primary target browser. Mobile app comes later.
- **No server-side storage** of any user data in MVP. Everything is localStorage / IndexedDB.
- **MediaPipe locks onto the first person** detected at session start — all others in frame are ignored.
- **No feature creep.** Stick to the current milestone scope. Future ideas go in [brainstorming.md](brainstorming.md), not into code.

---

## Repo / Git Etiquette

- **Branching:** One branch per milestone (e.g., `milestone-1/ui-screens`). Multiple issues are solved on the same branch.
- **Merging:** Squash merge to `main` when the milestone is complete.
- **Commit messages:** Use conventional commits — `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`.
- **Issues:** Claude creates GitHub issues for every feature/component with:
  - Clear acceptance criteria
  - TDD test requirements (what tests to write)
  - Labels (e.g., `milestone-1`, `ui`, `feature`, `bug`)
- **PRs:** One PR per milestone. PR description should reference all issues resolved.

---

## Frequently Used Commands and Workflows

### Development
```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

### Testing (TDD)
```bash
npm run test         # Run Vitest in watch mode
npm run test:run     # Run all tests once (CI mode)
npm run test:ui      # Vitest UI (visual test runner)
```

### TDD Workflow
1. Write a failing test for the feature/component
2. Run `npm run test` — confirm the test fails (red)
3. Write the minimum code to make the test pass
4. Run `npm run test` — confirm the test passes (green)
5. Refactor if needed — tests must still pass
6. Commit with `test:` and `feat:` prefixes

### Git
```bash
git checkout -b milestone-N/description   # New milestone branch
git add <files>                           # Stage specific files
git commit -m "feat: description"         # Conventional commit
git push -u origin milestone-N/description  # Push branch
```

---

## Testing and Build Instructions

- **Framework:** Vitest + React Testing Library
- **Test location:** Co-located with source — `src/components/__tests__/ComponentName.test.tsx` or `src/components/ComponentName.test.tsx`
- **Naming:** `*.test.tsx` for component tests, `*.test.ts` for utility/logic tests
- **What to test:**
  - Every UI component renders correctly
  - User interactions (clicks, form inputs) produce expected results
  - State changes work as expected
  - Edge cases (empty states, error states, boundary values)
- **What NOT to test:**
  - Third-party library internals
  - Styling/CSS (unless behaviour depends on it)
  - Implementation details — test behaviour, not code structure
- **Coverage:** Aim for meaningful coverage, not 100%. Every feature should have at least one happy-path test and one edge-case test.

---

## Key Reference Docs

| Doc | Purpose |
|-----|---------|
| [brainstorming.md](brainstorming.md) | Feature ideas, future versions, out-of-scope list |
| [project_spec_v1.md](project_spec_v1.md) | Full project spec — milestones, user flows, tech stack, schema |
| [docs/architecture.md](docs/architecture.md) | Technical architecture, component breakdown, data flow |
| [docs/changelog.md](docs/changelog.md) | Version history and notable changes |

---

## Claude Code Features for This Project

### Recommended Skills
- **`/frontend-design`** — Use when building UI components. Produces polished, production-grade interfaces matching our dark + neon green theme.
- **`/tdd`** (custom, to be created) — Enforces TDD workflow: generates a failing test file for a component/feature, then prompts implementation.
- **`/create-issues`** (custom, to be created) — Reads a milestone spec and batch-creates GitHub issues with labels, acceptance criteria, and test requirements.

### Recommended Hooks
- **Pre-commit:** Run `vitest run --changed` before every commit to prevent breaking tests.

### MCP Servers
- **claude-in-chrome** — Use for visual testing of the web app in Chrome during development. Verify UI rendering, test camera permissions, check responsive layout.

---

## Self-Maintenance Reminder

> **Claude: Update this file when any of the following happen:**
> - A new milestone begins (update "Active Milestone" section)
> - The tech stack changes (update Architecture Overview and commands)
> - New conventions or patterns are established (add to relevant section)
> - A milestone is completed (move it to a "Completed" section, update Active Milestone)
> - New docs are created (add to Key Reference Docs table)
> - New commands are added (update Frequently Used Commands)
> - Design tokens or colour palette changes (update Design section)
>
> Also update [docs/changelog.md](docs/changelog.md) with notable changes and [docs/architecture.md](docs/architecture.md) if the system design evolves.
