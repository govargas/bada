import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import sv from "./locales/sv/common.json";
import en from "./locales/en/common.json";

const saved = localStorage.getItem("lang");
const fallbackLng = "sv";
const lng = saved || fallbackLng;

i18n.use(initReactI18next).init({
  resources: {
    sv: { common: sv },
    en: { common: en },
  },
  lng,
  fallbackLng,
  ns: ["common"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
