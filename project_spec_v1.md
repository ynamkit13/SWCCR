# Project Spec: AI Fitness Trainer

---

## 1. Project Goal
- [x] Building an MVP

**Goal statement:**
> AI Fitness Trainer is a web app that coaches solo gym-goers and 
> home workout enthusiasts through real-time pose detection, rep counting, 
> and AI-powered voice feedback — giving anyone the experience of a personal 
> trainer without the cost or intimidation, entirely in-browser with no data 
> leaving the device.

---

## 2. Milestones

### MVP (Milestone 1)
- Onboarding quiz — fitness level, frequency, goal
- Device setup guide and pre-flight camera check
- AI-generated workout queue with full user customisation
- Real-time pose estimation via camera with skeletal overlay
- Exercises: Bicep Curls, Lateral Raises, Jumping Jacks
- Two-system feedback: MediaPipe live form correction + 
  AI coaching between sets
- Goal-based rep counter
- 4-tier voice feedback system with priority order
- Smart audio output — audio ducking, mute button
- Rest timer with AI-recommended duration, user adjustable, 
  snooze option
- Post-workout AI summary
- Workout logger saved locally via localStorage / IndexedDB

**MVP is done when:** Every feature above is working end-to-end 
in Chrome on desktop.

### Version 2 (Milestone 2)
- Adding more exercises
- Camera features — front vs side view detection, side view 
  recommendation, out-of-frame joint interpolation
- Authentication — user accounts, login (Clerk)
- Cloud sync — localStorage migrates to Supabase
- Progress analytics, streaks, and charts over time
- Workout recordings — saves to device / cloud storage
- In-app community (similar to Apple Fitness+)

### Version 3 (Milestone 3)
- Voice activation — start/stop/control hands-free
- Pose triggers — user-defined gestures set up during onboarding
- Social media sharing integrations

### Future Versions
- AI-recommended progressive workout plans based on history
- Monetization — freemium or subscription model. Not a current 
  goal — product and user base comes first.

---

## 3. Product Requirements

### Who is this for?
**Target user:**
> Solo gym-goers and home workout enthusiasts who are new to exercise 
> and want real guidance on what to do, how to do it, and how much to 
> do — without the cost or intimidation of a human personal trainer.

**User context:**
> Used during workouts, alone, at the gym or at home. Their device 
> (laptop/tablet/phone) is propped up in front of them. They may 
> have headphones in and music playing. They need the app to be 
> glanceable and hands-free — they shouldn't need to touch their 
> device once the session starts.

### What problems does it solve?
1. No guidance — new gym-goers don't know what exercises to do or 
   how to do them correctly
2. No accountability — working out alone means no one to count reps, 
   check form, or push you to finish
3. No affordability — personal trainers are expensive and 
   inaccessible for most people

### Key User Flows

#### Flow 1 — Onboarding (first launch only)
1. User opens app for the first time
2. Greeted with a welcome screen explaining what the app does
3. Presented with setup guide — ideal device height, distance, 
   and angle for workouts
4. Onboarding quiz:
   - How long have you been working out?
   - How often do you exercise per week?
   - What's your goal?
5. AI generates recommended starting sets, reps, and rest 
   durations based on answers
6. User reviews AI recommendations and can adjust sets, reps, 
   and rest durations per exercise if they wish — or confirm 
   as-is
7. Preferences saved locally to localStorage
8. User lands on home screen

#### Flow 2 — Pre-Workout Setup
1. User opens app and sees home screen
2. AI generates a recommended workout queue based on fitness 
   level and past workout history
3. User reviews the queue — can swap exercises, adjust sets, 
   reps, rest durations, and reorder
4. User confirms queue and taps Start
5. Pre-flight camera check screen opens — live camera feed 
   with MediaPipe detecting the user's full body
6. If full skeleton detected → green confirmation, 
   "You're good to go"
7. If skeleton not fully detected → warning with instructions 
   to adjust device position
