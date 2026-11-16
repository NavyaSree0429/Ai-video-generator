# AI Video Studio & Instagram Auto Publisher

> **Document Version:** 1.0  
> **Budget:** Strictly Free (No Paid AI APIs)  
> **Stack:** MERN (React + Vite, Node.js + Express, MongoDB Atlas) + Python AI Service + FFmpeg + BullMQ  
> **Languages Supported:** Telugu & English  

---

## 📌 Project Architecture

```
Ai-video-generator/
├── client/              # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/  # Navbar, Sidebar, ProtectedRoute, VideoPlayer
│   │   ├── context/     # AuthContext (JWT session state)
│   │   ├── pages/       # Dashboard, Studio, Editor, Projects, Instagram, Publishing
│   │   ├── services/    # Axios client with interceptors
│   │   └── routes/      # AppRoutes
│   └── package.json
│
├── server/              # Node.js + Express REST API Backend
│   ├── config/          # MongoDB (db.js), Redis (redis.js), Storage (storage.js)
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose models (User, Project, Video, etc.)
│   ├── routes/          # REST API endpoints (/api/v1/...)
│   ├── middleware/      # Auth, Error, Upload, RateLimit
│   ├── utils/           # ApiResponse, FFmpegHelper, Encryption
│   └── package.json
│
├── ai-service/          # Python FastAPI Microservice (Free Cloud AI)
│   ├── app/
│   │   ├── providers/   # Pollinations, Hugging Face, Gemini, Edge-TTS
│   │   └── main.py      # Internal endpoints (/internal/v1/...)
│   └── requirements.txt
│
├── docs/                # Architecture & Design Documents
│   ├── writing-block.md     # Document 01: SRS
│   ├── writing-block (1).md # Document 02: SADD
│   ├── writing-block (2).md # Document 03: DBDD
│   └── writing-block (3).md # Document 04: ADD
│
└── PROJECT_STATUS.md    # Feature & Phase Progress Tracker
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22)
- **MongoDB**: MongoDB Atlas Free Tier (M0) URI or local MongoDB
- **Redis (Optional for background queues)**: Upstash Redis Free URI or local Redis
- **Python (For AI microservice)**: Python 3.10+

### 2. Quick Setup

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Variables
Copy `.env.example` in both `server/` and `ai-service/`:
```bash
# Server
cp server/.env.example server/.env

# AI Service
cp ai-service/.env.example ai-service/.env
```

### 4. Running the Development Servers
```bash
# Terminal 1 - Node Backend (Port 5000)
npm run server

# Terminal 2 - React Frontend (Port 5173)
npm run client

# Terminal 3 (Optional) - Python AI Service (Port 8000)
cd ai-service
uvicorn app.main:app --port 8000 --reload
```

---

## 🔒 Strict Free-Tier Policy
The application enforces strict safeguards against paid API usage:
- **Video Generation:** Zero-cost open endpoints (Pollinations.ai / Hugging Face Free Tier).
- **Text & Captions:** Google Gemini API Free Tier.
- **Narration (TTS):** Edge-TTS / gTTS with high-quality natural Telugu and English voices.
- **Storage:** Cloudinary Free Tier (direct public URLs required by Instagram Graph API) with local `/uploads` fallback.
- **Instagram Publishing:** Simulated in Mock/Sandbox mode by default for zero-risk testing.

