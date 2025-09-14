import { Routes, Route } from "react-router-dom";
import BeachesList from "./components/BeachesList";
import BeachDetailPage from "./components/BeachDetailPage";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default function App() {
  return (
    <>
      <LanguageSwitcher />
      <Routes>
        <Route path="/" element={<BeachesList />} />
        <Route path="/beach/:id" element={<BeachDetailPage />} />
      </Routes>
    </>
  );
}
