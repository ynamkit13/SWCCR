# Architecture

> This document describes the technical architecture of AI Fitness Trainer.
> Updated as the project evolves.

---

## System Overview

AI Fitness Trainer is a fully client-side web application built with Next.js. There is no backend server in the MVP. All processing — pose detection, rep counting, form analysis — happens in-browser. The only external call is to an AI/ML API for contextual coaching between sets and post-workout summaries.

## Key Components

### 1. Camera + MediaPipe JS
- WebRTC (`getUserMedia`) captures live camera feed
- MediaPipe WASM detects 33 body landmarks in real time
- HTML Canvas renders skeletal overlay on the camera feed

### 2. Rep Counter + Form Analyser
- Calculates joint angles from MediaPipe landmarks
- Detects rep completion based on angle thresholds per exercise
- Triggers immediate hardcoded voice feedback on bad form

### 3. AI Coaching Engine
- Sends set data to LLM API between sets
- Receives contextual coaching feedback
- Delivers via Web Speech API or on-screen text

### 4. Audio Manager
- Handles audio ducking (lowers background audio during feedback)
- Manages mute state
- Routes feedback to correct output

### 5. Workout Queue Manager
- Stores the current session's exercise queue
- Tracks progress through sets and exercises
- Manages rest timer countdown

### 6. Local Storage
- localStorage / IndexedDB for onboarding data, user preferences, and workout logs
- Migrates to Supabase in v2 when auth is added

## Data Flow

```
Camera (WebRTC) → MediaPipe JS (WASM) → Landmark Data
    → Rep Counter (angle calculations) → Rep state + form issues
    → AI Coaching Engine (between sets) → LLM API → coaching text
    → Audio Manager → Web Speech API / on-screen text
    → Workout Logger → localStorage
```

## Tech Stack

See [project_spec_v1.md](../project_spec_v1.md) for the full tech stack table.

## Directory Structure

> To be populated once the project is scaffolded.
