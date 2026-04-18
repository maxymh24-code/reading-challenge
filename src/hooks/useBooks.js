import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { initialBooks } from '../data/initialBooks'

export function useBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('language')
      .order('sort_order')

    if (error) {
      console.error('Error fetching books:', error)
      return
    }

    if (data.length === 0) {
      await seedBooks()
      return
    }

    setBooks(data)
    setLoading(false)
  }, [])

  const seedBooks = async () => {
    const rows = initialBooks.map(b => ({
      ...b,
      current_page: 0,
      status: 'not_started',
      finished_date: null,
    }))
    const { error } = await supabase.from('books').insert(rows)
    if (error) {
      console.error('Error seeding books:', error)
      return
    }
    await fetchBooks()
  }

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const addBook = async (book) => {
    const maxOrder = books
      .filter(b => b.language === book.language)
      .reduce((max, b) => Math.max(max, b.sort_order || 0), 0)

    const { error } = await supabase.from('books').insert({
      ...book,
      current_page: 0,
      status: 'not_started',
      sort_order: maxOrder + 1,
    })
    if (!error) await fetchBooks()
  }

  const updateBook = async (id, updates) => {
    const { error } = await supabase.from('books').update(updates).eq('id', id)
    if (!error) await fetchBooks()
  }

  const deleteBook = async (id) => {
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (!error) await fetchBooks()
  }

  const toggleOwned = async (id, owned) => {
    await updateBook(id, { owned })
  }

  const updateProgress = async (id, currentPage) => {
    const book = books.find(b => b.id === id)
    if (!book) return

    const finished = currentPage >= book.total_pages
    await updateBook(id, {
      current_page: Math.min(currentPage, book.total_pages),
      status: finished ? 'finished' : currentPage > 0 ? 'reading' : 'not_started',
      finished_date: finished ? new Date().toISOString().split('T')[0] : null,
    })
  }

  const enBooks = books.filter(b => b.language === 'en')
  const zhBooks = books.filter(b => b.language === 'zh')
  const finishedCount = books.filter(b => b.status === 'finished').length
  const enFinished = enBooks.filter(b => b.status === 'finished').length
  const zhFinished = zhBooks.filter(b => b.status === 'finished').length
  const ownedUnfinished = books.filter(b => b.owned && b.status !== 'finished')
  const needMoreBooks = ownedUnfinished.length <= 2

  return {
    books, enBooks, zhBooks, loading,
    finishedCount, enFinished, zhFinished,
    needMoreBooks, ownedUnfinished,
    addBook, updateBook, deleteBook, toggleOwned, updateProgress,
    refresh: fetchBooks,
  }
}
