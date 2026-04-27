// Reading calculation engine
// All reading speed/target calculations centralized here

// Timezone-safe date string (YYYY-MM-DD in local time)
export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Check if today has been "ended" by user
export function isTodayEnded(settings) {
  return settings?.ended_date === toDateStr(new Date())
}

// Holidays that count as weekend (extra reading time)
const HOLIDAYS = [
  '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04',
]

export function isWeekend(date) {
  const day = date.getDay()
  if (day === 0 || day === 6) return true
  const dateStr = toDateStr(date)
  return HOLIDAYS.includes(dateStr)
}

export function formatMinutes(min) {
  if (min < 60) return `${min} 分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`
}

// Difficulty factor: currently all set to 1 (speed determined by words_per_page + reading speed only)
const DIFFICULTY_FACTOR = { 1: 1.0, 2: 1.0, 3: 1.0 }
const DEFAULT_WORDS_PER_PAGE = { zh: 250, en: 200 }

// Chinese books with fewer than this many pages remaining are not scheduled
export const MIN_SCHEDULE_PAGES_ZH = 10

// Calculate minutes needed to read one page of a specific book
export function minutesPerPage(book, settings) {
  const speed = book.language === 'zh'
    ? (settings.zh_speed || 250)
    : (settings.en_speed || 150)
  const wordsPerPage = book.words_per_page || DEFAULT_WORDS_PER_PAGE[book.language] || 250
  const factor = DIFFICULTY_FACTOR[book.difficulty || 2] || 1.0
  return (wordsPerPage / speed) * factor
}

// Convert reading speed to "pages per 30 minutes" for display
export function pagesPerHalfHour(book, settings) {
  const mpp = minutesPerPage(book, settings)
  return mpp > 0 ? Math.round(30 / mpp) : 0
}

// Build today's read map from check-ins
export function buildTodayReadMap(todayCheckIns) {
  const map = {}
  for (const c of todayCheckIns) {
    map[c.book_id] = (map[c.book_id] || 0) + c.pages_read
  }
  return map
}

// Get books that were active at start of day (unfinished + finished today)
export function getStartOfDayBooks(books, todayReadMap) {
  return books.filter(b => b.owned && (b.status !== 'finished' || todayReadMap[b.id]))
}

// Calculate start-of-day remaining pages for a book
export function startOfDayRemaining(book, todayReadMap) {
  return (book.total_pages - book.current_page) + (todayReadMap[book.id] || 0)
}

// Count weekday/weekend days in the remaining period
export function countDayTypes(daysLeft) {
  const today = new Date()
  let weekdayCount = 0, weekendCount = 0
  for (let i = 0; i < daysLeft; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    if (isWeekend(d)) weekendCount++
    else weekdayCount++
  }
  return { weekdayCount, weekendCount }
}

// Get the effective English time ratio
// If en_time_ratio is set (> 0), use it; otherwise auto-proportional based on remaining time
export function getEnRatio(settings, enMinutes, zhMinutes) {
  const total = enMinutes + zhMinutes
  if (settings.en_time_ratio != null && settings.en_time_ratio > 0) {
    // If one language has no remaining books, give all time to the other
    if (enMinutes <= 0) return 0
    if (zhMinutes <= 0) return 1
    return settings.en_time_ratio
  }
  // Auto: proportional to remaining time
  return total > 0 ? enMinutes / total : 0.5
}

