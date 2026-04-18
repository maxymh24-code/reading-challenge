export default function TodayPlan({ books, todayCheckIns }) {
  const today = new Date()
  const isWeekend = today.getDay() === 0 || today.getDay() === 6
  const targetMinutes = isWeekend ? 150 : 30

  // Currently reading books (owned + in progress)
  const readingBooks = books.filter(b => b.owned && b.status === 'reading')
  // Owned but not started
  const notStarted = books.filter(b => b.owned && b.status === 'not_started')

  const todayPages = todayCheckIns.reduce((sum, c) => sum + c.pages_read, 0)
  const checkedBookIds = new Set(todayCheckIns.map(c => c.book_id))

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">今日计划</h3>
        <span className="text-xs text-gray-400">
          建议阅读 {targetMinutes} 分钟
        </span>
      </div>

      {todayPages > 0 && (
        <div className="text-xs text-green-600 mb-2">
          今天已读 {todayPages} 页
        </div>
      )}

      {readingBooks.length === 0 && notStarted.length === 0 ? (
        <p className="text-sm text-gray-400">没有正在读的书，去书架添加吧！</p>
      ) : (
        <div className="space-y-2">
          {readingBooks.map(book => (
            <div key={book.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{book.title}</p>
                <p className="text-xs text-gray-500">
                  {book.current_page}/{book.total_pages} 页
                </p>
              </div>
              {checkedBookIds.has(book.id) && (
                <span className="text-green-500 text-sm ml-2">✓</span>
              )}
            </div>
          ))}
          {readingBooks.length === 0 && notStarted.length > 0 && (
            <div className="p-2 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                还有 {notStarted.length} 本未开始，去打卡开始阅读吧！
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
