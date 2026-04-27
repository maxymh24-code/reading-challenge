import { useState } from 'react'

export default function SettingsPanel({ settings, onSave, onClose }) {
  const [weekday, setWeekday] = useState(settings.weekday_minutes)
  const [weekend, setWeekend] = useState(settings.weekend_minutes)
  const [zhSpeed, setZhSpeed] = useState(settings.zh_speed || 250)
  const [enSpeed, setEnSpeed] = useState(settings.en_speed || 150)
  // Chinese weekend minutes: derived from en_time_ratio
  const initZhWeekend = settings.en_time_ratio > 0 && settings.en_time_ratio < 1
    ? Math.round(settings.weekend_minutes * (1 - settings.en_time_ratio))
    : 0
  const [zhWeekendMin, setZhWeekendMin] = useState(initZhWeekend)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Convert zhWeekendMin to en_time_ratio (0 = pure English)
    const enRatio = zhWeekendMin > 0 ? Math.round((1 - zhWeekendMin / weekend) * 100) / 100 : 1.0
    await onSave({
      weekday_minutes: weekday,
      weekend_minutes: weekend,
      zh_speed: zhSpeed,
      en_speed: enSpeed,
      en_time_ratio: enRatio,
    })
    setSaving(false)
  }

  // Calculate reference pages/30min for a "standard" book
  const zhPagesRef = Math.round(30 / ((250 / zhSpeed) * 1.0))
  const enPagesRef = Math.round(30 / ((200 / enSpeed) * 1.0))

  // Actual time allocation display
  const enWeekendMin = zhWeekendMin > 0 ? weekend - zhWeekendMin : weekend

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-6">阅读设置</h2>

        {/* Weekday */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">工作日每天阅读</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={weekday}
              onChange={e => setWeekday(parseInt(e.target.value))}
              className="flex-1 accent-[var(--color-candy-purple)]"
            />
            <div className="w-20 text-center py-1.5 rounded-xl bg-purple-50 text-[var(--color-candy-purple)] font-bold text-sm">
              {weekday} 分钟
            </div>
          </div>
        </div>

        {/* Weekend */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">周末每天阅读</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={30}
              max={300}
              step={10}
              value={weekend}
              onChange={e => {
                const v = parseInt(e.target.value)
                setWeekend(v)
                // Keep zhWeekendMin within bounds
                if (zhWeekendMin > v) setZhWeekendMin(Math.min(zhWeekendMin, v))
              }}
              className="flex-1 accent-[var(--color-candy-blue)]"
            />
            <div className="w-20 text-center py-1.5 rounded-xl bg-blue-50 text-[var(--color-candy-blue)] font-bold text-sm">
              {weekend >= 60
                ? `${Math.floor(weekend / 60)}h${weekend % 60 > 0 ? weekend % 60 : ''}`
                : `${weekend} 分钟`
              }
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="mb-6">
          <div className="text-xs text-[var(--color-text-secondary)] mb-2">快捷设置</div>
          <div className="flex gap-2">
            {[
              { label: '轻松', wd: 20, we: 60 },
              { label: '标准', wd: 30, we: 150 },
              { label: '冲刺', wd: 45, we: 180 },
              { label: '极限', wd: 60, we: 240 },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => { setWeekday(p.wd); setWeekend(p.we) }}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                  weekday === p.wd && weekend === p.we
                    ? 'bg-[var(--color-candy-purple)] text-white'
                    : 'bg-gray-50 text-[var(--color-text-secondary)] active:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language time allocation */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">周末中文阅读时间</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={Math.min(180, weekend)}
              step={10}
              value={zhWeekendMin}
              onChange={e => setZhWeekendMin(parseInt(e.target.value))}
              className="flex-1 accent-pink-400"
            />
            <div className="w-20 text-center py-1.5 rounded-xl bg-pink-50 text-pink-500 font-bold text-sm">
              {zhWeekendMin > 0 ? `${zhWeekendMin} 分钟` : '纯英文'}
            </div>
          </div>
          {/* Time allocation summary */}
          {zhWeekendMin > 0 && (
            <div className="mt-2 p-2.5 rounded-xl bg-gray-50 text-[10px] text-[var(--color-text-secondary)] space-y-0.5">
              <div className="flex justify-between">
                <span>工作日</span>
                <span className="text-blue-500 font-medium">英文 {weekday}分钟</span>
              </div>
              <div className="flex justify-between">
                <span>周末</span>
                <span>
                  <span className="text-blue-500 font-medium">英文 {enWeekendMin}分</span>
                  {' + '}
                  <span className="text-pink-500 font-medium">中文 {zhWeekendMin}分</span>
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {[
              { label: '纯英文', v: 0 },
              { label: '中文30分', v: 30 },
              { label: '中文1h', v: 60 },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => setZhWeekendMin(p.v)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  zhWeekendMin === p.v
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-50 text-[var(--color-text-secondary)] active:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-border)] pt-5 mb-5">
          <h3 className="text-sm font-bold mb-4">阅读速度</h3>

          {/* Chinese speed */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">中文速度</label>
              <span className="text-xs text-[var(--color-text-secondary)]">
                约 {zhPagesRef} 页/30分钟
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={100}
                max={500}
                step={10}
                value={zhSpeed}
                onChange={e => setZhSpeed(parseInt(e.target.value))}
                className="flex-1 accent-pink-400"
              />
              <div className="w-24 text-center py-1.5 rounded-xl bg-pink-50 text-pink-500 font-bold text-sm">
                {zhSpeed} 字/分
              </div>
            </div>
          </div>

          {/* English speed */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">英文速度</label>
              <span className="text-xs text-[var(--color-text-secondary)]">
                约 {enPagesRef} 页/30分钟
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={300}
                step={10}
                value={enSpeed}
                onChange={e => setEnSpeed(parseInt(e.target.value))}
                className="flex-1 accent-blue-400"
              />
              <div className="w-24 text-center py-1.5 rounded-xl bg-blue-50 text-blue-500 font-bold text-sm">
                {enSpeed} 词/分
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 font-medium text-[var(--color-text-secondary)] active:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--color-candy-purple)] to-[var(--color-candy-blue)] text-white font-medium active:opacity-80 transition-opacity"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
