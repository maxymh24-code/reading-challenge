import { useState } from 'react'
import {
  isWeekend, formatMinutes, minutesPerPage, toDateStr,
  buildTodayReadMap, getStartOfDayBooks, startOfDayRemaining,
  calcDailyTarget, getEnRatio, MIN_SCHEDULE_PAGES_ZH, isTodayEnded,
} from '../lib/readingCalc'

export default function CheckInCalendar({ data, checkIns = [], books = [], daysLeft, settings, onEditCheckIn, onUpdateProgress }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const today = new Date()
  // Current month view - default to today's month
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const startDate = new Date('2026-04-18')

  // Build today's read map for start-of-day calculations
  const todayStr = toDateStr(today)
  const todayCheckInsList = checkIns.filter(c => c.date === todayStr)
  const todayReadMap = buildTodayReadMap(todayCheckInsList)

  // Build future schedule map (date -> books planned)
  const todayEnded = isTodayEnded(settings)
  const scheduleMap = buildScheduleMap(books, daysLeft, settings, todayCheckInsList, todayEnded)

  // Determine month range: from start month to last scheduled date or end_date
  const scheduleDates = Object.keys(scheduleMap).sort()
  const lastScheduled = scheduleDates.length > 0 ? new Date(scheduleDates[scheduleDates.length - 1]) : null
  const endDate = settings?.end_date ? new Date(settings.end_date) : null
  const calendarEnd = new Date(Math.max(
    lastScheduled ? lastScheduled.getTime() : 0,
    endDate ? endDate.getTime() : 0,
    today.getTime(),
  ))

  // Generate months from start to end
  const months = []
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const endMonth = new Date(calendarEnd.getFullYear(), calendarEnd.getMonth(), 1)

  while (current <= endMonth) {
    const year = current.getFullYear()
    const month = current.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Monday-based week offset (0=Mon, 6=Sun)
    const startOffset = (firstDay.getDay() + 6) % 7

    const days = []
    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateStr = toDateStr(date)
      const pages = data[dateStr] || 0
      days.push({
        date: dateStr,
        day: d,
        pages,
        isToday: dateStr === todayStr,
        isFuture: date > today,
        hasSchedule: !!scheduleMap[dateStr],
      })
    }

    months.push({
      label: `${year === today.getFullYear() ? '' : year + '年'}${month + 1}月`,
      days,
    })

    current.setMonth(current.getMonth() + 1)
  }

  const getHeatLevel = (pages) => {
    if (pages === 0) return 0
    if (pages < 10) return 1
    if (pages < 30) return 2
    if (pages < 60) return 3
    return 4
  }

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

  // Get detail for selected date
  const getDateDetail = (dateStr) => {
    const d = new Date(dateStr)
    const isToday = dateStr === todayStr
    const isPast = dateStr < todayStr
    const dayCheckIns = checkIns.filter(c => c.date === dateStr)
    const planned = scheduleMap[dateStr] || []

    const weekDay = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
    const label = `${d.getMonth() + 1}月${d.getDate()}日 周${weekDay}`
    const weekend = isWeekend(d)
    const minutes = weekend ? settings?.weekend_minutes || 180 : settings?.weekday_minutes || 30

    let dailyTarget = 0
    let todayBookPlan = []
    if (isToday && daysLeft > 0 && settings) {
      const result = calcDailyTarget(books, daysLeft, settings, todayCheckInsList)
      dailyTarget = result.dailyTarget
      todayBookPlan = result.bookTargets
    }

    return { isPast, isToday, dayCheckIns, planned, label, minutes, weekend, dailyTarget, todayBookPlan, date: dateStr }
  }

  // Find the current month data
  const currentMonthData = months.find(m => {
    const mIdx = months.indexOf(m)
    const mDate = new Date(startDate.getFullYear(), startDate.getMonth() + mIdx, 1)
    return mDate.getFullYear() === viewYear && mDate.getMonth() === viewMonth
  })

  // Build current view month days if not in the pre-built range
  const viewDays = (() => {
    if (currentMonthData) return currentMonthData.days
    const firstDay = new Date(viewYear, viewMonth, 1)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const startOffset = (firstDay.getDay() + 6) % 7
    const days = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d)
      const dateStr = toDateStr(date)
      const pages = data[dateStr] || 0
      days.push({
        date: dateStr, day: d, pages,
        isToday: dateStr === todayStr,
        isFuture: date > today,
        hasSchedule: !!scheduleMap[dateStr],
      })
    }
    return days
  })()

  const viewLabel = `${viewYear === today.getFullYear() ? '' : viewYear + '年'}${viewMonth + 1}月`

  const goPrev = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
    setSelectedDate(null)
  }
  const goNext = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
    setSelectedDate(null)
  }
  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(null)
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={goPrev}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--color-text-secondary)]">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={goToday}
          className={`text-sm font-bold px-3 py-1 rounded-lg transition-colors ${
            isCurrentMonth ? 'text-[var(--color-candy-purple)]' : 'text-[var(--color-text-primary)] active:bg-gray-100'
          }`}
        >
          {viewLabel}
        </button>
        <button
          onClick={goNext}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--color-text-secondary)]">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-[10px] text-[var(--color-text-secondary)]">
            {d}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {viewDays.map((day, di) => {
          if (!day) {
            return <div key={di} className="aspect-square" />
          }
          return (
            <button
              key={di}
              onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
              className={`aspect-square rounded-sm transition-all flex items-center justify-center text-[10px] font-medium ${
                day.isFuture
                  ? day.hasSchedule
                    ? 'bg-blue-50 text-blue-400 active:bg-blue-100'
                    : 'bg-gray-50 text-gray-400 active:bg-gray-100'
                  : `heat-${getHeatLevel(day.pages)} ${day.pages > 0 ? 'text-white' : 'text-gray-400'} active:opacity-70`
              } ${day.isToday ? 'ring-2 ring-[var(--color-candy-purple)] ring-offset-1' : ''
              } ${selectedDate === day.date ? 'ring-2 ring-[var(--color-candy-orange)] ring-offset-1' : ''}`}
            >
              {day.day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[10px] text-[var(--color-text-secondary)]">少</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div key={level} className={`w-3 h-3 rounded-sm heat-${level}`} />
        ))}
        <span className="text-[10px] text-[var(--color-text-secondary)]">多</span>
        <div className="w-2" />
        <div className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200" />
        <span className="text-[10px] text-[var(--color-text-secondary)]">有计划</span>
      </div>

      {/* Selected date detail */}
      {selectedDate && (
        <DateDetail
          detail={getDateDetail(selectedDate)}
          books={books}
          totalPages={data[selectedDate] || 0}
          onEditCheckIn={onEditCheckIn}
          onUpdateProgress={onUpdateProgress}
        />
      )}
    </div>
  )
}

