import { createContext, useContext, useEffect, useState } from "react";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("shz-lang") || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("shz-lang", lang);
  }, [lang]);

  const toggle = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  // L({en, ar}) -> string in the active language
  const L = (obj) => (typeof obj === "string" ? obj : obj?.[lang] ?? obj?.en ?? "");

  return <LangContext.Provider value={{ lang, toggle, L }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
