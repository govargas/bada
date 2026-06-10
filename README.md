# 🏖️ BADA – Find Safe Beaches in Sweden

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Backend-Express_5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/Code-TypeScript-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/UI-Tailwind_CSS_v4-38B2AC?logo=tailwind-css&logoColor=white)
![Three.js](https://img.shields.io/badge/3D-Three.js-000000?logo=three.js&logoColor=white)
![MapLibre](https://img.shields.io/badge/Maps-MapLibre-4264FB?logo=openstreetmap&logoColor=white)
![i18next](https://img.shields.io/badge/Translations-i18next-26A69A?logo=i18next&logoColor=white)
![TanStack Query](https://img.shields.io/badge/State-TanStack_Query-FF4154?logo=reactquery&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)

**BADA** helps beachgoers and families in Sweden find safe, EU-classified bathing waters with real-time quality updates.  
It replaces outdated or clunky websites with a **clean, mobile-friendly experience** where you can browse nearby beaches on a map, check water quality, and save your favourites.

[Try it out here](https://badaweb.netlify.app/) (deployed on Netlify)

---

## ✨ Features

- 🗺 **Map of all EU-classified beaches in Sweden** (MapLibre + OpenStreetMap)
- 📍 **Find the nearest beach** using your device's location
- 🔬 **View water quality, classification, and recent test results** (data from HaV)
- 🔍 **Real-time beach search** with autocomplete dropdown
- ❤️ **Create an account and save favourite beaches** to your profile
- 🔀 **Drag-and-drop sorting for favorites**
- 🌊 **3D animated backgrounds** (WebGL water simulation in dark mode, sand texture in light mode)
- 🎨 **Glassmorphism UI** with backdrop blur effects
- 🌤️ **Weather & sun times panel** on each beach — air temp, feels like, UV index, water temperature, and a visual sun arc with golden hour, sunrise/sunset, and twilight phases
- 🌗 **Dark mode** and responsive design (mobile → desktop)
- 🌐 **Multi-language support** (Swedish / English)
- 📚 **API Documentation** (Swagger UI at `/api/docs`)

---

## 🚀 Tech Stack

**Frontend**

- React 18 + Vite + TypeScript
- React Router v7
- Zustand (global state)
- TanStack Query (server state & caching)
- Tailwind CSS v4 (with CSS-based theme system)
- i18next (translations)
- MapLibre GL (maps)
- Three.js ecosystem (@react-three/fiber, @react-three/drei) for 3D backgrounds
- @dnd-kit (drag-and-drop)
- react-hook-form + Zod (form validation)
- react-hot-toast (notifications)

**Custom React Hooks**

- `useGeolocation` – Device location access
- `useOutsideClose` – Close popovers on outside click/Escape key
- `useToggleDarkMode` – Writes the `.dark` class (used in Header)
- `useDarkModeObserver` – Reads/observes `.dark` class via MutationObserver (used in AmbientBackground)
- `usePrefersReducedMotion` – Respect user's motion preferences
- `useBeaches` – Beach data fetching
- `useWeather` – Weather data with 30-min stale time
- `useSunTimes` – Sun times keyed by date with 12-hr stale time

**Backend**

- Node.js + Express 5
- MongoDB + Mongoose
- JWT Authentication
- Zod (validation)
- In-memory caching for HaV API responses
- Swagger UI (API documentation)

**External APIs**

- [HaV Bathing Waters API](https://badplatsen.havochvatten.se/) (official Swedish Agency for Marine and Water Management)
- [MapTiler](https://www.maptiler.com/) (map styles)
- [Open-Meteo](https://open-meteo.com/) (weather forecast + marine/water temperature)
- [sunrise-sunset.org](https://sunrise-sunset.org/api) (sunrise, sunset, golden hour, and twilight times)

---

## ♿ Accessibility

BADA is built with accessibility in mind:

- **Skip navigation link** – Jump directly to main content
- **ARIA labels** – Proper labeling of interactive elements
- **ARIA live regions** – Screen reader announcements for dynamic content
- **ARIA busy states** – Loading indicators for assistive technology
- **Keyboard navigation** – Search is an ARIA combobox (arrow keys / Enter / Escape); menus and dialogs are keyboard-operable with focus management
- **Escape key handling** – Close menus and return focus to trigger
- **Focus visible rings** – Clear focus indicators
- **Reduced motion support** – Respects `prefers-reduced-motion` (both CSS and JS)
- **Semantic HTML** – Proper document structure with roles
- **Dynamic lang attribute** – HTML lang updates with language selection
- **Accessible notifications** – Toast messages with proper ARIA live regions

---

## 📸 Screenshots

_(Coming soon)_

---

## 🛠 Installation & Setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/govargas/bada.git
cd bada
```

**Backend**

```bash
cd backend
cp .env.example .env.local # then fill in your values
npm install
npm run dev
```

Backend runs on http://localhost:3000

API Documentation available at http://localhost:3000/api/docs

**Frontend**

```bash
cd frontend
cp .env.example .env.local # then fill in your values
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## 🔑 Environment Variables

- See .env.example in both backend/ and frontend/.
- Fill in with your own values (MongoDB Atlas, JWT secret, MapTiler key).

---

## 👤 Test User Credentials

- Use these to try the app without registering:

Email: smoke@test.com

Password: Test1234

This account already has some favourite beaches saved.

---

## 🌍 Deployment

- Frontend: Deployed on Netlify: https://badaweb.netlify.app/
- Backend: Deployed on Vercel → https://bada-backend.vercel.app/api/health

---

## ✅ Requirements Checklist

### Technical Requirements (Grade G)

- ✅ React frontend
- ✅ Node.js + Express backend
- ✅ MongoDB database
- ✅ Authentication (JWT)
- ✅ React Router navigation
- ✅ Global state management (Zustand)
- ✅ ≥2 external libraries (TanStack Query, MapLibre, Three.js, react-hook-form, i18next, react-hot-toast, @dnd-kit)
- ✅ Custom React hooks (useGeolocation, useOutsideClose, useToggleDarkMode, useDarkModeObserver, usePrefersReducedMotion, useBeaches, useWeather, useSunTimes)
- ✅ Responsive (320px → 1600px+)
- ✅ Accessibility features (comprehensive a11y implementation)
- ✅ Clean Code practices

### Visual Requirements

- ✅ Clear structure using box model with consistent margins/paddings
- ✅ Consistent typography across views and breakpoints
- ✅ Cohesive color scheme with CSS design tokens
- ✅ Mobile-first responsive design
- ✅ Dark mode support with 3D backgrounds
- ✅ Multi-language support (Swedish/English)
- ✅ Glassmorphism UI design system

### Grade VG Enhancements

- ✅ Error Boundaries
- ✅ Toast notifications with a11y
- ✅ Reduced motion support
- ✅ Comprehensive documentation
- ✅ Meta tags for SEO (Open Graph, Twitter Cards)
- ✅ API Documentation (Swagger UI)
- ✅ Performance optimizations (lazy-loaded 3D backgrounds)

---

## ⚠️ Known Limitations

These are conscious trade-offs for an MVP, documented rather than hidden:

- **Backend cache is per-instance.** The HaV proxy cache is an in-memory `Map`. On Vercel serverless it does not survive cold starts or span instances, so it mainly de-dupes bursts within a warm instance. The beach _list_ sidesteps this entirely via a static CDN snapshot (`frontend/public/beaches.json`, refreshed daily by a GitHub Action); only per-beach detail still hits the proxy.
- **Data is seasonal.** HaV samples bathing waters roughly June–August. Outside the season `latestSampleDate` and classification reflect the previous year.
- **Golden hour is approximate.** It is computed as sunrise + 1h / sunset − 1h, and the sun arc degrades north of the Arctic Circle during the midnight sun (sunrise-sunset.org returns degenerate times there).
- **Third-party APIs called from the client.** Open-Meteo and sunrise-sunset.org are called directly from the browser with no SLA — acceptable for an MVP, not for production traffic.
- **Auth token in `localStorage`.** Simple and fine for a no-sensitive-data MVP, but XSS-exposed; an httpOnly cookie would be the production choice.
- **No SSR.** SEO is limited to per-route `<title>`, a generated `sitemap.xml`, and site-wide Open Graph tags. Per-beach Open Graph previews would require prerendering.

---

## 🧭 Roadmap

### Completed

- ✅ 3D animated backgrounds (WebGL water/sand)
- ✅ Enhanced glassmorphism UI
- ✅ Header search with autocomplete
- ✅ Comprehensive accessibility implementation
- ✅ API documentation with Swagger
- ✅ Performance optimization (deferred 3D loading)
- ✅ Focus management and keyboard navigation
- ✅ Weather & sun times panel (Open-Meteo + sunrise-sunset.org) with visual sun arc, golden hour zones, and water temperature

### Planned

- 🔄 Filter beaches by classification
- 🔄 Add user beach photos
- 🔄 Allow notes/tips per beach (e.g. "good for kids")
- 🔄 PWA support with offline capability

---

## 💡 Inspiration & Credits

- Data from the Swedish Agency for Marine and Water Management (HaV)
- Maps powered by OpenStreetMap + MapTiler
- Built during the Technigo Fullstack JavaScript Bootcamp (2025)

---

## 👨‍💻 Author

Created by Talo Vargas, 2025
