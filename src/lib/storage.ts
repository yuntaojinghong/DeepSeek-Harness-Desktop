import type { AppSettings, Conversation, ModelConfig, Persona } from "../types";

const K_CONVERSATIONS = "dh.conversations";
const K_SETTINGS = "dh.settings";
const K_MODELS = "dh.models";
const K_SELECTED = "dh.selected";

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(K_CONVERSATIONS) || "[]");
  } catch {
    return [];
  }
}

export function saveConversations(list: Conversation[]) {
  localStorage.setItem(K_CONVERSATIONS, JSON.stringify(list));
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  apiKeys: {},
  fontSize: 14,
  density: "comfortable",
  workspace: "",
  defaultModelId: "deepseek-chat",
};

export function loadSettings(): AppSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(K_SETTINGS) || "{}") };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(K_SETTINGS, JSON.stringify(s));
}

export const BUILTIN_MODELS: ModelConfig[] = [
  {
    id: "deepseek-chat",
    name: "DeepSeek V3.2",
    provider: "deepseek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    contextWindow: 128000,
    supportsTools: true,
    builtin: true,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek R1 (推理)",
    provider: "deepseek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-reasoner",
    contextWindow: 128000,
    supportsTools: false,
    builtin: true,
  },
  {
    id: "deepseek-r1-0528",
    name: "DeepSeek R1-0528",
    provider: "deepseek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-reasoner",
    contextWindow: 128000,
    supportsTools: false,
    builtin: true,
  },
];

export function loadModels(): ModelConfig[] {
  try {
    const extra = JSON.parse(localStorage.getItem(K_MODELS) || "[]");
    return [...BUILTIN_MODELS, ...extra];
  } catch {
    return [...BUILTIN_MODELS];
  }
}

export function saveModels(list: ModelConfig[]) {
  const custom = list.filter((m) => !m.builtin);
  localStorage.setItem(K_MODELS, JSON.stringify(custom));
}

export function loadSelected(): string {
  return localStorage.getItem(K_SELECTED) || "deepseek-chat";
}

export function saveSelected(id: string) {
  localStorage.setItem(K_SELECTED, id);
}

export function exportConversationJson(conv: Conversation) {
  const blob = new Blob([JSON.stringify(conv, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${conv.title || "conversation"}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportConversationMarkdown(conv: Conversation) {
  const lines: string[] = [`# ${conv.title || "对话记录"}`, `> 模型: ${conv.modelId} · 导出时间: ${new Date().toLocaleString()}`, ""];
  for (const m of conv.messages) {
    if (m.role === "user") lines.push(`## 用户\n\n${m.content}\n`);
    else if (m.role === "assistant") lines.push(`## AI\n\n${m.content}\n`);
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${conv.title || "conversation"}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const PERSONAS: Persona[] = [
  {
    id: "default",
    name: "通用助手",
    color: "#22d3ee",
    prompt: "",
  },
  {
    id: "coder",
    name: "编程专家",
    color: "#4d6bfe",
    prompt: "你是一名资深软件工程师。回答技术问题时给出可直接运行的代码、解释关键实现，并指出常见的坑。代码优先，简洁专业。",
  },
  {
    id: "writer",
    name: "中文文案",
    color: "#8b5cf6",
    prompt: "你是一名资深中文文案策划。文笔流畅、有感染力，擅长润色、起标题、写营销文案与公众号文章。输出直接可用，不堆砌套话。",
  },
  {
    id: "analyst",
    name: "数据分析",
    color: "#10b981",
    prompt: "你是一名数据分析师。对数据先给结论，再给依据；能用表格和步骤清晰呈现分析过程，并指出数据的局限与可优化的方向。",
  },
  {
    id: "translator",
    name: "翻译官",
    color: "#f59e0b",
    prompt: "你是一名专业翻译。中英互译准确、地道，保留原文语气与专业术语。默认只输出译文，需要时附上术语说明。",
  },
];

export interface DiskData {
  conversations: Conversation[];
  settings: AppSettings;
  models: ModelConfig[];
  selected: string;
}

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function readDiskData(): Promise<DiskData | null> {
  if (!isTauri()) return null;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const raw = await invoke<string>("read_store", { key: "data" });
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DiskData>;
    return {
      conversations: parsed.conversations ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      models: [...BUILTIN_MODELS, ...(parsed.models ?? []).filter((m) => !m.builtin)],
      selected: parsed.selected ?? "deepseek-chat",
    };
  } catch {
    return null;
  }
}

export async function writeDiskData(data: DiskData) {
  if (!isTauri()) return;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("write_store", {
      key: "data",
      value: JSON.stringify({
        conversations: data.conversations,
        settings: data.settings,
        models: data.models.filter((m) => !m.builtin),
        selected: data.selected,
      }),
    });
  } catch {
    /* ignore */
  }
}

export async function notify(title: string, body: string) {
  if (!isTauri()) return;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("notify", { title, body });
  } catch {
    /* ignore */
  }
}
