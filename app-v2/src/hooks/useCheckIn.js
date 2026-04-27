import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toDateStr } from '../lib/readingCalc'

export function useCheckIn() {
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCheckIns = useCallback(async () => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching check-ins:', error)
      return
    }
    setCheckIns(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCheckIns()
  }, [fetchCheckIns])

  const addCheckIn = async (bookId, pagesRead, date) => {
    const dateStr = date || toDateStr(new Date())
    const { error } = await supabase.from('check_ins').insert({
      book_id: bookId,
      pages_read: pagesRead,
      date: dateStr,
    })
    if (!error) await fetchCheckIns()
    return !error
  }

  const deleteCheckIn = async (id) => {
    const { error } = await supabase.from('check_ins').delete().eq('id', id)
    if (!error) await fetchCheckIns()
  }

  // Edit all check-ins for a book on a specific date, returns page difference
  const editDayCheckIn = async (bookId, date, newPages) => {
    const existing = checkIns.filter(c => c.book_id === bookId && c.date === date)
    const oldTotal = existing.reduce((s, c) => s + c.pages_read, 0)

    // Delete all existing for this book+date
    for (const c of existing) {
      await supabase.from('check_ins').delete().eq('id', c.id)
    }

    // Insert new record if > 0
    if (newPages > 0) {
      await supabase.from('check_ins').insert({ book_id: bookId, pages_read: newPages, date })
    }

    await fetchCheckIns()
    return newPages - oldTotal
  }

  const todayCheckIns = checkIns.filter(
    c => c.date === toDateStr(new Date())
  )

  const getStreak = () => {
    const dates = [...new Set(checkIns.map(c => c.date))].sort().reverse()
    if (dates.length === 0) return 0

    const today = toDateStr(new Date())
    const yd = new Date(); yd.setDate(yd.getDate() - 1)
    const yesterday = toDateStr(yd)

    if (dates[0] !== today && dates[0] !== yesterday) return 0

    let streak = 0
    let checkDate = new Date(dates[0] + 'T12:00:00')

    for (const d of dates) {
      const expected = toDateStr(checkDate)
      if (d === expected) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  const getCalendarData = () => {
    const map = {}
    for (const c of checkIns) {
      map[c.date] = (map[c.date] || 0) + c.pages_read
    }
    return map
  }

  return {
    checkIns, todayCheckIns, loading,
    addCheckIn, deleteCheckIn, editDayCheckIn,
    streak: getStreak(),
    calendarData: getCalendarData(),
    refresh: fetchCheckIns,
  }
}
