import { Routes, Route } from "react-router-dom";
import BeachesList from "./components/BeachesList";
import BeachDetailPage from "./components/BeachDetailPage";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Header from "./components/Header";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* TEMP: Tailwind smoke test */}
      <div className="bg-red-500 text-white p-2">Tailwind OK</div>

      <main className="p-4">
        <LanguageSwitcher />
        <Routes>
          <Route path="/" element={<BeachesList />} />
          <Route path="/beach/:id" element={<BeachDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
