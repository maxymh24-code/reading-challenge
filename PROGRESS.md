# Web App 开发进度

## 当前状态：前端完成，待配置 Supabase 🟡

## 已完成
- [x] 设计方案确认（技术栈、数据模型、功能列表、UI 结构）
- [x] 用 Vite 创建 React 项目骨架
- [x] 创建项目文档（CLAUDE.md、DESIGN.md、PROGRESS.md）
- [x] 安装所有依赖（react, vite, tailwindcss, @supabase/supabase-js）
- [x] 配置 vite.config.js（含 @tailwindcss/vite 插件）
- [x] 配置 index.html（中文 lang, emoji favicon, mobile viewport）
- [x] 配置 index.css（tailwind import + 移动端基础样式 + 弹窗动画）
- [x] 创建 .env（Supabase 占位值）
- [x] src/lib/supabase.js — Supabase 客户端初始化
- [x] src/data/initialBooks.js — 40 本书预置数据
- [x] src/hooks/useBooks.js — 书籍 CRUD + 自动初始化 + 进度管理
- [x] src/hooks/useCheckIn.js — 打卡 CRUD + 连续天数 + 日历数据
- [x] src/App.jsx — 主应用 + Tab 导航
- [x] src/components/Dashboard.jsx — 进度总览页面
- [x] src/components/ProgressRing.jsx — 环形进度条
- [x] src/components/ProgressBar.jsx — 线性进度条
- [x] src/components/TodayPlan.jsx — 今日计划卡片
- [x] src/components/CheckInCalendar.jsx — GitHub 风格打卡热力图
- [x] src/components/BookList.jsx — 书架列表（中英文 Tab）
- [x] src/components/BookCard.jsx — 书籍卡片（进度+状态+操作）
- [x] src/components/BookForm.jsx — 添加/编辑书籍弹窗（支持修改页数）
- [x] src/components/CheckIn.jsx — 每日打卡页面
- [x] `npm run build` 构建成功
- [x] `npm run dev` 开发服务器正常启动

## 待完成

### Supabase 配置（需要用户操作）
- [ ] 创建 Supabase 项目
- [ ] 运行建表 SQL（见 CLAUDE.md）
- [ ] 将 URL 和 anon key 写入 .env
- [ ] 测试数据同步

### 部署
- [ ] 初始化 Git 仓库
- [ ] 推送 GitHub
- [ ] 配置 Netlify（环境变量 + 自动部署）

## Supabase 设置步骤（用户操作）
1. 打开 https://supabase.com 登录/注册
2. 创建新项目（名称：reading-challenge）
3. 进入 SQL Editor，运行 CLAUDE.md 中的建表 SQL
4. 进入 Settings → API，复制 Project URL 和 anon public key
5. 将这两个值写入 app/.env 文件
