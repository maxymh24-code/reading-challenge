import ProgressBar from './ProgressBar'

const STATUS_MAP = {
  not_started: { text: '未开始', color: 'text-gray-400' },
  reading: { text: '阅读中', color: 'text-blue-600' },
  finished: { text: '已完成', color: 'text-green-600' },
}

export default function BookCard({ book, onEdit, onToggleOwned, onDelete }) {
  const status = STATUS_MAP[book.status]
  const percent = book.total_pages > 0
    ? Math.round((book.current_page / book.total_pages) * 100)
    : 0

  return (
    <div className={`bg-white rounded-xl p-3 border ${book.owned ? 'border-gray-100' : 'border-dashed border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{book.title}</h4>
          {book.author && (
            <p className="text-xs text-gray-400 truncate">{book.author}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-xs ${status.color}`}>{status.text}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <ProgressBar current={book.current_page} total={book.total_pages} className="flex-1" />
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {book.current_page}/{book.total_pages}页 {percent}%
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleOwned(book.id, !book.owned)}
            className={`text-xs px-2 py-0.5 rounded-full border ${
              book.owned
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            {book.owned ? '已有' : '没有'}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(book)}
            className="text-xs text-blue-500 px-2 py-0.5"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="text-xs text-red-400 px-2 py-0.5"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
