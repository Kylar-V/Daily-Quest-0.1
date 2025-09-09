import { Link } from "react-router-dom";

export default function CharacterProfile() {
  const s = JSON.parse(localStorage.getItem("dq:v1") || "{}");
  const hero = s.hero || { name: "Adventurer", class: "Wizard" };
  const stats = s.stats || { xp: 0, level: 1, hp: 100, maxHp: 100 };

  const xpPct = Math.max(0, Math.min(100, (stats.xp % 100))); // placeholder until xp-system is wired

  return (
    <div className="page">
      <header className="header">
        <h1>{hero.name}</h1>
        <Link to="/log" className="link">← Quest Log</Link>
      </header>

      <div className="card">
        <div className="muted">Class</div>
        <div className="big">{hero.class}</div>
      </div>

      <div className="card">
        <div className="muted">Level</div>
        <div className="big">{stats.level ?? 1}</div>
      </div>

      <div className="card">
        <div className="muted">XP</div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="muted">HP</div>
        <div className="bar">
          <div className="bar-fill bar-fill--hp" style={{ width: `${Math.round((stats.hp / (stats.maxHp || 1)) * 100)}%` }} />
        </div>
      </div>

      <button
        className="btn danger"
        onClick={() => { localStorage.removeItem("dq:v1"); location.href = "/"; }}
      >
        Reset Data
      </button>
    </div>
  );
}
