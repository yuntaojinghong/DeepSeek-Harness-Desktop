use serde::Serialize;
use std::process::Command;

#[derive(Serialize, Clone)]
struct RuntimeInfo {
    installed: bool,
    version: Option<String>,
    path: Option<String>,
}

#[derive(Serialize)]
struct EnvStatus {
    python: Option<RuntimeInfo>,
    node: Option<RuntimeInfo>,
    git: Option<RuntimeInfo>,
    os: String,
    arch: String,
    app_dir: String,
}

fn detect(cmd: &str, version_args: &[&str]) -> RuntimeInfo {
    let path = Command::new("where")
        .arg(cmd)
        .output()
        .ok()
        .filter(|o| o.status.success())
        .and_then(|o| {
            String::from_utf8_lossy(&o.stdout)
                .lines()
                .next()
                .map(|s| s.trim().to_string())
        });

    let version = Command::new(cmd)
        .args(version_args)
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| {
            let out = String::from_utf8_lossy(&o.stdout).trim().to_string();
            if out.is_empty() {
                String::from_utf8_lossy(&o.stderr).trim().to_string()
            } else {
                out
            }
        })
        .filter(|s| !s.is_empty());

    RuntimeInfo {
        installed: path.is_some(),
        version,
        path,
    }
}

#[tauri::command]
fn check_env(app: tauri::AppHandle) -> EnvStatus {
    EnvStatus {
        python: Some(detect("python", &["--version"])),
        node: Some(detect("node", &["--version"])),
        git: Some(detect("git", &["--version"])),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        app_dir: app
            .path()
            .app_data_dir()
            .map(|p| p.display().to_string())
            .unwrap_or_default(),
    }
}

#[derive(Serialize)]
struct RunResult {
    code: i32,
    stdout: String,
    stderr: String,
}

#[tauri::command]
fn run_command(command: String, args: Vec<String>, cwd: Option<String>) -> RunResult {
    let mut cmd = Command::new(&command);
    cmd.args(&args);
    if let Some(c) = cwd {
        cmd.current_dir(c);
    }
    match cmd.output() {
        Ok(o) => RunResult {
            code: o.status.code().unwrap_or(-1),
            stdout: String::from_utf8_lossy(&o.stdout).to_string(),
            stderr: String::from_utf8_lossy(&o.stderr).to_string(),
        },
        Err(e) => RunResult {
            code: -1,
            stdout: String::new(),
            stderr: e.to_string(),
        },
    }
}

#[derive(Serialize)]
struct DirEntry {
    name: String,
    is_dir: bool,
    size: u64,
}

#[tauri::command]
fn list_dir(path: String) -> Vec<DirEntry> {
    let mut out: Vec<DirEntry> = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&path) {
        for e in entries.flatten() {
            let name = e.file_name().to_string_lossy().to_string();
            let is_dir = e.file_type().map(|t| t.is_dir()).unwrap_or(false);
            let size = if is_dir {
                0
            } else {
                e.metadata().map(|m| m.len()).unwrap_or(0)
            };
            out.push(DirEntry {
                name,
                is_dir,
                size,
            });
        }
    }
    out.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    out
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![check_env, run_command, list_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
