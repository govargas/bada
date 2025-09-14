import { Routes, Route } from "react-router-dom";
import BeachesList from "./components/BeachesList";
import BeachDetailPage from "./components/BeachDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BeachesList />} />
      <Route path="/beach/:id" element={<BeachDetailPage />} />
    </Routes>
  );
}
