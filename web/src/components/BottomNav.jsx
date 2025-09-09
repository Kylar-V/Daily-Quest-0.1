import { NavLink } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav className="bottomnav">
      <NavLink to="/log" className={({isActive}) => "tab" + (isActive ? " tab--active" : "")}>Quests</NavLink>
      <NavLink to="/character" className={({isActive}) => "tab" + (isActive ? " tab--active" : "")}>Character</NavLink>
    </nav>
  );
}
