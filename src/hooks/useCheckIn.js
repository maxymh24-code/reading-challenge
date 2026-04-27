import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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
    const dateStr = date || new Date().toISOString().split('T')[0]
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

  const todayCheckIns = checkIns.filter(
    c => c.date === new Date().toISOString().split('T')[0]
  )

  const getStreak = () => {
    const dates = [...new Set(checkIns.map(c => c.date))].sort().reverse()
    if (dates.length === 0) return 0

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (dates[0] !== today && dates[0] !== yesterday) return 0

    let streak = 0
    let checkDate = new Date(dates[0])

    for (const d of dates) {
      const expected = checkDate.toISOString().split('T')[0]
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
    addCheckIn, deleteCheckIn,
    streak: getStreak(),
    calendarData: getCalendarData(),
    refresh: fetchCheckIns,
  }
}
