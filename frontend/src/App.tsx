import { Routes, Route } from "react-router";
import Header from "./components/Header";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./routes/ProtectedRoute";
import AmbientBackground from "./components/AmbientBackground";

import HomePage from "./pages/HomePage";
import BeachDetailPage from "./pages/BeachDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";
import AboutPage from "./pages/AboutPage";
import WhatIsEUBeachPage from "./pages/WhatIsEUBeachPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <ErrorBoundary>
      {/* Three.js ambient background (water/sand) */}
      <AmbientBackground />
      
      <div className="min-h-screen relative">
        <Header languageSwitcher={<LanguageSwitcher />} />
        <main id="main-content" className="p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/beach/:id" element={<BeachDetailPage />} />

            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/what-is-eu-beach" element={<WhatIsEUBeachPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Private */}
            <Route element={<ProtectedRoute />}>
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Optional 404 */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}
