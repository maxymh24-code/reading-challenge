import { useState } from 'react'

const DIFFICULTY_OPTIONS = [
  { value: 1, label: '简单', color: 'bg-emerald-400' },
  { value: 2, label: '中等', color: 'bg-blue-400' },
  { value: 3, label: '困难', color: 'bg-orange-400' },
]

export default function BookForm({ book, language, onClose, onSave }) {
  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState(book?.author || '')
  const [totalPages, setTotalPages] = useState(book?.total_pages || '')
  const [owned, setOwned] = useState(book?.owned ?? true)
  const [difficulty, setDifficulty] = useState(book?.difficulty || 2)
  const [wordsPerPage, setWordsPerPage] = useState(book?.words_per_page || '')
  const [saving, setSaving] = useState(false)

  const isEdit = !!book
  const lang = book?.language || language
  const defaultWpp = lang === 'zh' ? 250 : 200
  const wppUnit = lang === 'zh' ? '字' : '词'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !totalPages) return
    setSaving(true)
    await onSave({
      title: title.trim(),
      author: author.trim(),
      total_pages: parseInt(totalPages),
      owned,
      difficulty,
      words_per_page: wordsPerPage ? parseInt(wordsPerPage) : null,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">{isEdit ? '编辑书籍' : '添加新书'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">书名</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-candy-purple)] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">作者</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-candy-purple)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">总页数</label>
            <input
              type="number"
              value={totalPages}
              onChange={e => setTotalPages(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-candy-purple)] transition-colors"
              required
              min="1"
            />
          </div>

          {/* Difficulty selector */}
          <div>
            <label className="block text-sm font-medium mb-2">难度</label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    difficulty === opt.value
                      ? `${opt.color} text-white scale-105`
                      : 'bg-gray-100 text-[var(--color-text-secondary)] active:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Words per page */}
          <div>
            <label className="block text-sm font-medium mb-1">
              每页{wppUnit}数 <span className="text-[var(--color-text-secondary)] font-normal">(可选)</span>
            </label>
            <input
              type="number"
              value={wordsPerPage}
              onChange={e => setWordsPerPage(e.target.value)}
              placeholder={`默认 ${defaultWpp} ${wppUnit}`}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-candy-purple)] transition-colors"
              min="50"
              max="1000"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">已拥有</label>
            <button
              type="button"
              onClick={() => setOwned(!owned)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                owned ? 'bg-emerald-400' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                owned ? 'left-[26px]' : 'left-0.5'
              }`} />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100 font-medium text-[var(--color-text-secondary)] active:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !totalPages || saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--color-candy-orange)] to-[var(--color-candy-pink)] text-white font-medium disabled:opacity-40 active:opacity-80 transition-opacity"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
