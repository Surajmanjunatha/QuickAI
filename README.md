# 🚀 QuickAI – AI-Powered SaaS Platform

QuickAI is a **production-ready AI SaaS application** that brings together content generation, image processing, and resume analysis into a single scalable platform.  
It is built with a **real-world product mindset**, focusing on clean architecture, scalability, and secure AI integration.

🌐 **Live Demo:** https://quick-ai-psi-gray.vercel.app/

---

## 🧠 What is QuickAI?

QuickAI enables users to:
- Generate **AI-powered articles & blog titles**
- Perform **image background & object removal**
- Analyze resumes using a **custom ATS scoring system**
- Explore a **community feed** of AI-generated content
- Manage usage, subscriptions, and history via a dashboard

This project is built end-to-end as a **real SaaS product**, not a clone.

---

## 🧩 System Architecture

<p align="center">
  <img src="./screenshots/QuickAISystemArchitecture.png" alt="QuickAI System Architecture" width="900">
</p>

### Architecture Overview
- **Frontend:** React + Vite handles UI and user interaction
- **Backend:** Express APIs manage business logic and orchestration
- **Service Layer:** Abstracts multiple AI providers
- **Database:** Serverless PostgreSQL (Neon) stores users, usage, and results
- **Auth & Billing:** Clerk handles authentication and subscriptions
- **Media:** Cloudinary optimizes and serves images

All AI outputs are processed server-side, **stored in the database**, and then returned to the frontend for consistency and scalability.

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-fast-purple)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-green)
![Express.js](https://img.shields.io/badge/Express.js-black)

### Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue)
![Neon](https://img.shields.io/badge/Neon-Serverless-green)

### AI & Cloud
![Gemini](https://img.shields.io/badge/Gemini-2.5-orange)
![Groq](https://img.shields.io/badge/Groq-AI-red)
![ClipDrop](https://img.shields.io/badge/ClipDrop-API-lightgrey)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-blue)

### Auth & Billing
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)

---

## 🖼️ Project Screenshots

### 🔐 Authentication & Landing 
<p align="center">
  <img src="./screenshots/landingpage.png" width="40%">
  <img src="./screenshots/login.png" width="20%">
</p>

### 🧠 AI Content & Tools
<p align="center">
  <img src="./screenshots/articleGeneration.png" width="45%">
  <img src="./screenshots/tools.png" width="45%">
</p>

### 🖼️ Image generation & 📄 Resume Analyzer (ATS)
<p align="center">
  <img src="./screenshots/imageGeneration.png" width="45%">
   <img src="./screenshots/resumeReview.png" width="45%">
</p>

---

## ⚙️ Key Engineering Highlights

- Multi-AI provider integration with clean abstraction
- Secure authentication and subscription-based access
- Usage-based limits to control AI costs
- Stateless backend with serverless database
- Production-ready SaaS architecture

---

## 👨‍💻 Author

**Suraj M**  
Final-Year Computer Science Student  
Full-Stack Developer | AI & SaaS Enthusiast  

---

⭐ *QuickAI demonstrates real-world system design, scalable architecture, and end-to-end product ownership.*
