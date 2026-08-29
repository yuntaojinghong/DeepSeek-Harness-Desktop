import { useId } from "react";

interface Props {
  size?: number;
  radius?: number;
}

export default function LogoMark({ size = 28, radius = 9 }: Props) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4d6bfe" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx={230 * (radius / 9)} fill={`url(#${gid})`} />
      <path
        d="M512 196 C 542 446 588 482 828 512 C 588 542 542 588 512 828 C 482 588 436 542 196 512 C 436 482 482 446 512 196 Z"
        fill="#ffffff"
      />
      <circle cx="770" cy="254" r="42" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
