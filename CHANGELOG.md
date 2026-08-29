# Changelog

本项目的所有值得注意的变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)（SemVer 2.0.0）。

## [Unreleased]

## [0.4.0] - 2026-08-30

### Added
- **内置官方 DeepSeek Harness**：新增 `npm run setup:resources` 一键准备脚本（`scripts/setup-resources.sh`），自动下载便携版 Node 并安装 `@deepseek-ai/dsh`；启动时由 Rust 后端 `start_dsh` 拉起官方 Web UI（`127.0.0.1:3080`），双击即用、插件生态与官方一致。
- **品牌启动动画**：深空星野 + 鲸鱼辉光 + 环形轨道 + 扫描进度，并实时展示「正在启动 DeepSeek Harness 服务…」及失败重试。
- **官方模型实时同步**（浏览器预览模式）：调用 `GET /v1/models` 拉取 DeepSeek 官方最新模型，启动自动同步 + 设置页手动刷新。
- **官方主页（GitHub Pages）**：新增 `docs/index.html`，含 Hero、特性、应用预览、安装、FAQ、技术栈；深空科幻配色与动效。
- **安装程序品牌化**：NSIS 接入 `headerImage` / `sidebarImage`，重绘安装图片（多层轨道环、双层辉光、扫描光带）。

### Changed
- **应用图标**：改用 DeepSeek 官方 Harness logo（`deepseek-ai/deepseek-harness` 的 `apps/web/public/favicon.svg`），重新生成全套图标。
- **仓库重命名**：`StarCore` → `DeepSeek-Harness-Desktop`，同步更新 README 徽章、下载链接与更新检查 URL。
- **产品定位**：由「自建聊天界面」调整为「内置官方 Harness 的桌面封装」，React 前端降级为浏览器预览模式。
- **Logo 组件**：由硬编码黑色改为品牌渐变（原黑色在深色主题下不可见）。
- **README**：更新定位说明、构建步骤（setup:resources）与商标归属。

### Fixed
- 修复 `bundle.resources` 引用不存在的 `resources/` 目录导致打包失败（现由 setup 脚本生成资源，并恢复正确的资源打包）。
- 修复 `selectModel` 误把模型 id 写入「选中会话」存储 `dh.selected`，导致刷新后回退到首个会话。
- 修复 Logo 在深色主题下不可见。
- 移除未经验证的 `deepseek-v4-flash-vision-exp` 内置模型。

## [0.3.0] - 历史版本

> 0.3.0 及更早版本未维护变更日志，此处仅作占位。
