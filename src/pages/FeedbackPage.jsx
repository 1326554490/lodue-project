import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { modePresets } from '../data/modes.js'
import { useReadingSession } from '../hooks/useReadingSession.js'

const rhythmNames = {
  building: '建立中',
  fast: '偏快',
  steady: '稳定',
  slow: '偏慢',
  attention: '注意力停留',
}

const rhythmColors = {
  building: 'rgba(141, 179, 200, 0.56)',
  fast: 'rgba(218, 143, 80, 0.66)',
  steady: 'rgba(87, 169, 159, 0.72)',
  slow: 'rgba(139, 116, 203, 0.62)',
  attention: 'rgba(122, 91, 190, 0.68)',
}

const darkRhythmColors = {
  building: 'rgba(141, 179, 200, 0.56)',
  fast: 'rgba(255, 211, 154, 0.56)',
  steady: 'rgba(143, 230, 219, 0.58)',
  slow: 'rgba(215, 197, 255, 0.52)',
  attention: 'rgba(200, 154, 243, 0.58)',
}

export default function FeedbackPage({ goTo, selectedText, mode, testState, settings, sharedRecaps, setSharedRecaps }) {
  const { readingSession, getSessionSummary } = useReadingSession()
  const summary = getSessionSummary()
  const paragraphs = splitParagraphs(selectedText?.content)
  const paragraphCount = readingSession.paragraphCount || paragraphs.length || 1
  const dwellData = buildDwellData(readingSession, paragraphCount)
  const rhythmCounts = countRhythms(readingSession.rhythmHistory)
  const behaviorNotes = buildBehaviorNotes(readingSession, summary, paragraphCount)
  const suggestions = buildSuggestions(readingSession, summary, testState, mode)
  const dataConfidence = getDataConfidence(readingSession)
  const isDark = settings?.theme === 'dark' || settings?.bg === 'dark' || readingSession.theme === 'dark'
  const axisColor = isDark ? '#A8BEC0' : '#718791'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(120,150,154,0.18)'
  const myShared = sharedRecaps?.find((item) => item.isMine && item.sessionId === readingSession.startTime)

  const handleShareToCommunity = () => {
    const newRecap = buildSharedRecap({ readingSession, selectedText, mode, summary, rhythmCounts, paragraphs, dataConfidence })
    setSharedRecaps((list) => {
      const existingIndex = list.findIndex((item) => item.isMine && item.sessionId === newRecap.sessionId)
      if (existingIndex >= 0) {
        return list.map((item, index) => (index === existingIndex ? { ...item, ...newRecap, sharedAt: '刚刚' } : item))
      }
      return [newRecap, ...list]
    })
  }

  const shareAndOpen = () => {
    handleShareToCommunity()
    goTo('community')
  }

  return (
    <section>
      <PageHero eyebrow="阅读复盘" title="这次阅读留下了真实轨迹">
        Lodue 根据段落停留、阅读路径、节奏变化、便签和难读标记生成复盘。你也可以把这份复盘轻轻放进共读空间。
      </PageHero>

      <Card className="feedback-confidence-card">
        <div className="row-title compact">复盘可信度提示</div>
        <div className={`confidence-note ${dataConfidence.level}`}>{dataConfidence.text}</div>
      </Card>

      <div className="feedback-grid mt24">
        <Card className="feedback-summary-card">
          <div className="row-title compact">本次阅读摘要</div>
          <div className="report-metric-grid">
            <ReportCell label="阅读内容" value={selectedText.title} />
            <ReportCell label="阅读时长" value={formatDuration(summary.totalDuration)} />
            <ReportCell label="完成进度" value={`${summary.progress}%`} />
            <ReportCell label="已到达段落" value={`${summary.completedParagraphs} / ${paragraphCount}`} />
            <ReportCell label="便签数量" value={`${summary.noteCount} 条`} />
            <ReportCell label="难读标记" value={`${summary.difficultCount} 处`} />
            <ReportCell label="平均停留" value={summary.averageDwellTime ? `${summary.averageDwellTime}s` : '暂无'} />
            <ReportCell
              label="最长停留"
              value={summary.longestDwellParagraph.paragraphIndex == null ? '暂无' : `第 ${summary.longestDwellParagraph.paragraphIndex + 1} 段 · ${summary.longestDwellParagraph.seconds}s`}
            />
            <ReportCell label="偏快信号" value={`${rhythmCounts.fast} 次`} />
            <ReportCell label="偏慢信号" value={`${rhythmCounts.slow} 次`} />
            <ReportCell label="注意力停留" value={`${rhythmCounts.attention} 次`} />
          </div>
        </Card>

        <Card>
          <div className="row-title compact">阅读行为解释</div>
          <div className="behavior-list">
            {behaviorNotes.map((note, index) => (
              <div className="behavior-note" key={note}>
                <i />
                <div>
                  <strong>{getBehaviorTitle(index, note)}</strong>
                  <span>{note}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt24">
        <div className="between mb18">
          <strong>阅读过程图</strong>
          <span className="tag">段落停留 / 节奏状态 / 标记</span>
        </div>
        <div className="process-chart">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dwellData} margin={{ top: 12, right: 12, bottom: 4, left: -18 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 11 }} interval={Math.max(0, Math.floor(dwellData.length / 10))} />
              <YAxis tickLine={false} axisLine={false} width={42} unit="s" tick={{ fill: axisColor, fontSize: 11 }} />
              <Tooltip content={<ReadingTooltip />} cursor={{ fill: 'rgba(126,207,196,0.08)' }} />
              <Bar dataKey="seconds" radius={[8, 8, 4, 4]}>
                {dwellData.map((item) => (
                  <Cell key={item.label} fill={getRhythmColor(item.rhythmType, isDark)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="feedback-legend">
          {Object.entries(rhythmNames).map(([key, label]) => (
            <span key={key}>
              <i style={{ background: getRhythmColor(key, isDark) }} />
              {label}
            </span>
          ))}
        </div>
      </Card>

      <div className="feedback-grid mt24">
        <Card>
          <div className="between mb18">
            <strong>阅读路径 / 进度轨迹</strong>
            <span className="tag">{(readingSession.paragraphPath || readingSession.readPath).length || 0} 次移动</span>
          </div>
          <ReadingPath session={readingSession} paragraphCount={paragraphCount} />
        </Card>

        <Card>
          <div className="row-title compact">Lodue 建议</div>
          <div className="suggestion-list">
            {suggestions.map((item) => (
              <div className="suggestion-item" key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt24 share-recap-card">
        <div>
          <div className="row-title compact">分享到共读空间</div>
          <p className="muted">{myShared ? '这次阅读已经放进共读空间，你可以去查看或删除自己的分享。' : '把这次复盘分享成一张安静的共读卡，朋友可以轻轻回应或进入同一段落。'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleShareToCommunity}>{myShared ? '更新分享' : '分享到共读空间'}</Button>
          <Button variant="secondary" onClick={shareAndOpen}>查看共读空间</Button>
        </div>
      </Card>

      <div className="actions">
        <Button onClick={() => goTo('reader')}>继续阅读</Button>
        <Button variant="secondary" onClick={() => goTo('home')}>保存并返回首页</Button>
      </div>
    </section>
  )
}

function buildSharedRecap({ readingSession, selectedText, mode, summary, rhythmCounts, paragraphs, dataConfidence }) {
  const longest = summary.longestDwellParagraph.paragraphIndex
  const highlightParagraph = longest != null ? longest + 1 : Math.max((readingSession.maxReachedParagraph || 0) + 1, 1)
  const quote = getParagraphQuote(paragraphs[highlightParagraph - 1])
  const tags = buildRecapTags(readingSession, rhythmCounts, dataConfidence)

  return {
    id: `mine-${readingSession.startTime || Date.now()}`,
    sessionId: readingSession.startTime || Date.now(),
    owner: '我',
    isMine: true,
    avatar: '我',
    bookTitle: selectedText?.title || '本次阅读',
    sharedAt: '刚刚',
    mode: modePresets[mode]?.label || mode || '阅读模式',
    progress: summary.progress,
    durationText: formatDuration(summary.totalDuration),
    rhythmSummary: buildRhythmSummary(rhythmCounts, dataConfidence),
    notesCount: readingSession.notes.length,
    difficultCount: readingSession.difficultMarks.length,
    highlightParagraph,
    quote,
    insight: buildInsight({ rhythmCounts, notesCount: readingSession.notes.length, difficultCount: readingSession.difficultMarks.length }),
    tags,
    reactions: { resonance: 0, readTogether: 0, revisit: 0 },
    confidence: dataConfidence.level,
  }
}

function buildRecapTags(session, rhythmCounts, dataConfidence) {
  const tags = ['复盘']
  if (dataConfidence.level === 'low') tags.push('初步复盘')
  if (rhythmCounts.slow) tags.push('慢读')
  if (rhythmCounts.attention) tags.push('回看')
  if (session.difficultMarks.length) tags.push('难读')
  if (session.notes.length) tags.push('便签')
  if (tags.length < 3) tags.push('共鸣')
  return tags.slice(0, 4)
}

function buildRhythmSummary(counts, confidence) {
  if (confidence.level === 'low') return '有效阅读数据较少，这是一份初步复盘'
  if (counts.attention) return `出现 ${counts.attention} 次注意力停留，适合回到关键段落整理`
  if (counts.fast > counts.slow) return '推进偏快，部分段落可以放慢再读'
  if (counts.slow) return '整体偏慢读，适合保留舒缓节奏'
  return '本次阅读节奏较稳定，适合继续从当前段落读下去'
}

function buildInsight({ rhythmCounts, notesCount, difficultCount }) {
  if (rhythmCounts.attention) return '这次阅读里有几次注意力停留，适合回到关键段落慢慢整理。'
  if (notesCount) return `你留下了 ${notesCount} 条便签，说明这段内容触发了主动记录。`
  if (difficultCount) return '难读标记提示这里值得回看，可能藏着人物或情绪的关键转折。'
  if (rhythmCounts.slow) return '这次更像慢读，适合保留舒缓模式，让情绪慢慢浮出来。'
  return '这次阅读节奏较稳定，适合继续从当前段落读下去。'
}

function getParagraphQuote(paragraph = '') {
  const clean = paragraph.trim()
  if (!clean) return '这一段像是把心事轻轻放在纸面上。'
  return clean.length > 46 ? `${clean.slice(0, 46)}……` : clean
}

function splitParagraphs(content = '') {
  return content.split('\n').map((item) => item.trim()).filter(Boolean)
}

function buildDwellData(session, paragraphCount) {
  const rhythmByParagraph = session.rhythmHistory.reduce((map, item) => {
    map[item.paragraph] = item.type
    return map
  }, {})

  return Array.from({ length: paragraphCount }, (_, index) => {
    const seconds = Number((session.dwellTimes[index] || 0).toFixed(1))
    return {
      label: `${index + 1}`,
      paragraph: index,
      seconds,
      rhythmType: rhythmByParagraph[index] || (seconds ? 'steady' : 'building'),
      hasNote: session.notes.some((note) => note.paragraphIndex === index),
      isDifficult: session.difficultMarks.includes(index),
    }
  })
}

function countRhythms(history = []) {
  return history.reduce(
    (count, item) => ({
      fast: count.fast + (item.type === 'fast' ? 1 : 0),
      steady: count.steady + (item.type === 'steady' ? 1 : 0),
      slow: count.slow + (item.type === 'slow' ? 1 : 0),
      attention: count.attention + (item.type === 'attention' ? 1 : 0),
    }),
    { fast: 0, steady: 0, slow: 0, attention: 0 },
  )
}

function getRhythmColor(type, isDark) {
  const palette = isDark ? darkRhythmColors : rhythmColors
  return palette[type] || palette.steady
}

function getBehaviorTitle(index, text) {
  if (text.includes('注意力')) return '注意力信号'
  if (text.includes('偏快')) return '推进速度'
  if (text.includes('慢读') || text.includes('偏慢')) return '慢读节奏'
  if (text.includes('便签')) return '主动记录'
  if (text.includes('难读')) return '难读回看'
  if (text.includes('稳定')) return '稳定推进'
  return `观察 ${index + 1}`
}

function getDataConfidence(session) {
  const pathCount = (session.paragraphPath || session.readPath || []).length
  const dwellCount = Object.keys(session.dwellTimes || {}).length

  if (pathCount < 3 || dwellCount < 3) {
    return {
      level: 'low',
      text: '本次有效阅读行为较少，以下为初步复盘。多阅读几段后，Lodue 会生成更完整的节奏分析。',
    }
  }

  return {
    level: 'good',
    text: '已根据段落停留、节奏变化和标记行为生成本次复盘。',
  }
}

function buildBehaviorNotes(session, summary, paragraphCount) {
  const notes = []
  const attentionCount = session.rhythmHistory.filter((item) => item.type === 'attention').length
  const fastCount = session.rhythmHistory.filter((item) => item.type === 'fast').length
  const slowCount = session.rhythmHistory.filter((item) => item.type === 'slow').length
  const steadyCount = session.rhythmHistory.filter((item) => item.type === 'steady').length

  if (summary.longestDwellParagraph.paragraphIndex != null) notes.push(`你在第 ${summary.longestDwellParagraph.paragraphIndex + 1} 段停留最久，共 ${summary.longestDwellParagraph.seconds}s，适合回看这一段是否有情绪、线索或注意力停留。`)
  if (attentionCount) notes.push(`本次出现 ${attentionCount} 次注意力停留信号，强陪伴会在这些时刻用轻提醒把注意力带回正文。`)
  if (fastCount) notes.push(`系统记录到 ${fastCount} 次节奏偏快，通常来自连续跨段或上一段停留明显短于预计阅读时间。`)
  if (slowCount && !attentionCount) notes.push('慢读信号较多但没有明显注意力停留，说明你更像是在稳定细读，而不是走神。')
  if (steadyCount > fastCount + slowCount + attentionCount) notes.push('稳定节奏记录更多，说明本次阅读大部分时间能保持连续推进。')
  if (session.notes.length) notes.push(`你留下了 ${session.notes.length} 条便签，复盘时可以优先查看这些段落。`)
  if (session.difficultMarks.length) notes.push(`你标记了 ${session.difficultMarks.length} 处难读段落，下次可以用清晰模式或增大字距降低跳行压力。`)
  if (!notes.length) notes.push(`你到达了全文 ${summary.progress}%，下次可以从第 ${Math.min(summary.completedParagraphs + 1, paragraphCount)} 段继续。`)

  return notes.slice(0, 5)
}

function buildSuggestions(session, summary, testState, mode) {
  const attentionCount = session.rhythmHistory.filter((item) => item.type === 'attention').length
  const fastCount = session.rhythmHistory.filter((item) => item.type === 'fast').length
  const slowCount = session.rhythmHistory.filter((item) => item.type === 'slow').length
  const suggestions = []

  if (attentionCount >= 2) suggestions.push({ title: '下次模式', detail: '建议使用专注模式，并把陪伴强度调到强陪伴。它会在停留过久时给轻提醒。' })
  else if (summary.difficultCount >= 2) suggestions.push({ title: '下次模式', detail: '建议尝试清晰模式，段落边界和字距会更适合处理难读段。' })
  else if (fastCount >= 2) suggestions.push({ title: '下次模式', detail: '建议使用标准或强陪伴，让节奏仪表提醒你给句子多留一点停顿。' })
  else if (slowCount > fastCount) suggestions.push({ title: '下次模式', detail: '建议继续使用舒缓模式，保留较慢节奏，减少阅读压力。' })
  else suggestions.push({ title: '下次模式', detail: `当前 ${modePresets[mode]?.label || session.mode || '阅读模式'} 表现稳定，可以继续沿用。` })

  suggestions.push({
    title: '陪伴强度',
    detail: attentionCount || fastCount ? '建议保留标准或强陪伴，让节奏仪表继续跟随阅读速度。' : '轻陪伴或标准陪伴已足够，避免右侧信息过多。',
  })

  suggestions.push({
    title: '阅读工具',
    detail: summary.difficultCount ? '建议先回看难读标记段落，并保留阅读尺和高亮。' : testState?.rhythmType === 'verySlow' ? '建议保留阅读尺和高亮，帮助定位当前段落。' : '可以按当前设置继续，必要时只开启阅读尺。',
  })

  if (session.notes.length >= 2) suggestions.push({ title: '便签复盘', detail: '本次便签较多，建议下次阅读前先查看右侧便签汇总，快速恢复上下文。' })

  suggestions.push({
    title: '休息建议',
    detail: summary.totalDuration >= 1500 ? '本次阅读超过 25 分钟，建议休息 3 到 5 分钟再继续。' : '本次阅读负担不高，可以短暂停顿后继续。',
  })

  return suggestions
}

function ReadingPath({ session, paragraphCount }) {
  const maxReached = Math.max(session.maxReachedParagraph || 0, 0)
  const visited = new Set(session.visitedParagraphs || [])
  const revisited = new Set(Object.keys(session.revisitCount || {}).map(Number))
  const noteParagraphs = new Set((session.notes || []).map((note) => note.paragraphIndex))
  const difficultParagraphs = new Set(session.difficultMarks || [])
  const repeated = (session.paragraphPath || session.readPath || []).reduce((map, item) => {
    const paragraph = item.paragraph ?? item.paragraphIndex
    if (paragraph != null) map[paragraph] = (map[paragraph] || 0) + 1
    return map
  }, {})
  const dotCount = Math.min(28, Math.max(12, paragraphCount))

  return (
    <div className="path-timeline" aria-label="阅读路径">
      {Array.from({ length: dotCount }, (_, index) => {
        const paragraph = dotCount === 1 ? 0 : Math.round((index / (dotCount - 1)) * Math.max(paragraphCount - 1, 0))
        const isReached = paragraph <= maxReached
        const isVisited = visited.has(paragraph)
        const isRevisit = revisited.has(paragraph) || repeated[paragraph] > 1
        const hasNote = noteParagraphs.has(paragraph)
        const isDifficult = difficultParagraphs.has(paragraph)
        return (
          <span
            className={`path-dot${isReached ? ' reached' : ''}${isVisited ? ' visited' : ''}${isRevisit ? ' revisit' : ''}${hasNote ? ' has-note' : ''}${isDifficult ? ' difficult' : ''}`}
            key={`${paragraph}-${index}`}
            title={`第 ${paragraph + 1} 段${isRevisit ? ' · 有回看' : ''}`}
          />
        )
      })}
      <div className="path-caption">最高到达第 {maxReached + 1} 段，重复点表示回看轨迹。</div>
    </div>
  )
}

function ReadingTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="reading-tooltip">
      <strong>第 {item.paragraph + 1} 段</strong>
      <span>停留 {item.seconds}s</span>
      <span>节奏：{rhythmNames[item.rhythmType] || '稳定'}</span>
      <span>{item.hasNote ? '有便签' : '无便签'} · {item.isDifficult ? '难读标记' : '未标记难读'}</span>
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '暂无'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest ? `${minutes}分${rest}s` : `${minutes}分钟`
}

function ReportCell({ label, value }) {
  return (
    <div className="report-cell">
      <div className="small muted">{label}</div>
      <div className="report-number">{value}</div>
    </div>
  )
}
