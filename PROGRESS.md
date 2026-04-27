# 进度日志

## 当前状态：进行中 🟢

---

## 已完成的工作

### 2026-04-18：书单确定
- [x] 从照片识别已有书目（15 本）
- [x] 确定最终书单：中英文各 20 本，共 40 本
- [x] 查验所有待购书的出版信息（确认真实存在）
- [x] 用户选定最终书单

### 2026-04-18：Web App v2 开发
- [x] 确定技术栈：React 18 + Vite + TailwindCSS v4 + Supabase
- [x] 完成 App 设计文档
- [x] 创建项目骨架 + 安装依赖
- [x] Supabase 数据库建表（books, check_ins, settings）
- [x] 初始化 40 本书种子数据
- [x] 核心功能开发：书籍列表、打卡、进度条、统计
- [x] 部署到 Vercel（reading-v2.vercel.app）
- [x] 书籍管理页：添加/编辑/删除/拖拽排序
- [x] 每日目标 + 阅读进度组件
- [x] 打卡日历热力图

### 2026-04-18：书籍参数与阅读速度
- [x] 数据库新增 difficulty, words_per_page, zh_speed, en_speed 字段
- [x] 创建 `readingCalc.js` 核心计算模块
- [x] 基于时间的阅读模型：minutesPerPage = words_per_page / speed
- [x] 为 40 本书设置初始 difficulty 和 words_per_page
- [x] SettingsPanel 添加阅读速度滑块
- [x] BookForm 添加难度和每页字数编辑
- [x] DIFFICULTY_FACTOR 全部设为 1.0（速度由 words_per_page + 阅读速度决定）
- [x] 截止日期延长至 2026-09-05

### 2026-04-19：英文优先计划调整
- [x] 新增 `en_time_ratio` 设置（数据库 + 前端）
- [x] 工作日 = 纯英文阅读，周末按比例分配中英文时间
- [x] SettingsPanel 重新设计：用"周末中文阅读时间"滑块替代抽象比例
  - 显示实际分钟数分配
  - 预设按钮：自动 / 中文1h / 中文30分
- [x] `getEnRatio()` 函数：支持固定比例和自动按比例分配
- [x] ReadingSchedule 和 CheckInCalendar 同步支持语言时间比例
- [x] 当前设置：en_time_ratio = 0.67（周末英文120分 + 中文60分）

### 2026-04-19：日历重构
- [x] 从 9 周网格改为单月视图 + 左右箭头切换月份
- [x] 点击月份标题回到当前月
- [x] 修复时区 bug：`toISOString().split('T')[0]` → `toDateStr()`（本地时间）
  - 影响 4 个文件共 11 处替换
  - 根因：UTC+8 时区下 midnight 本地时间转 UTC 会回退一天

### 2026-04-19：每日目标优化
- [x] 中文书剩余 < 10 页不再排入计划（MIN_SCHEDULE_PAGES_ZH）
- [x] 从"比例分配"改为"顺序分配"：先读当前书，读完才溢出到下一本
- [x] 日历详情：同一本书多次打卡合并显示
- [x] 去掉计划日的冗余"已完成"区块
- [x] 构建并部署成功

---

## 当前数据库设置
```
weekday_minutes: 30
weekend_minutes: 180
zh_speed: 130
en_speed: 150
end_date: 2026-09-05
en_time_ratio: 0.67
```

## 关键文件
- `app-v2/src/lib/readingCalc.js` — 核心计算引擎
- `app-v2/src/components/CheckInCalendar.jsx` — 月视图日历 + 日期详情
- `app-v2/src/components/ReadingSchedule.jsx` — 未来阅读安排
- `app-v2/src/components/SettingsPanel.jsx` — 设置面板
- `app-v2/src/components/DailyGoal.jsx` — 每日目标

## 下一步待办
- 持续使用并根据反馈迭代优化
- 用户日常打卡追踪阅读进度
