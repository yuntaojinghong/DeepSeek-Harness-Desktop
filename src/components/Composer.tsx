import { useRef, useState } from "react";
import { SendIcon, StopIcon } from "./Icons";

interface Props {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  canSend: boolean;
}

export default function Composer({ onSend, onStop, streaming, canSend }: Props) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  };

  const submit = () => {
    const v = text.trim();
    if (!v || !canSend) return;
    onSend(v);
    setText("");
    requestAnimationFrame(() => {
      if (taRef.current) {
        taRef.current.style.height = "auto";
        taRef.current.focus();
      }
    });
  };

  return (
    <div className="composer-wrap">
      <div className="composer">
        <textarea
          ref={taRef}
          rows={1}
          placeholder="输入消息，@ 引用文件，/ 呼出命令…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoResize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="composer-bottom">
          <span className="composer-hint">Enter 发送 · Shift+Enter 换行</span>
          {streaming ? (
            <button className="btn btn-sm" style={{ color: "var(--danger)" }} onClick={onStop}>
              <StopIcon size={14} /> 停止生成
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" style={{ padding: "6px 16px" }} onClick={submit} disabled={!text.trim()}>
              <SendIcon size={14} /> 发送
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
