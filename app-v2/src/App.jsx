import { useState } from 'react'
import { useBooks } from './hooks/useBooks'
import { useCheckIn } from './hooks/useCheckIn'
import { useSettings } from './hooks/useSettings'
import { toDateStr } from './lib/readingCalc'
import StatsBar from './components/StatsBar'
import DailyGoal from './components/DailyGoal'
import BookList from './components/BookList'
import CheckInModal from './components/CheckInModal'
import StatsDetail from './components/StatsDetail'
import ManagePage from './components/ManagePage'
import QuickCheckIn from './components/QuickCheckIn'

const TABS = [
  { key: 'zh', label: '中文书', emoji: '📚' },
  { key: 'en', label: '英文书', emoji: '📖' },
]

export default function App() {
  const [tab, setTab] = useState('en')
  const [page, setPage] = useState('home') // home | stats | manage
  const [checkInBook, setCheckInBook] = useState(null)
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false)

  const booksHook = useBooks()
  const checkInHook = useCheckIn()
  const settingsHook = useSettings()

  const { enBooks, zhBooks, finishedCount, loading } = booksHook
  const { streak, calendarData, todayCheckIns } = checkInHook
  const todayPages = todayCheckIns.reduce((sum, c) => sum + c.pages_read, 0)
  const { settings } = settingsHook

  const currentBooks = tab === 'zh' ? zhBooks : enBooks

  const endDate = new Date(settings.end_date)
  const today = new Date()
  const daysLeft = Math.max(0, Math.ceil((endDate - today) / 86400000))

  if (loading || settingsHook.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="text-center animate-bounce-soft">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-lg text-[var(--color-text-secondary)]">加载中...</div>
        </div>
      </div>
    )
  }

  if (page === 'stats') {
    return (
      <StatsDetail
        booksHook={booksHook}
        checkInHook={checkInHook}
        settingsHook={settingsHook}
        daysLeft={daysLeft}
        onBack={() => setPage('home')}
      />
    )
  }

  if (page === 'manage') {
    return (
      <ManagePage
        booksHook={booksHook}
        language={tab}
        onBack={() => setPage('home')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Top stats bar */}
      <StatsBar
        streak={streak}
        daysLeft={daysLeft}
        finishedCount={finishedCount}
        total={40}
        onTap={() => setPage('stats')}
      />

      {/* Daily goal */}
      <DailyGoal
        books={booksHook.books}
        todayPages={todayPages}
        todayCheckIns={todayCheckIns}
        daysLeft={daysLeft}
        settings={settings}
        onCheckIn={() => setShowQuickCheckIn(true)}
        onEndDay={settingsHook.endDay}
        onResumeDay={settingsHook.resumeDay}
      />

      {/* Book list */}
      <div className="flex-1 overflow-y-auto pb-20">
        <BookList
          books={currentBooks}
          onBookTap={setCheckInBook}
          onManage={() => setPage('manage')}
        />
      </div>

      {/* Bottom tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[var(--color-border)] pb-safe z-40">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center py-2.5 transition-all ${
                tab === t.key
                  ? 'text-[var(--color-candy-purple)] scale-105'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs font-semibold mt-0.5">{t.label}</span>
              {tab === t.key && (
                <div className="w-6 h-1 rounded-full bg-[var(--color-candy-purple)] mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Check-in modal */}
      {checkInBook && (
        <CheckInModal
          book={checkInBook}
          onClose={() => setCheckInBook(null)}
          onCheckIn={async (bookId, newPage) => {
            const book = booksHook.books.find(b => b.id === bookId)
            if (!book) return
            const pagesRead = newPage - book.current_page
            if (pagesRead > 0) {
              await checkInHook.addCheckIn(bookId, pagesRead)
            } else if (pagesRead < 0) {
              const today = toDateStr(new Date())
              const todayBook = checkInHook.todayCheckIns.filter(c => c.book_id === bookId)
              const todayTotal = todayBook.reduce((s, c) => s + c.pages_read, 0)
              if (todayTotal > 0) {
                await checkInHook.editDayCheckIn(bookId, today, Math.max(0, todayTotal + pagesRead))
              }
            }
            await booksHook.updateProgress(bookId, newPage)
            setCheckInBook(null)
          }}
        />
      )}

      {/* Quick check-in modal */}
      {showQuickCheckIn && (
        <QuickCheckIn
          zhBooks={zhBooks}
          enBooks={enBooks}
          onClose={() => setShowQuickCheckIn(false)}
          onSubmit={async ({ zh, en }) => {
            const today = toDateStr(new Date())
            for (const item of [zh, en]) {
              if (!item) continue
              if (item.pages > 0) {
                await checkInHook.addCheckIn(item.bookId, item.pages)
              } else if (item.pages < 0) {
                const todayBook = checkInHook.todayCheckIns.filter(c => c.book_id === item.bookId)
                const todayTotal = todayBook.reduce((s, c) => s + c.pages_read, 0)
                if (todayTotal > 0) {
                  await checkInHook.editDayCheckIn(item.bookId, today, Math.max(0, todayTotal + item.pages))
                }
              }
              await booksHook.updateProgress(item.bookId, item.newPage)
            }
            setShowQuickCheckIn(false)
          }}
        />
      )}
    </div>
  )
}
