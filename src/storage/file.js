// src/storage/file.js
import fs from "fs";
import path from "path";

const SAVE_PATH = path.resolve("./save.json");
const BACKUP_PATH = path.resolve("./save.bak");

export const fileStorage = {
  load() {
    if (!fs.existsSync(SAVE_PATH)) return null;
    try {
      const raw = fs.readFileSync(SAVE_PATH, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to read save.json:", e);
      return null;
    }
  },

  save(obj) {
    try {
      if (fs.existsSync(SAVE_PATH)) {
        try { fs.copyFileSync(SAVE_PATH, BACKUP_PATH); } catch (_) {}
      }
      fs.writeFileSync(SAVE_PATH, JSON.stringify(obj, null, 2));
      return true;
    } catch (e) {
      console.error("Failed to write save.json:", e);
      return false;
    }
  },

  backup() {
    try {
      if (fs.existsSync(SAVE_PATH)) fs.copyFileSync(SAVE_PATH, BACKUP_PATH);
    } catch (_) {}
  }
};
