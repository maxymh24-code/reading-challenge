import { useState } from 'react'
import BookForm from './BookForm'

export default function ManagePage({ booksHook, language, onBack }) {
  const [showForm, setShowForm] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)

  const books = language === 'zh' ? booksHook.zhBooks : booksHook.enBooks
  const langLabel = language === 'zh' ? '中文' : '英文'

  const handleMoveUp = async (index) => {
    if (index === 0) return
    const ids = books.map(b => b.id)
    ;[ids[index], ids[index - 1]] = [ids[index - 1], ids[index]]
    await booksHook.reorderBooks(language, ids)
  }

  const handleMoveDown = async (index) => {
    if (index === books.length - 1) return
    const ids = books.map(b => b.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    await booksHook.reorderBooks(language, ids)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-candy-orange)] to-[var(--color-candy-pink)] p-4 pt-[max(env(safe-area-inset-top),1rem)] text-white">
        <div className="max-w-lg mx-auto">
          <button onClick={onBack} className="flex items-center gap-1 text-white/80 mb-4 active:opacity-60">
            <span className="text-xl">‹</span>
            <span className="text-sm">返回</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">管理{langLabel}书</h1>
            <button
              onClick={() => { setEditBook(null); setShowForm(true) }}
              className="px-3 py-1.5 rounded-xl bg-white/20 text-sm font-medium active:bg-white/30 transition-colors"
            >
              + 添加
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
        {books.map((book, i) => (
          <div
            key={book.id}
            className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[var(--color-border)] animate-slide-up"
            style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'backwards' }}
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleMoveUp(i)}
                className={`text-xs px-1 rounded ${i === 0 ? 'text-gray-200' : 'text-[var(--color-text-secondary)] active:bg-gray-100'}`}
                disabled={i === 0}
              >
                ▲
              </button>
              <button
                onClick={() => handleMoveDown(i)}
                className={`text-xs px-1 rounded ${i === books.length - 1 ? 'text-gray-200' : 'text-[var(--color-text-secondary)] active:bg-gray-100'}`}
                disabled={i === books.length - 1}
              >
                ▼
              </button>
            </div>

            {/* Book info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{book.title}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {book.total_pages}页 · {book.owned ? '已有' : '待购'}
              </div>
            </div>

            {/* Owned toggle */}
            <button
              onClick={() => booksHook.toggleOwned(book.id, !book.owned)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                book.owned
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              {book.owned ? '已有' : '待购'}
            </button>

            {/* Edit */}
            <button
              onClick={() => { setEditBook(book); setShowForm(true) }}
              className="text-[var(--color-text-secondary)] active:text-[var(--color-text)] px-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                if (confirm(`删除「${book.title}」？`)) {
                  booksHook.deleteBook(book.id)
                }
              }}
              className="text-red-300 active:text-red-500 px-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Book form modal */}
      {showForm && (
        <BookForm
          book={editBook}
          language={language}
          onClose={() => setShowForm(false)}
          onSave={async (bookData) => {
            if (editBook) {
              await booksHook.updateBook(editBook.id, bookData)
            } else {
              await booksHook.addBook({ ...bookData, language })
            }
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
