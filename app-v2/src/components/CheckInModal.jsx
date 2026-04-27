import { useState } from 'react'

export default function CheckInModal({ book, onClose, onCheckIn }) {
  const [page, setPage] = useState(book.current_page)
  const [submitting, setSubmitting] = useState(false)
  const isFinished = book.status === 'finished'

  const pagesRead = page - book.current_page
  const willFinish = page >= book.total_pages
  const pct = Math.round((page / book.total_pages) * 100)

  const handleSubmit = async () => {
    if (page === book.current_page) return
    setSubmitting(true)
    await onCheckIn(book.id, Math.min(page, book.total_pages))
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Book title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold">{book.title}</h2>
          {book.author && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{book.author}</p>
          )}
        </div>

        {/* Progress display */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--color-text-secondary)]">当前进度</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-candy-purple)] to-[var(--color-candy-blue)] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
            <span>{book.current_page} 页</span>
            <span>{book.total_pages} 页</span>
          </div>
        </div>

        {/* Page input */}
        {!isFinished && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">读到第几页？</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold active:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={page}
                  onChange={e => {
                    const v = parseInt(e.target.value) || 0
                    setPage(Math.min(book.total_pages, Math.max(0, v)))
                  }}
                  className="flex-1 text-center text-2xl font-bold py-2 rounded-xl border-2 border-[var(--color-candy-purple)] focus:outline-none focus:border-[var(--color-candy-blue)] transition-colors"
                  min="0"
                  max={book.total_pages}
                />
                <button
                  onClick={() => setPage(p => Math.min(book.total_pages, p + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold active:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pages read info */}
            {pagesRead !== 0 && (
              <div className="text-center mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  pagesRead > 0
                    ? 'bg-[var(--color-candy-green)]/10 text-[var(--color-candy-green)]'
                    : 'bg-orange-100 text-orange-500'
                }`}>
                  {pagesRead > 0 ? `+${pagesRead} 页` : `回退 ${-pagesRead} 页`}
                  {willFinish ? ' 🎉 读完啦！' : ''}
                </span>
              </div>
            )}

            {/* Quick buttons */}
            <div className="flex gap-2 mb-4">
              {[5, 10, 20, 50].map(n => (
                <button
                  key={n}
                  onClick={() => setPage(p => Math.min(book.total_pages, p + n))}
                  className="flex-1 py-1.5 rounded-lg bg-gray-50 text-xs font-medium text-[var(--color-text-secondary)] active:bg-gray-100 transition-colors"
                >
                  +{n}页
                </button>
              ))}
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 font-medium text-[var(--color-text-secondary)] active:bg-gray-200 transition-colors"
          >
            取消
          </button>
          {!isFinished && (
            <button
              onClick={handleSubmit}
              disabled={pagesRead === 0 || submitting}
              className={`flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-40 active:opacity-80 transition-opacity ${
                pagesRead < 0
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                  : 'bg-gradient-to-r from-[var(--color-candy-purple)] to-[var(--color-candy-blue)]'
              }`}
            >
              {submitting ? '保存中...' : pagesRead < 0 ? '修正进度' : '打卡'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
