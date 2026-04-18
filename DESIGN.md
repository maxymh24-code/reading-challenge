# Reading Challenge Web App 设计文档

## 1. 需求描述

### 背景
为阅读挑战（4/18 - 6/16，中英文各 20 本共 40 本）创建进度追踪 Web 应用。

### 核心需求
- 管理书单（增删改，标记是否已有）
- 每日打卡记录阅读页数
- 可视化阅读进度
- 自动生成阅读计划，新书加入后自动调整
- 多设备数据同步
- 书快读完时提醒添加新书

### 约束
- 无需登录，所有访问者共享数据
- 以移动端使用为主（手机打卡）
- 部署到 Netlify（静态托管）

## 2. 技术方案

### 架构
```
用户浏览器 (React SPA)
    ↕ Supabase JS SDK
Supabase (PostgreSQL + REST API)
```

### 前端：React 18 + Vite + TailwindCSS
- 单页应用，底部 Tab 切换（Dashboard / 书架 / 打卡）
- 移动端优先设计

### 数据库：Supabase
- 3 张表：books、check_ins、settings
- RLS 策略允许匿名读写（无需登录）
- 通过 Supabase JS SDK 直接操作

### 部署：GitHub → Netlify
- 代码推送 GitHub 后 Netlify 自动构建部署
- 环境变量存 Supabase URL 和 anon key

## 3. 数据模型

### books 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| title | text | 书名 |
| author | text | 作者 |
| language | 'en' / 'zh' | 语言 |
| total_pages | int | 总页数 |
| current_page | int | 当前读到的页数 |
| status | 'not_started' / 'reading' / 'finished' | 阅读状态（根据页数自动判断） |
| owned | boolean | 是否已有这本书 |
| finished_date | date | 读完日期 |
| sort_order | int | 排序序号 |

### check_ins 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| date | date | 打卡日期 |
| book_id | uuid | 关联书籍 |
| pages_read | int | 本次阅读页数 |

### settings 表
| 字段 | 类型 | 说明 |
|------|------|------|
| start_date | date | 挑战开始日期（默认 2026-04-18） |
| end_date | date | 挑战结束日期（默认 2026-06-16） |
| weekday_minutes | int | 工作日阅读分钟数 |
| weekend_minutes | int | 周末阅读分钟数 |

## 4. 页面与组件

### Tab 1: Dashboard
- **ProgressRing**：环形进度条，显示 X/40 本
- **中英文进度**：分别显示 X/20
- **倒计时**：距离截止日还有 X 天
- **连续打卡**：已连续 X 天
- **TodayPlan**：今日推荐阅读
- **CheckInCalendar**：打卡日历热力图
- **提醒**：已有未读完书 ≤ 2 本时黄色警告

### Tab 2: 书架
- **中文/英文 Tab 切换**
- **BookCard**：每本书一张卡片（书名、作者、进度条、有/没有标签）
- **BookForm**：添加/编辑弹窗
- **删除**：滑动删除或点击删除

### Tab 3: 打卡
- **选书**：下拉选择已有的书
- **输入页数**：输入读到第几页
- **提交打卡**
- **今日打卡记录列表**

## 5. 自动计划逻辑（planGenerator.js）

```
输入：所有 owned=true 且 status≠finished 的书
输出：未来每天推荐阅读的书

逻辑：
1. 收集可读书籍
2. 计算剩余天数
3. 按语言分组（中文/英文）
4. 工作日优先排中文（每天 30min，约 20-30 页）
5. 周末排英文（每天 2-3h）
6. 正在读的书优先排（先读完再开新书）
7. 估算每本书剩余阅读天数 = 剩余页数 / 每日页数
8. 均匀分配
```

## 6. 预置书单数据

### 英文 20 本

**已有（owned: true）— 13 本：**
1. Racing Legends: Max Verstappen (176p)
2. Racing Legends: Lewis Hamilton (176p)
3. Racing Legends: Charles Leclerc (176p)
4. How to Train Your Dragon (214p)
5. How to Ride a Dragon's Storm (288p)
6. How to Break a Dragon's Heart (320p)
7. How to Steal a Dragon's Sword (368p)
8. How to Betray a Dragon's Hero (416p)
9. How to Seize a Dragon's Jewel (416p)
10. How to Fight a Dragon's Fury (472p)
11. How To — Randall Munroe (320p)
12. What If? — Randall Munroe (336p)
13. What If? 2 — Randall Munroe (368p)

**还没有（owned: false）— 7 本：**
14. Drive to Survive (300p)
15. The Number Devil — Enzensberger (262p)
16. The Griffin Gate — Vashti Hardy (300p)
17. Eye to Eye: How Animals See the World (32p)
18. Seeds of Discovery — Lori Alexander (40p)
19. Sleuth & Solve: Science — Ana Gallo (80p)
20. Land of Roar — Jenny McLachlan (350p)

### 中文 20 本

**已有（owned: true）— 10 本：**
1. 《海底两万里》(400p)
2. 《荒野求生①》(200p)
3. 《荒野求生②》(200p)
4. 《荒野求生③》(200p)
5. 《荒野求生④》(200p)
6. 《荒野求生⑤》(200p)
7. 《神秘岛》(400p)
8. 《威斯汀游戏》(200p)
9. 《科学家故事100个》上 (433p)
10. 《科学家故事100个》下 (433p)

**还没有（owned: false）— 10 本：**
11. 《物理世界奇遇记》(270p)
12. 《从一到无穷大①》(150p)
13. 《从一到无穷大②》(150p)
14. 《从一到无穷大③》(150p)
15. 《从一到无穷大④》(150p)
16. 《从一到无穷大⑤》(150p)
17. 《如何举起一头大象》(200p)
18. 《万物简史》少儿版 (300p)
19. 《火星使命：雷斯的冒险传奇》(320p)
20. 《少年勇者：探秘野人谷》(154p)
