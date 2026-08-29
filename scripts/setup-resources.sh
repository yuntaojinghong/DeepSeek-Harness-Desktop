#!/usr/bin/env bash
# =============================================================================
# DeepSeek Harness Desktop · 资源准备脚本
# 自动下载 Node 便携版 + 安装 @deepseek-ai/dsh，供 Tauri 打包内置进安装程序。
#
# 用法：
#   bash scripts/setup-resources.sh          # 完整准备
#   bash scripts/setup-resources.sh --node   # 仅准备 Node
#   bash scripts/setup-resources.sh --dsh    # 仅安装 dsh
#
# 产物目录（已加入 .gitignore，不会提交到仓库）：
#   resources/node/                          便携版 Node（node.exe）
#   resources/dsh/node_modules/@deepseek-ai/dsh/lib/bin.js  官方 Harness
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RES="$ROOT/resources"

# ---- 可调版本 ----
NODE_VERSION="${NODE_VERSION:-22.12.0}"            # Node 便携版版本（LTS）
NODE_ARCH="${NODE_ARCH:-x64}"                       # 目标架构
DSH_VERSION="${DSH_VERSION:-0.1.1-rc.2}"            # @deepseek-ai/dsh 版本

NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-${NODE_ARCH}.zip"
NODE_DIR="$RES/node"
DSH_DIR="$RES/dsh"
DSH_BIN="$DSH_DIR/node_modules/@deepseek-ai/dsh/lib/bin.js"

log()  { printf '\033[36m>>\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
fail() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

extract_zip() { # $1=zip $2=dest
  if command -v unzip >/dev/null 2>&1; then
    unzip -q "$1" -d "$2"
  elif command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Expand-Archive -Path '$1' -DestinationPath '$2' -Force"
  else
    fail "需要 unzip 或 PowerShell 来解压 $1"
  fi
}

setup_node() {
  if [ -f "$NODE_DIR/node.exe" ]; then
    ok "Node 已就绪（跳过）：$NODE_DIR/node.exe"
    return 0
  fi
  log "下载 Node 便携版 v${NODE_VERSION}（${NODE_ARCH}）..."
  local zip="$RES/node-win.zip"
  local tmp="$RES/node-tmp"
  mkdir -p "$RES"
  curl -fL --ssl-no-revoke --retry 3 "$NODE_URL" -o "$zip" || fail "下载 Node 失败：$NODE_URL"
  rm -rf "$tmp"; mkdir -p "$tmp"
  extract_zip "$zip" "$tmp" || fail "解压 Node 失败"
  mv "$tmp/node-v${NODE_VERSION}-win-${NODE_ARCH}" "$NODE_DIR" || fail "移动 Node 目录失败"
  rm -rf "$tmp" "$zip"
  ok "Node 已就绪：$NODE_DIR/node.exe"
}

setup_dsh() {
  if [ -f "$DSH_BIN" ]; then
    ok "dsh 已就绪（跳过）：$DSH_BIN"
    return 0
  fi
  log "安装 @deepseek-ai/dsh@${DSH_VERSION} ..."
  mkdir -p "$DSH_DIR"
  if [ ! -f "$DSH_DIR/package.json" ]; then
    (cd "$DSH_DIR" && npm init -y >/dev/null 2>&1)
  fi
  (cd "$DSH_DIR" && npm install "@deepseek-ai/dsh@${DSH_VERSION}") || fail "安装 @deepseek-ai/dsh 失败"
  [ -f "$DSH_BIN" ] || fail "未找到 $DSH_BIN，安装可能不完整"
  ok "dsh 已就绪：$DSH_BIN"
}

main() {
  local do_node=0 do_dsh=0
  if [ "$#" -eq 0 ]; then do_node=1; do_dsh=1; fi
  for a in "$@"; do
    case "$a" in
      --node) do_node=1 ;;
      --dsh)  do_dsh=1 ;;
      *) fail "未知参数：$a（支持 --node / --dsh）" ;;
    esac
  done

  mkdir -p "$RES"
  [ "$do_node" = 1 ] && setup_node
  [ "$do_dsh"  = 1 ] && setup_dsh

  echo
  ok "资源准备完成。现在可以运行：npm run tauri build"
}

main "$@"
