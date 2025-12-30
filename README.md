# score-caculate · 学分绩预测工具

一个基于 **Tauri + React** 的本地桌面应用，用于课程成绩管理与学分加权平均分（GPA / 学分绩）预测。

* 🚀 **完全本地运行**，无需网络
* 💾 **自动持久化保存**，安全写入
* 🔒 **支持“已出分 / 未出分”锁定**
* 📊 **实时计算学分加权平均分**
* 🧠 **对未出分课程进行统一预测**

---


### ⚠️ 关于 `default_courses.json` 的说明（重要）

本项目仓库中提供的 `resources/default_courses.json` **仅为示例数据**，用于：

* 应用首次启动时初始化数据
* 演示 GPA 计算与预测逻辑
* 保证仓库可直接运行

**该文件中的课程、学分、学期均为虚构内容**，
**不包含任何真实培养方案或个人成绩信息**。

👉 **在实际使用前，你需要自行修改此文件**，将其替换为：

* 你所在学校的课程名称
* 对应学期
* 正确的学分信息

修改后：

* 应用首次启动会自动加载你的课程模板
* 后续所有数据将存储在本地，不会影响仓库文件

> 出于隐私与合规考虑，仓库中不会提供任何真实培养方案数据。

---

## ✨ 功能概览

### 1. 课程成绩管理

* 课程名称、学期、学分、成绩
* 成绩范围校验（`0 ~ 100`）
* 支持标记「已出分 / 未出分」

### 2. 成绩预测机制

* 对 **未锁定课程** 批量应用预测分数
* 已锁定课程（已出分）不会被覆盖
* 成绩为 `0` 的课程不计入 GPA 计算

### 3. GPA 计算规则

* 使用 **学分加权平均分**：

  $$
  \text{Avg} = \frac{\sum_{i=1}^{n} (\text{score}_i \times \text{credit}_i)}
  {\sum_{i=1}^{n} \text{credit}_i}
  $$

* 实时刷新，自动保存

### 4. 数据安全与恢复

* 数据以 `courses.json` 形式保存在应用数据目录
* **原子写入（tmp → rename）**，防止数据损坏
* 文件缺失 / 解析失败时：

  * 自动加载内置默认课程
  * 恢复并标记状态

---

## 🏗️ 技术架构

```
├─ src-tauri/                 # Rust 后端
│  ├─ main.rs                 # 应用入口 & command 注册
│  └─ courses.json            # 用户数据（运行时生成）
│
├─ src/
│  ├─ components/
│  │  └─ CourseTable.tsx      # 成绩表 & GPA 计算核心组件
│  └─ types/
│     └─ course.ts            # Course 类型定义
│
└─ resources/
   └─ default_courses.json    # 默认课程模板
```

---

## 🦀 后端（Tauri / Rust）

### Course 数据结构

```rust
pub struct Course {
    pub name: String,   // 课程名
    pub term: String,   // 学期
    pub score: f64,     // 成绩 (0~100)
    pub locked: bool,   // 是否已出分
    pub credit: f64,    // 学分
}
```

### 校验规则

* 课程名、学期不能为空
* 成绩必须在 `[0, 100]` 范围内
* 校验失败将直接拒绝保存

---

### 后端 Commands

#### `load_courses()`

加载课程数据，返回结构化结果：

```rust
pub struct LoadResult {
    pub courses: Vec<Course>,
    pub state: LoadState,
}
```

`LoadState` 含义：

| 状态                  | 含义            |
| ------------------- | ------------- |
| `Normal`            | 正常读取          |
| `Initialized`       | 文件不存在，初始化默认数据 |
| `Recovered(reason)` | 出错后已自动恢复      |

---

#### `save_courses(courses)`

* 校验所有课程
* 使用临时文件写入
* 原子替换旧数据，确保安全

---

## ⚛️ 前端（React + Ant Design）

### CourseTable 核心能力

* 成绩表格（AntD Table）
* 成绩输入（InputNumber）
* 锁定状态（Checkbox）
* GPA 实时统计卡片

### 关键前端逻辑

* **不可修改已锁定课程**
* 批量预测仅作用于未锁定项
* 自动计算：

  * 总课程数
  * 已出分 / 未出分
  * 参与预测课程数
  * 学分加权平均分

---

## 💾 数据持久化策略

* 存储位置：`app_data_dir/courses.json`
  * Windows: `%APPDATA%/score-caculate/courses.json`
* 首次启动：

  * 自动拷贝 `resources/default_courses.json`
* 异常情况：

  * JSON 损坏 / 读取失败 → 自动恢复

---

## 🚀 运行与开发

### 启动开发环境

```bash
pnpm install
pnpm tauri dev
```

### 构建桌面应用

```bash
pnpm tauri build
```

---

## 🧩 设计理念

* **本地优先**：不依赖任何后端服务
* **安全第一**：防止数据丢失
* **预测友好**：为“尚未出分”的现实场景服务
* **工程克制**：逻辑集中、状态清晰、易维护

---

## 📌 适用场景

* 平均学分绩 预测
* 奖学金 / 保研成绩估算
* 课程规划与成绩敏感性分析
* 课程设计 / Tauri 实战项目

---

## 📄 License

MIT License