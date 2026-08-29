export type Role = "user" | "assistant" | "system";

export interface ToolCallRecord {
  name: string;
  args: string;
  result: string;
  ok: boolean;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  model?: string;
  toolCalls?: ToolCallRecord[];
  createdAt: number;
  error?: boolean;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  modelId: string;
  workspace?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: "deepseek" | "openai" | "custom";
  baseUrl: string;
  model: string;
  contextWindow: number;
  supportsTools: boolean;
  temperature?: number;
  maxTokens?: number;
  builtin?: boolean;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  apiKeys: Record<string, string>;
  fontSize: number;
  density: "comfortable" | "compact";
  workspace: string;
  defaultModelId: string;
}

export interface EnvStatus {
  python: { installed: boolean; version?: string; path?: string } | null;
  node: { installed: boolean; version?: string; path?: string } | null;
  git: { installed: boolean; version?: string; path?: string } | null;
  os: string;
  arch: string;
  appDir: string;
}

export interface ToolToggle {
  code: boolean;
  file: boolean;
  search: boolean;
}
