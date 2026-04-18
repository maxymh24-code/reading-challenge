# Reading Challenge Web App

## 项目简介
阅读挑战进度追踪 Web 应用，支持书架管理、每日打卡、进度可视化，数据通过 Supabase 云端同步。

## 技术栈
- **前端**：React 18 + Vite
- **样式**：TailwindCSS
- **数据库**：Supabase（PostgreSQL + 实时同步）
- **部署**：GitHub → Netlify（自动部署）
- **访问控制**：无需登录，所有人共享同一份数据

## 常用命令
```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
```

## 项目结构
```
app/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                           # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   └── supabase.js            # Supabase 客户端初始化
│   ├── data/
│   │   └── initialBooks.js        # 预置的 40 本书数据
│   ├── hooks/
│   │   ├── useBooks.js             # 书籍 CRUD
│   │   ├── useCheckIn.js           # 打卡逻辑
│   │   └── useSettings.js          # 设置管理
│   ├── utils/
│   │   └── planGenerator.js        # 自动生成阅读计划
│   ├── components/
│   │   ├── Layout.jsx              # 底部 Tab 导航
│   │   ├── Dashboard.jsx           # 进度总览
│   │   ├── ProgressRing.jsx        # 环形进度条
│   │   ├── TodayPlan.jsx           # 今日计划
│   │   ├── CheckInCalendar.jsx     # 打卡日历热力图
│   │   ├── BookList.jsx            # 书架列表
│   │   ├── BookCard.jsx            # 单本书卡片
│   │   ├── BookForm.jsx            # 添加/编辑书籍弹窗
│   │   ├── CheckIn.jsx             # 打卡页面
│   │   └── ProgressBar.jsx         # 页数进度条
```

## Supabase 建表 SQL

```sql
-- 书籍表
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  language text not null check (language in ('en', 'zh')),
  total_pages int not null default 0,
  current_page int not null default 0,
  status text not null default 'not_started' check (status in ('not_started', 'reading', 'finished')),
  owned boolean not null default false,
  finished_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 打卡记录表
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  book_id uuid references books(id) on delete cascade,
  pages_read int not null default 0,
  created_at timestamptz default now()
);

-- 设置表（单行）
create table settings (
  id int primary key default 1 check (id = 1),
  start_date date default '2026-04-18',
  end_date date default '2026-06-16',
  weekday_minutes int default 30,
  weekend_minutes int default 150
);

-- 初始化设置
insert into settings (id) values (1);

-- RLS 策略：允许匿名读写
alter table books enable row level security;
alter table check_ins enable row level security;
alter table settings enable row level security;

create policy "Allow all on books" on books for all using (true) with check (true);
create policy "Allow all on check_ins" on check_ins for all using (true) with check (true);
create policy "Allow all on settings" on settings for all using (true) with check (true);
```

## 核心功能
1. **书架管理**：中英文分 Tab，增删改书籍，标记有/没有
2. **阅读计划**：只有"已有"且"未读完"的书参与排期，新书加入后自动调整
3. **每日打卡**：选书 → 输入读到第几页 → 自动更新进度，页数满了自动标记完成
4. **Dashboard**：总进度环形图、中英文进度、倒计时、连续打卡、打卡日历热力图
5. **提醒**：已有且未读完的书 ≤ 2 本时提示添加新书

## UI 风格
- 移动端优先，底部 Tab 导航
- 中文界面，蓝色系主题
- 3 个 Tab：📊 Dashboard / 📚 书架 / ✅ 打卡
