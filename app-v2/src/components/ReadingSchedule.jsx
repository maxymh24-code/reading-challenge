import { isWeekend, formatMinutes, minutesPerPage, getEnRatio, MIN_SCHEDULE_PAGES_ZH, isTodayEnded } from '../lib/readingCalc'

export default function ReadingSchedule({ books, daysLeft, settings }) {
  const wdMin = settings.weekday_minutes || 30
  const weMin = settings.weekend_minutes || 180

  const unfinishedZh = books
    .filter(b => b.language === 'zh' && b.owned && b.status !== 'finished')
    .filter(b => (b.total_pages - b.current_page) >= MIN_SCHEDULE_PAGES_ZH)
    .sort((a, b) => a.sort_order - b.sort_order)
  const unfinishedEn = books
    .filter(b => b.language === 'en' && b.owned && b.status !== 'finished')
    .sort((a, b) => a.sort_order - b.sort_order)

  // Calculate total minutes needed for each language
  const zhMinutes = unfinishedZh.reduce((s, b) => s + (b.total_pages - b.current_page) * minutesPerPage(b, settings), 0)
  const enMinutes = unfinishedEn.reduce((s, b) => s + (b.total_pages - b.current_page) * minutesPerPage(b, settings), 0)
  const totalMinutes = zhMinutes + enMinutes

  if (totalMinutes <= 0) return null

  // Use configurable ratio
  const enRatio = getEnRatio(settings, enMinutes, zhMinutes)
  const zhRatio = 1 - enRatio
  const hasCustomRatio = settings.en_time_ratio != null && settings.en_time_ratio > 0

  // When custom ratio: weekday = English only, weekend = use ratio
  const zhWd = hasCustomRatio ? 0 : wdMin * zhRatio
  const zhWe = weMin * zhRatio
  const enWd = hasCustomRatio ? wdMin : wdMin * enRatio
  const enWe = weMin * enRatio

  const todayEnded = isTodayEnded(settings)
  const zhSchedule = buildTrack(unfinishedZh, zhWd, zhWe, settings, todayEnded)
  const enSchedule = buildTrack(unfinishedEn, enWd, enWe, settings, todayEnded)

  const allEnd = [
    ...zhSchedule.map(s => s.endDate),
    ...enSchedule.map(s => s.endDate),
  ].sort((a, b) => b - a)
  const lastDate = allEnd[0]

  // Display info - use actual track minutes
  const zhWdPages = unfinishedZh.length > 0 && zhWd > 0 ? Math.round(zhWd / minutesPerPage(unfinishedZh[0], settings)) : 0
  const enWdPages = unfinishedEn.length > 0 && enWd > 0 ? Math.round(enWd / minutesPerPage(unfinishedEn[0], settings)) : 0
  const zhWePages = unfinishedZh.length > 0 && zhWe > 0 ? Math.round(zhWe / minutesPerPage(unfinishedZh[0], settings)) : 0
  const enWePages = unfinishedEn.length > 0 && enWe > 0 ? Math.round(enWe / minutesPerPage(unfinishedEn[0], settings)) : 0

  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-sm">未来安排</h3>
      </div>
      <div className="text-xs text-[var(--color-text-secondary)] mb-4">
        {hasCustomRatio
          ? zhWePages > 0
            ? `工作日 英${enWdPages}页(${wdMin}分) · 周末 英${enWePages}+中${zhWePages}页(${formatMinutes(weMin)})`
            : `每天 英文${enWdPages}页(${wdMin}分) · 周末 英文${enWePages}页(${formatMinutes(weMin)})`
          : `工作日 中${zhWdPages}+英${enWdPages}页 · 周末 中${zhWePages}+英${enWePages}页`
        }
      </div>

      {/* Layout: single column if pure English, two columns otherwise */}
      {zhSchedule.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          <TrackColumn label="中文" schedule={zhSchedule} colorStart={0} />
          <TrackColumn label="英文" schedule={enSchedule} colorStart={4} />
        </div>
      ) : (
        <TrackColumn label="英文" schedule={enSchedule} colorStart={4} />
      )}

      {lastDate && (
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-center">
          <span className="text-xs text-[var(--color-text-secondary)]">
            预计 {formatDate(lastDate)} 全部读完
          </span>
        </div>
      )}
    </div>
  )
}

