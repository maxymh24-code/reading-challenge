const START_DATE = '2026-04-18'
const END_DATE = '2026-06-16'

function getColor(pages) {
  if (!pages) return '#ebedf0'
  if (pages < 10) return '#9be9a8'
  if (pages < 30) return '#40c463'
  if (pages < 60) return '#30a14e'
  return '#216e39'
}

export default function CheckInCalendar({ calendarData }) {
  const start = new Date(START_DATE)
  const end = new Date(END_DATE)
  const today = new Date().toISOString().split('T')[0]

  // Build weeks grid
  const weeks = []
  let current = new Date(start)
  // Align to Monday
  const dayOfWeek = current.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  current.setDate(current.getDate() + mondayOffset)

  while (current <= end || weeks.length === 0) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0]
      const inRange = dateStr >= START_DATE && dateStr <= END_DATE
      week.push({
        date: dateStr,
        pages: calendarData[dateStr] || 0,
        inRange,
        isToday: dateStr === today,
        isFuture: dateStr > today,
      })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="bg-white rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">打卡日历</h3>
      <div className="flex gap-0.5">
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map(l => (
            <div key={l} className="w-3 h-3 text-[8px] text-gray-400 flex items-center justify-center">
              {l}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map(day => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-[2px] ${day.isToday ? 'ring-1 ring-blue-500' : ''}`}
                style={{
                  backgroundColor: !day.inRange
                    ? 'transparent'
                    : day.isFuture
                      ? '#f3f4f6'
                      : getColor(day.pages),
                }}
                title={day.inRange ? `${day.date}: ${day.pages}页` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
        <span>少</span>
        {[0, 5, 15, 40, 70].map(p => (
          <div key={p} className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: getColor(p) }} />
        ))}
        <span>多</span>
      </div>
    </div>
  )
}
