import { useState } from 'react'

export default function QuickCheckIn({ zhBooks, enBooks, onSubmit, onClose }) {
  const currentZh = zhBooks.find(b => b.owned && b.status !== 'finished')
  const currentEn = enBooks.find(b => b.owned && b.status !== 'finished')

  const [zhPages, setZhPages] = useState(0)
  const [enPages, setEnPages] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [hint, setHint] = useState('')

  const zhMax = currentZh ? currentZh.total_pages - currentZh.current_page : 0
  const enMax = currentEn ? currentEn.total_pages - currentEn.current_page : 0
  const hasInput = zhPages !== 0 || enPages !== 0

  const handleSubmit = async () => {
    if (!hasInput) {
      setHint('请先输入阅读页数')
      setTimeout(() => setHint(''), 2000)
      return
    }
    setHint('')
    setSubmitting(true)
    try {
      await onSubmit({
        zh: currentZh && zhPages > 0 ? { bookId: currentZh.id, pages: zhPages, newPage: currentZh.current_page + zhPages } : null,
        en: currentEn && enPages > 0 ? { bookId: currentEn.id, pages: enPages, newPage: currentEn.current_page + enPages } : null,
        minutes,
      })
    } catch (err) {
      console.error('Check-in failed:', err)
      setHint('打卡失败，请重试')
      setTimeout(() => setHint(''), 3000)
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-center mb-5">快速打卡</h2>

        {/* Chinese book */}
        {currentZh ? (
          <BookInput
            label="中文"
            color="var(--color-candy-pink)"
            book={currentZh}
            pages={zhPages}
            setPages={setZhPages}
            max={zhMax}
          />
        ) : (
          <div className="text-sm text-[var(--color-text-secondary)] mb-4">中文书全部读完!</div>
        )}

        {/* English book */}
        {currentEn ? (
          <BookInput
            label="英文"
            color="var(--color-candy-blue)"
            book={currentEn}
            pages={enPages}
            setPages={setEnPages}
            max={enMax}
          />
        ) : (
          <div className="text-sm text-[var(--color-text-secondary)] mb-4">英文书全部读完!</div>
        )}

        {/* Time input */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⏱</span>
            <span className="text-sm font-semibold">阅读时间</span>
          </div>
          <div className="flex items-center gap-2">
            {[10, 20, 30, 60].map(m => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  minutes === m
                    ? 'bg-[var(--color-candy-purple)] text-white scale-105'
                    : 'bg-gray-100 text-[var(--color-text-secondary)] active:bg-gray-200'
                }`}
              >
                {m}分
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setMinutes(m => Math.max(0, m - 5))}
              className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold active:bg-gray-200 transition-colors"
            >-</button>
            <div className="flex-1 text-center">
              <input
                type="number"
                value={minutes}
                onChange={e => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center text-xl font-bold py-1.5 rounded-xl border-2 border-gray-200 focus:border-[var(--color-candy-purple)] focus:outline-none transition-colors"
              />
              <span className="text-xs text-[var(--color-text-secondary)]">分钟</span>
            </div>
            <button
              onClick={() => setMinutes(m => m + 5)}
              className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold active:bg-gray-200 transition-colors"
            >+</button>
          </div>
        </div>

        {/* Hint */}
        {hint && (
          <div className="text-center text-sm text-[var(--color-candy-red)] font-medium mb-3 animate-pop-in">
            {hint}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 font-medium text-[var(--color-text-secondary)] active:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-1 py-3 rounded-xl text-white font-bold transition-all active:scale-95 ${
              hasInput
                ? 'bg-gradient-to-r from-[var(--color-candy-orange)] to-[var(--color-candy-red)]'
                : 'bg-gray-300'
            } ${submitting ? 'opacity-40' : ''}`}
          >
            {submitting ? '保存中...' : '打卡!'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BookInput({ label, color, book, pages, setPages, max }) {
  const resultPage = book.current_page + pages
  const willFinish = resultPage >= book.total_pages
  const pct = Math.round((Math.max(0, resultPage) / book.total_pages) * 100)
  const minPages = -book.current_page // 最多回退到第0页

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-[var(--color-text-secondary)] truncate flex-1">{book.title}</span>
        <span className="text-xs text-[var(--color-text-secondary)]">{book.current_page}/{book.total_pages}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>

      {/* Quick page buttons */}
      <div className="flex gap-2 mb-2">
        {[10, 20, 30, 50].map(n => (
          <button
            key={n}
            onClick={() => setPages(pages === n ? 0 : Math.min(max, n))}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              pages === n ? 'bg-gray-800 text-white scale-105' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {n}页
          </button>
        ))}
      </div>
      {/* Page input */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPages(p => Math.max(minPages, p - 5))}
          className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold active:bg-gray-200 transition-colors"
        >-</button>
        <input
          type="number"
          value={pages}
          onChange={e => {
            const v = parseInt(e.target.value) || 0
            setPages(Math.min(max, Math.max(minPages, v)))
          }}
          className="flex-1 text-center text-xl font-bold py-2 rounded-xl border-2 focus:outline-none transition-colors"
          style={{ borderColor: pages > 0 ? color : pages < 0 ? '#f97316' : '#e5e7eb' }}
        />
        <span className="text-sm text-[var(--color-text-secondary)]">页</span>
        <button
          onClick={() => setPages(p => Math.min(max, p + 5))}
          className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold active:bg-gray-200 transition-colors"
        >+</button>
      </div>

      {/* Result hint */}
      {pages !== 0 && (
        <div className={`text-xs font-medium mt-1 text-center ${
          pages < 0 ? 'text-orange-500' : willFinish ? 'text-emerald-500' : 'text-[var(--color-text-secondary)]'
        }`}>
          {pages < 0
            ? `修正到第 ${resultPage} 页`
            : willFinish
              ? '读完啦! 🎉'
              : `将读到第 ${resultPage} 页`
          }
        </div>
      )}
    </div>
  )
}