const COLORS = [
  'var(--color-candy-pink)',
  'var(--color-candy-purple)',
  'var(--color-candy-blue)',
  'var(--color-candy-cyan)',
  'var(--color-candy-green)',
  'var(--color-candy-yellow)',
  'var(--color-candy-orange)',
  'var(--color-candy-red)',
]

function TrackColumn({ label, schedule, colorStart }) {
  if (schedule.length === 0) {
    return (
      <div>
        <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">{label}</div>
        <div className="text-xs text-[var(--color-text-secondary)]">全部读完!</div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">{label}</div>
      <div className="space-y-2">
        {schedule.map((item, i) => {
          const color = COLORS[(colorStart + i) % COLORS.length]
          const remainPages = item.totalPages - item.startPage

          return (
            <div key={item.id} className="animate-slide-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: color }}>
                  {i + 1}
                </div>
                <div className="text-xs font-medium truncate">{item.title}</div>
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)] pl-[26px]">
                {remainPages}页 · {formatDate(item.startDate)}→{formatDate(item.endDate)} · {item.days}天
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MERGE_THRESHOLD = 15 // pages
const SPILL_THRESHOLD = 10 // minutes: don't start next book if less than this remains

// Simulate day by day - each book has its own reading speed
function buildTrack(books, weekdayMinutes, weekendMinutes, settings, todayEnded = false) {
  if ((weekdayMinutes <= 0 && weekendMinutes <= 0) || books.length === 0) return []

  const today = new Date()
  const queue = books
    .filter(b => (b.total_pages - b.current_page) > 0)
    .map(b => ({
      ...b,
      remaining: b.total_pages - b.current_page,
      mpp: minutesPerPage(b, settings),
    }))

  if (queue.length === 0) return []

  const schedule = []
  let bookIdx = 0
  let day = todayEnded ? 1 : 0 // Skip today if ended
  let startDay = day

  while (bookIdx < queue.length && day < 300) {
    const book = queue[bookIdx]
    const date = new Date(today)
    date.setDate(date.getDate() + day)
    const dailyMinutes = isWeekend(date) ? weekendMinutes : weekdayMinutes
    // Convert today's available minutes to pages for this specific book
    const dailyPages = dailyMinutes > 0 ? Math.floor(dailyMinutes / book.mpp) : 0

    if (dailyPages <= 0) { day++; continue }

    if (!book._started) {
      book._started = true
      startDay = day
    }

    if (book.remaining <= dailyPages || (book.remaining - dailyPages > 0 && book.remaining - dailyPages < MERGE_THRESHOLD)) {
      const leftoverMinutes = (dailyPages - book.remaining) * book.mpp
      book.remaining = 0

      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + day)
      const sDate = new Date(today)
      sDate.setDate(sDate.getDate() + startDay)
      const days = day - startDay + 1

      schedule.push({
        id: book.id, title: book.title, language: book.language,
        totalPages: book.total_pages, startPage: book.current_page,
        startDate: sDate, endDate, days,
      })

      bookIdx++

      // Give leftover time to next book (only if enough time remains)
      if (leftoverMinutes >= SPILL_THRESHOLD && bookIdx < queue.length) {
        const nextBook = queue[bookIdx]
        nextBook._started = true
        startDay = day
        const leftoverPages = Math.floor(leftoverMinutes / nextBook.mpp)
        nextBook.remaining -= Math.min(leftoverPages, nextBook.remaining)
        if (nextBook.remaining <= 0) bookIdx++
      }

      day++
    } else {
      book.remaining -= dailyPages
      day++
    }
  }

  return schedule
}

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}