// Merge check-ins by book: [{bookId, title, language, pages}]
function mergeCheckIns(dayCheckIns, books) {
  const map = {}
  for (const c of dayCheckIns) {
    if (!map[c.book_id]) {
      const book = books.find(b => b.id === c.book_id)
      map[c.book_id] = { bookId: c.book_id, title: book?.title || '未知书籍', language: book?.language, pages: 0 }
    }
    map[c.book_id].pages += c.pages_read
  }
  return Object.values(map)
}

function DateDetail({ detail, books, totalPages, onEditCheckIn, onUpdateProgress }) {
  const { isPast, isToday, dayCheckIns, planned, label, minutes, weekend, dailyTarget, todayBookPlan, date } = detail
  const todayRemaining = Math.max(0, dailyTarget - totalPages)
  const merged = mergeCheckIns(dayCheckIns, books)

  return (
    <div className="mt-3 p-3 rounded-xl bg-gray-50 animate-slide-up">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}{isToday ? ' (今天)' : ''}</span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {weekend ? '周末' : '工作日'} · {formatMinutes(minutes)}
        </span>
      </div>

      {isToday ? (
        <div className="space-y-2">
          {dailyTarget > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold">已读 {totalPages} 页 / 目标 {dailyTarget} 页</span>
                <span className={totalPages >= dailyTarget ? 'text-emerald-500 font-bold' : 'text-[var(--color-text-secondary)]'}>
                  {totalPages >= dailyTarget ? '已达标!' : `还差 ${todayRemaining} 页`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${totalPages >= dailyTarget ? 'bg-emerald-400' : 'bg-[var(--color-candy-purple)]'}`}
                  style={{ width: `${Math.min(100, Math.round(totalPages / dailyTarget * 100))}%` }}
                />
              </div>
            </div>
          )}
          {todayBookPlan.length > 0 && (
            <div>
              <div className="text-[10px] text-[var(--color-text-secondary)] font-semibold mb-1">今日计划</div>
              <div className="space-y-1.5">
                {todayBookPlan.map((p, i) => {
                  const readToday = merged.find(m => m.bookId === p.bookId)?.pages || 0
                  const remaining = Math.max(0, p.pages - readToday)
                  const done = readToday >= p.pages

                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        p.language === 'zh' ? 'bg-pink-400' : 'bg-blue-400'
                      }`} />
                      <span className="flex-1 truncate">{p.title}</span>
                      <span className={done ? 'font-medium text-emerald-500' : 'text-[var(--color-text-secondary)]'}>
                        {done ? `✓ ${readToday}页` : `${readToday}/${p.pages}页 差${remaining}页`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {/* Show check-ins for books NOT in plan */}
          {(() => {
            const planBookIds = new Set(todayBookPlan.map(p => p.bookId))
            const extraMerged = merged.filter(m => !planBookIds.has(m.bookId))
            if (extraMerged.length === 0) return null
            return (
              <div>
                <div className="text-[10px] text-[var(--color-text-secondary)] font-semibold mb-1">额外阅读</div>
                <div className="space-y-1">
                  {extraMerged.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="flex-1 truncate">{m.title}</span>
                      <span className="font-medium text-emerald-600">+{m.pages} 页</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
          {todayBookPlan.length === 0 && dayCheckIns.length === 0 && (
            <div className="text-xs text-[var(--color-text-secondary)]">暂无安排</div>
          )}
        </div>
      ) : isPast ? (
        merged.length > 0 ? (
          <PastDateEditor
            merged={merged}
            date={date}
            totalPages={totalPages}
            books={books}
            onEditCheckIn={onEditCheckIn}
            onUpdateProgress={onUpdateProgress}
          />
        ) : (
          <div className="text-xs text-[var(--color-text-secondary)]">当天无打卡记录</div>
        )
      ) : (
        planned.length > 0 ? (
          <div className="space-y-1.5">
            {planned.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  p.language === 'zh' ? 'bg-pink-400' : 'bg-blue-400'
                }`} />
                <span className="flex-1 truncate">{p.title}</span>
                <span className="text-[var(--color-text-secondary)]">~{p.pages} 页</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[var(--color-text-secondary)]">暂无安排</div>
        )
      )}
    </div>
  )
}

function PastDateEditor({ merged, date, totalPages, books, onEditCheckIn, onUpdateProgress }) {
  const [editingBookId, setEditingBookId] = useState(null)
  const [editPages, setEditPages] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleEdit = (m) => {
    setEditingBookId(m.bookId)
    setEditPages(m.pages)
  }

  const handleSave = async () => {
    if (!onEditCheckIn || !onUpdateProgress) return
    setSaving(true)
    const diff = await onEditCheckIn(editingBookId, date, editPages)
    if (diff !== 0) {
      const book = books.find(b => b.id === editingBookId)
      if (book) {
        await onUpdateProgress(editingBookId, Math.max(0, book.current_page + diff))
      }
    }
    setEditingBookId(null)
    setSaving(false)
  }

  const handleDelete = async (m) => {
    if (!onEditCheckIn || !onUpdateProgress) return
    setSaving(true)
    const diff = await onEditCheckIn(m.bookId, date, 0)
    if (diff !== 0) {
      const book = books.find(b => b.id === m.bookId)
      if (book) {
        await onUpdateProgress(m.bookId, Math.max(0, book.current_page + diff))
      }
    }
    setSaving(false)
  }

  return (
    <div className="space-y-1.5">
      {merged.map((m, i) => (
        <div key={i}>
          {editingBookId === m.bookId ? (
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                m.language === 'zh' ? 'bg-pink-400' : 'bg-blue-400'
              }`} />
              <span className="flex-1 truncate text-[11px]">{m.title}</span>
              <input
                type="number"
                value={editPages}
                onChange={e => setEditPages(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 px-1.5 py-0.5 rounded bg-white border border-gray-300 text-xs text-center"
                autoFocus
              />
              <span className="text-[var(--color-text-secondary)]">页</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-emerald-500 font-bold"
              >
                {saving ? '...' : '✓'}
              </button>
              <button
                onClick={() => setEditingBookId(null)}
                className="text-gray-400"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs group">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                m.language === 'zh' ? 'bg-pink-400' : 'bg-blue-400'
              }`} />
              <span className="flex-1 truncate">{m.title}</span>
              <span className="font-medium text-emerald-600">+{m.pages} 页</span>
              <button
                onClick={() => handleEdit(m)}
                className="text-gray-300 active:text-gray-600 ml-1"
                title="编辑"
              >
                ✎
              </button>
              <button
                onClick={() => handleDelete(m)}
                disabled={saving}
                className="text-gray-300 active:text-red-500"
                title="删除"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ))}
      {merged.length > 1 && (
        <div className="text-xs text-[var(--color-text-secondary)] pt-1 border-t border-gray-200">
          合计 {totalPages} 页
        </div>
      )}
    </div>
  )
}

// Build a map of date -> [{ title, pages, language }] for future days
function buildScheduleMap(books, daysLeft, settings, todayCheckIns = [], todayEnded = false) {
  if (!daysLeft || !settings) return {}

  const wdMin = settings.weekday_minutes || 30
  const weMin = settings.weekend_minutes || 180

  const todayReadMap = buildTodayReadMap(todayCheckIns)

  const zhBooks = books
    .filter(b => b.language === 'zh' && b.owned && (b.status !== 'finished' || todayReadMap[b.id]))
    .filter(b => startOfDayRemaining(b, todayReadMap) >= MIN_SCHEDULE_PAGES_ZH)
    .sort((a, b) => a.sort_order - b.sort_order)
  const enBooks = books
    .filter(b => b.language === 'en' && b.owned && (b.status !== 'finished' || todayReadMap[b.id]))
    .sort((a, b) => a.sort_order - b.sort_order)

  const zhMinutes = zhBooks.reduce((s, b) => {
    const rem = b.total_pages - b.current_page
    return s + rem * minutesPerPage(b, settings)
  }, 0)
  const enMinutes = enBooks.reduce((s, b) => {
    const rem = b.total_pages - b.current_page
    return s + rem * minutesPerPage(b, settings)
  }, 0)
  const totalMinutes = zhMinutes + enMinutes

  if (totalMinutes <= 0) return {}

  const enRatio = getEnRatio(settings, enMinutes, zhMinutes)
  const zhRatio = 1 - enRatio
  const hasCustomRatio = settings.en_time_ratio != null && settings.en_time_ratio > 0

  const map = {}
  const today = new Date()
  const MERGE_THRESHOLD = 15
  const SPILL_THRESHOLD = 10 // minutes: don't start next book if less than this remains

  const addTrack = (trackBooks, wdMinTrack, weMinTrack) => {
    if (wdMinTrack <= 0 && weMinTrack <= 0) return
    const queue = trackBooks
      .filter(b => (b.total_pages - b.current_page) > 0)
      .map(b => ({
        ...b,
        remaining: b.total_pages - b.current_page,
        mpp: minutesPerPage(b, settings),
      }))

    let bookIdx = 0
    let day = todayEnded ? 1 : 0 // Skip today if ended

    while (bookIdx < queue.length && day < 500) {
      const date = new Date(today)
      date.setDate(date.getDate() + day)
      const dateStr = toDateStr(date)
      const dailyMinutes = isWeekend(date) ? weMinTrack : wdMinTrack
      const book = queue[bookIdx]
      const dailyPages = dailyMinutes > 0 ? Math.floor(dailyMinutes / book.mpp) : 0

      if (dailyPages <= 0) { day++; continue }

      if (!map[dateStr]) map[dateStr] = []

      if (book.remaining <= dailyPages || (book.remaining - dailyPages > 0 && book.remaining - dailyPages < MERGE_THRESHOLD)) {
        const actualRead = book.remaining
        map[dateStr].push({ title: book.title, pages: actualRead, language: book.language })
        const leftoverMinutes = (dailyPages - actualRead) * book.mpp
        book.remaining = 0
        bookIdx++

        if (leftoverMinutes >= SPILL_THRESHOLD && bookIdx < queue.length) {
          const nextBook = queue[bookIdx]
          const nextPages = Math.min(Math.floor(leftoverMinutes / nextBook.mpp), nextBook.remaining)
          if (nextPages > 0) {
            nextBook.remaining -= nextPages
            map[dateStr].push({ title: nextBook.title, pages: nextPages, language: nextBook.language })
          }
          if (nextBook.remaining <= 0) bookIdx++
        }
      } else {
        book.remaining -= dailyPages
        map[dateStr].push({ title: book.title, pages: dailyPages, language: book.language })
      }

      day++
    }
  }

  // When custom ratio: weekday = English only, weekend = use ratio
  const zhWd = hasCustomRatio ? 0 : wdMin * zhRatio
  const zhWe = weMin * zhRatio
  const enWd = hasCustomRatio ? wdMin : wdMin * enRatio
  const enWe = weMin * enRatio

  addTrack(zhBooks, zhWd, zhWe)
  addTrack(enBooks, enWd, enWe)

  return map
}
