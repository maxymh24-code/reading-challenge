import { useState, useEffect } from 'react'

export default function BookForm({ book, onSave, onClose }) {
  const isEdit = !!book
  const [form, setForm] = useState({
    title: '',
    author: '',
    language: 'zh',
    total_pages: '',
    owned: true,
  })

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author || '',
        language: book.language,
        total_pages: String(book.total_pages),
        owned: book.owned,
      })
    }
  }, [book])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.total_pages) return
    onSave({
      title: form.title.trim(),
      author: form.author.trim(),
      language: form.language,
      total_pages: parseInt(form.total_pages, 10),
      owned: form.owned,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-[480px] p-5 pb-8 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">
            {isEdit ? '编辑书籍' : '添加新书'}
          </h2>
          <button onClick={onClose} className="text-gray-400 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">书名 *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入书名"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">作者</label>
            <input
              type="text"
              value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入作者"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500">总页数 *</label>
              <input
                type="number"
                value={form.total_pages}
                onChange={e => setForm(f => ({ ...f, total_pages: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="1"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">语言</label>
              <select
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zh">中文</option>
                <option value="en">英文</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">是否已有：</label>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, owned: !f.owned }))}
              className={`text-xs px-3 py-1 rounded-full border ${
                form.owned
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              {form.owned ? '已有' : '没有'}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {isEdit ? '保存修改' : '添加书籍'}
          </button>
        </form>
      </div>
    </div>
  )
}
