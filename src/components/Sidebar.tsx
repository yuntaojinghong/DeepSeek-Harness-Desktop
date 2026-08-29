import { useAppStore } from "../store";
import { PlusIcon, SearchIcon, TrashIcon } from "./Icons";

export default function Sidebar() {
  const conversations = useAppStore((s) => s.searchConversations());
  const activeId = useAppStore((s) => s.activeId);
  const setActive = useAppStore((s) => s.setActive);
  const newConversation = useAppStore((s) => s.newConversation);
  const deleteConversation = useAppStore((s) => s.deleteConversation);
  const renameConversation = useAppStore((s) => s.renameConversation);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const handleNew = () => {
    newConversation();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("删除该会话？此操作不可恢复。")) deleteConversation(id);
  };

  const handleRename = (e: React.MouseEvent, id: string, current: string) => {
    e.stopPropagation();
    const title = window.prompt("会话名称：", current);
    if (title && title.trim()) renameConversation(id, title.trim());
  };

  return (
    <div className="sidebar">
      <div style={{ padding: "12px 12px 4px" }}>
        <button className="btn btn-primary" style={{ width: "100%", padding: "9px" }} onClick={handleNew}>
          <PlusIcon size={15} /> 新会话
        </button>
      </div>

      <div style={{ padding: "8px 12px" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", display: "flex" }}>
            <SearchIcon size={14} />
          </span>
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="搜索会话与消息…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {conversations.length === 0 && (
          <div style={{ padding: "20px 16px", fontSize: 12.5, color: "var(--text-tertiary)", textAlign: "center", lineHeight: 1.7 }}>
            还没有会话
            <br />
            点击上方「新会话」开始
          </div>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`conv-item ${c.id === activeId ? "active" : ""}`}
            onClick={() => setActive(c.id)}
            onDoubleClick={(e) => handleRename(e, c.id, c.title)}
            title="双击重命名"
          >
            <span className="conv-title">{c.title || "新会话"}</span>
            <span
              style={{ fontSize: 11, color: "var(--text-tertiary)", flexShrink: 0 }}
            >
              {new Date(c.updatedAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
            </span>
            <button className="btn-icon btn-ghost" style={{ width: 24, height: 24 }} onClick={(e) => handleDelete(e, c.id)}>
              <TrashIcon size={13} />
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--border)",
          fontSize: 11.5,
          color: "var(--text-tertiary)",
          lineHeight: 1.6,
          userSelect: "none",
        }}
      >
        数据仅存储在本机
        <br />
        对话记录不上传 · 无遥测
      </div>
    </div>
  );
}
