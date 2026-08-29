import { useEffect, useState } from "react";
import { useAppStore } from "./store";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ContextPanel from "./components/ContextPanel";
import SettingsModal from "./components/SettingsModal";
import EnvModal from "./components/EnvModal";
import WelcomeModal from "./components/WelcomeModal";
import LogoMark from "./components/Logo";
import { isTauri } from "./lib/env";

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

  const [booting, setBooting] = useState(isTauri());
  const [bootError, setBootError] = useState<string | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{ version: string; url: string } | null>(null);

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

  useEffect(() => {
    if (!isTauri()) {
      setBooting(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        // Rust 端会阻塞直到 dsh 服务就绪（或超时/失败）
        await invoke("start_dsh");
        if (!cancelled) {
          window.location.href = "http://127.0.0.1:3080";
        }
      } catch (e) {
        if (!cancelled) setBootError(`启动失败：${String(e)}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isTauri()) return;
    (async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const { getVersion } = await import("@tauri-apps/api/app");
        const latest = await invoke<{ version: string; url: string } | null>("check_update");
        const current = await getVersion();
        if (latest && latest.version !== `v${current}`) {
          setUpdateInfo(latest);
        }
      } catch {
        /* 检查更新失败则静默跳过 */
      }
    })();
  }, []);

  if (booting) {
    return (
      <div className="empty-state">
        <div className="logo-float">
          <LogoMark size={80} radius={22} />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>星核 StarCore</div>
          <div style={{ fontSize: 13, marginTop: 8, color: "var(--text-secondary)" }}>
            {bootError ? (
              <span style={{ color: "var(--danger)" }}>{bootError}</span>
            ) : (
              "正在启动 DeepSeek Harness 服务…"
            )}
          </div>
        </div>
        {!bootError && <div className="spinner" />}
        {bootError && (
          <button className="btn" onClick={() => window.location.reload()}>
            重试
          </button>
        )}
        {updateInfo && !bootError && (
          <div
            style={{
              marginTop: 4,
              padding: "8px 14px",
              borderRadius: 10,
              background: "var(--primary-weak)",
              color: "var(--primary)",
              fontSize: 12.5,
            }}
          >
            发现新版本 <b>{updateInfo.version}</b>，可
            <a
              href={updateInfo.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "underline" }}
            >
              前往下载
            </a>
          </div>
        )}
      </div>
    );
  }

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
