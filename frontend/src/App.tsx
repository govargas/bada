import { Routes, Route } from "react-router-dom";
import BeachesList from "./components/BeachesList";
import BeachDetailPage from "./components/BeachDetailPage";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Header from "./components/Header";

export default function App() {
  return (
    <div className="bg-surface text-ink min-h-screen">
      <Header />
      <main className="p-4">
        {/* Keep language switcher (you may later move it into the menu) */}
        <LanguageSwitcher />

        <Routes>
          <Route path="/" element={<BeachesList />} />
          <Route path="/beach/:id" element={<BeachDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
