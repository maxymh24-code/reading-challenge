import { isWeekend, formatMinutes, calcDailyTarget, isTodayEnded } from '../lib/readingCalc'

export { isWeekend, formatMinutes }
// Re-export for any legacy consumers
export { calcDailyPages } from '../lib/readingCalc'

export default function DailyGoal({ books, todayPages, todayCheckIns = [], daysLeft, settings, onCheckIn, onEndDay, onResumeDay }) {
  const ended = isTodayEnded(settings)
  const { dailyTarget, todayMinutes, todayIsWeekend } = calcDailyTarget(books, daysLeft, settings, todayCheckIns)

  // Today ended - show rest state
  if (ended && !(todayPages >= dailyTarget && dailyTarget > 0)) {
    return (
      <div className="mx-4 mt-3 max-w-lg sm:mx-auto">
        <div className="rounded-2xl p-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">今日已结束</span>
            <span className="text-sm font-bold">{todayPages} 页</span>
          </div>
          <div className="text-sm">未完成的部分已顺延到明天</div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onResumeDay}
              className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur text-white text-sm font-bold active:bg-white/30 transition-colors"
            >
              继续阅读
            </button>
            {onCheckIn && (
              <button
                onClick={onCheckIn}
                className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur text-white text-sm font-bold active:bg-white/30 transition-colors"
              >
                补打卡
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const pct = dailyTarget > 0 ? Math.min(100, Math.round((todayPages / dailyTarget) * 100)) : 0
  const remaining = Math.max(0, dailyTarget - todayPages)
  const exceeded = todayPages > dailyTarget
  const completed = todayPages >= dailyTarget && dailyTarget > 0

  const remainingMinutes = Math.max(0, Math.round(todayMinutes * (1 - todayPages / Math.max(dailyTarget, 1))))

  const getMessage = () => {
    if (dailyTarget === 0) return { text: '所有书都读完啦!', tone: 'gold' }
    if (todayPages === 0) return { text: `今天目标 ${dailyTarget} 页，开始阅读吧!`, tone: 'neutral' }
    if (exceeded) return { text: `超额完成 ${todayPages - dailyTarget} 页!太棒了!`, tone: 'success' }
    if (completed) return { text: '今日目标达成!继续保持!', tone: 'success' }
    if (pct >= 70) return { text: `还差 ${remaining} 页就达标了!加油!`, tone: 'warm' }
    if (pct >= 30) return { text: `已完成一半，继续加油!`, tone: 'neutral' }
    return { text: `还需读 ${remaining} 页，快翻开书吧!`, tone: 'neutral' }
  }

  const msg = getMessage()

  const toneStyles = {
    gold: 'from-amber-400 to-yellow-500',
    success: 'from-emerald-400 to-green-500',
    warm: 'from-orange-400 to-amber-500',
    neutral: 'from-[var(--color-candy-blue)] to-[var(--color-candy-cyan)]',
  }

  return (
    <div className="mx-4 mt-3 max-w-lg sm:mx-auto">
      <div className={`rounded-2xl p-4 bg-gradient-to-r ${toneStyles[msg.tone]} text-white shadow-sm animate-slide-up`}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">今日阅读</span>
          <span className="text-sm font-bold">{todayPages} / {dailyTarget} 页</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 rounded-full bg-white/30 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Time + message row */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{msg.text}</div>
          <div className="text-xs text-white/80 whitespace-nowrap ml-2">
            {completed || exceeded
              ? `${todayIsWeekend ? '周末' : '工作日'} ${formatMinutes(todayMinutes)}`
              : `还需 ${formatMinutes(remainingMinutes)}`
            }
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-3">
          {onCheckIn && (
            <button
              onClick={onCheckIn}
              className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur text-white text-sm font-bold active:bg-white/30 transition-colors"
            >
              打卡
            </button>
          )}
          {onEndDay && (
            <button
              onClick={onEndDay}
              className="py-2.5 px-4 rounded-xl bg-white/10 backdrop-blur text-white/80 text-sm font-medium active:bg-white/20 transition-colors"
            >
              结束今天
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
