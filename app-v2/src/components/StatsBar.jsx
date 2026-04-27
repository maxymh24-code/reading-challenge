export default function StatsBar({ streak, daysLeft, finishedCount, total, onTap }) {
  return (
    <button
      onClick={onTap}
      className="w-full bg-gradient-to-r from-[var(--color-candy-purple)] via-[var(--color-candy-blue)] to-[var(--color-candy-cyan)] p-4 pt-[max(env(safe-area-inset-top),1rem)] text-white active:opacity-90 transition-opacity"
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <StatItem icon="🔥" value={streak} label="连续天" />
        <StatItem icon="📅" value={daysLeft} label="剩余天" />
        <StatItem icon="📊" value={`${finishedCount}/${total}`} label="已完成" />
        <span className="text-white/60 text-xl">›</span>
      </div>
    </button>
  )
}

function StatItem({ icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xl">{icon}</span>
      <div className="text-left">
        <div className="text-lg font-bold leading-tight">{value}</div>
        <div className="text-[10px] text-white/80">{label}</div>
      </div>
    </div>
  )
}
