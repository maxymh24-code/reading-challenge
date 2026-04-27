# Progress

## 当前状态：已完成 v1.0 + 阅读速度系统

## 已完成
- [x] 初始化 Vite + React + TailwindCSS v4 项目
- [x] 复用数据层文件（supabase, hooks, initialBooks）
- [x] 新增 reorderBooks 功能到 useBooks hook
- [x] 全新 UI 组件：StatsBar, BookList, BookCard, CheckInModal, StatsDetail, ProgressRing, CheckInCalendar, ManagePage, BookForm
- [x] 本地构建测试通过
- [x] GitHub 仓库创建：maxymh24-code/reading-challenge-v2
- [x] Netlify 部署（已因额度用完暂停）
- [x] ProgressRing 文字被遮挡问题修复
- [x] 域名缩短：reading-v2
- [x] 每日目标功能（DailyGoal）：进度条 + 激励语
- [x] 未来阅读安排（ReadingSchedule）：中英文并行双轨
- [x] 阅读时间设置（SettingsPanel + useSettings hook）
- [x] 日历可点击查看详情（过去：打卡记录，未来：计划安排）
- [x] 五一假期（5/1-5/4）标记为周末
- [x] 安排优化：剩余 < 15 页时当天读完，不浪费一天
- [x] 迁移部署到 Vercel（Netlify 额度用完）
- [x] 书籍参数系统：difficulty（难度）、words_per_page（每页字数）
- [x] 个人阅读速度设置：zh_speed（中文字/分）、en_speed（英文词/分）
- [x] 新建 readingCalc.js 核心计算模块，集中管理所有阅读计算逻辑
- [x] 时间分配模型：按各书实际阅读速度分配每日目标（取代平均页数分配）
- [x] BookForm 增强：难度选择器 + 每页字数输入
- [x] SettingsPanel 增强：中英文阅读速度滑块 + 参考页数显示
- [x] 数据库迁移：40 本书设置 difficulty 和 words_per_page 初始值
- [x] 修复"今天读完的书"被排除出每日目标计算的 bug
- [x] 困难系数统一设为 1.0（仅靠 words_per_page 和速度决定）
- [x] 结束日期延长至 2026-09-05（138 天完成计划）

## 部署信息
- Vercel: https://reading-v2.vercel.app
- GitHub: https://github.com/maxymh24-code/reading-challenge-v2

## 当前设置
- 工作日：30 分钟/天，周末：180 分钟/天
- 中文速度：130 字/分，英文速度：150 词/分
- 结束日期：2026-09-05

## 下一步待办
- [ ] 用户体验测试和反馈
- [ ] 根据反馈调整 UI 细节
