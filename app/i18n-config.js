export const defaultLocale = "id";
export const locales = ["id", "en"];

export const dictionaries = {
  id: () => import("./dictionaries/id.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};
