import { create } from "zustand";
import type { AppSettings, Conversation, EnvStatus, ModelConfig, ToolToggle } from "./types";
import {
  loadConversations,
  loadModels,
  loadSelected,
  loadSettings,
  saveConversations,
  saveModels,
  saveSelected,
  saveSettings,
  uid,
  readDiskData,
  writeDiskData,
} from "./lib/storage";

interface AppState {
  conversations: Conversation[];
  activeId: string | null;
  settings: AppSettings;
  models: ModelConfig[];
  env: EnvStatus | null;
  envChecking: boolean;
  tools: ToolToggle;
  sidebarOpen: boolean;
  contextOpen: boolean;
  settingsOpen: boolean;
  envOpen: boolean;
  welcomeOpen: boolean;
  searchQuery: string;
  hydrated: boolean;

  activeConversation: () => Conversation | null;
  hydrate: () => Promise<void>;
  setActive: (id: string) => void;
  newConversation: (modelId?: string) => string;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, fn: (c: Conversation) => Conversation) => void;
  searchConversations: () => Conversation[];
  setPersona: (personaId: string) => void;

  setSettings: (s: Partial<AppSettings>) => void;
  setApiKey: (provider: string, key: string) => void;
  addModel: (m: ModelConfig) => void;
  removeModel: (id: string) => void;
  selectModel: (id: string) => void;

  setEnv: (e: EnvStatus | null) => void;
  setEnvChecking: (v: boolean) => void;
  setTools: (t: Partial<ToolToggle>) => void;
  setSidebarOpen: (v: boolean) => void;
  setContextOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setEnvOpen: (v: boolean) => void;
  setWelcomeOpen: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  conversations: loadConversations(),
  activeId: (() => {
    const list = loadConversations();
    const sel = loadSelected();
    if (list.some((c) => c.id === sel)) return sel;
    return list[0]?.id ?? null;
  })(),
  settings: loadSettings(),
  models: loadModels(),
  env: null,
  envChecking: false,
  tools: { code: true, file: true, search: false },
  sidebarOpen: true,
  contextOpen: true,
  settingsOpen: false,
  envOpen: false,
  welcomeOpen: false,
  searchQuery: "",
  hydrated: false,

  activeConversation: () => {
    const s = get();
    return s.conversations.find((c) => c.id === s.activeId) ?? null;
  },

  hydrate: async () => {
    const disk = await readDiskData();
    if (disk) {
      saveConversations(disk.conversations);
      saveSettings(disk.settings);
      saveModels(disk.models);
      saveSelected(disk.selected);
      set({
        conversations: disk.conversations,
        settings: disk.settings,
        models: disk.models,
        activeId: disk.conversations.some((c) => c.id === disk.selected)
          ? disk.selected
          : disk.conversations[0]?.id ?? null,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },

  setPersona: (personaId) => {
    const conv = get().activeConversation();
    if (conv) {
      get().updateConversation(conv.id, (c) => ({ ...c, systemPromptId: personaId }));
    }
  },

  setActive: (id) => {
    saveSelected(id);
    set({ activeId: id });
  },

  newConversation: (modelId) => {
    const s = get();
    const id = uid();
    const conv: Conversation = {
      id,
      title: "新会话",
      messages: [],
      modelId: modelId || s.settings.defaultModelId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const list = [conv, ...s.conversations];
    saveConversations(list);
    saveSelected(id);
    set({ conversations: list, activeId: id, searchQuery: "" });
    return id;
  },

  renameConversation: (id, title) => {
    set({
      conversations: get().conversations.map((c) => (c.id === id ? { ...c, title } : c)),
    });
  },

  deleteConversation: (id) => {
    const list = get().conversations.filter((c) => c.id !== id);
    saveConversations(list);
    const next = list[0]?.id ?? null;
    if (next) saveSelected(next);
    set({ conversations: list, activeId: next });
  },

  updateConversation: (id, fn) => {
    set({
      conversations: get().conversations.map((c) => (c.id === id ? fn(c) : c)),
    });
  },

  searchConversations: () => {
    const s = get();
    const q = s.searchQuery.trim().toLowerCase();
    if (!q) return s.conversations;
    return s.conversations.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      return c.messages.some((m) => m.content.toLowerCase().includes(q));
    });
  },

  setSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    saveSettings(next);
    set({ settings: next });
  },

  setApiKey: (provider, key) => {
    const keys = { ...get().settings.apiKeys, [provider]: key };
    get().setSettings({ apiKeys: keys });
  },

  addModel: (m) => {
    const list = [...get().models, m];
    saveModels(list);
    set({ models: list });
  },

  removeModel: (id) => {
    const list = get().models.filter((m) => m.id !== id);
    saveModels(list);
    set({ models: list });
  },

  selectModel: (id) => {
    saveSelected(id);
    set({ settings: { ...get().settings, defaultModelId: id } });
    const conv = get().activeConversation();
    if (conv) {
      get().updateConversation(conv.id, (c) => ({ ...c, modelId: id }));
    }
  },

  setEnv: (e) => set({ env: e }),
  setEnvChecking: (v) => set({ envChecking: v }),
  setTools: (t) => set({ tools: { ...get().tools, ...t } }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setContextOpen: (v) => set({ contextOpen: v }),
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  setEnvOpen: (v) => set({ envOpen: v }),
  setWelcomeOpen: (v) => set({ welcomeOpen: v }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));

let persistTimer: ReturnType<typeof setTimeout> | null = null;
useAppStore.subscribe((state) => {
  if (!state.hydrated) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    writeDiskData({
      conversations: state.conversations,
      settings: state.settings,
      models: state.models,
      selected: state.activeId ?? state.settings.defaultModelId,
    });
  }, 400);
});
