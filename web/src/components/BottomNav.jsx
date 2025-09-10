import { NavLink } from "react-router-dom";

export default function BottomNav(){
  function resetAll(){
    if (confirm("Reset all data? This cannot be undone.")) {
      localStorage.removeItem("dq:v1");
      location.href = "/";
    }
  }

  return (
    <div className="bottomnav">
      <div className="tabs">
        <NavLink to="/log" className={({isActive}) => "tab" + (isActive ? " tab--active" : "")}>Log</NavLink>
        <NavLink to="/character" className={({isActive}) => "tab" + (isActive ? " tab--active" : "")}>Character</NavLink>
      </div>

      <button className="btn danger small" onClick={resetAll} title="Reset all data">
        Reset
      </button>
    </div>
  );
}
