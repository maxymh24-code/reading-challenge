import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toDateStr } from '../lib/readingCalc'

export function useSettings() {
  const [settings, setSettings] = useState({
    weekday_minutes: 30,
    weekend_minutes: 180,
    start_date: '2026-04-18',
    end_date: '2026-06-16',
    zh_speed: 250,
    en_speed: 150,
    en_time_ratio: 0,
    ended_date: null,
  })
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('Error fetching settings:', error)
      setLoading(false)
      return
    }
    if (data) setSettings(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = async (updates) => {
    const { error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', 1)
    if (!error) {
      setSettings(prev => ({ ...prev, ...updates }))
    }
  }

  const endDay = async () => {
    await updateSettings({ ended_date: toDateStr(new Date()) })
  }

  const resumeDay = async () => {
    await updateSettings({ ended_date: null })
  }

  return { settings, loading, updateSettings, endDay, resumeDay }
}
