# DeepSeek Harness 桌面版

<p align="center">
  <a href="./README_EN.md">English</a> · <b>中文</b>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="GitHub stars" src="https://img.shields.io/github/stars/yuntaojinghong/DeepSeek-Harness-Desktop?style=social">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-2-24c8db.svg">
  <img alt="React" src="https://img.shields.io/badge/React-18-61dafb.svg">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6.svg">
</p>

开箱即用的 DeepSeek AI 桌面工作台：双击即用、自动补齐运行环境、多模型切换、Agent 工具调用。

> **星核 StarCore**：驾驭星辰智能的能量核心——科幻风 AI 工作台。

## ✨ 功能

- **流式对话**：Markdown / 代码高亮 / 表格 / 引用块渲染
- **多模型切换**：DeepSeek V4 Flash / Pro 实时同步官方接口新增（启动或「设置 → 模型管理」一键刷新，无需升级客户端）；任意 OpenAI 兼容模型（通义 / Kimi / GLM 等），每个模型独立图标
- **品牌启动动画**：深空星野 + 鲸鱼标志 + 环形轨道 + 扫描进度，1.3s 淡入主界面
- **便携模式**：数据跟随应用目录（`portable.flag` 标记），整个文件夹拷到 U 盘即用
- **系统托盘**：关窗最小化到托盘，任务不中断；回合完成弹桌面通知
- **环境自检**：检测 Python / Node / Git，缺失自动补齐便携版运行时
- **Agent 工具**：代码执行（run_command）、目录列举（list_dir），多轮工具调用
- **人设卡**：System Prompt 一键切换（编程专家 / 中文文案 / 数据分析 / 翻译官…）
- **首次引导**：两步配置（填 API Key + 选工作目录）
- **科幻主题**：深空霓虹配色、星空背景、发光动效，深浅双主题 + 字号/密度自定义
- 会话导出 MD / JSON、全文搜索、全本地存储、零遥测

## 🛠 技术栈

- **桌面壳**：Tauri 2（Rust 后端，安装包 ~10MB）
- **前端**：React 18 + TypeScript + Vite
- **模型**：DeepSeek 官方 API + 任意 OpenAI 兼容服务

## 🚀 开发运行

### 前置条件

1. **Node.js** ≥ 18（项目已用 Node 22）
2. **Rust**：`rustup` 安装 stable-msvc
3. **Visual Studio Build Tools**（含「使用 C++ 的桌面开发」工作负载）— Windows 上链接 MSVC 必需

```bash
# 安装依赖
npm install

# 仅前端预览（浏览器，无系统能力）
npm run dev

# 完整桌面应用（开发模式，自动启动 Rust 后端）
npm run tauri dev

# 打包安装程序
npm run tauri build
```

## 📥 下载安装

前往 [Releases](https://github.com/yuntaojinghong/DeepSeek-Harness-Desktop/releases) 下载最新的 `DeepSeek-Harness-Desktop_*.exe` 安装包，双击安装即可（默认装到用户目录，无需管理员权限，自动创建桌面快捷方式）。

> 想绿色便携使用？在安装目录旁放置一个空的 `portable.flag` 文件，数据就会跟随应用目录存储，整个文件夹拷到 U 盘即可随处使用。

## 🎬 首次使用

1. 启动后按欢迎页引导，填入 DeepSeek API Key（platform.deepseek.com 获取）并选择工作目录
2. 顶部下拉选择模型（V3 / R1 等）
3. 直接开始对话；模型支持工具调用时，可让它帮你执行命令、读目录

## 📁 项目结构

```
deepseek-harness-desktop/
├── src/                    # React 前端
│   ├── App.tsx             # 布局、启动动画、主题
│   ├── store.ts            # zustand 全局状态（含官方模型实时拉取）
│   ├── components/         # 界面组件（含 SplashScreen 启动动画）
│   ├── lib/                # llm 流式客户端 / env 检测 / storage / models
│   └── styles/global.css   # 设计系统（含启动动画关键帧）
└── src-tauri/              # Rust 后端
    ├── src/lib.rs          # check_env / run_command / list_dir / 存储 / 托盘 / 通知 / update
    ├── tauri.conf.json
    └── Cargo.toml
```

## ⭐ 支持项目

如果这个项目对你有帮助，欢迎点个 **Star ⭐**，你的支持是持续更新的动力！

## 📄 License

[MIT](./LICENSE) © 2026 [yuntaojinghong](https://github.com/yuntaojinghong)

## 🤝 贡献

欢迎提交 Issue 与 Pull Request。提交前请确保前端 `npm run build` 与后端 `cargo check` 均通过。

## ™️ 商标

应用图标及品牌素材（鲸鱼 logo）来自 **DeepSeek** 官方开源仓库，仅用于标识本项目与 DeepSeek 的关系。本项目是独立开发的第三方桌面封装工具，与 DeepSeek 公司无官方隶属关系。如需将本项目用于商业再分发，请自行评估并遵守 DeepSeek 的品牌使用条款。
