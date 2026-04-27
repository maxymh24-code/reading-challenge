export default function ProgressBar({ current, total, className = '' }) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0

  return (
    <div className={`w-full bg-gray-100 rounded-full h-2 ${className}`}>
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{
          width: `${percent}%`,
          backgroundColor: percent >= 100 ? '#22c55e' : '#3b82f6',
        }}
      />
    </div>
  )
}
