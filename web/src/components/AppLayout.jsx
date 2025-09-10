// web/src/components/AppLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav.jsx";
import LevelUpBanner from "./LevelUpBanner.jsx";
import Toaster from "./Toaster.jsx";

export default function AppLayout() {
  const { pathname } = useLocation();
  const showNav = pathname !== "/" && pathname !== "/setup"; // hide on setup

  return (
    <div className="app-shell">
      <Outlet />
      {showNav && <BottomNav />}
      <LevelUpBanner />
      <Toaster />
    </div>
  );
}
