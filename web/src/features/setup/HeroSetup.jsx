import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { setHero } from "../../api/storage";

const CLASS_DESCRIPTIONS = {
  Knight: "Thrive on epic challenges. Large quests grant bonus XP.",
  Wizard: "Knowledge grows through consistency. Daily streaks grant bonus XP.",
  Rogue:  "Masters of quick wins. Completing several quests a day grants bonus XP.",
  Archer: "Precise and focused. Medium quests grant bonus XP.",
};

export default function HeroSetup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [klass, setKlass] = useState("Wizard");

  function handleBegin() {
    setHero({ name: name.trim() || "Adventurer", class: klass });
    nav("/log");
  }

  return (
    <div className="page">
      <h1>Create Your Hero</h1>

      <label className="label">Hero Name</label>
      <input
        className="input"
        placeholder="Name your legend…"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="label">Choose a Class</label>
      <div className="grid">
        {["Wizard", "Knight", "Rogue", "Archer"].map((c) => (
          <button
            key={c}
            className={`chip ${klass === c ? "chip--active" : ""}`}
            onClick={() => setKlass(c)}
            type="button"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 8 }}>
        <div className="muted">Class Bonus</div>
        <div>{CLASS_DESCRIPTIONS[klass]}</div>
      </div>

      {/* Centered CTA */}
      <button className="cta block" onClick={handleBegin}>
        Begin Adventure
      </button>
    </div>
  );
}
