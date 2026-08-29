import { useEffect, useMemo, useRef } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

marked.setOptions({ gfm: true, breaks: true });

export default function Markdown({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    try {
      return marked.parse(content) as string;
    } catch {
      return content;
    }
  }, [content]);

  useEffect(() => {
    ref.current?.querySelectorAll("pre code").forEach((el) => {
      try {
        hljs.highlightElement(el as HTMLElement);
      } catch {
        /* ignore */
      }
    });
  }, [html]);

  return <div className="markdown-body" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
