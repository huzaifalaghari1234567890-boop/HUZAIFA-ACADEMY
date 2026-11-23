# 🎬 Huzaifa Academy - Multi-Page Web Platform

A high-conversion multi-page promotional web platform built for the official YouTube channel **[Huzaifa Academy (@HuzaifaAcademy-z6m)](https://www.youtube.com/@HuzaifaAcademy-z6m)**.

Engineered with a cinematic aesthetic inspired by Netflix and Curiosity Stream, this platform features dedicated pages for every core experience, embedded in-page YouTube player with guaranteed official view attribution, an interactive mystery roulette wheel, search and category filters, responsive dual-theme support (Dark & Light), and particle constellation physics.

---

## 🌟 Channel Overview
- **Channel Name:** Huzaifa Academy
- **Handle:** `@HuzaifaAcademy-z6m`
- **Channel URL:** [https://www.youtube.com/@HuzaifaAcademy-z6m](https://www.youtube.com/@HuzaifaAcademy-z6m)
- **Direct Subscribe Link:** [Subscribe with One Click](https://www.youtube.com/@HuzaifaAcademy-z6m?sub_confirmation=1)
- **Content Focus:** Educational Documentaries in Urdu covering Ancient Mysteries, Historical Enigmas, Maritime Anomalies, Deep Oceans, and Astrophysics.
- **Indexed Catalog:** 14 verified official documentaries with authentic titles, durations, and view counts.

---

## 📑 Multi-Page Website Architecture

Each major feature now lives on its own dedicated, fast-loading page with synchronized navigation:

| Page | File | Description |
|---|---|---|
| **Home** | `index.html` | Hero showcase with constellation starfield canvas, typewriter tagline cycler, featured premiere spotlight, 3 top documentaries with 3D tilt, 4 educational pillars, testimonials, and subscribe CTA. |
| **Cinema Studio Player** | `studio.html` | Full-screen cinema player supporting query routing (`?v=VIDEO_ID`), side playlist queue of all 14 documentaries, theater lights dimmer, direct YouTube comments and like buttons. Views register directly on YouTube. |
| **Documentaries Archive** | `documentaries.html` | Comprehensive catalog of all 14 official documentaries with live search bar, multi-category pills, sorting dropdown (Views, Duration, Title, Release), 3D card tilt, and bookmarking. |
| **Mystery Wheel** | `wheel.html` | Interactive "Mystery Roulette" recommendation engine that randomly picks and previews documentaries with custom Web Audio chimes and quick-launch into Studio Player. |
| **About Channel** | `about.html` | Creator profile, channel philosophy, 4-step research standards, frequently asked questions (FAQs) regarding view counting, and viewer testimonials. |

---

## 🚀 Key Platform Features

### 1. 📺 In-Page Cinema Studio Player (Guaranteed Official YouTube Views)
- Dedicated on-page theater stage with an interactive sidebar queue of all 14 documentaries.
- Embedded via the official YouTube IFrame API using `enablejsapi=1` and window origin parameters.
- **Official View Counting:** In accordance with YouTube's embedded player policies, user-initiated playback in the embedded player registers valid views and watch time directly to `@HuzaifaAcademy-z6m` on YouTube.
- Studio controls: "Watch on YouTube", "Join Discussion on YouTube" (jumps to comments), "Copy Video Link", and "Theater Lights" (dims page lighting to dark ambient mode).

### 2. 🔍 Instant Search & Multi-Category Filters
- Real-time search across titles, synopses, and tags on `documentaries.html`.
- Category pills: *All (14)*, *Ancient Mysteries (4)*, *Disasters & Vanishings (4)*, *Science & Nature (3)*, and *Space & Engineering (3)*.
- Multi-attribute sort: *Latest Uploads*, *Most Popular (Views)*, *Longest Duration*, *Shortest Duration*, *Alphabetical (A - Z)*.

### 3. 🎲 "Mystery Roulette" Recommendation Engine
- Dedicated interactive wheel on `wheel.html` that randomly selects a documentary from the channel archives.
- Synthesized Web Audio chimes accompany every roll.

### 4. 🌓 Seamless Dual-Theme Mode (Dark & Light)
- Fast toggle between **Cosmic Dark** and **Crisp Light** themes.
- Persists user choice across pages via `localStorage`.
- Available on desktop navbar and mobile slide-out drawer.

### 5. 🔊 Web Audio API Acoustic Feedback
- Zero-external-file audio synthesizer built using native browser `AudioContext`.
- Tactile micro-tones on category pill clicks and harmonic chords on roulette wheel spins.
- Sound mute/unmute toggle in navbar.

### 6. ✨ Modern Motion & 3D Interactive Card Tilt
- Constellation physics starfield on Home page canvas that responds to cursor movement.
- True 3D perspective card tilt with dynamic reflective light glare (`--mouse-x`, `--mouse-y`) on all documentary cards.

---

## 📁 File Structure

```text
huzaifa-academy-web/
├── index.html          # Standalone Home Page (Hero, Spotlight, Featured, Testimonials)
├── studio.html         # Standalone Cinema Studio Player (Full player + side queue)
├── documentaries.html  # Standalone Catalog Page (Search, Sort, Category Pills, 14 Cards)
├── wheel.html          # Standalone Mystery Roulette Wheel Page (Randomizer Engine)
├── about.html          # Standalone About Channel Page (Creator, Mission, FAQs, Reviews)
├── styles.css          # Glassmorphic dual-theme CSS design system with 3D tilt styles
├── app.js              # Multi-page engine, Web Audio synth, URL router, search & filter
├── videos-data.js      # Structured catalog containing all 14 official documentaries & tags
├── Start-Server.ps1    # Zero-dependency local PowerShell web server (.NET HttpListener)
└── README.md           # Documentation & instructions
```

---

## ⚡ How to Run

### Method 1: Local HTTP Server (Recommended)
Open PowerShell in the project directory and run:
```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Server.ps1
```
This starts the local web server at `http://localhost:8080/` and automatically launches your default browser.

### Method 2: Direct File Opening
Double-click `index.html` in Windows File Explorer or open any `.html` file directly in Chrome, Edge, Firefox, or any modern browser.
