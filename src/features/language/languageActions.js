import { SET_LANGUAGE } from "./languageConstants";
import i18n from "../../i18n";

export const setLanguage = (language) => (dispatch) => {
  // Change the i18n instance language
  i18n.changeLanguage(language);
  
  dispatch({
    type: SET_LANGUAGE,
    payload: language
  });
};