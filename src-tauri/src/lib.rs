use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Manager};
use std::path::PathBuf;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 注册后端 command
        .invoke_handler(tauri::generate_handler![
            load_courses,
            save_courses
        ])

        // setup 阶段（插件、初始化）
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })

        // ③ 启动应用
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Course {
    pub name: String,
    pub term: String,
    pub score: f64,
    pub locked: bool,
    pub credit: f64,
}

impl Course {
    fn validate(&self) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err("course name is empty".into());
        }

        if self.term.trim().is_empty() {
            return Err("course term is empty".into());
        }

        if !(0.0..=100.0).contains(&self.score) {
            return Err(format!("invalid score: {}", self.score));
        }

        Ok(())
    }
}

fn courses_path(app: &AppHandle) -> Result<PathBuf, String> {
     let mut dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    fs::create_dir_all(&dir)
        .map_err(|e| e.to_string())?;

    dir.push("courses.json");
    Ok(dir)
}

fn load_default_courses(app: &AppHandle) -> Result<Vec<Course>, String> {
    let resource_path: PathBuf = app
        .path()
        .resolve("resources/default_courses.json", tauri::path::BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;

    let content = fs::read_to_string(resource_path)
        .map_err(|e| e.to_string())?;

    let courses: Vec<Course> =
        serde_json::from_str(&content)
            .map_err(|e| e.to_string())?;

    for c in &courses {
        c.validate()?;
    }

    Ok(courses)
}

#[derive(Serialize)]
pub enum LoadState {
    Normal,            // 正常加载
    Initialized,       // 文件不存在，已初始化默认数据
    Recovered(String), // 出错，已恢复（附带原因）
}

#[derive(Serialize)]
pub struct LoadResult {
    pub courses: Vec<Course>,
    pub state: LoadState,
}

#[tauri::command]
fn load_courses(app: AppHandle) -> Result<LoadResult, String> {
    let path = courses_path(&app)?;

    // 情况 1：文件不存在
    if !path.exists() {
        let courses = load_default_courses(&app)?;
        save_courses(app.clone(), courses.clone())?;
        return Ok(LoadResult {
            courses,
            state: LoadState::Initialized,
        });
    }

    let content = match fs::read_to_string(&path) {
        Ok(c) => c,
        Err(e) => {
            // 情况 2：读取失败 / 解析失败 / 校验失败
            let courses = load_default_courses(&app)?;
            save_courses(app.clone(), courses.clone())?;
            return Ok(LoadResult {
                courses,
                state: LoadState::Recovered(e.to_string()),
            });
        }
    };

    let courses: Vec<Course> = match serde_json::from_str(&content) {
        Ok(c) => c,
        Err(e) => {
            // 情况 2：读取失败 / 解析失败 / 校验失败
            let courses = load_default_courses(&app)?;
            save_courses(app.clone(), courses.clone())?;
            return Ok(LoadResult {
                courses,
                state: LoadState::Recovered(e.to_string()),
            });
        }
    };

    // 情况 3：一切正常
     Ok(LoadResult {
        courses,
        state: LoadState::Normal,
    })
}

#[tauri::command]
fn save_courses(app: AppHandle, courses: Vec<Course>) -> Result<(), String> {
    for course in &courses {
        course.validate()?;
    }

    let path = courses_path(&app)?;

    let json = serde_json::to_string_pretty(&courses)
        .map_err(|e| e.to_string())?;

    let mut tmp_path = path.clone();
    tmp_path.set_extension("json.tmp");

    fs::write(&tmp_path, json)
        .map_err(|e| e.to_string())?;

    if path.exists() {
    fs::remove_file(&path)
        .map_err(|e| e.to_string())?;
    }

    fs::rename(&tmp_path, &path)
        .map_err(|e| e.to_string())?;

    Ok(())
}