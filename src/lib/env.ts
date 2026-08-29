import type { EnvStatus } from "../types";

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(cmd, args);
}

export async function checkEnv(): Promise<EnvStatus> {
  if (isTauri()) {
    try {
      return await invoke<EnvStatus>("check_env");
    } catch {
      return browserFallback();
    }
  }
  return browserFallback();
}

function browserFallback(): EnvStatus {
  return {
    python: null,
    node: null,
    git: null,
    os: `${navigator.platform} (浏览器预览)`,
    arch: "—",
    dataDir: "浏览器预览模式 · 无应用目录",
    portable: false,
  };
}

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

export async function runTool(command: string, args: string[], cwd?: string): Promise<RunResult> {
  if (isTauri()) {
    return await invoke<RunResult>("run_command", { command, args, cwd });
  }
  return {
    code: 0,
    stdout: `[预览模式] 桌面版将在这里真实执行：${command} ${args.join(" ")}`,
    stderr: "",
  };
}

export interface DirEntry {
  name: string;
  isDir: boolean;
  size: number;
}

export async function listDir(path: string): Promise<DirEntry[]> {
  if (isTauri()) {
    return await invoke<DirEntry[]>("list_dir", { path });
  }
  return [{ name: "（预览模式：无法读取目录，桌面版可真实列出）", isDir: false, size: 0 }];
}
