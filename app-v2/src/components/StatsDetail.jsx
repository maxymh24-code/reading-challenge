import { useState } from 'react'
import ProgressRing from './ProgressRing'
import CheckInCalendar from './CheckInCalendar'
import ReadingSchedule from './ReadingSchedule'
import SettingsPanel from './SettingsPanel'

export default function StatsDetail({ booksHook, checkInHook, settingsHook, daysLeft, onBack }) {
  const [showSettings, setShowSettings] = useState(false)
  const { finishedCount, enFinished, zhFinished, enBooks, zhBooks } = booksHook
  const { streak, calendarData, checkIns } = checkInHook
  const { settings } = settingsHook

  const totalPages = checkIns.reduce((sum, c) => sum + c.pages_read, 0)

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--color-candy-purple)] via-[var(--color-candy-blue)] to-[var(--color-candy-cyan)] p-4 pt-[max(env(safe-area-inset-top),1rem)] text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="flex items-center gap-1 text-white/80 active:opacity-60">
              <span className="text-xl">‹</span>
              <span className="text-sm">返回</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-white/80 active:opacity-60 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 01-.517.608 7.45 7.45 0 00-.478.198.798.798 0 01-.796-.064l-.453-.324a1.875 1.875 0 00-2.416.2l-.243.243a1.875 1.875 0 00-.2 2.416l.324.453a.798.798 0 01.064.796 7.448 7.448 0 00-.198.478.798.798 0 01-.608.517l-.55.092a1.875 1.875 0 00-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 01-.064.796l-.324.453a1.875 1.875 0 00.2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 01.796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 01.517-.608 7.52 7.52 0 00.478-.198.798.798 0 01.796.064l.453.324a1.875 1.875 0 002.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 01-.064-.796c.071-.157.137-.316.198-.478a.798.798 0 01.608-.517l.55-.092a1.875 1.875 0 001.566-1.849v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 01-.608-.517 7.507 7.507 0 00-.198-.478.798.798 0 01.064-.796l.324-.453a1.875 1.875 0 00-.2-2.416l-.243-.243a1.875 1.875 0 00-2.416-.2l-.453.324a.798.798 0 01-.796.064 7.462 7.462 0 00-.478-.198.798.798 0 01-.517-.608l-.092-.55a1.875 1.875 0 00-1.849-1.566h-.344zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
              </svg>
            </button>
          </div>
          <h1 className="text-xl font-bold">阅读统计</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="🔥" value={streak} label="连续打卡" />
          <StatCard icon="📅" value={daysLeft} label="剩余天数" />
          <StatCard icon="📄" value={totalPages} label="已读页数" />
        </div>

        {/* Progress rings */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]">
          <h3 className="font-semibold text-sm mb-4">完成进度</h3>
          <div className="flex items-center justify-around">
            <ProgressRing
              value={zhFinished}
              max={zhBooks.length}
              label="中文"
              color="var(--color-candy-pink)"
            />
            <ProgressRing
              value={finishedCount}
              max={40}
              label="总计"
              color="var(--color-candy-purple)"
              size={100}
            />
            <ProgressRing
              value={enFinished}
              max={enBooks.length}
              label="英文"
              color="var(--color-candy-blue)"
            />
          </div>
        </div>

        {/* Reading status */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]">
          <h3 className="font-semibold text-sm mb-3">阅读状态</h3>
          <div className="space-y-2">
            <StatusRow label="已读完" count={finishedCount} color="bg-emerald-400" />
            <StatusRow label="阅读中" count={booksHook.books.filter(b => b.status === 'reading').length} color="bg-[var(--color-candy-blue)]" />
            <StatusRow label="未开始" count={booksHook.books.filter(b => b.status === 'not_started').length} color="bg-gray-300" />
          </div>
        </div>

        {/* Reading schedule */}
        <ReadingSchedule books={booksHook.books} daysLeft={daysLeft} settings={settings} />

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]">
          <h3 className="font-semibold text-sm mb-3">打卡日历</h3>
          <CheckInCalendar
            data={calendarData}
            checkIns={checkIns}
            books={booksHook.books}
            daysLeft={daysLeft}
            settings={settings}
            onEditCheckIn={checkInHook.editDayCheckIn}
            onUpdateProgress={booksHook.updateProgress}
          />
        </div>

        <div className="h-8" />
      </div>

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={async (updates) => {
            await settingsHook.updateSettings(updates)
            setShowSettings(false)
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-2xl p-4 text-center border border-[var(--color-border)] animate-pop-in">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-[var(--color-text-secondary)]">{label}</div>
    </div>
  )
}

function StatusRow({ label, count, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm text-[var(--color-text-secondary)] flex-1">{label}</span>
      <span className="text-sm font-semibold">{count} 本</span>
    </div>
  )
}
