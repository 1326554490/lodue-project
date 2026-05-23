import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import Card from '../common/Card.jsx'

const rhythmData = [
  { t: 0, focus: 38, calm: 54 },
  { t: 5, focus: 44, calm: 58 },
  { t: 10, focus: 61, calm: 65 },
  { t: 15, focus: 72, calm: 70 },
  { t: 18, focus: 78, calm: 74 },
]

export default function CompanionPanel({ progress, activePara, total, notes, markDifficult, difficultyCount }) {
  const stage = progress < 35 ? '渐入' : progress < 70 ? '沉浸' : '收束'

  return (
    <aside className="side-stack">
      <div className="companion-card level-medium">
        <div className="companion-inner">
          <div className="comp-head">
            <div>
              <div className="pill-soft">Lodue 陪伴中</div>
              <h3>陪伴流场</h3>
              <p>实时可视化会随着阅读进度变化，形成轻量的节奏反馈。</p>
            </div>
          </div>
          <div className="orb-shell">
            <div className="soft-ripple" />
            <div className="soft-ripple2" />
            <div className="soft-ripple3" />
            <div className="soft-orb" />
            <div className="orb-center">
              <strong>{progress}%</strong>
              <span>{stage}阅读中</span>
            </div>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <span>陪伴感</span>
              <strong>中</strong>
            </div>
            <div className="metric">
              <span>阅读阶段</span>
              <strong>{stage}</strong>
            </div>
            <div className="metric">
              <span>可视强度</span>
              <strong>柔和</strong>
            </div>
          </div>
        </div>
      </div>

      <Card className="assist-card">
        <div className="between">
          <div>
            <strong>阅读进度</strong>
            <div className="small muted">
              第 {activePara + 1} / {total} 段
            </div>
          </div>
          <span className="tag">{progress}%</span>
        </div>
        <div className="assist-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="assist-grid">
          <div className="assist-cell">
            <span>难读标记</span>
            <strong>{difficultyCount} 处</strong>
          </div>
          <div className="assist-cell">
            <span>预计剩余</span>
            <strong>约 {Math.max(total - activePara - 1, 0)} 段</strong>
          </div>
        </div>
        <div className="assist-actions">
          <button onClick={markDifficult}>标记难读</button>
          <button>本段提示</button>
        </div>
        <div className="hint-box">本段建议慢读：先关注人物关系与情绪变化，遇到长句时可以按逗号自然停顿。</div>
      </Card>

      <Card>
        <div className="between mb18">
          <strong>专注与平静</strong>
          <span className="tag">实时</span>
        </div>
        <div className="chart-mini">
          <ResponsiveContainer width="100%" height={126}>
            <AreaChart data={rhythmData}>
              <Area dataKey="calm" stroke="#8db3c8" fill="#dcebef" strokeWidth={3} />
              <Area dataKey="focus" stroke="#57aea2" fill="#d9f2ef" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="between mb18">
          <strong>我的便签</strong>
          <span className="small muted">{notes.length} 条</span>
        </div>
        {notes.length ? (
          notes.map((note) => (
            <div className="note-item" key={`${note.para}-${note.text}`}>
              <div className="note-label">第 {note.para} 段</div>
              {note.text}
            </div>
          ))
        ) : (
          <div className="note-empty">点击正文段落后添加便签，记录难读点或共鸣句。</div>
        )}
      </Card>
    </aside>
  )
}
