import ProgressRing from './ProgressRing'
import TodayPlan from './TodayPlan'
import CheckInCalendar from './CheckInCalendar'

const END_DATE = new Date('2026-06-16')

export default function Dashboard({ books, checkIn }) {
  const today = new Date()
  const daysLeft = Math.max(0, Math.ceil((END_DATE - today) / 86400000))

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-lg font-bold text-gray-800">阅读挑战</h1>
        <p className="text-xs text-gray-400 mt-1">
          4/18 - 6/16 | 还剩 {daysLeft} 天
        </p>
      </div>

      {/* Progress Rings */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex justify-around items-start">
          <div className="relative">
            <ProgressRing
              current={books.finishedCount}
              total={40}
              size={90}
              label="总进度"
            />
          </div>
          <div className="relative">
            <ProgressRing
              current={books.enFinished}
              total={20}
              size={70}
              strokeWidth={6}
              color="#6366f1"
              label="英文"
            />
          </div>
          <div className="relative">
            <ProgressRing
              current={books.zhFinished}
              total={20}
              size={70}
              strokeWidth={6}
              color="#f59e0b"
              label="中文"
            />
          </div>
        </div>
      </div>

      {/* Streak & Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-500">{checkIn.streak}</div>
          <div className="text-xs text-gray-400 mt-1">连续打卡</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{checkIn.todayCheckIns.length}</div>
          <div className="text-xs text-gray-400 mt-1">今日打卡</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{daysLeft}</div>
          <div className="text-xs text-gray-400 mt-1">剩余天数</div>
        </div>
      </div>

      {/* Warning: Need more books */}
      {books.needMoreBooks && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-800">快没书读了！</p>
            <p className="text-xs text-amber-600">
              已有且未读完的书只剩 {books.ownedUnfinished.length} 本，记得添加新书
            </p>
          </div>
        </div>
      )}

      {/* Today Plan */}
      <TodayPlan
        books={books.books}
        todayCheckIns={checkIn.todayCheckIns}
      />

      {/* Calendar Heatmap */}
      <CheckInCalendar calendarData={checkIn.calendarData} />
    </div>
  )
}
