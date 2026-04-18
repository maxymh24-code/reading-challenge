import { useState } from 'react'
import BookCard from './BookCard'
import BookForm from './BookForm'

export default function BookList({ books }) {
  const [langTab, setLangTab] = useState('zh')
  const [showForm, setShowForm] = useState(false)
  const [editBook, setEditBook] = useState(null)

  const displayBooks = langTab === 'zh' ? books.zhBooks : books.enBooks

  const handleEdit = (book) => {
    setEditBook(book)
    setShowForm(true)
  }

  const handleSave = async (data) => {
    if (editBook) {
      await books.updateBook(editBook.id, data)
    } else {
      await books.addBook(data)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('确定要删除这本书吗？')) {
      await books.deleteBook(id)
    }
  }

  const handleClose = () => {
    setShowForm(false)
    setEditBook(null)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-gray-800">书架</h1>
        <button
          onClick={() => { setEditBook(null); setShowForm(true) }}
          className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg"
        >
          + 添加
        </button>
      </div>

      {/* Language Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setLangTab('zh')}
          className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
            langTab === 'zh' ? 'bg-white text-gray-800 font-medium shadow-sm' : 'text-gray-500'
          }`}
        >
          中文 ({books.zhBooks.length})
        </button>
        <button
          onClick={() => setLangTab('en')}
          className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
            langTab === 'en' ? 'bg-white text-gray-800 font-medium shadow-sm' : 'text-gray-500'
          }`}
        >
          英文 ({books.enBooks.length})
        </button>
      </div>

      {/* Book Cards */}
      <div className="space-y-3">
        {displayBooks.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onEdit={handleEdit}
            onToggleOwned={books.toggleOwned}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {displayBooks.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          暂无{langTab === 'zh' ? '中文' : '英文'}书籍
        </div>
      )}

      {/* Book Form Modal */}
      {showForm && (
        <BookForm
          book={editBook}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
