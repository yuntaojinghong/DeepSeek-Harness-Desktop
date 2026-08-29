import type { AppSettings, Conversation, ModelConfig } from "../types";

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
