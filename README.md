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

[Try it out here](https://badaweb.netlify.app/) (deployed on Netlify)

---

## ✨ Features

- 🗺 **Map of all EU-classified beaches in Sweden** (MapLibre + OpenStreetMap)
- 📍 **Find the nearest beach** using your device’s location
- 🔬 **View water quality, classification, and recent test results** (data from HaV)
- ❤️ **Create an account and save favourite beaches** to your profile
- 🌗 **Dark mode** and responsive design (mobile → desktop)
- 🌐 **Multi-language support** (Swedish / English)
- 🔀 **Drag-and-drop sorting for favorites**

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

_(Will add screenshots or GIFs here once deployed – e.g. home page, map view, beach detail page, favourites page)_

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

**Frontend**

```bash
cd frontend
cp .env.example .env.local # then fill in your values
npm install
npm run dev

```

Frontend runs on http://localhost:5173

---

## 📚 API Documentation

### Base URL

- Production: `https://bada-backend.vercel.app/api`
- Local: `http://localhost:3000/api`

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Endpoints

#### Health Check

- **GET** `/health`
- **Description**: Check if the backend is running
- **Auth**: Not required
- **Response**: `{ status: "ok", timestamp: "..." }`

#### Beaches

**GET** `/beaches`

- List all EU-classified beaches in Sweden
- **Auth**: Not required
- **Response**: GeoJSON FeatureCollection
- **Example**:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "NUTSKOD": "SE110006001",
        "NAMN": "Folhem",
        "KMN_NAMN": "Stockholm"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [18.0555, 59.3326]
      }
    }
  ]
}
```

**GET** `/beaches/:id`

- Get detailed information about a specific beach
- **Auth**: Not required
- **Response**: BeachDetail object
- **Example**:

```json
{
  "nutsCode": "SE110006001",
  "locationName": "Folhem",
  "locationArea": "Stockholm",
  "classification": 1,
  "classificationText": "Bra kvalitet",
  "classificationYear": 2024,
  "bathInformation": "Public beach with facilities",
  "latestSampleDate": "2024-07-15"
}
```

#### Authentication

**POST** `/auth/register`

- Register a new user
- **Auth**: Not required
- **Request body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

- **Response**: `{ message: "User created successfully" }`

**POST** `/auth/login`

- Login and get JWT token
- **Auth**: Not required
- **Request body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

- **Response**: `{ token: "eyJhbGciOiJIUzI1NiIs..." }`

#### Favorites

**GET** `/favorites`

- Get user's favorite beaches
- **Auth**: Required
- **Response**: Array of favorite objects
- **Example**:

```json
[
  {
    "_id": "65abc123def456",
    "userId": "user123",
    "beachId": "SE110006001",
    "order": 0,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**POST** `/favorites`

- Add a beach to favorites
- **Auth**: Required
- **Request body**:

```json
{
  "beachId": "SE110006001"
}
```

- **Response**: Created favorite object

**DELETE** `/favorites/:id`

- Remove a beach from favorites
- **Auth**: Required
- **Response**: `{ message: "Favorite removed" }`

**PUT** `/favorites/reorder`

- Reorder favorite beaches (drag & drop)
- **Auth**: Required
- **Request body**:

```json
{
  "order": ["SE110006001", "SE220015002", "SE330024003"]
}
```

- **Response**: Updated order

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
- ✅ ≥2 external libraries (TanStack Query, MapLibre, react-hook-form, i18next, react-hot-toast, @dnd-kit)
- ✅ Custom React hooks (useGeolocation, useOutsideClose, useDarkMode)
- ✅ Responsive (320px → 1600px+)
- ✅ Accessibility features (ARIA labels, skip navigation, semantic HTML, form labels)
- ✅ Clean Code practices

### Visual Requirements

- ✅ Clear structure using box model with consistent margins/paddings
- ✅ Consistent typography across views and breakpoints
- ✅ Cohesive color scheme
- ✅ Mobile-first responsive design
- ✅ Dark mode support
- ✅ Multi-language support (Swedish/English)

### Grade VG Enhancements

- ✅ Error Boundaries
- ✅ Toast notifications
- ✅ Reduced motion support
- ✅ Comprehensive documentation
- ✅ Meta tags for SEO

---

## 🧭 Roadmap

- ✅ Allow notes/tips per beach (e.g. "good for kids") - Planned for future
- Integrate OpenWeatherMap for weather & water temperature
- ✅ Accessibility extras (reduced motion, ARIA live regions) - Implemented
- ✅ Polish with animations and micro-interactions - Toast notifications added
- Filter beaches by classification
- Add user beach photos

---

## 💡 Inspiration & Credits

- Data from the Swedish Agency for Marine and Water Management (HaV)
- Maps powered by OpenStreetMap + MapTiler
- Built during the Technigo Fullstack JavaScript Bootcamp (2025)

---

## 👨‍💻 Author

Created by Talo Vargas, 2025
