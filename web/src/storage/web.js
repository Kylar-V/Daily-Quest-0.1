// localStorage backend for the browser
const KEY = "daily-quest-save";

export const webStorage = {
  load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("localStorage load error:", e);
      return null;
    }
  },
  save(obj) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(obj));
      return true;
    } catch (e) {
      console.error("localStorage save error:", e);
      return false;
    }
  },
  backup() {}
};
