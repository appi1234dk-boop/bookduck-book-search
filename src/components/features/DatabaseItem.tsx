'use client'

interface DatabaseItemProps {
  icon: string
  name: string
  count: string
  selected: boolean
  onClick: () => void
}

export default function DatabaseItem({ icon, name, count, selected, onClick }: DatabaseItemProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`db-item ${selected ? 'selected' : ''}`}
    >
      <span className="db-emoji">{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="db-name">{name}</div>
        <div className="db-count">{count}</div>
      </div>
      <div className="db-radio">
        <div className="db-radio-inner" />
      </div>
    </div>
  )
}
