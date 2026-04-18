import { useState } from 'react'

export default function CheckIn({ books, checkIn }) {
  const [selectedBook, setSelectedBook] = useState('')
  const [currentPage, setCurrentPage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Only show owned, unfinished books
  const availableBooks = books.books.filter(
    b => b.owned && b.status !== 'finished'
  )

  const selected = availableBooks.find(b => b.id === selectedBook)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBook || !currentPage) return

    setSubmitting(true)
    const page = parseInt(currentPage, 10)
    const pagesRead = selected ? Math.max(0, page - selected.current_page) : 0

    if (pagesRead > 0) {
      await checkIn.addCheckIn(selectedBook, pagesRead)
    }
    await books.updateProgress(selectedBook, page)

    setSelectedBook('')
    setCurrentPage('')
    setSubmitting(false)
  }

  const todayPages = checkIn.todayCheckIns.reduce((s, c) => s + c.pages_read, 0)

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-gray-800 mb-4">每日打卡</h1>

      {/* Today Summary */}
      <div className="bg-blue-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-800 font-medium">
              今天已读 {todayPages} 页
            </p>
            <p className="text-xs text-blue-500 mt-0.5">
              打卡 {checkIn.todayCheckIns.length} 次
            </p>
          </div>
          <div className="text-3xl">📖</div>
        </div>
      </div>

      {/* Check-in Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-500">选择书籍</label>
          <select
            value={selectedBook}
            onChange={e => {
              setSelectedBook(e.target.value)
              const book = availableBooks.find(b => b.id === e.target.value)
              if (book) setCurrentPage(String(book.current_page))
            }}
            className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- 选择一本书 --</option>
            {availableBooks.map(book => (
              <option key={book.id} value={book.id}>
                {book.language === 'zh' ? '🇨🇳' : '🇬🇧'} {book.title} ({book.current_page}/{book.total_pages}页)
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div>
            <label className="text-xs text-gray-500">
              读到第几页（当前 {selected.current_page} 页，共 {selected.total_pages} 页）
            </label>
            <input
              type="number"
              value={currentPage}
              onChange={e => setCurrentPage(e.target.value)}
              min={selected.current_page}
              max={selected.total_pages}
              className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`${selected.current_page + 1} - ${selected.total_pages}`}
            />
            {currentPage && parseInt(currentPage) > selected.current_page && (
              <p className="text-xs text-green-600 mt-1">
                本次阅读 {parseInt(currentPage) - selected.current_page} 页
                {parseInt(currentPage) >= selected.total_pages && ' 🎉 读完啦！'}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedBook || !currentPage || submitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '提交中...' : '打卡'}
        </button>
      </form>

      {/* Today's Check-in Records */}
      {checkIn.todayCheckIns.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">今日记录</h3>
          <div className="space-y-2">
            {checkIn.todayCheckIns.map(c => {
              const book = books.books.find(b => b.id === c.book_id)
              return (
                <div key={c.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{book?.title || '未知书籍'}</p>
                    <p className="text-xs text-gray-400">+{c.pages_read} 页</p>
                  </div>
                  <button
                    onClick={() => checkIn.deleteCheckIn(c.id)}
                    className="text-xs text-red-400 ml-2"
                  >
                    撤销
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
