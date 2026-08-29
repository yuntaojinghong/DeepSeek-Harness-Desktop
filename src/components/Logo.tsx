import { useId } from "react";

interface Props {
  size?: number;
  radius?: number;
}

export default function LogoMark({ size = 28, radius = 9 }: Props) {
  const bg = useId().replace(/:/g, "");
  const core = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b1226" />
          <stop offset="1" stopColor="#1b1040" />
        </linearGradient>
        <linearGradient id={core} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#4d6bfe" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx={230 * (radius / 9)} fill={`url(#${bg})`} />
      <circle cx="196" cy="232" r="7" fill="#6d84ff" />
      <circle cx="836" cy="178" r="6" fill="#6d84ff" />
      <circle cx="802" cy="782" r="7" fill="#6d84ff" />
      <circle cx="182" cy="752" r="5" fill="#6d84ff" />
      <g transform="rotate(-24 512 512)">
        <ellipse cx="512" cy="512" rx="330" ry="126" fill="none" stroke="#22d3ee" strokeWidth="12" opacity="0.75" />
        <circle cx="842" cy="512" r="18" fill="#67e8f9" />
      </g>
      <circle cx="512" cy="512" r="176" fill={`url(#${core})`} />
      <circle cx="512" cy="512" r="176" fill="none" stroke="#7dd3fc" strokeWidth="4" opacity="0.55" />
      <circle cx="462" cy="452" r="52" fill="#ffffff" opacity="0.28" />
      <path
        d="M512 392 C 528 478 546 496 632 512 C 546 528 528 546 512 632 C 496 546 478 528 392 512 C 478 496 496 478 512 392 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
