import { BookOpen, MessageCircle, PenLine, Send, Sparkles, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { useReadingSession } from '../hooks/useReadingSession.js'

const filterOptions = ['全部', '我的', '共鸣', '慢读', '难读', '回看']
const commentFilters = ['全部', '共鸣', '难读', '慢读', '我的']
const tagOptions = ['共鸣', '难读', '慢读', '喜欢', '疑问']

const partners = [
  { name: '小林', avatar: '林', status: '正在读', paragraph: 6, progress: 42 },
  { name: '南枝', avatar: '南', status: '写了便签', paragraph: 8, progress: 53 },
  { name: '阿澈', avatar: '澈', status: '正在回看', paragraph: 4, progress: 31 },
  { name: '雾青', avatar: '青', status: '安静中', paragraph: 7, progress: 48 },
  { name: 'Mia', avatar: 'M', status: '已完成', paragraph: 12, progress: 100 },
]

const initialChapterMessages = [
  {
    id: 1,
    paragraph: 3,
    quote: '你看这书里的人，明明心里有千言万语，却偏偏要藏着。',
    user: '小林',
    avatar: '林',
    tag: '共鸣',
    mood: 'calm',
    text: '这句像是在替很多没说出口的话留位置。',
    time: '2 分钟前',
    reactions: { same: 2, warm: 4, revisit: 1 },
  },
  {
    id: 2,
    paragraph: 5,
    quote: '雨声把窗外的路洗得很亮，屋里的人却越坐越沉默。',
    user: '南枝',
    avatar: '南',
    tag: '喜欢',
    mood: 'warm',
    text: '画面很轻，但是情绪压得很低，适合慢慢读。',
    time: '6 分钟前',
    reactions: { same: 1, warm: 3, revisit: 0 },
  },
  {
    id: 3,
    paragraph: 7,
    quote: '他忽然停下来，好像终于听见了自己心里的回声。',
    user: '阿澈',
    avatar: '澈',
    tag: '难读',
    mood: 'focus',
    text: '这里我读了两遍，人物动机有点绕，但很关键。',
    time: '12 分钟前',
    reactions: { same: 0, warm: 1, revisit: 3 },
  },
  {
    id: 4,
    paragraph: 9,
    quote: '有些告别不是转身，而是把一句话一直留在原处。',
    user: '雾青',
    avatar: '青',
    tag: '慢读',
    mood: 'soft',
    text: '读到这里放慢了，像需要给情绪一点缓冲。',
    time: '刚刚',
    reactions: { same: 2, warm: 2, revisit: 1 },
  },
]

export default function CommunityPage({ goTo, selectedText, sharedRecaps, setSharedRecaps }) {
  const { readingSession } = useReadingSession()
  const [communityView, setCommunityView] = useState('home')
  const [selectedParagraph, setSelectedParagraph] = useState(Math.max(readingSession.currentParagraph + 1 || 3, 3))
  const [activeFilter, setActiveFilter] = useState('全部')
  const [message, setMessage] = useState('')
  const [selectedTag, setSelectedTag] = useState('共鸣')
  const [chapterMessages, setChapterMessages] = useState(initialChapterMessages)

  const paragraphCount = readingSession.paragraphCount || 12
  const progress = readingSession.progress || 38
  const filteredRecaps = useMemo(() => filterRecaps(sharedRecaps || [], activeFilter), [activeFilter, sharedRecaps])
  const resonanceStats = useMemo(() => buildResonanceStats(sharedRecaps || [], chapterMessages), [chapterMessages, sharedRecaps])

  const handleReactRecap = (id, key) => {
    setSharedRecaps((list) => list.map((item) => (
      item.id === id
        ? { ...item, reactions: { ...item.reactions, [key]: (item.reactions?.[key] || 0) + 1 } }
        : item
    )))
  }

  const handleDeleteRecap = (id) => {
    setSharedRecaps((list) => list.filter((item) => item.id !== id || !item.isMine))
  }

  const enterRoom = (paragraph = selectedParagraph) => {
    setSelectedParagraph(paragraph)
    setCommunityView('room')
  }

  const sendMessage = () => {
    const text = message.trim()
    if (!text) return
    const quote = getParagraphQuote(selectedParagraph, chapterMessages)
    setChapterMessages((current) => [
      {
        id: Date.now(),
        paragraph: selectedParagraph,
        quote,
        user: '我',
        avatar: '我',
        tag: selectedTag,
        mood: selectedTag === '难读' ? 'focus' : 'calm',
        text,
        time: '刚刚',
        reactions: { same: 0, warm: 0, revisit: 0 },
      },
      ...current,
    ])
    setMessage('')
  }

  if (communityView === 'room') {
    return (
      <section className="community-page">
        <RoomDetail
          selectedText={selectedText}
          paragraphCount={paragraphCount}
          progress={progress}
          selectedParagraph={selectedParagraph}
          setSelectedParagraph={setSelectedParagraph}
          chapterMessages={chapterMessages}
          setChapterMessages={setChapterMessages}
          message={message}
          setMessage={setMessage}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onSend={sendMessage}
          onBack={() => setCommunityView('home')}
          sharedRecaps={sharedRecaps || []}
          resonanceStats={resonanceStats}
        />
      </section>
    )
  }

  return (
    <section className="community-page">
      <PageHero eyebrow="安静共读空间" title="有人和你读过同一段">
        这里不是聊天流。复盘、段落留言和轻回应都锚定在阅读行为上，让共读保持安静，也保留同行的感觉。
      </PageHero>

      <div className="community-home-grid">
        <CoReadingRoomCard
          title={selectedText?.title || '今日共读文本'}
          progress={progress}
          currentParagraph={readingSession.currentParagraph || 0}
          paragraphCount={paragraphCount}
          messageCount={chapterMessages.length}
          topParagraph={getTopParagraph(chapterMessages)}
          onEnter={() => enterRoom(selectedParagraph)}
        />
        <PresenceTrail partners={partners} paragraphCount={paragraphCount} />
      </div>

      <div className="community-wall-grid mt24">
        <main className="community-main">
          <SharedRecapWall
            recaps={filteredRecaps}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onReact={handleReactRecap}
            onDelete={handleDeleteRecap}
            onEnterRoom={enterRoom}
          />
        </main>
        <aside className="community-column">
          <ResonanceMap stats={resonanceStats} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <SharedReadingRecap
            totalReaders={18}
            topParagraph={getTopParagraph(chapterMessages)}
            revisitParagraph={getRevisitParagraph(chapterMessages)}
            commonTag={resonanceStats[0]?.tag || '共鸣'}
            nextParagraph={Math.min(Math.max(readingSession.maxReachedParagraph + 2 || 8, 1), paragraphCount)}
            latestRecap={sharedRecaps?.[0]}
          />
        </aside>
      </div>
    </section>
  )
}

function RoomDetail({
  selectedText,
  paragraphCount,
  progress,
  selectedParagraph,
  setSelectedParagraph,
  chapterMessages,
  message,
  setMessage,
  selectedTag,
  setSelectedTag,
  onSend,
  onBack,
  sharedRecaps,
  resonanceStats,
}) {
  const groupedMessages = groupMessages(chapterMessages)
  const messages = groupedMessages[selectedParagraph] || []
  const selectedQuote = messages[0]?.quote || '这一段还没有留言，可以先留下一句轻轻的回应。'

  return (
    <>
      <div className="room-detail-head">
        <Button variant="secondary" onClick={onBack}>返回共读空间</Button>
        <div>
          <div className="eyebrow">安静共读中</div>
          <h1>{selectedText?.title || '共读房间'} · 雨后共读房</h1>
          <p>当前在线 6 人，今日共同进度 {progress}%</p>
        </div>
      </div>

      <div className="room-detail-grid">
        <Card className="room-paragraph-trail">
          <div className="row-title compact">
            <BookOpen size={18} /> 房间阅读轨迹
          </div>
          <div className="room-paragraph-list">
            {Array.from({ length: Math.min(paragraphCount, 18) }, (_, index) => {
              const paragraph = index + 1
              const count = groupedMessages[paragraph]?.length || 0
              const revisit = chapterMessages.filter((item) => item.paragraph === paragraph && item.reactions.revisit > 0).length
              return (
                <button key={paragraph} className={selectedParagraph === paragraph ? 'active' : ''} onClick={() => setSelectedParagraph(paragraph)}>
                  <span>第 {paragraph} 段</span>
                  <small>{count} 留言 · {revisit ? '多人回看' : '安静推进'}</small>
                </button>
              )
            })}
          </div>
        </Card>

        <main className="community-main">
          <Card className="paragraph-board room-comment-board">
            <div className="between mb18">
              <div>
                <div className="row-title compact">
                  <MessageCircle size={18} /> 第 {selectedParagraph} 段共读
                </div>
                <div className="small muted">附近有 {partners.filter((item) => Math.abs(item.paragraph - selectedParagraph) <= 1).length} 位伙伴正在读或回看。</div>
              </div>
              <span className="tag">段落锚点</span>
            </div>
            <blockquote>{selectedQuote}</blockquote>
            <div className="paragraph-groups">
              {messages.length ? messages.map((item) => <MessageItem item={item} key={item.id} />) : <div className="note-empty">这一段还很安静，适合留下第一句回应。</div>}
            </div>
          </Card>

          <SharedNoteComposer
            selectedParagraph={selectedParagraph}
            setSelectedParagraph={setSelectedParagraph}
            paragraphCount={paragraphCount}
            message={message}
            setMessage={setMessage}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            onSend={onSend}
          />
        </main>

        <aside className="community-column">
          <PresenceTrail partners={partners} paragraphCount={paragraphCount} compact />
          <ResonanceMap stats={resonanceStats} activeFilter="全部" setActiveFilter={() => {}} />
          <SharedReadingRecap
            totalReaders={18}
            topParagraph={getTopParagraph(chapterMessages)}
            revisitParagraph={getRevisitParagraph(chapterMessages)}
            commonTag={resonanceStats[0]?.tag || '共鸣'}
            nextParagraph={Math.min(selectedParagraph + 1, paragraphCount)}
            latestRecap={sharedRecaps?.[0]}
          />
        </aside>
      </div>
    </>
  )
}

function CoReadingRoomCard({ title, progress, currentParagraph, paragraphCount, messageCount, topParagraph, onEnter }) {
  return (
    <Card className="co-room-card">
      <div className="co-room-head">
        <span className="tag active">今日安静共读房</span>
        <Users size={22} />
      </div>
      <h2>{title}</h2>
      <p className="muted">房间节奏稳定推进，留言只锚定段落，不做刷屏聊天。</p>
      <div className="room-progress">
        <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
      <div className="room-metrics">
        <RoomMetric label="当前在线" value="6 人" />
        <RoomMetric label="共同进度" value={`${progress}%`} />
        <RoomMetric label="共鸣留言" value={`${messageCount} 条`} />
        <RoomMetric label="最高共鸣" value={`第 ${topParagraph} 段`} />
      </div>
      <div className="my-co-state">你在第 {Math.max(currentParagraph + 1, 1)} / {Math.max(paragraphCount, 1)} 段附近，可以进入房间查看相邻段落的轻回应。</div>
      <Button className="w-full" onClick={onEnter}>进入共读房间</Button>
    </Card>
  )
}

function SharedRecapWall({ recaps, activeFilter, setActiveFilter, onReact, onDelete, onEnterRoom }) {
  return (
    <Card className="shared-recap-wall">
      <div className="between mb18">
        <div>
          <div className="row-title compact">
            <Sparkles size={18} /> 共读复盘墙
          </div>
          <div className="small muted">每张卡都来自一次阅读总结，锚定到段落和阅读行为。</div>
        </div>
        <span className="tag">{recaps.length} 条</span>
      </div>
      <div className="comment-filters">
        {filterOptions.map((filter) => (
          <button key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>
        ))}
      </div>
      <div className="recap-wall-list">
        {recaps.length ? recaps.map((recap) => (
          <article className={`shared-recap-card-item ${recap.isMine ? 'is-mine' : ''}`} key={recap.id}>
            <div className="recap-card-head">
              <div className="avatar">{recap.avatar}</div>
              <div>
                <strong>{recap.owner}</strong>
                <span>{recap.sharedAt} · {recap.mode}</span>
              </div>
              {recap.isMine ? (
                <button className="delete-recap-btn" onClick={() => onDelete(recap.id)} title="删除分享">
                  <Trash2 size={15} /> 删除分享
                </button>
              ) : null}
            </div>
            <h3>{recap.bookTitle}</h3>
            <div className="recap-meta-grid">
              <span>进度 {recap.progress}%</span>
              <span>{recap.durationText}</span>
              <span>{recap.notesCount} 条便签</span>
              <span>{recap.difficultCount} 处难读</span>
            </div>
            <p className="recap-summary">{recap.rhythmSummary}</p>
            <blockquote>{recap.quote}</blockquote>
            <p>{recap.insight}</p>
            <div className="keyword-cloud">
              {recap.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
            </div>
            <div className="quick community-reactions">
              <button onClick={() => onReact(recap.id, 'readTogether')}>我也读到这里了 · {recap.reactions?.readTogether || 0}</button>
              <button onClick={() => onReact(recap.id, 'resonance')}>有同感 · {recap.reactions?.resonance || 0}</button>
              <button onClick={() => onReact(recap.id, 'revisit')}>想回看 · {recap.reactions?.revisit || 0}</button>
            </div>
            <Button variant="secondary" onClick={() => onEnterRoom(recap.highlightParagraph)}>进入共读房间</Button>
          </article>
        )) : <div className="note-empty">这个筛选下还没有复盘。读完后可以从阅读总结页分享到这里。</div>}
      </div>
    </Card>
  )
}

function PresenceTrail({ partners, paragraphCount, compact = false }) {
  return (
    <Card className={`presence-trail-card ${compact ? 'compact' : ''}`}>
      <div className="row-title compact">
        <BookOpen size={18} /> 伙伴阅读位置
      </div>
      <div className="presence-trail">
        {partners.map((partner) => (
          <div className="presence-item" key={partner.name}>
            <div className="avatar">{partner.avatar}</div>
            <div className="presence-body">
              <div className="between">
                <strong>{partner.name}</strong>
                <span>{partner.status}</span>
              </div>
              <div className="presence-line"><span style={{ width: `${partner.progress}%` }} /></div>
              <div className="small muted">第 {partner.paragraph} / {paragraphCount} 段附近</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SharedNoteComposer({ selectedParagraph, setSelectedParagraph, paragraphCount, message, setMessage, selectedTag, setSelectedTag, onSend }) {
  return (
    <Card className="shared-composer">
      <div className="row-title compact">
        <PenLine size={18} /> 给段落留一句回应
      </div>
      <div className="composer-controls">
        <label>
          锚定段落
          <select value={selectedParagraph} onChange={(event) => setSelectedParagraph(Number(event.target.value))}>
            {Array.from({ length: Math.min(paragraphCount, 28) }, (_, index) => index + 1).map((paragraph) => (
              <option key={paragraph} value={paragraph}>第 {paragraph} 段</option>
            ))}
          </select>
        </label>
        <div className="tag-picker">
          {tagOptions.map((tag) => (
            <button key={tag} className={selectedTag === tag ? 'active' : ''} onClick={() => setSelectedTag(tag)}>{tag}</button>
          ))}
        </div>
      </div>
      <div className="composer-input">
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="给这一段留一句轻轻的回应……" />
        <button type="button" onClick={onSend} aria-label="发送段落回应"><Send size={17} /></button>
      </div>
    </Card>
  )
}

function ResonanceMap({ stats, activeFilter, setActiveFilter }) {
  return (
    <Card className="resonance-map">
      <div className="row-title compact">
        <Sparkles size={18} /> 共鸣浮岛
      </div>
      <div className="resonance-islands">
        {stats.map((item, index) => (
          <button
            key={item.tag}
            className={`resonance-island island-${index % 3} ${activeFilter === item.tag ? 'active' : ''}`}
            onClick={() => setActiveFilter(item.tag)}
          >
            <strong>{item.tag}</strong>
            <span>{item.count}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function SharedReadingRecap({ totalReaders, topParagraph, revisitParagraph, commonTag, nextParagraph, latestRecap }) {
  return (
    <Card className="shared-recap">
      <div className="row-title compact">房间小结</div>
      <div className="recap-list">
        <div><span>今日共读</span><strong>{totalReaders} 人</strong></div>
        <div><span>最高共鸣</span><strong>第 {topParagraph} 段</strong></div>
        <div><span>最多回看</span><strong>第 {revisitParagraph} 段</strong></div>
        <div><span>常见标签</span><strong>{commonTag}</strong></div>
      </div>
      <div className="hint-box">
        {latestRecap ? `最近复盘来自 ${latestRecap.owner}：${latestRecap.rhythmSummary}` : `下一次可以从第 ${nextParagraph} 段继续。`}
      </div>
    </Card>
  )
}

function MessageItem({ item }) {
  return (
    <div className="community-message">
      <div className="message-meta">
        <div className="avatar small-avatar">{item.avatar}</div>
        <strong>{item.user}</strong>
        <span className={`mood-dot mood-${item.mood}`} />
        <span className="tag">{item.tag}</span>
        <span>{item.time}</span>
      </div>
      <p>{item.text}</p>
      <div className="quick community-reactions">
        <button>我也读到这里了 · {item.reactions.same}</button>
        <button>这句话很温柔 · {item.reactions.warm}</button>
        <button>想回看 · {item.reactions.revisit}</button>
      </div>
    </div>
  )
}

function RoomMetric({ label, value }) {
  return (
    <div className="room-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function filterRecaps(recaps, filter) {
  if (filter === '全部') return recaps
  if (filter === '我的') return recaps.filter((item) => item.isMine)
  return recaps.filter((item) => item.tags?.includes(filter))
}

function buildResonanceStats(recaps, messages) {
  const counts = { 共鸣: 0, 慢读: 0, 难读: 0, 雨声: 0, 回看: 0, 便签: 0 }
  recaps.forEach((recap) => recap.tags?.forEach((tag) => {
    if (tag in counts) counts[tag] += 1
  }))
  messages.forEach((message) => {
    if (message.tag in counts) counts[message.tag] += 1
    if (message.reactions?.revisit) counts.回看 += message.reactions.revisit
  })
  return Object.entries(counts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count)
}

function groupMessages(messages) {
  return messages.reduce((groups, item) => {
    groups[item.paragraph] = groups[item.paragraph] || []
    groups[item.paragraph].push(item)
    return groups
  }, {})
}

function getParagraphQuote(paragraph, messages) {
  return messages.find((item) => item.paragraph === paragraph)?.quote || '这一段像是把心事轻轻放在纸面上。'
}

function getTopParagraph(messages) {
  const counts = messages.reduce((map, item) => {
    map[item.paragraph] = (map[item.paragraph] || 0) + 1 + (item.reactions?.warm || 0)
    return map
  }, {})
  return Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 3)
}

function getRevisitParagraph(messages) {
  const counts = messages.reduce((map, item) => {
    map[item.paragraph] = (map[item.paragraph] || 0) + (item.reactions?.revisit || 0)
    return map
  }, {})
  return Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 7)
}
