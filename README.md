# 🏖️ BADA – Find Safe Beaches in Sweden

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Backend-Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/Code-TypeScript-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![MapLibre](https://img.shields.io/badge/Maps-MapLibre-4264FB?logo=openstreetmap&logoColor=white)
![i18next](https://img.shields.io/badge/Translations-i18next-26A69A?logo=i18next&logoColor=white)
![TanStack Query](https://img.shields.io/badge/State-TanStack_Query-FF4154?logo=reactquery&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)

**BADA** helps beachgoers and families in Sweden find safe, EU-classified bathing waters with real-time quality updates.  
It replaces outdated or clunky websites with a **clean, mobile-friendly experience** where you can browse nearby beaches on a map, check water quality, and save your favourites.

---

## ✨ Features

- 🗺 **Map of all EU-classified beaches in Sweden** (MapLibre + OpenStreetMap)
- 📍 **Find the nearest beach** using your device’s location
- 🔬 **View water quality, classification, and recent test results** (data from HaV)
- ❤️ **Create an account and save favourite beaches** to your profile
- 🌗 **Dark mode** and responsive design (mobile → desktop)
- 🌐 **Multi-language support** (Swedish / English)

---

## 🚀 Tech Stack

**Frontend**

- React 18 + Vite + TypeScript
- React Router
- Zustand (global state)
- TanStack Query (server state & caching)
- Tailwind CSS
- i18next (translations)
- MapLibre GL (maps)
- Custom React Hooks (geolocation, dark mode, outside click)

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Zod (validation)
- In-memory caching for HaV API responses

**External APIs**

- [HaV Bathing Waters API](https://badplatsen.havochvatten.se/) (official Swedish Agency for Marine and Water Management)
- [MapTiler](https://www.maptiler.com/) (map styles)
- _(Planned)_ OpenWeatherMap for weather and water temperature

---

## 📸 Screenshots

_(Add screenshots or GIFs here once deployed – e.g. home page, map view, beach detail page, favourites page)_

---

## 🛠 Installation & Setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/govargas/bada.git
cd bada

```

**Backend**
cd backend
cp .env.example .env.local # then fill in your values
npm install
npm run dev

Backend runs on http://localhost:3000

**Frontend**
cd frontend
cp .env.example .env.local # then fill in your values
npm install
npm run dev

Frontend runs on http://localhost:5173

---

## 🔑 Environment Variables

See .env.example in both backend/ and frontend/.
Fill in with your own values (MongoDB Atlas, JWT secret, MapTiler key).

---

## 👤 Test User Credentials

Use these to try the app without registering:
Email: test@bada.app
Password: Test1234

This account already has some favourite beaches saved.

---

## 🌍 Deployment

    •	Frontend: Deployed on Vercel
    •	Backend: Deployed on Vercel

(Will replace with actual links when deployed)

---

## ✅ Requirements Checklist

    •	React frontend
    •	Node.js + Express backend
    •	MongoDB database
    •	Authentication (JWT)
    •	React Router navigation
    •	Global state management (Zustand)
    •	≥2 external libraries (TanStack Query, MapLibre, react-hook-form, i18next)
    •	Custom React hooks
    •	Responsive (320px → 1600px+)
    •	Accessibility & Lighthouse 100% (AA compliant)
    •	Clean Code practices

---

## 🧭 Roadmap

    •	Add drag-and-drop sorting for favourites
    •	Allow notes/tips per beach (e.g. “good for kids”)
    •	Integrate OpenWeatherMap for weather & water temperature
    •	Accessibility extras (reduced motion, ARIA live regions)
    •	Polish with animations and micro-interactions

---

## 💡 Inspiration & Credits

    •	Data from the Swedish Agency for Marine and Water Management (HaV)
    •	Maps powered by OpenStreetMap + MapTiler
    •	Built during the Technigo Fullstack JavaScript Bootcamp (2025)

---

## 👨‍💻 Author

Created by Talo Vargas
2025
