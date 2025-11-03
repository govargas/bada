import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("en") ? "en" : "sv";

  function setLang(lang: "sv" | "en") {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  }

  return (
    <div className="p-2 flex flex-col gap-2">
      <button
        onClick={() => setLang("sv")}
        aria-pressed={current === "sv"}
        className={`px-3 py-2 rounded-lg text-sm transition-colors text-left ${
          current === "sv"
            ? "bg-accent text-white font-bold"
            : "bg-surface-muted text-ink hover:bg-surface"
        }`}
      >
        Svenska
      </button>
      <button
        onClick={() => setLang("en")}
        aria-pressed={current === "en"}
        className={`px-3 py-2 rounded-lg text-sm transition-colors text-left ${
          current === "en"
            ? "bg-accent text-white font-bold"
            : "bg-surface-muted text-ink hover:bg-surface"
        }`}
      >
        English
      </button>
    </div>
  );
}
