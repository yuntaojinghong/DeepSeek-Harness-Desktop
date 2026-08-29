import { useEffect } from "react";
import { useAppStore } from "./store";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ContextPanel from "./components/ContextPanel";
import SettingsModal from "./components/SettingsModal";
import EnvModal from "./components/EnvModal";
import WelcomeModal from "./components/WelcomeModal";

export default function App() {
  const theme = useAppStore((s) => s.settings.theme);
  const fontSize = useAppStore((s) => s.settings.fontSize);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const contextOpen = useAppStore((s) => s.contextOpen);
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const envOpen = useAppStore((s) => s.envOpen);
  const setEnv = useAppStore((s) => s.setEnv);
  const hydrate = useAppStore((s) => s.hydrate);
  const welcomeOpen = useAppStore((s) => s.welcomeOpen);
  const setWelcomeOpen = useAppStore((s) => s.setWelcomeOpen);
  const hasKey = useAppStore((s) => Object.values(s.settings.apiKeys).some((k) => k.trim()));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    document.documentElement.setAttribute("data-theme", resolved);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("font-size", `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    import("./lib/env")
      .then((m) => m.checkEnv())
      .then(setEnv)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasKey) setWelcomeOpen(true);
  }, [hasKey, setWelcomeOpen]);

  return (
    <div className="app-shell">
      <TitleBar />
      <div className="body">
        {sidebarOpen && <Sidebar />}
        <ChatArea />
        {contextOpen && <ContextPanel />}
      </div>
      {welcomeOpen && <WelcomeModal />}
      {settingsOpen && <SettingsModal />}
      {envOpen && <EnvModal />}
    </div>
  );
}

