<div align="center">

# ⚡ AI Interview Prep 3D - Next-Gen Autonomous Interview Simulation & Proctoring System

[![Live Frontend](https://img.shields.io/badge/Frontend-Live%20on%20Render-6366f1?style=for-the-badge&logo=render&logoColor=white)](https://ai-interview-frontend-4qd5.onrender.com/)
[![Live Backend](https://img.shields.io/badge/Backend-API%20Live-06b6d4?style=for-the-badge&logo=fastapi&logoColor=white)](https://ai-interview-backend-hy1o.onrender.com/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

An intelligent, full-stack AI interview preparation platform combining **Real-Time 3D Computer Vision**, **Dynamic Question Generation**, **Biometric Confidence & Posture Analysis**, **Voice Acoustics & Live Speech-to-Text**, and an **Anti-Cheating Proctoring Shield**.

---

### 🌐 Live Production Links:
- 🚀 **Live Web Application:** [https://ai-interview-frontend-4qd5.onrender.com/](https://ai-interview-frontend-4qd5.onrender.com/)
- ⚙️ **Live Backend REST API:** [https://ai-interview-backend-hy1o.onrender.com/](https://ai-interview-backend-hy1o.onrender.com/)

---

</div>

## 📑 Table of Contents
- [🌟 Key Highlights & Core Features](#-key-highlights--core-features)
  - [1. Dynamic AI Question Generation](#1-dynamic-ai-question-generation)
  - [2. Real-Time 3D Face Mesh & Posture Detection](#2-real-time-3d-face-mesh--posture-detection)
  - [3. Dynamic Live Confidence Gauge (0-100%)](#3-dynamic-live-confidence-gauge-0-100)
  - [4. Anti-Cheating & Proctoring Shield](#4-anti-cheating--proctoring-shield)
  - [5. AI Voice Reading & Live Speech-to-Text](#5-ai-voice-reading--live-speech-to-text)
  - [6. Automated AI Answer Evaluation](#6-automated-ai-answer-evaluation)
  - [7. 3D Cybernetic UI & Particle Constellation](#7-3d-cybernetic-ui--particle-constellation)
- [🛠️ Tech Stack & Technologies Used](#️-tech-stack--technologies-used)
- [📂 Project Folder Structure](#-project-folder-structure)
- [💻 Local Setup & Installation Guide](#-local-setup--installation-guide)
- [📡 Backend API Documentation](#-backend-api-documentation)
- [🚀 Deployment on Render](#-deployment-on-render)
- [🛡️ Anti-Cheating Integrity Metrics](#️-anti-cheating-integrity-metrics)
- [🤝 Contributing & License](#-contributing--license)

---

## 🌟 Key Highlights & Core Features

```
               ┌────────────────────────────────────────┐
               │    AI Interview Prep 3D Platform       │
               └───────────────────┬────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐      ┌──────────────────┐
│  Computer Vision │     │  Voice & Speech  │      │ AI Question & Eval│
│  & Biometrics    │     │  Acoustics       │      │ Engine           │
├──────────────────┤     ├──────────────────┤      ├──────────────────┤
│• 3D Face Mesh    │     │• Natural TTS Read│      │• Multi-Domain Qs │
│• Posture Vector  │     │• Real-Time STT   │      │• Custom Topics   │
│• Eye Contact/Gaze│     │• Filler Words    │      │• STAR Evaluation │
│• Dynamic Conf %  │     │• Voice Energy    │      │• Actionable Tips │
└──────────────────┘     └──────────────────┘      └──────────────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   ▼
                   ┌────────────────────────────────┐
                   │ Anti-Cheating Proctoring Guard │
                   │  (Tab Switch, Copy/Paste, Gaze)│
                   └────────────────────────────────┘
```

### 1. Dynamic AI Question Generation
- **Targeted Roles & Domains:**
  - 💻 `Software Engineer` (System Design, DSA, Clean Code, Microservices)
  - ⚛️ `Frontend Engineer (React)` (UI Architecture, Hooks, State Management, Core Web Vitals)
  - ⚙️ `Backend Engineer (Python/API)` (Database Indexing, Scalability, Caching, REST/gRPC)
  - 🧠 `AI & Data Scientist` (ML Models, LLM Quantization, RAG Architectures, Pipelines)
  - 🤝 `HR & Behavioral Round` (STAR Method, Conflict Resolution, Team Leadership)
- **Experience Levels:** Junior, Mid, Senior.
- **Custom Tech Stack Keywords:** Allows candidates to enter specialized tools (e.g. *Docker, Kubernetes, Next.js, Redux, FastAPI*), generating dynamic scenario-based architectural questions.

---

### 2. Real-Time 3D Face Mesh & Posture Detection
- Real-time video frame processing with high-performance HTML5 Canvas vision heuristics.
- **Visual 3D Sci-Fi Face Overlay:** Corner tracking brackets, eye-connecting vector lines, nose coordinates, and mouth landmarks drawn dynamically over the camera stream.
- **Posture Vector & Slouching Tracker:** Measures head-to-baseline orientation to flag:
  - `Good Posture ✅` (Upright, centered)
  - `Slouching / Too Low ⚠️` (Candidate is hunching down)
  - `Head Tilted / Off-Center ⚠️` (Candidate is leaning excessively)
- **Eye Gaze & Attention Tracker:** Detects direct screen engagement vs looking away from the camera.

---

### 3. Dynamic Live Confidence Gauge (0-100%)
- Computes a continuous biometric confidence index based on:
  - Posture stability & center-frame alignment
  - Direct eye contact persistence
  - Facial positivity and engagement
  - Voice energy cadence & volume steadiness
- Visual animated glowing confidence bar with categorized biometric states:
  - `🌟 High Confidence` (80% - 100%)
  - `👍 Steady Confidence` (60% - 79%)
  - `⚠️ Building Confidence` (< 60%)

---

### 4. Anti-Cheating & Proctoring Shield
- **Tab Switch & Focus Lost Detection:** Monitors `visibilitychange` and `window.blur` events. Triggers instant onscreen warning toasts if the candidate switches tabs or minimizes the window.
- **Clipboard & Right-Click Shield:** Intercepts `Ctrl+C` (copying question), `Ctrl+V` (pasting answers), `Ctrl+X`, and right-click context menu attempts.
- **Continuous Look-Away Detection:** Flags if the candidate is looking away from the camera for longer than 3 seconds (suspicious reading from a secondary screen/notes).
- **Proctoring Integrity Score:** Starts at 100% and deducts penalty points per violation. Provides a comprehensive timestamped audit trail in the final report.

---

### 5. AI Voice Reading & Live Speech-to-Text
- **Text-to-Speech (TTS):** Natural speech synthesis reads out questions aloud like an actual interviewer, with an interactive "Replay Voice" button.
- **Live Speech-to-Text (STT):** Transcribes candidate speech in real-time onto the screen using Web Speech Recognition.
- **Filler Word Counter:** Automatically tracks vocal fillers (`um`, `uh`, `like`, `actually`, `basically`, `literally`, `you know`) in real-time.

---

### 6. Automated AI Answer Evaluation
- When the candidate clicks **"⏹ Stop & AI Evaluate Answer"**, the backend evaluates:
  - Answer depth, vocabulary, and relevance
  - STAR Method structural completeness
  - Speech clarity & filler word usage
  - Posture & confidence metrics
- Generates a granular score card, key strengths, and actionable improvement recommendations.

---

### 7. 3D Cybernetic UI & Particle Constellation
- **Interactive 3D Particle Matrix Canvas (`ThreeDCanvas`):** Background interactive 3D nodes that rotate and respond to mouse movements with dynamic perspective depth.
- **3D Mouse Parallax Hologram Card:** Interactive 3D tilt transformation (`perspective: 1000px`) on the hero visual.
- **Cyber Glassmorphism:** Deep cosmic backdrop (`#05050a`), neon cyan & violet glow borders, floating metric badges, and polished animations.
- **⚡ 1-Click Instant Demo:** Practice immediately with guest access without waiting for sign-up.

---

## 🛠️ Tech Stack & Technologies Used

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, JavaScript (ES6+), JSX |
| **Styling & 3D UI** | Modern CSS3 (Cyber Glassmorphism, 3D Perspective Transforms, Keyframe Animations) |
| **3D & Canvas Graphics** | HTML5 Canvas 2D/3D Projection, Interactive Particle Field |
| **Computer Vision** | Custom Canvas Skin-Tone & Luminance Heuristics, 3D Mesh Overlays, Head Tilt Tracker |
| **Audio & Speech Engine** | Web Audio API (`AudioContext`, `AnalyserNode`), Web Speech API (`SpeechRecognition`, `SpeechSynthesis`) |
| **Backend Framework** | Python 3, Flask, Flask-CORS |
| **Production WSGI Server** | Gunicorn (Linux/Render production deployment) |
| **Database & Auth** | Firebase Auth & Cloud Firestore |
| **Deployment Platform** | Render (Static Site for Frontend + Web Service for Backend) |

---

## 📂 Project Folder Structure

```
ai-interview-preparation/
│
├── .gitignore                   # Comprehensive gitignore for React, Node, Python & venv
├── render.yaml                  # 1-Click Render Blueprint configuration
├── README.md                    # Detailed documentation and architecture guide
│
├── backend/                     # Flask REST API Backend
│   ├── app.py                   # Main Flask application with question & evaluation endpoints
│   ├── requirements.txt         # Python dependencies (Flask, Flask-Cors, gunicorn)
│   └── venv/                    # Python virtual environment (ignored in git)
│
└── fronted/                     # React Single Page Application (SPA)
    ├── package.json             # Frontend dependencies & build scripts
    ├── public/                  # HTML template, favicons, web manifest
    └── src/
        ├── App.js               # 3D Landing page, Auth modals, Hero hologram
        ├── App.css              # Futuristic 3D design system & cyber styling
        ├── firebase.js          # Firebase Auth & Firestore client SDK integration
        ├── index.js             # React entry point
        │
        ├── components/
        │   ├── InterviewPage.jsx  # Live 3D AI Interview Suite & Proctoring HUD
        │   ├── InterviewPage.css  # Cyber camera HUD, confidence gauge, report styling
        │   └── ThreeDCanvas.jsx   # Interactive 3D particle constellation canvas
        │
        └── utils/
            ├── visionDetector.js  # Real-time 3D face mesh, posture & gaze detector
            ├── audioDetector.js   # Web Audio analyser, Speech-to-Text & TTS voice
            └── proctoringGuard.js # Anti-cheating listeners, violation logs & integrity engine
```

---

## 💻 Local Setup & Installation Guide

### Prerequisites
- **Node.js** (v18+ or v22+) & **npm**
- **Python** (v3.8+)
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/surajsahani9321/ai-interview-preparation.git
cd ai-interview-preparation
```

---

### Step 2: Backend Setup & Execution (Flask)

Open a new terminal:
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment (if not present)
python -m venv venv

# 3. Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Run the Flask server
python app.py
```
> 📍 **Backend will be live at:** `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)

---

### Step 3: Frontend Setup & Execution (React 3D)

Open a second terminal:
```bash
# 1. Navigate to frontend directory
cd fronted

# 2. Install npm dependencies
npm install

# 3. Start React Development Server
npm start
```
> 📍 **Frontend will be live at:** `http://localhost:3000`

---

## 📡 Backend API Documentation

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
```json
{
  "message": "Backend is running!",
  "status": "ok",
  "timestamp": 1726000000.0
}
```

---

### 2. Generate AI Questions
- **Endpoint:** `POST /api/generate-questions`
- **Request Body:**
```json
{
  "role": "frontend_developer",
  "level": "Mid",
  "count": 3,
  "customTopic": "React Hooks & Performance"
}
```
- **Response:**
```json
{
  "status": "success",
  "role": "frontend_developer",
  "level": "Mid",
  "totalQuestions": 3,
  "questions": [
    {
      "id": 1,
      "category": "frontend_developer",
      "difficulty": "Mid",
      "question": "What techniques do you use to optimize React web performance (memoization, lazy loading, code-splitting)?",
      "suggestedDuration": 60
    }
  ]
}
```

---

### 3. Evaluate Candidate Answer
- **Endpoint:** `POST /api/evaluate-answer`
- **Request Body:**
```json
{
  "question": "Explain how Virtual DOM works.",
  "transcript": "React creates a lightweight copy of the real DOM in memory called Virtual DOM. When state changes, it diffs and updates only changed elements.",
  "role": "frontend_developer",
  "metrics": {
    "confidence": 85,
    "posture": "Good",
    "eyeContact": "Good"
  }
}
```
- **Response:**
```json
{
  "status": "success",
  "contentScore": 78,
  "overallScore": 82,
  "wordCount": 32,
  "feedback": "Excellent explanation! You covered key concepts clearly.",
  "strengths": ["In-depth explanation", "Structured flow", "Strong technical vocabulary"],
  "improvements": ["Mention performance trade-offs in real projects"]
}
```

---

## 🚀 Deployment on Render

This project includes a root `render.yaml` Blueprint file for automatic 1-click deployment.

### 1. Deploy via Blueprint (Recommended):
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Select this GitHub repository.
4. Render will automatically launch both the **Python Flask Web Service** and **React Static Site**.

### 2. Deploy Manually:
- **Backend (Web Service):**
  - **Root Directory:** `backend`
  - **Environment:** `Python 3`
  - **Build Command:** `pip install -r requirements.txt`
  - **Start Command:** `gunicorn app:app`
- **Frontend (Static Site):**
  - **Root Directory:** `fronted`
  - **Build Command:** `npm install && npm run build`
  - **Publish Directory:** `build`
  - **Environment Variable:** `REACT_APP_API_URL` = `https://your-backend-service.onrender.com`
  - **Rewrite Rule:** `/*` -> `/index.html`

---

## 🛡️ Anti-Cheating Integrity Metrics

The proctoring system enforces strict integrity standards during each session:

| Violation Type | Trigger Condition | Integrity Penalty |
| :--- | :--- | :--- |
| **`TAB_SWITCH`** | Switching browser tabs or minimizing window | **-15%** |
| **`WINDOW_BLUR`** | Clicking outside the active interview window | **-10%** |
| **`COPY_ATTEMPT`** | Copying question text (`Ctrl+C`, Right Click) | **-12%** |
| **`PASTE_ATTEMPT`** | Pasting external text (`Ctrl+V`) | **-15%** |
| **`LOOKING_AWAY`** | Face uncentered / looking away for > 3 seconds | **-8%** |
| **`DEVTOOLS`** | Pressing `F12` or opening developer tools | **-20%** |

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

Distributed under the **MIT License**.

<div align="center">

Made with ❤️ by **Suraj Sahani** • Powered by Real-Time AI Biometrics & 3D Web Vision

</div>
