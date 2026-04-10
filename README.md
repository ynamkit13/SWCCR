# AI Fitness Trainer

A web app that coaches you through workouts using real-time pose detection, rep counting, and voice feedback — giving anyone the experience of a personal trainer, entirely in-browser with no data leaving the device.

## What It Does

- **Real-time pose detection** via webcam + MediaPipe with skeletal overlay
- **Automatic rep counting** using joint angle calculations
- **Voice form feedback** — tells you when your elbows drift, knees lock, back arches, etc.
- **AI coaching between sets** powered by Claude API
- **Smart workout recommendations** that adapt based on your history and performance
- **Rest timer** with countdown, snooze, and skip
- **Post-workout AI summary** of your session
- **Fully client-side** — no camera data ever leaves your browser

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Pose Detection | MediaPipe JS (WASM, runs in-browser) |
| Voice Feedback | Web Speech API |
| AI Coaching | Anthropic Claude API |
| Drag & Drop | @dnd-kit |
| Testing | Vitest + React Testing Library |
| Storage | localStorage (MVP) |

## Getting Started

### Prerequisites

- Node.js 18+
- Chrome browser (primary target)
- Anthropic API key (for AI coaching features)

### Setup

```bash
# Install dependencies
npm install

# Copy env file and add your Anthropic API key
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome.

### Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests in watch mode
npm run test:run     # Run all tests once
npm run lint         # Lint check
npm run format       # Format code
```

## How It Works

1. **Onboarding** — Answer 3 questions about your fitness level, frequency, and goals
2. **Recommendations** — Get a workout plan tailored to your answers, adjustable before starting
3. **Workout** — Camera tracks your pose in real-time, counts reps, and gives voice feedback on form
4. **Rest** — Countdown timer between sets with AI coaching notes
5. **Summary** — Post-workout recap with AI-generated insights

The app adapts over time: exercises are reordered based on recency, and reps increase or decrease based on your performance in previous sessions.

## Privacy

All pose detection and camera processing runs **fully in-browser**. No camera data, frames, or images are ever sent to a server. The only external API calls are for AI coaching text (exercise names and rep counts, never video).

## Project Structure

```
src/
  app/                    # Next.js pages and API routes
    home/                 # Home screen with today's workout
    onboarding/           # Setup, quiz, recommendations
    workout/              # Queue, session, summary
    api/                  # AI coaching and summary endpoints
  components/             # Reusable UI components
  lib/                    # Core logic
    angles.ts             # Joint angle calculations
    repCounter.ts         # Rep detection per exercise
    formAnalyser.ts       # Form rules (17 rules across 3 exercises)
    poseDetector.ts       # MediaPipe integration
    speech.ts             # Priority-based voice queue
    recommendations.ts    # History-based workout planning
    aiCoaching.ts         # Claude API integration
    storage.ts            # Typed localStorage wrapper
```

## Docs

- [Project Spec](project_spec_v1.md) — Full MVP specification
- [Architecture](docs/architecture.md) — Technical architecture and data flow
- [Changelog](docs/changelog.md) — Version history
