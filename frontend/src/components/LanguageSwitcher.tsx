import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("en") ? "en" : "sv";

  function setLang(lang: "sv" | "en") {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  }

  return (
    <div style={{ padding: 8, display: "flex", gap: 8 }}>
      <button
        onClick={() => setLang("sv")}
        aria-pressed={current === "sv"}
        style={{ fontWeight: current === "sv" ? 700 : 400 }}
      >
        Svenska
      </button>
      <button
        onClick={() => setLang("en")}
        aria-pressed={current === "en"}
        style={{ fontWeight: current === "en" ? 700 : 400 }}
      >
        English
      </button>
    </div>
  );
}
