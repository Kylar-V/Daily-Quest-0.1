import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HeroSetup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [klass, setKlass] = useState("Wizard");

  function handleBegin() {
    const s = JSON.parse(localStorage.getItem("dq:v1") || "{}");
    s.hero = { name: name.trim() || "Adventurer", class: klass };
    localStorage.setItem("dq:v1", JSON.stringify(s));
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

      <button className="cta" onClick={handleBegin}>Begin Adventure</button>
    </div>
  );
}
