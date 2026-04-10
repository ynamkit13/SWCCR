# Brainstorm: AI Fitness Trainer

## What are you building?
AI Fitness Trainer is a mobile app that acts as a private, on-device workout 
coach for people who exercise alone. It uses your phone's camera to track your 
body in real time, counts your reps toward a goal, and gives you live voice 
feedback on your form — no gym membership, no personal trainer, no data leaving 
your phone. Built for solo gym-goers and home workout enthusiasts who want 
real guidance, motivation, and accountability without the intimidation of a 
human trainer.

**Project type:** MVP

---

## MVP Features

### Onboarding
- One-time quiz on first launch, saved locally to AsyncStorage:
  - How long have you been working out? (Never / Under 6 months / 1+ years)
  - How often do you exercise per week?
  - What's your goal? (Build strength / Lose weight / Stay active)
- AI uses answers to recommend starting sets, reps, and rest durations 
  per exercise
- User reviews AI recommendations and can adjust sets, reps, and rest 
  durations per exercise if they wish — or confirm as-is
- Phone setup guide — shows ideal phone height, distance, and angle 
  before the first workout

### Pre-Workout Flow
- AI generates a recommended workout queue based on fitness level and 
  past workout history — exercise order, sets, reps, and rest durations
- User can fully customise before starting:
  - Swap exercises
  - Adjust sets and reps
  - Reorder the queue
  - Change rest durations
- Pre-flight camera check — live camera screen that uses MediaPipe to 
  confirm the user's full body is visible and correctly positioned 
  before the session starts. Warns the user to adjust if skeleton 
  cannot be detected. Locks onto the first person detected — all 
  others in frame are ignored.

### During Workout
- Real-time pose estimation via camera — detects 33 body landmarks to 
  understand the user's movement without recording or storing any footage
- Skeletal overlay rendered on the live camera feed so the user can 
  see their own form with joint markers
- Basic exercises trackable from front view:
  - Bicep Curls
  - Lateral Raises
  - Jumping Jacks
- Two-system feedback approach:
  - **MediaPipe (live, on-device)** — detects bad form instantly 
    mid-rep with zero latency. Triggers immediate hardcoded voice 
    feedback ("keep your elbows tucked")
  - **AI (LLM, between sets)** — analyses the full set data and 
    delivers smarter contextual coaching during rest periods 
    ("your left elbow was drifting on reps 4-7, try slowing 
    down the curl")
- Goal-based rep counter — counts toward the user's target, 
  always visible on screen ("3 more to go!")
- 4 feedback types delivered in priority order:
  1. Form correction ("keep your elbows tucked")
  2. Rep/goal feedback ("3 more to go", "last set!")
  3. Practical advice ("take a rest", "drink some water")
  4. Motivation ("keep going", "you've got this")
- Smart audio output:
  - Headphones connected → voice feedback through headphones
  - No headphones → visual on-screen text feedback by default, 
    with option to enable speaker
  - Audio ducking — temporarily lowers background music during 
    voice feedback and restores it immediately after 
    (toggleable in settings)
  - Mute button always visible during a session — silences voice 
    feedback instantly while visual feedback continues, 
    one tap to unmute

### Rest Periods
- AI recommends rest duration based on exercise and fitness level
- User can adjust rest duration before and during the workout
- Countdown timer shown on screen, bold and readable
- When timer ends: "Ready for your next set?" with two buttons:
  - **Start** (green)
  - **+1 min** (grey) — snoozes and restarts countdown

### Post-Workout
- Workout logger — saves exercises, sets, reps, and date 
  locally to AsyncStorage after every session
- AI delivers a post-session summary with coaching notes 
  based on form data from the session

---

## Future Ideas

### Version 2
- Adding more exercises
- Camera features:
  - Front vs side view detection and side view recommendation 
    for exercises where it improves accuracy
  - Interpolation of out-of-frame joints with immediate voice 
    callout without pausing the session
- Authentication — user accounts, login, and cloud sync 
  (Clerk for auth, Supabase for database)
  - On auth setup, AsyncStorage data migrates to Supabase
- Progress analytics, streaks, and charts over time
- Workout recordings — saves to phone gallery
- In-app community (similar to Apple Fitness+ social features)

### Version 3
- Voice activation — start/stop/control the session 
  hands-free, like Siri
- Pose triggers — gestures like a thumbs up or timeout sign 
  that the user sets up during onboarding to control the 
  session hands-free without voice commands
- Social media sharing integrations

### Future Versions
- AI-recommended progressive workout plans based on 
  workout history
- Monetization — freemium or subscription model (e.g. basic 
  exercises free, advanced features and AI coaching depth 
  behind a paywall). Not a current goal — product and user 
  base comes first.

---

## Out of Scope
- Any server-side video storage or image capture of the 
  user — privacy, non-negotiable
- Calorie / nutrition tracking — different product entirely
- Live sessions with other users — different product entirely
- Wearable integration — the camera is the only sensor, always
- Paid trainer marketplace — defeats the purpose of an AI coach
- Monetization — not a current goal, to be revisited in 
  future versions

---

## Design & Style
Clean, athletic, and confidence-inspiring — think the polish 
of Apple Fitness+ meets the energy of a sports app. The camera 
feed should dominate the screen with the skeletal overlay 
feeling like a heads-up display, not a cluttered UI. The rep 
counter should be bold, high-contrast, and readable at a glance 
— always showing progress toward the goal. Popups and prompts 
should be minimal and non-intrusive — the workout should never 
feel interrupted. Dark-themed to reduce glare during exercise. 
On-screen text feedback should appear briefly and fade, never 
blocking the camera view.

---

## Tech Stack
- **Language:** TypeScript
- **Framework:** Next.js (React) + MediaPipe JS (pose detection 
  via WASM, in-browser) + Web Speech API (voice feedback)
- **Styling:** Tailwind CSS
- **Camera:** WebRTC (getUserMedia) for browser camera access
- **Database:** localStorage / IndexedDB (local, on-device — 
  workout logs and onboarding data). Migrates to Supabase in v2.
- **Hosting:** Vercel (recommended for Next.js)
- **Auth:** None for MVP — Clerk in v2
- **Already set up:** Anthropic API key available — open to 
  Claude, OpenAI, or Gemini; Claude Code recommends best fit 
  for real-time coaching latency and cost

---

## Other Engineering Requirements
- All pose detection and camera processing must run fully 
  in-browser — no camera data, frames, or images are ever 
  sent to a server
- MediaPipe locks onto the first person detected at session 
  start — all other people in frame are ignored throughout 
  the session
- Audio ducking must lower background music volume during 
  voice feedback and restore it immediately after
- Web-first (Chrome primary target), mobile app later

---

## Claude's Autonomy
- [x] Database schema design
- [x] API endpoint design
- [x] Component/file structure
- [x] Styling and visual details
- [x] Error handling approach
- [x] Testing strategy