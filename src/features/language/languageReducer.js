import { SET_LANGUAGE } from "./languageConstants";

const initialState = {
  currentLanguage: localStorage.getItem("language") || "vi" // Default to Vietnamese if not set
};

const languageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      localStorage.setItem("language", action.payload);
      return {
        ...state,
        currentLanguage: action.payload
      };
    default:
      return state;
  }
};

export default languageReducer;