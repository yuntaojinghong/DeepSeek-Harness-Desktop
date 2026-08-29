# 星核 StarCore 桌面版

开箱即用的 DeepSeek AI 桌面工作台：双击即用、自动补齐运行环境、多模型切换、Agent 工具调用。

> **星核 StarCore**：驾驭星辰智能的能量核心——科幻风 AI 工作台。

## 技术栈

- **桌面壳**：Tauri 2（Rust 后端，安装包 ~10MB）
- **前端**：React 18 + TypeScript + Vite
- **模型**：DeepSeek 官方 API + 任意 OpenAI 兼容服务

## 功能

- 流式对话 + Markdown / 代码高亮 / 表格 / 公式渲染
- 多会话管理与全文搜索（本地 localStorage）
- 模型中心：DeepSeek V3 / R1 全系 + 自定义 OpenAI 兼容模型
- 环境体检面板：检测 Python / Node / Git，缺失自动补齐（便携版）
- Agent 工具调用：代码执行（run_command）、目录列举（list_dir）
- 深浅双主题、字号/密度自定义、会话导出 MD / JSON
- 全本地存储、零遥测

## 开发运行

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

## 首次使用

1. 启动后点击右上角「设置」，填入 DeepSeek API Key（platform.deepseek.com 获取）
2. 顶部下拉选择模型（V3 / R1 等）
3. 直接开始对话；模型支持工具调用时，可让它帮你执行命令、读目录

## 项目结构

```
deepseek-harness-desktop/
├── src/                    # React 前端
│   ├── App.tsx             # 布局与主题
│   ├── store.ts            # zustand 全局状态
│   ├── components/         # 界面组件
│   ├── lib/                # llm 流式客户端 / env 检测 / storage
│   └── styles/global.css   # 设计系统
└── src-tauri/              # Rust 后端
    ├── src/lib.rs          # check_env / run_command / list_dir 命令
    ├── tauri.conf.json
    └── Cargo.toml
```

## License

[MIT](./LICENSE) © 2026 StarCore Contributors

## 贡献

欢迎提交 Issue 与 Pull Request。提交前请确保前端 `npm run build` 与后端 `cargo check` 均通过。

