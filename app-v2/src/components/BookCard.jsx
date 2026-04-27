export default function BookCard({ book, colorIndex, onTap, delay = 0, dimmed }) {
  const pct = book.total_pages > 0
    ? Math.round((book.current_page / book.total_pages) * 100)
    : 0
  const isFinished = book.status === 'finished'

  return (
    <button
      onClick={onTap}
      className={`book-color-${colorIndex} w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98] animate-slide-up ${
        isFinished
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 finished-glow border border-emerald-200'
          : dimmed
          ? 'bg-white/60 border border-dashed border-[var(--color-border)]'
          : 'bg-white border border-[var(--color-border)] shadow-sm'
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-start gap-3">
        {/* Color accent dot */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0 ${
            isFinished ? 'bg-emerald-400' : ''
          }`}
          style={isFinished ? {} : { background: `var(--book-accent)` }}
        >
          {isFinished ? '✓' : book.title.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm truncate ${isFinished ? 'text-emerald-700' : ''}`}>
              {book.title}
            </span>
            {isFinished && <span className="text-sm">🎉</span>}
          </div>

          {/* Author */}
          {book.author && (
            <div className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
              {book.author}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFinished ? 'bg-emerald-400' : 'progress-gradient'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${
              isFinished ? 'text-emerald-600' : 'text-[var(--color-text-secondary)]'
            }`}>
              {pct}%
            </span>
          </div>

          {/* Page count */}
          <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            {book.current_page} / {book.total_pages} 页
          </div>
        </div>
      </div>
    </button>
  )
}