// Core: calculate daily target using time-based model
// Returns { dailyTarget, bookTargets, totalMinutesNeeded, totalAvailableMinutes }
export function calcDailyTarget(books, daysLeft, settings, todayCheckIns = []) {
  if (daysLeft <= 0) return { dailyTarget: 0, bookTargets: [], totalMinutesNeeded: 0, totalAvailableMinutes: 0 }

  const todayReadMap = buildTodayReadMap(todayCheckIns)
  const activeBooks = getStartOfDayBooks(books, todayReadMap)

  // Calculate per-book minutes needed
  const bookInfos = activeBooks.map(b => {
    const remaining = startOfDayRemaining(b, todayReadMap)
    const mpp = minutesPerPage(b, settings)
    return { book: b, remaining, mpp, totalMinutes: remaining * mpp }
  }).filter(bi => bi.remaining > 0)
    // Skip Chinese books with very few pages remaining
    .filter(bi => bi.book.language !== 'zh' || bi.remaining >= MIN_SCHEDULE_PAGES_ZH)

  const totalMinutesNeeded = bookInfos.reduce((s, bi) => s + bi.totalMinutes, 0)

  // Group by language
  const enInfos = bookInfos.filter(bi => bi.book.language === 'en')
  const zhInfos = bookInfos.filter(bi => bi.book.language === 'zh')
  const enMinutes = enInfos.reduce((s, bi) => s + bi.totalMinutes, 0)
  const zhMinutes = zhInfos.reduce((s, bi) => s + bi.totalMinutes, 0)

  // Available time
  const { weekdayCount, weekendCount } = countDayTypes(daysLeft)
  const wdMin = settings.weekday_minutes || 30
  const weMin = settings.weekend_minutes || 180
  const totalAvailableMinutes = weekdayCount * wdMin + weekendCount * weMin

  // Today's available minutes
  const today = new Date()
  const todayIsWeekend = isWeekend(today)
  const todayMinutes = todayIsWeekend ? weMin : wdMin

  // Split today's time by language ratio
  const enRatio = getEnRatio(settings, enMinutes, zhMinutes)
  const hasCustomRatio = settings.en_time_ratio != null && settings.en_time_ratio > 0

  // When custom ratio is set: weekday = English only, weekend = use ratio
  let enTodayMinutes, zhTodayMinutes
  if (hasCustomRatio && !todayIsWeekend) {
    enTodayMinutes = todayMinutes
    zhTodayMinutes = 0
  } else {
    enTodayMinutes = todayMinutes * enRatio
    zhTodayMinutes = todayMinutes * (1 - enRatio)
  }

  // Sequential allocation: read current book in order, spill to next if finished
  const bookTargets = []
  let dailyTarget = 0

  const SPILL_THRESHOLD = 10 // minutes: don't start next book if less than this remains

  const allocateSequential = (infos, availableMinutes) => {
    if (availableMinutes <= 0 || infos.length === 0) return
    const sorted = [...infos].sort((a, b) => a.book.sort_order - b.book.sort_order)
    let remaining = availableMinutes

    for (const bi of sorted) {
      if (remaining <= 0) break
      const pages = Math.min(Math.ceil(remaining / bi.mpp), bi.remaining)
      const minutesUsed = pages * bi.mpp
      remaining -= minutesUsed
      bookTargets.push({
        bookId: bi.book.id,
        title: bi.book.title,
        language: bi.book.language,
        pages,
        minutesPerPage: bi.mpp,
      })
      dailyTarget += pages
      // Only spill to next book if this one finishes today AND enough time remains
      if (pages < bi.remaining || remaining < SPILL_THRESHOLD) break
    }
  }

  allocateSequential(enInfos, enTodayMinutes)
  allocateSequential(zhInfos, zhTodayMinutes)

  return {
    dailyTarget,
    bookTargets,
    totalMinutesNeeded: Math.round(totalMinutesNeeded),
    totalAvailableMinutes,
    todayMinutes,
    todayIsWeekend,
    enRatio,
  }
}

// Legacy wrapper for ReadingSchedule compatibility
export function calcDailyPages(totalMinutesNeeded, daysLeft, weekdayMin, weekendMin) {
  if (daysLeft <= 0 || totalMinutesNeeded <= 0) return { weekdayPages: 0, weekendPages: 0 }
  const { weekdayCount, weekendCount } = countDayTypes(daysLeft)
  const totalAvailable = weekdayCount * weekdayMin + weekendCount * weekendMin
  if (totalAvailable <= 0) return { weekdayPages: 0, weekendPages: 0 }
  // This returns total minutes allocated per day type, not pages
  // Consumers must convert to pages using their own minutesPerPage
  const ratio = totalMinutesNeeded / totalAvailable
  return {
    weekdayMinutes: weekdayMin,
    weekendMinutes: weekendMin,
    weekdayPages: Math.ceil(ratio * weekdayMin),  // minutes worth of reading
    weekendPages: Math.ceil(ratio * weekendMin),
  }
}
