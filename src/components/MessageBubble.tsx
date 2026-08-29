import type { ChatMessage } from "../types";
import Markdown from "./Markdown";
import LogoMark from "./Logo";
import { UserIcon } from "./Icons";

export default function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="msg-row user">
        <div className="bubble user" style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
        <div className="avatar user"><UserIcon size={16} /></div>
      </div>
    );
  }

  const showTyping = msg.streaming && !msg.content;

  return (
    <div className="msg-row">
      <div className="avatar ai"><LogoMark size={28} radius={8} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div>
            {msg.toolCalls.map((tc, i) => (
              <div className="tool-call-box" key={i}>
                <span className="tool-name">{tc.name}</span>
                {tc.ok ? (
                  <span style={{ marginLeft: 8, color: "var(--success)", fontSize: 12 }}>执行成功</span>
                ) : (
                  <span style={{ marginLeft: 8, color: "var(--danger)", fontSize: 12 }}>执行失败</span>
                )}
                <pre>{tc.result.slice(0, 600)}{tc.result.length > 600 ? " …" : ""}</pre>
              </div>
            ))}
          </div>
        )}
        <div className={`bubble ai ${msg.error ? "error" : ""}`}>
          {showTyping ? (
            <span className="typing-dots"><span /><span /><span /></span>
          ) : msg.content ? (
            <Markdown content={msg.content} />
          ) : (
            <span style={{ color: "var(--text-tertiary)" }}>（无内容）</span>
          )}
          {msg.streaming && msg.content && (
            <span className="typing-dots" style={{ display: "inline-flex", marginLeft: 4 }}><span /><span /><span /></span>
          )}
        </div>
        {msg.model && (
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4, paddingLeft: 2 }}>{msg.model}</div>
        )}
      </div>
    </div>
  );
}
