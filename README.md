# 🎓 EdTech Platform – NASCON 2025 Hackathon Project

A full-featured EdTech platform developed in just **6 hours** during the **NASCON 2025 Hackathon** by [Hasnat Ahmed](https://www.linkedin.com/in/hasnat-ahmed), [Muhammad Saad](https://www.linkedin.com/in/muhammad-saad), and [Your Name].

🌐 **Live Demo**:  
[https://nascon-final-amber.vercel.app/](https://nascon-final-amber.vercel.app/)

---

## 🚀 Overview

This platform connects students and tutors in an immersive learning environment, featuring:
- Course creation & management
- Video hosting via Supabase Buckets
- Real-time AI-powered video transcription
- Live chat via WebSockets
- Secure authentication with Clerk
- Smart email notifications with Resend
- Mock Stripe payment flow

Built with a modern, scalable tech stack and designed for accessibility and responsiveness.

---

## ✨ Features

### 🧑‍🎓 Students
- Browse and search available courses
- Enroll in courses (Stripe mock payment)
- Watch course videos with progress tracking
- View **AI-generated video transcriptions** in real-time
- Chat with tutors inside each course
- Resume learning exactly where they left off

### 🧑‍🏫 Tutors
- Secure dashboard with **Clerk authentication**
- Create, edit, and manage courses, modules, and lessons
- Upload video content to **Supabase Buckets**
- Manage enrolled students and remove them if needed
- Review and edit **AI-generated transcriptions**

### 🤖 AI Integration
- Real-time transcription of course videos using **OpenAI Whisper**
- Transcripts shown alongside the video player
- Boosts accessibility and learning retention

### 💬 Communication
- Real-time **WebSocket-based chat** between students and tutors within courses

### 📧 Notifications
- Transactional and status notifications via **Resend**

---

## 🧱 Tech Stack

| Layer         | Tech                             |
|---------------|----------------------------------|
| Frontend      | Next.js (App Router), React      |
| Styling       | Tailwind CSS, ShadCN UI          |
| Backend       | Next.js API Routes (Node.js)     |
| Database      | **Supabase** (PostgreSQL)        |
| Storage       | **Supabase Buckets**             |
| Auth          | **Clerk**                        |
| AI Services   | OpenAI Whisper API               |
| Chat          | WebSockets                       |
| Payments      | Stripe (Test Mode)               |
| Notifications | Resend                           |
| 3D Animation  | Three.js / React Three Fiber     |

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/Slothdemon22/nascon-test.git
cd edtech-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in required variables: Supabase, Clerk, Resend, OpenAI, etc.

# Run the dev server
npm run dev