8. User taps Begin Workout

#### Flow 3 — During Workout
1. Camera feed dominates the screen with skeletal overlay
2. Current exercise, set number, and rep goal shown on screen
3. User performs exercise — MediaPipe tracks joints in real time
4. Rep counter increments toward goal, always visible
5. If bad form detected → immediate voice feedback 
   ("keep your elbows tucked") + on-screen text
6. Rep goal reached → "Set complete!"
7. Rest timer begins — AI-recommended duration shown as 
   countdown
8. Between sets → AI delivers contextual coaching based on 
   set data ("your left elbow drifted on reps 4-7, 
   slow it down")
9. Rest timer ends → "Ready for your next set?" with 
   Start (green) and +1 min (grey) buttons
10. User taps Start → next set begins
11. All sets for exercise complete → moves to next exercise 
    in queue
12. Mute button always visible — one tap silences voice, 
    visual feedback continues

#### Flow 4 — Post-Workout
1. All exercises in queue complete → workout ends automatically
2. Post-workout summary screen:
   - Exercises completed
   - Total sets and reps
   - AI coaching notes based on form data from the session
3. Workout saved to logger in localStorage
4. User returns to home screen

---

## 4. Technical Requirements

### Tech Stack
| Component | Choice | Notes |
|-----------|--------|-------|
| Language | TypeScript | |
| Frontend Framework | Next.js (React) | Web-first, mobile later |
| Styling | Tailwind CSS | |
| Component Library | Claude recommends | |
| Backend Framework | None for MVP — Claude recommends for v2 | |
| Database | localStorage / IndexedDB (MVP) → Supabase (v2) | Migrates when auth is added |
| Authentication | None for MVP — Clerk (v2) | |
| Hosting | Vercel | Recommended for Next.js |
| Payments | None — future versions only | Not a current goal. Stack to be determined when monetization is revisited. |
| Email | None for MVP — Resend (v2) | For auth emails — verification, password reset |
| Object Storage | None for MVP — Cloudflare R2 (v2) | For workout recordings in v2 |
| AI/ML | Claude recommends best fit | Anthropic API key available |
| Pose Detection | MediaPipe JS (WASM) | Runs fully in-browser via WebRTC |
| Voice Output | Web Speech API | Built into modern browsers |
| Testing | Vitest + React Testing Library | TDD workflow |
| Linting | ESLint + Prettier | |

### Technical Architecture

**System overview:**
AI Fitness Trainer is a fully client-side web application. 
There is no backend server in the MVP. All processing — pose 
detection, rep counting, form analysis — happens in-browser. 
The only external call is to an AI/ML API between sets for 
contextual coaching. Workout data and user preferences are 
stored locally via localStorage / IndexedDB.

**Key components:**
1. Camera + MediaPipe JS — WebRTC captures live camera feed, 
   MediaPipe WASM detects 33 body landmarks in real time, 
   Canvas renders skeletal overlay
2. Rep Counter + Form Analyser — calculates joint angles from 
   MediaPipe landmarks, detects rep completion, triggers 
   immediate hardcoded voice feedback on bad form
3. AI Coaching Engine — sends set data to LLM API between 
   sets, receives contextual coaching, delivers via 
   Web Speech API or on-screen text
4. Audio Manager — handles audio ducking, mute state, and 
   routes feedback to correct output
5. Workout Queue Manager — stores the current session's 
   exercise queue, tracks progress through sets and exercises, 
   manages rest timer
6. Local Storage — localStorage / IndexedDB reads and writes 
   for onboarding data, user preferences, and workout logs

**Database schema (localStorage / IndexedDB — MVP):**

user_profile
- fitnessLevel: string (never/beginner/intermediate)
- weeklyFrequency: number
- goal: string (strength/weight_loss/active)
- defaultSets: number
- defaultReps: number
- defaultRestDuration: number (seconds)
- onboardingComplete: boolean

workout_logs (stored as array)
- id: string (unique, auto-generated)
- date: string (ISO format)
- exercises: [
    - exerciseName: string
    - sets: [
        - setNumber: number
        - repsCompleted: number
        - formNotes: string (AI coaching note for this set)
      ]
  ]
- aiSummary: string (post-workout AI summary)

user_preferences
- audioOutputSpeaker: boolean
- audioDuckingEnabled: boolean
- defaultMuted: boolean

**API design:**

All API calls are client-side. One external integration — AI/ML 
provider (Claude, OpenAI, or Gemini — Claude Code recommends 
best fit).

POST /ai-coaching (called between sets)
- Input: exercise name, set number, reps completed, 
  form issues detected (array of joint/angle violations)
- Output: contextual coaching message (string)

POST /ai-summary (called post-workout)
- Input: full workout log for the session (exercises, 
  sets, reps, form issues)
- Output: post-workout summary with coaching notes (string)

POST /ai-workout-recommendation (called on home screen)
- Input: user profile, last 5 workout logs
- Output: recommended workout queue (exercise name, 
  sets, reps, rest duration per exercise)

### Infrastructure to Provision
Before building, set up:
- [ ] Anthropic API key (already have) — confirm billing enabled
- [ ] Node.js installed locally — required for Next.js
- [ ] Vercel account — for deployment
- [ ] GitHub repo — for version control and CI/CD

---

## 5. Questions to Answer

**Product questions:**
- [ ] What does the home screen look like — does it show 
      workout history, the AI recommended queue, or both?
- [ ] What happens if the user wants to skip an exercise 
      mid-session?
- [ ] What happens if the user wants to end the workout 
      early — is there a confirmation prompt?
- [ ] How many past workout logs does the AI use to generate 
      recommendations — and what does it recommend on the 
      very first workout with no history?

**Technical questions:**
- [ ] Which AI/ML provider gives the best balance of speed 
      and cost for real-time between-set coaching? 
      (Claude Code to benchmark)
- [ ] Can MediaPipe JS (WASM) run at a stable 30fps in Chrome 
      alongside Web Speech API and Canvas skeletal overlay?
- [ ] Does the Web Speech API work reliably across browsers 
      when third-party audio is playing?
- [ ] What is the exact joint angle threshold per exercise 
      that defines a completed rep and bad form? 
      (requires testing and tuning)

---

## 6. Out of Scope
- Any server-side video storage or image capture of the 
  user — privacy, non-negotiable
- Calorie / nutrition tracking — different product entirely
- Live sessions with other users — different product entirely
- Wearable integration — the camera is the only sensor, always
- Paid trainer marketplace — defeats the purpose of an AI coach
- Monetization — not a current goal, to be revisited in 
  future versions

---

## Summary

**One-liner:** 
An in-browser AI fitness coach that tracks your form, counts 
your reps, and coaches you through workouts in real time — 
no trainer, no gym membership, no data leaving your device.

**MVP scope:** 
Onboarding quiz, AI-generated workout queue, real-time pose 
estimation with skeletal overlay, goal-based rep counting, 
two-system AI feedback (live MediaPipe form correction + 
LLM coaching between sets), smart audio output, rest timer, 
workout logger, and post-workout AI summary. Web-first 
(Chrome), fully client-side.

**Tech stack:** 
TypeScript, Next.js, Tailwind CSS, MediaPipe JS, Web Speech 
API, localStorage / IndexedDB, AI/ML provider (Claude Code 
recommends)

**First milestone "done" looks like:** 
A user can open the app in Chrome, complete onboarding, 
receive an AI-recommended workout, perform bicep curls with 
a working rep counter and live form feedback, rest between 
sets with a timer, and see a post-workout summary — all 
without any data leaving their device.

---
> **Next step:** Once this spec is complete, move to the 
> Setup Checklist to configure Claude Code for your project.