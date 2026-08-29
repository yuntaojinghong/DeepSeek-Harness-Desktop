import LogoMark from "./Logo";

interface Props {
  leaving?: boolean;
}

// 启动动画页：深空星野 + 鲸鱼标志辉光 + 环形轨道 + 扫描进度
export default function SplashScreen({ leaving }: Props) {
  return (
    <div className={leaving ? "splash splash-leaving" : "splash"}>
      <div className="splash-stars" aria-hidden="true" />
      <div className="splash-core">
        <div className="splash-orbit">
          <div className="splash-orbit-ring" />
          <div className="splash-orbit-dot" />
          <div className="splash-logo">
            <LogoMark size={86} radius={22} />
          </div>
        </div>
        <div className="splash-brand">
          <span className="splash-title">星核 StarCore</span>
          <span className="splash-sub">DeepSeek Harness · AI 桌面工作台</span>
        </div>
        <div className="splash-status">
          <span>正在初始化</span>
          <span className="splash-dots">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
      <div className="splash-bar">
        <div className="splash-bar-fill" />
      </div>
    </div>
  );
}
