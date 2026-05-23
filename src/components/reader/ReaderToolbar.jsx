export default function ReaderToolbar({ modeLabel, activePara, total }) {
  const safeTotal = Math.max(total || 0, 1)
  const current = Math.min((activePara || 0) + 1, safeTotal)

  return (
    <div className="reader-tools">
      <div className="flex flex-wrap items-center gap-3">
        <span className="tag active">{modeLabel}</span>
        <span className="small muted">
          第 {current} / {safeTotal} 段
        </span>
      </div>
      <span className="small muted">阅读中</span>
    </div>
  )
}
