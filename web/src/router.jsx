import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import HeroSetup from "./features/setup/HeroSetup.jsx";
import QuestLog from "./features/quests/QuestLog.jsx";
import NewQuest from "./features/quests/NewQuest.jsx";
import CharacterProfile from "./features/character/CharacterProfile.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HeroSetup /> },
      { path: "setup", element: <HeroSetup /> },
      { path: "log", element: <QuestLog /> },
      { path: "new", element: <NewQuest /> },
      { path: "character", element: <CharacterProfile /> },
    ],
  },
]);
