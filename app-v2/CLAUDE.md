# Reading Challenge App v2

## 项目简介
全新阅读挑战进度追踪 Web 应用，Duolingo 风格，色彩丰富活泼，每本书直接显示进度条，打卡零摩擦。

## 技术栈
- React 18 + Vite + TailwindCSS v4
- Supabase（复用现有数据库 `oonbmuhvcvldssaeones`）
- Vercel 部署（原 Netlify 额度用完已迁移）

## 常用命令
```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
```

## 项目结构
```
app-v2/
├── index.html
├── package.json
├── vite.config.js
├── .env
├── src/
│   ├── main.jsx
│   ├── App.jsx                    # 主应用 + 路由
│   ├── index.css                  # 全局样式 + 动画
│   ├── lib/supabase.js
│   ├── data/initialBooks.js
│   ├── hooks/
│   │   ├── useBooks.js
│   │   └── useCheckIn.js
│   └── components/
│       ├── StatsBar.jsx           # 顶部统计栏
│       ├── BookList.jsx           # 书籍列表
│       ├── BookCard.jsx           # 单本书卡片+进度条
│       ├── CheckInModal.jsx       # 打卡弹窗
│       ├── StatsDetail.jsx        # 统计详情页
│       ├── ProgressRing.jsx       # 环形进度条
│       ├── CheckInCalendar.jsx    # 打卡日历热力图
│       ├── DailyGoal.jsx          # 每日目标 + isWeekend/formatMinutes
│       ├── ReadingSchedule.jsx    # 未来阅读安排（中英文并行）
│       ├── SettingsPanel.jsx      # 阅读时间设置
│       ├── ManagePage.jsx         # 书籍管理页
│       └── BookForm.jsx           # 添加/编辑书籍弹窗
```

## 部署信息
- GitHub: https://github.com/maxymh24-code/reading-challenge-v2
- Vercel: https://reading-v2.vercel.app
- 原 Netlify 站点（已暂停）：https://reading-v2.netlify.app
