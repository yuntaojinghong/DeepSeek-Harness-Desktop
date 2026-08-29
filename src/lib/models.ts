import type { ModelConfig } from "../types";

const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

// 已知官方模型的展示元数据（/models 只返回 id，这里补齐名称 / 上下文 / 能力）
const KNOWN: Record<string, { name: string; contextWindow: number; supportsTools: boolean }> = {
  "deepseek-v4-flash": { name: "DeepSeek V4 Flash", contextWindow: 1000000, supportsTools: true },
  "deepseek-v4-pro": { name: "DeepSeek V4 Pro", contextWindow: 1000000, supportsTools: true },
  "deepseek-chat": { name: "DeepSeek Chat（已停用）", contextWindow: 64000, supportsTools: true },
  "deepseek-reasoner": { name: "DeepSeek Reasoner（已停用）", contextWindow: 64000, supportsTools: false },
};

function humanize(id: string): string {
  return id
    .replace(/^deepseek[-_]?/i, "")
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * 实时拉取 DeepSeek 官方模型列表（GET /models）。
 * 返回的 ModelConfig 使用模型 id 作为唯一标识，便于与内置/自定义模型去重。
 */
export async function fetchOfficialModels(baseUrl: string, apiKey: string): Promise<ModelConfig[]> {
  const url = `${baseUrl.replace(/\/+$/, "")}/models`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { data?: { id?: string }[] };
    const ids: string[] = (json?.data ?? [])
      .map((m) => m?.id)
      .filter((x): x is string => typeof x === "string" && x.length > 0);

    if (!ids.length) throw new Error("官方接口未返回模型列表");

    return ids.map((id) => {
      const k = KNOWN[id];
      return {
        id,
        name: k?.name ?? `DeepSeek ${humanize(id)}`,
        provider: "deepseek" as const,
        baseUrl: DEEPSEEK_BASE,
        model: id,
        contextWindow: k?.contextWindow ?? 1000000,
        supportsTools: k?.supportsTools ?? true,
        builtin: true,
      };
    });
  } finally {
    clearTimeout(timer);
  }
}
