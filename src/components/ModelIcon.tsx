import { useId } from "react";

interface Props {
  provider: string;
  size?: number;
}

const BGR = {
  deepseek: ["#4d6bfe", "#38bdf8"],
  openai: ["#10a37f", "#0d8a6a"],
  custom: ["#8b5cf6", "#6366f1"],
} as const;

function bgId(prefix: string) {
  return `${prefix}bg`;
}

export default function ModelIcon({ provider, size = 22 }: Props) {
  const id = useId().replace(/:/g, "");
  const [c1, c2] = BGR[provider as keyof typeof BGR] ?? BGR.custom;
  const gid = bgId(id);

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0, borderRadius: 6 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6.5" fill={`url(#${gid})`} />

      {provider === "deepseek" && (
        <g fill="none" stroke="#ffffff" strokeLinecap="round">
          <path d="M5 14.5c2.4-4.2 4.7-4.2 7 0s4.6 4.2 7 0" strokeWidth="1.8" />
          <path d="M6.5 18.5c1.9-3 3.8-3 5.5 0s3.6 3 5.5 0" strokeWidth="1.4" opacity="0.7" />
        </g>
      )}

      {provider === "openai" && (
        <g fill="#ffffff">
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="12" cy="6.2" r="1.8" />
          <circle cx="17" cy="9" r="1.8" />
          <circle cx="17" cy="15" r="1.8" />
          <circle cx="12" cy="17.8" r="1.8" />
          <circle cx="7" cy="15" r="1.8" />
          <circle cx="7" cy="9" r="1.8" />
        </g>
      )}

      {provider === "custom" && (
        <g>
          <rect x="8.6" y="8.6" width="6.8" height="6.8" rx="1.6" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <path
            d="M10 6.2v1.6M14 6.2v1.6M10 16.2v1.6M14 16.2v1.6M6.2 10h1.6M6.2 14h1.6M16.2 10h1.6M16.2 14h1.6"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}
