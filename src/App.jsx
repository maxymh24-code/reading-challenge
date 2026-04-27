import { useState } from 'react'
import { useBooks } from './hooks/useBooks'
import { useCheckIn } from './hooks/useCheckIn'
import Dashboard from './components/Dashboard'
import BookList from './components/BookList'
import CheckIn from './components/CheckIn'

const TABS = [
  { key: 'dashboard', label: '进度', icon: '📊' },
  { key: 'books', label: '书架', icon: '📚' },
  { key: 'checkin', label: '打卡', icon: '✅' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const booksData = useBooks()
  const checkInData = useCheckIn()

  if (booksData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="pb-2">
        {activeTab === 'dashboard' && (
          <Dashboard books={booksData} checkIn={checkInData} />
        )}
        {activeTab === 'books' && <BookList books={booksData} />}
        {activeTab === 'checkin' && (
          <CheckIn books={booksData} checkIn={checkInData} />
        )}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 text-xs transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
