import { defaultLocale, dictionaries } from "../i18n-config";

export const getDictionary = async (locale) => {
  try {
    return dictionaries[locale || defaultLocale]();
  } catch (error) {
    console.error("Error loading dictionary", error);
    return dictionaries[defaultLocale]();
  }
};
