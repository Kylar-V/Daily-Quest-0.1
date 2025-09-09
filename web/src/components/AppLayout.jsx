import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav.jsx";

export default function AppLayout() {
  const { pathname } = useLocation();
  const showNav = pathname !== "/" && pathname !== "/setup"; // hide on setup

  return (
    <div className="app-shell">
      <Outlet />
      {showNav && <BottomNav />}
    </div>
  );
}
