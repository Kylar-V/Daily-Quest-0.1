import { Link } from "react-router-dom";
import { getHero, getStats, getState } from "../../api/storage";

// Helper: 100 XP per level placeholder
function getLevelProgress(xp) {
  const level = Math.floor((xp || 0) / 100) + 1;
  const start = (level - 1) * 100;
  const next = level * 100;
  const inLvl = (xp || 0) - start;
  const needed = next - (xp || 0);
  const pct = Math.max(0, Math.min(100, (inLvl / 100) * 100));
  return { level, next, inLvl, needed, pct };
}

export default function CharacterProfile() {
  const hero = getHero() || { name: "Adventurer", class: "Wizard" };
  const stats = getStats();
  const { level, next, needed, pct } = getLevelProgress(stats.xp || 0);
  const hpPct = Math.round(((stats.hp || 0) / (stats.maxHp || 1)) * 100);

  const all = (getState().quests || []);
  const completedCount = all.filter(q => q.done).length;

  return (
    <div className="page">
      <header className="header">
        <h1>Character Profile</h1>
        <div className="header-actions">
          <Link to="/log" className="link">← Quest Log</Link>
        </div>
      </header>

      {/* Tidy spacing just like quest list */}
      <div className="list">
        <div className="card">
          <div className="muted">Name</div>
          <div className="big">{hero.name}</div>
        </div>

        <div className="card">
          <div className="muted">Class</div>
          <div className="big">{hero.class}</div>
        </div>

        <div className="card">
          <div className="muted">Level</div>
          <div className="big">{stats.level ?? level}</div>
        </div>

        <div className="card">
          <div className="muted">XP</div>
          <div className="bar" title={`${stats.xp} / ${next} XP`}>
            <div className="bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <span>{stats.xp} / {next} XP</span>
            <span className="muted">{needed} to next level</span>
          </div>
        </div>

        <div className="card">
          <div className="muted">HP</div>
          <div className="bar" title={`${stats.hp} / ${stats.maxHp} HP`}>
            <div className="bar-fill bar-fill--hp" style={{ width: `${hpPct}%` }} />
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <span>{stats.hp} / {stats.maxHp} HP</span>
          </div>
        </div>

        <div className="card">
          <div className="muted">Quests Completed</div>
          <div className="big">{completedCount}</div>
        </div>
      </div>
    </div>
  );
}
