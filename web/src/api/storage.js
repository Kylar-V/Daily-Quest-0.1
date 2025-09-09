// web/src/api/storage.js
const KEY = "dq:v1";
const read  = () => JSON.parse(localStorage.getItem(KEY) || "{}");
const write = (obj) => localStorage.setItem(KEY, JSON.stringify(obj));

export function getState(){ return read(); }
export function setState(s){ write(s); }

export function getHero(){ return read().hero || null; }
export function setHero(hero){ const s = read(); s.hero = hero; write(s); }

export function getStats(){
  const s = read();
  return s.stats || { xp: 0, level: 1, hp: 100, maxHp: 100 };
}
export function setStats(stats){ const s = read(); s.stats = stats; write(s); }

export function getQuests(){ return read().quests || []; }
export function addQuest(q){
  const s = read(); s.quests = [...(s.quests || []), q]; write(s);
}
export function updateQuest(id, patch){
  const s = read();
  s.quests = (s.quests || []).map(q => q.id === id ? { ...q, ...patch } : q);
  write(s);
}
