import { useState, useRef, useEffect } from 'react'
import { isWeekend } from '../lib/readingCalc'

export default function Stopwatch({ settings }) {
  const todayMinutes = isWeekend(new Date())
    ? settings.weekend_minutes
    : settings.weekday_minutes
  const totalSeconds = todayMinutes * 60

  const [remaining, setRemaining] = useState(totalSeconds)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)

  // Reset when settings change
  useEffect(() => {
    if (!running) {
      setRemaining(todayMinutes * 60)
      setFinished(false)
    }
  }, [todayMinutes])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setFinished(true)
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const elapsed = totalSeconds - remaining
  const pct = totalSeconds > 0 ? Math.round((elapsed / totalSeconds) * 100) : 0

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60
  const pad = n => String(n).padStart(2, '0')

  const display = hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`

  const handleReset = () => {
    setRemaining(totalSeconds)
    setRunning(false)
    setFinished(false)
  }

  return (
    <div className="mx-4 mt-2 max-w-lg sm:mx-auto">
      <div className={`rounded-2xl p-4 border transition-colors ${
        finished
          ? 'bg-emerald-50 border-emerald-200'
          : running
          ? 'bg-orange-50 border-orange-200'
          : 'bg-white border-[var(--color-border)]'
      }`}>
        <div className="flex items-center gap-4">
          {/* Timer label */}
          <div className="flex-1">
            <div className="text-xs text-[var(--color-text-secondary)] mb-1">
              {finished ? '阅读完成！🎉' : running ? '阅读中...' : '今日阅读倒计时'}
            </div>
            <div className={`font-mono text-3xl font-bold tracking-wider ${
              finished ? 'text-emerald-600' : remaining <= 300 && running ? 'text-[var(--color-candy-orange)]' : ''
            }`}>
              {display}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 shrink-0">
            {!finished && (
              <button
                onClick={() => setRunning(!running)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform ${
                  running
                    ? 'bg-[var(--color-candy-orange)]'
                    : 'bg-[var(--color-candy-green)]'
                }`}
              >
                {running ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
            {(!running && remaining < totalSeconds) && (
              <button
                onClick={handleReset}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-[var(--color-text-secondary)] active:scale-95 active:bg-gray-200 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903H14.25a.75.75 0 000 1.5h6a.75.75 0 00.75-.75v-6a.75.75 0 00-1.5 0v3.068l-1.658-1.657A9 9 0 013.306 9.67a.75.75 0 101.45.388zm14.49 3.882a7.5 7.5 0 01-12.548 3.364l-1.903-1.903H9.75a.75.75 0 000-1.5h-6a.75.75 0 00-.75.75v6a.75.75 0 001.5 0v-3.068l1.658 1.657A9 9 0 0020.694 14.33a.75.75 0 10-1.45-.388z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              finished ? 'bg-emerald-400' : 'bg-gradient-to-r from-[var(--color-candy-purple)] to-[var(--color-candy-blue)]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
