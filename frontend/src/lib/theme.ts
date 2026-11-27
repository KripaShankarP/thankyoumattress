export type Theme = "light" | "dark";

export const THEME_KEY = "ty-theme";

/** Runs in <head> before first paint: applies the saved theme (light by default). */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
