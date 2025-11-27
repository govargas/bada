import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("en") ? "en" : "sv";

  function setLang(lang: "sv" | "en") {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => setLang("sv")}
        aria-pressed={current === "sv"}
        className={`px-2.5 py-1 rounded-lg text-sm transition-colors ${
          current === "sv"
            ? "bg-accent text-white font-medium"
            : "text-ink hover:bg-surface-muted"
        }`}
      >
        SV
      </button>
      <button
        onClick={() => setLang("en")}
        aria-pressed={current === "en"}
        className={`px-2.5 py-1 rounded-lg text-sm transition-colors ${
          current === "en"
            ? "bg-accent text-white font-medium"
            : "text-ink hover:bg-surface-muted"
        }`}
      >
        EN
      </button>
    </div>
  );
}
