import { useState } from "react";
import { useAppStore } from "../store";
import type { ModelConfig } from "../types";
import { uid } from "../lib/storage";
import { CloseIcon, TrashIcon } from "./Icons";
import ModelIcon from "./ModelIcon";

export default function SettingsModal() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const setApiKey = useAppStore((s) => s.setApiKey);
  const models = useAppStore((s) => s.models);
  const addModel = useAppStore((s) => s.addModel);
  const removeModel = useAppStore((s) => s.removeModel);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const [tab, setTab] = useState<"keys" | "models" | "prefs">("keys");
  const [deepseekKey, setDeepseekKey] = useState(settings.apiKeys["deepseek"] || "");
  const [openaiKey, setOpenaiKey] = useState(settings.apiKeys["openai"] || "");

  const [form, setForm] = useState({
    name: "",
    model: "",
    baseUrl: "https://api.deepseek.com/v1",
    contextWindow: "128000",
  });

  const saveKeys = () => {
    setApiKey("deepseek", deepseekKey.trim());
    setApiKey("openai", openaiKey.trim());
    alert("密钥已保存到本机");
  };

  const addCustomModel = () => {
    if (!form.name.trim() || !form.model.trim()) {
      alert("请填写模型名称与模型标识");
      return;
    }
    const cfg: ModelConfig = {
      id: uid(),
      name: form.name.trim(),
      provider: "custom",
      baseUrl: form.baseUrl.trim() || "https://api.deepseek.com/v1",
      model: form.model.trim(),
      contextWindow: parseInt(form.contextWindow, 10) || 32768,
      supportsTools: true,
    };
    addModel(cfg);
    setForm({ name: "", model: "", baseUrl: "https://api.deepseek.com/v1", contextWindow: "128000" });
  };

  return (
    <div className="modal-mask" onMouseDown={(e) => e.target === e.currentTarget && setSettingsOpen(false)}>
      <div className="modal">
        <div className="modal-head">
          <span style={{ fontSize: 15, fontWeight: 500 }}>设置</span>
          <button className="btn-icon btn-ghost" onClick={() => setSettingsOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div style={{ display: "flex", gap: 4, padding: "10px 22px 0" }}>
          {([["keys", "API 密钥"], ["models", "模型管理"], ["prefs", "偏好"]] as const).map(([id, label]) => (
            <button
              key={id}
              className="btn btn-sm"
              style={tab === id ? { background: "var(--primary-weak)", borderColor: "var(--primary)", color: "var(--primary)" } : undefined}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === "keys" && (
            <div>
              <div className="field-card">
                <div className="field-card-title">
                  <span>DeepSeek 官方 API</span>
                  <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>平台: platform.deepseek.com</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="sk-…（仅保存在本机）"
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                  />
                  <div className="form-hint">用于 DeepSeek V3 / R1 系列模型，未设置时无法发送消息</div>
                </div>
              </div>

              <div className="field-card">
                <div className="field-card-title">
                  <span>OpenAI 兼容服务（通义 / Kimi / GLM 等）</span>
                  <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>可选</span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="可选的通用 API Key"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                  <div className="form-hint">
                    在「模型管理」中添加自定义模型，填写该服务的 Base URL 后即可使用此密钥
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                <button className="btn btn-primary" onClick={saveKeys}>保存密钥</button>
              </div>
            </div>
          )}

          {tab === "models" && (
            <div>
              {models.map((m) => (
                <div className="field-card" key={m.id}>
                  <div className="field-card-title">
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ModelIcon provider={m.provider} size={22} />
                      {m.name}
                      {m.builtin && <span style={{ marginLeft: 4, fontSize: 11, color: "var(--text-tertiary)" }}>内置</span>}
                    </span>
                    {!m.builtin && (
                      <button className="btn-icon btn-ghost" style={{ width: 26, height: 26, color: "var(--danger)" }} onClick={() => removeModel(m.id)}>
                        <TrashIcon size={13} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.7 }}>
                    <div>模型: <span style={{ fontFamily: "ui-monospace, monospace" }}>{m.model}</span></div>
                    <div>服务: {m.baseUrl}</div>
                    <div>上下文: {m.contextWindow.toLocaleString()} · {m.supportsTools ? "支持工具调用" : "纯对话"}</div>
                  </div>
                </div>
              ))}

              <div style={{ border: "1px dashed var(--border-strong)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>添加自定义模型</div>
                <div className="form-row" style={{ marginBottom: 10 }}>
                  <label className="form-label">显示名称</label>
                  <input className="form-input" placeholder="如：通义千问 Qwen-Max" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-row" style={{ marginBottom: 10 }}>
                  <label className="form-label">模型标识</label>
                  <input className="form-input" placeholder="如：qwen-max" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </div>
                <div className="form-row" style={{ marginBottom: 10 }}>
                  <label className="form-label">Base URL</label>
                  <input className="form-input" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
                </div>
                <div className="form-row" style={{ marginBottom: 6 }}>
                  <label className="form-label">上下文窗口（token）</label>
                  <input className="form-input" value={form.contextWindow} onChange={(e) => setForm({ ...form, contextWindow: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={addCustomModel}>添加模型</button>
              </div>
            </div>
          )}

          {tab === "prefs" && (
            <div>
              <div className="form-row">
                <label className="form-label">主题</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {([["light", "浅色"], ["dark", "深色"], ["system", "跟随系统"]] as const).map(([v, label]) => (
                    <button
                      key={v}
                      className={`btn btn-sm ${settings.theme === v ? "btn-primary" : ""}`}
                      onClick={() => setSettings({ theme: v })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">字号：{settings.fontSize}px</label>
                <input
                  type="range"
                  min={12}
                  max={18}
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ fontSize: Number(e.target.value) })}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="form-row">
                <label className="form-label">默认工作区目录</label>
                <input
                  className="form-input"
                  placeholder="留空则使用项目目录"
                  value={settings.workspace}
                  onChange={(e) => setSettings({ workspace: e.target.value })}
                />
                <div className="form-hint">工具执行时的工作目录；在 Tauri 中可用环境面板查看真实路径</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
