import { BookOpen, Leaf, MessageCircle, PenLine, Send, Settings, Sparkles, SunMedium, Trash2, Users, Waves } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { sampleTexts } from '../data/sampleTexts.js'
import { useReadingSession } from '../hooks/useReadingSession.js'

const recapFilters = ['全部', '我的', '共鸣', '慢读', '难读', '回看']
const resonanceFilters = ['全部', '共鸣', '慢读', '难读', '回看', '喜欢', '疑问']
const tagOptions = ['共鸣', '慢读', '难读', '回看', '喜欢', '疑问']
const feedFilters = ['全部', '共鸣', '慢读', '难读', '回看', '喜欢', '疑问']

const friendActivities = [
  {
    id: 'activity-1',
    user: '小林',
    avatar: '林',
    action: '完成了一次 18 分钟慢读',
    bookTitle: '《红楼梦》节选 · 雨后共读',
    detail: '她在第 5 段留下了关于“没说出口的话”的便签。',
    time: '5 分钟前',
    tag: '慢读',
  },
  {
    id: 'activity-2',
    user: 'Mia',
    avatar: 'M',
    action: '标记了一个难读概念',
    bookTitle: 'The Future of AI Research',
    detail: 'human-centered evaluation 被她放进了回看清单。',
    time: '12 分钟前',
    tag: '难读',
  },
  {
    id: 'activity-3',
    user: '阿南',
    avatar: '南',
    action: '分享了一条使用感受',
    bookTitle: 'Lodue 产品使用说明',
    detail: '他说阅读尺让长段落更容易跟住。',
    time: '18 分钟前',
    tag: '喜欢',
  },
  {
    id: 'activity-4',
    user: '顾北',
    avatar: '顾',
    action: '正在安静共读',
    bookTitle: '《红楼梦》雨后共读房',
    detail: '他停在第 7 段附近，正在看朋友们的讨论。',
    time: '刚刚',
    tag: '共鸣',
  },
]
const roomThemes = [
  { key: 'calm', label: '安静' },
  { key: 'ocean', label: '海浪' },
  { key: 'forest', label: '林间' },
  { key: 'dusk', label: '黄昏' },
  { key: 'custom', label: '自定义 · 待开放' },
]

const coReadingRooms = [
  {
    id: 'dream-room',
    title: '《红楼梦》雨后共读房',
    bookTitle: '《红楼梦》节选 · 雨后共读',
    status: '安静共读中',
    online: 6,
    progress: 68,
    resonanceCount: 18,
    latest: '小林在第 5 段留下共鸣',
    theme: 'ocean',
    textId: 'dream',
  },
  {
    id: 'ai-room',
    title: 'AI 论文慢读房',
    bookTitle: 'The Future of AI Research',
    status: '论文精读',
    online: 3,
    progress: 42,
    resonanceCount: 9,
    latest: 'Mia 标记了 human-centered evaluation',
    theme: 'calm',
    textId: 'ai',
  },
  {
    id: 'manual-room',
    title: 'Lodue 使用说明共读',
    bookTitle: 'Lodue 产品使用说明',
    status: '功能体验',
    online: 4,
    progress: 55,
    resonanceCount: 12,
    latest: '阿南正在讨论阅读尺',
    theme: 'forest',
    textId: 'manual',
  },
]

const resonanceTagStyles = {
  全部: { text: '#4B7C77', bg: 'rgba(126,207,196,0.12)', glow: 'rgba(126,207,196,0.16)', darkText: '#8FE6DB', darkBg: 'rgba(143,230,219,0.12)', darkGlow: 'rgba(143,230,219,0.16)' },
  感受: { text: '#B06B4F', bg: 'rgba(236,159,122,0.16)', glow: 'rgba(236,159,122,0.18)', darkText: '#FFD0B2', darkBg: 'rgba(255,208,178,0.13)', darkGlow: 'rgba(255,208,178,0.16)' },
  疑问: { text: '#4B86A0', bg: 'rgba(125,190,214,0.15)', glow: 'rgba(125,190,214,0.18)', darkText: '#A8DFF2', darkBg: 'rgba(168,223,242,0.13)', darkGlow: 'rgba(168,223,242,0.16)' },
  共鸣: { text: '#7C5BD6', bg: 'rgba(167,139,250,0.14)', glow: 'rgba(167,139,250,0.18)', darkText: '#D7C5FF', darkBg: 'rgba(215,197,255,0.14)', darkGlow: 'rgba(215,197,255,0.16)' },
  重点: { text: '#B98A32', bg: 'rgba(241,199,105,0.18)', glow: 'rgba(241,199,105,0.2)', darkText: '#FFE0A0', darkBg: 'rgba(255,224,160,0.14)', darkGlow: 'rgba(255,224,160,0.18)' },
  分歧: { text: '#4B7C77', bg: 'rgba(109,166,155,0.15)', glow: 'rgba(109,166,155,0.18)', darkText: '#9EDCD4', darkBg: 'rgba(158,220,212,0.13)', darkGlow: 'rgba(158,220,212,0.16)' },
}

const discussionTagStyles = {
  全部: {
    light: { text: '#4B7C77', bg: 'rgba(126,207,196,0.12)', border: 'rgba(126,207,196,0.30)', icon: '#4B7C77' },
    dark: { text: '#8FE6DB', bg: 'rgba(143,230,219,0.12)', border: 'rgba(143,230,219,0.26)', icon: '#8FE6DB' },
  },
  共鸣: {
    light: { text: '#3D9D92', bg: 'rgba(126,207,196,0.14)', border: 'rgba(126,207,196,0.34)', icon: '#3D9D92' },
    dark: { text: '#8FE6DB', bg: 'rgba(143,230,219,0.13)', border: 'rgba(143,230,219,0.28)', icon: '#8FE6DB' },
  },
  慢读: {
    light: { text: '#7C5BD6', bg: 'rgba(167,139,250,0.14)', border: 'rgba(167,139,250,0.32)', icon: '#7C5BD6' },
    dark: { text: '#D7C5FF', bg: 'rgba(215,197,255,0.13)', border: 'rgba(215,197,255,0.28)', icon: '#D7C5FF' },
  },
  难读: {
    light: { text: '#C2732E', bg: 'rgba(255,190,120,0.16)', border: 'rgba(255,190,120,0.36)', icon: '#C2732E' },
    dark: { text: '#FFD39A', bg: 'rgba(255,211,154,0.14)', border: 'rgba(255,211,154,0.30)', icon: '#FFD39A' },
  },
  回看: {
    light: { text: '#3A8FA8', bg: 'rgba(120,190,210,0.15)', border: 'rgba(120,190,210,0.34)', icon: '#3A8FA8' },
    dark: { text: '#9ADFF2', bg: 'rgba(154,223,242,0.13)', border: 'rgba(154,223,242,0.30)', icon: '#9ADFF2' },
  },
  喜欢: {
    light: { text: '#B85F84', bg: 'rgba(240,150,190,0.14)', border: 'rgba(240,150,190,0.32)', icon: '#B85F84' },
    dark: { text: '#F3B6CC', bg: 'rgba(243,182,204,0.13)', border: 'rgba(243,182,204,0.28)', icon: '#F3B6CC' },
  },
  疑问: {
    light: { text: '#607C90', bg: 'rgba(120,150,170,0.14)', border: 'rgba(120,150,170,0.30)', icon: '#607C90' },
    dark: { text: '#B8CCD8', bg: 'rgba(184,204,216,0.13)', border: 'rgba(184,204,216,0.26)', icon: '#B8CCD8' },
  },
}

const discussionTagPriority = ['难读', '回看', '疑问', '慢读', '共鸣', '喜欢']

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

export default function CommunityPage({ goTo, selectedText, sharedRecaps, setSharedRecaps, settings }) {
  const { readingSession } = useReadingSession()
  const [activeRoom, setActiveRoom] = useState('dream-room')
  const activeRoomConfig = coReadingRooms.find((room) => room.id === activeRoom) || coReadingRooms[0]
  const activeText = sampleTexts.find((text) => text.id === activeRoomConfig.textId) || selectedText || sampleTexts[0]
  const paragraphs = useMemo(() => splitParagraphs(activeText.content), [activeText.content])
  const isDark = settings?.theme === 'dark' || settings?.bg === 'dark'
  const [communityView, setCommunityView] = useState('home')
  const [selectedParagraph, setSelectedParagraph] = useState(Math.max(readingSession.currentParagraph + 1 || 3, 1))
  const [activeFilter, setActiveFilter] = useState('全部')
  const [activeResonanceTag, setActiveResonanceTag] = useState('全部')
  const [pendingDeleteRecap, setPendingDeleteRecap] = useState(null)
  const [roomTheme, setRoomTheme] = useState('calm')
  const [message, setMessage] = useState('')
  const [selectedTag, setSelectedTag] = useState('共鸣')
  const [chapterMessages, setChapterMessages] = useState(initialChapterMessages)
  const [joinedRooms, setJoinedRooms] = useState([])

  const paragraphCount = readingSession.textId === activeText.id ? readingSession.paragraphCount || paragraphs.length || 1 : paragraphs.length || 1
  const progress = readingSession.textId === activeText.id ? readingSession.progress || activeRoomConfig.progress : activeRoomConfig.progress
  const effectiveRecapFilter = activeResonanceTag !== '全部' ? activeResonanceTag : activeFilter
  const filteredRecaps = useMemo(() => filterRecaps(sharedRecaps || [], effectiveRecapFilter), [effectiveRecapFilter, sharedRecaps])
  const feedRecaps = useMemo(() => filterFeedRecaps(sharedRecaps || [], activeFilter), [activeFilter, sharedRecaps])
  const filteredActivities = useMemo(() => filterFriendActivities(friendActivities, activeFilter), [activeFilter])
  const feedStats = useMemo(() => buildFeedStats(sharedRecaps || [], friendActivities), [sharedRecaps])
  const resonanceStats = useMemo(() => buildResonanceStats([], chapterMessages), [chapterMessages])
  const recentRecaps = useMemo(() => (sharedRecaps || []).slice(0, 2), [sharedRecaps])
  const joinedRoomConfigs = useMemo(() => joinedRooms.map((id) => coReadingRooms.find((room) => room.id === id)).filter(Boolean), [joinedRooms])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [communityView])

  const setResonanceFilter = (tag) => {
    setActiveResonanceTag((current) => (current === tag ? '全部' : tag))
  }

  const handleReactRecap = (id, key) => {
    setSharedRecaps((list) => list.map((item) => (
      item.id === id
        ? { ...item, reactions: { ...item.reactions, [key]: (item.reactions?.[key] || 0) + 1 } }
        : item
    )))
  }

  const confirmDelete = () => {
    if (!pendingDeleteRecap?.isMine) return
    setSharedRecaps((list) => list.filter((item) => item.id !== pendingDeleteRecap.id))
    setPendingDeleteRecap(null)
  }

  const enterRoom = (paragraph = 1, roomId = activeRoom) => {
    const nextRoom = coReadingRooms.find((room) => room.id === roomId) || coReadingRooms[0]
    const nextText = sampleTexts.find((text) => text.id === nextRoom.textId) || selectedText || sampleTexts[0]
    const nextCount = splitParagraphs(nextText.content).length || 1
    setActiveRoom(nextRoom.id)
    setJoinedRooms((current) => (current.includes(nextRoom.id) ? current : [nextRoom.id, ...current]))
    setRoomTheme(nextRoom.theme)
    setSelectedParagraph(Math.min(Math.max(paragraph, 1), nextCount))
    setCommunityView('room')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    })
  }

  const sendMessage = () => {
    const text = message.trim()
    if (!text) return
    const paragraphText = paragraphs[selectedParagraph - 1]
    setChapterMessages((current) => [
      {
        id: Date.now(),
        paragraph: selectedParagraph,
        quote: getParagraphQuote(paragraphText),
        user: '我',
        avatar: '我',
        tag: selectedTag,
        mood: selectedTag === '难读' || selectedTag === '回看' ? 'focus' : selectedTag === '喜欢' ? 'warm' : 'calm',
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
      <section className={`community-page room-detail-shell room-detail-page room-theme-${roomTheme} ${isDark ? 'room-theme-dark' : ''}`}>
        <RoomAtmosphereBackground theme={roomTheme} isDark={isDark} />
        <RoomDetail
          selectedText={activeText}
          paragraphs={paragraphs}
          paragraphCount={paragraphCount}
          progress={progress}
          selectedParagraph={selectedParagraph}
          setSelectedParagraph={setSelectedParagraph}
          chapterMessages={chapterMessages}
          message={message}
          setMessage={setMessage}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onSend={sendMessage}
          onBack={() => {
            setCommunityView('home')
            setActiveResonanceTag('全部')
          }}
          sharedRecaps={sharedRecaps || []}
          resonanceStats={resonanceStats}
          activeResonanceTag={activeResonanceTag}
          setActiveResonanceTag={setResonanceFilter}
          roomTheme={roomTheme}
          setRoomTheme={setRoomTheme}
          room={activeRoomConfig}
          isDark={isDark}
        />
      </section>
    )
  }

  return (
    <section className="community-page">
      <PageHero eyebrow="Lodue 共读空间" title="共读空间">
        看见朋友的阅读复盘，也可以安静地进入同一本书。
      </PageHero>

      <CommunityHeroStats
        dynamicCount={(sharedRecaps || []).length + friendActivities.length}
        activeReaders={partners.filter((item) => item.progress < 100).length}
        roomCount={coReadingRooms.length}
        myShareCount={(sharedRecaps || []).filter((item) => item.isMine).length}
      />

      <div className="community-feed-layout">
        <main className="community-feed-main">
          <ReadingFeed
            recaps={feedRecaps}
            activeFilter={activeFilter}
            onReact={handleReactRecap}
            onDelete={setPendingDeleteRecap}
            onEnterRoom={enterRoom}
            onContinue={() => enterRoom(Math.max(readingSession.currentParagraph + 1 || 1, 1), activeRoom)}
            joinedRooms={joinedRoomConfigs}
          />

          <RecommendedRooms
            rooms={coReadingRooms}
            activeRoom={activeRoom}
            readingSession={readingSession}
            paragraphCount={paragraphCount}
            onEnter={enterRoom}
          />
        </main>

        <aside className="community-feed-side">
          <ResonanceIsland
            stats={feedStats}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            isDark={isDark}
          />
          <FriendActivity activities={filteredActivities} activeFilter={activeFilter} isDark={isDark} />
          {joinedRoomConfigs.length > 0 ? (
            <ContinueRoomCard rooms={joinedRoomConfigs} onEnter={enterRoom} />
          ) : null}
        </aside>
      </div>

      {pendingDeleteRecap ? (
        <DeleteConfirm recap={pendingDeleteRecap} onCancel={() => setPendingDeleteRecap(null)} onConfirm={confirmDelete} />
      ) : null}
    </section>
  )
}

function RoomDetail({
  selectedText,
  paragraphs,
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
  activeResonanceTag,
  setActiveResonanceTag,
  roomTheme,
  setRoomTheme,
  room,
  isDark,
}) {
  const roomParagraphItems = useMemo(() => paragraphs.map((text, index) => ({
    id: `paragraph-${index}`,
    index,
    text,
  })), [paragraphs])
  const groupedMessages = groupMessages(chapterMessages)
  const [expandedParagraph, setExpandedParagraph] = useState(null)
  const [activeRoomParagraph, setActiveRoomParagraph] = useState(Math.max(0, selectedParagraph - 1))
  const [mapHovering, setMapHovering] = useState(false)
  const [paragraphNodePositions, setParagraphNodePositions] = useState([])
  const paragraphRefs = useRef([])
  const roomArticleRef = useRef(null)
  const mapViewportRef = useRef(null)
  const mapNodeRefs = useRef([])
  const rightRailRef = useRef(null)
  const filterAnchorRef = useRef(null)
  const filterCardRef = useRef(null)
  const manualScrollTargetRef = useRef(null)
  const [filterFloating, setFilterFloating] = useState(false)
  const [filterHeight, setFilterHeight] = useState(286)
  const [floatingFilterStyle, setFloatingFilterStyle] = useState(null)
  const nearbyPartners = partners.filter((item) => Math.abs(item.paragraph - (activeRoomParagraph + 1)) <= 1)
  const discussedParagraphCount = Object.keys(groupedMessages).length
  const MAP_TOP_PADDING = 36
  const MAP_BOTTOM_PADDING = 64
  const NODE_MIN_GAP = 46
  const mapContentHeight = Math.max(860, roomParagraphItems.length * NODE_MIN_GAP + MAP_TOP_PADDING + MAP_BOTTOM_PADDING)

  const centerMapOnParagraph = (index, behavior = 'smooth') => {
    const viewport = mapViewportRef.current
    const target = mapNodeRefs.current[index]
    if (!viewport || !target) return
    const nextTop = target.offsetTop - (viewport.clientHeight / 2) + (target.clientHeight / 2)
    viewport.scrollTo({ top: Math.max(0, nextTop), behavior })
  }

  useEffect(() => {
    setActiveRoomParagraph(Math.max(0, selectedParagraph - 1))
  }, [selectedParagraph])

  useEffect(() => {
    paragraphRefs.current = paragraphRefs.current.slice(0, roomParagraphItems.length)
    mapNodeRefs.current = mapNodeRefs.current.slice(0, roomParagraphItems.length)
  }, [roomParagraphItems.length, room?.id])

  useEffect(() => {
    const updateMapPositions = () => {
      const article = roomArticleRef.current
      if (!article) return
      const articleHeight = Math.max(article.scrollHeight, 1)
      const rawPositions = roomParagraphItems.map((item, visualIndex) => {
        const index = item.index
        const node = paragraphRefs.current[index]
        const fallbackRatio = visualIndex / Math.max(roomParagraphItems.length - 1, 1)
        const ratio = node ? node.offsetTop / articleHeight : fallbackRatio
        return MAP_TOP_PADDING + ratio * (mapContentHeight - MAP_TOP_PADDING - MAP_BOTTOM_PADDING)
      })
      const positions = [...rawPositions]
      if (positions.length) {
        positions[0] = Math.max(MAP_TOP_PADDING, positions[0])
        for (let index = 1; index < positions.length; index += 1) {
          if (positions[index] - positions[index - 1] < NODE_MIN_GAP) {
            positions[index] = positions[index - 1] + NODE_MIN_GAP
          }
        }

        const bottomLimit = mapContentHeight - MAP_BOTTOM_PADDING
        const overflow = positions[positions.length - 1] + 40 - bottomLimit
        if (overflow > 0) {
          for (let index = 0; index < positions.length; index += 1) {
            positions[index] -= overflow
          }
        }
        if (positions[0] < MAP_TOP_PADDING) {
          const underflow = MAP_TOP_PADDING - positions[0]
          for (let index = 0; index < positions.length; index += 1) {
            positions[index] += underflow
          }
        }
      }
      setParagraphNodePositions(positions)
    }

    updateMapPositions()
    const timer = window.setTimeout(updateMapPositions, 120)
    window.addEventListener('resize', updateMapPositions)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', updateMapPositions)
    }
  }, [roomParagraphItems, expandedParagraph, mapContentHeight])

  useEffect(() => {
    const nodes = paragraphRefs.current.filter(Boolean)
    if (!nodes.length) return undefined

    const observer = new IntersectionObserver((entries) => {
      const anchorY = window.innerHeight * 0.38
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top - anchorY) - Math.abs(b.boundingClientRect.top - anchorY))[0]

      if (!current) return
      const paragraphIndex = Number(current.target.dataset.paragraphIndex)
      if (!Number.isFinite(paragraphIndex)) return
      if (manualScrollTargetRef.current !== null) return

      setActiveRoomParagraph(paragraphIndex)
      setSelectedParagraph(paragraphIndex + 1)
    }, {
      root: null,
      rootMargin: '-18% 0px -46% 0px',
      threshold: [0.18, 0.35, 0.55],
    })

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [roomParagraphItems.length, setSelectedParagraph])

  useEffect(() => {
    if (!mapHovering) {
      centerMapOnParagraph(activeRoomParagraph, 'smooth')
    }
  }, [activeRoomParagraph, mapHovering])

  useEffect(() => {
    const updateFloatingFilterPosition = () => {
      const anchor = filterAnchorRef.current
      const rail = rightRailRef.current
      if (!anchor || !rail) return
      const anchorRect = anchor.getBoundingClientRect()
      const railRect = rail.getBoundingClientRect()
      const cardHeight = filterCardRef.current?.offsetHeight
      if (cardHeight) {
        setFilterHeight(cardHeight)
      }
      setFilterFloating(anchorRect.top <= 96)
      setFloatingFilterStyle({
        left: railRect.left,
        width: railRect.width,
      })
    }

    updateFloatingFilterPosition()
    window.addEventListener('resize', updateFloatingFilterPosition)
    window.addEventListener('scroll', updateFloatingFilterPosition, { passive: true })
    return () => {
      window.removeEventListener('resize', updateFloatingFilterPosition)
      window.removeEventListener('scroll', updateFloatingFilterPosition)
    }
  }, [room?.id, activeResonanceTag])

  const scrollToParagraph = (index) => {
    const target = paragraphRefs.current[index]
    if (!target) return
    manualScrollTargetRef.current = index
    setActiveRoomParagraph(index)
    setSelectedParagraph(index + 1)
    setExpandedParagraph(null)
    const headerOffset = 96
    const rect = target.getBoundingClientRect()
    const absoluteTop = rect.top + window.scrollY
    const nextTop = Math.max(0, absoluteTop - headerOffset)
    window.scrollTo({
      top: nextTop,
      behavior: 'smooth',
    })
    window.setTimeout(() => {
      manualScrollTargetRef.current = null
    }, 700)
  }

  return (
    <div className="room-detail-content">
      <div className="room-detail-head">
        <Button variant="secondary" onClick={onBack}>返回共读空间</Button>
        <div>
          <div className="eyebrow">安静共读中</div>
          <h1>{room?.title || selectedText?.title || '共读房间'}</h1>
          <p>{room?.bookTitle || selectedText?.title} · 当前在线 {room?.online || 6} 人，今日共同进度 {progress}% · 当前氛围：{roomThemes.find((item) => item.key === roomTheme)?.label}</p>
        </div>
      </div>

      <div className="room-detail-grid">
        <aside className="room-left-rail">
        <Card className="room-paragraph-trail">
          <div className="paragraph-map-shell">
          <div className="paragraph-map-head">
            <div className="row-title compact">
              <BookOpen size={18} /> 段落地图
            </div>
            <p>按位置查看讨论</p>
            <div className="map-mini-status">
              <span>当前 {activeRoomParagraph + 1}/{roomParagraphItems.length}</span>
              <span>{discussedParagraphCount} 段有讨论</span>
            </div>
            <div className="map-progress" aria-hidden="true">
              <span style={{ width: `${Math.min(100, Math.max(0, ((activeRoomParagraph + 1) / Math.max(roomParagraphItems.length, 1)) * 100))}%` }} />
            </div>
          </div>
          <div
            ref={mapViewportRef}
            className="paragraph-map-viewport"
            onMouseEnter={() => setMapHovering(true)}
            onMouseLeave={() => {
              setMapHovering(false)
              requestAnimationFrame(() => centerMapOnParagraph(activeRoomParagraph, 'smooth'))
            }}
          >
            <div className="paragraph-map-content" style={{ height: `${mapContentHeight}px` }}>
            {roomParagraphItems.map((item) => {
              const paragraph = item.index + 1
              const paragraphMessages = groupedMessages[paragraph] || []
              const count = paragraphMessages.length
              const revisit = chapterMessages.filter((item) => item.paragraph === paragraph && item.reactions.revisit > 0).length
              const primaryTag = getPrimaryDiscussionTag(paragraphMessages, activeResonanceTag)
              const tagStyle = getDiscussionTagInlineStyle(primaryTag || '全部', isDark)
              const title = `第 ${paragraph} 段 · ${count ? `${count} 条讨论` : '暂无讨论'}${primaryTag ? ` · ${primaryTag}` : ''}${revisit ? ' · 有人回看' : ''}`
              return (
                <button
                  key={item.id}
                  data-paragraph-index={item.index}
                  ref={(node) => { mapNodeRefs.current[item.index] = node }}
                  className={`map-node ${activeRoomParagraph === item.index ? 'active' : ''} ${count ? 'has-discussion' : ''}`}
                  title={title}
                  style={{ top: `${paragraphNodePositions[item.index] ?? (MAP_TOP_PADDING + ((item.index + 0.5) / Math.max(roomParagraphItems.length, 1)) * (mapContentHeight - MAP_TOP_PADDING - MAP_BOTTOM_PADDING))}px` }}
                  onClick={() => scrollToParagraph(item.index)}
                >
                  <span className="map-line" />
                  <span className="map-dot" style={count ? { background: tagStyle.color, boxShadow: `0 0 0 5px ${tagStyle.background}` } : undefined} />
                  <span className="map-index">{paragraph}</span>
                  {count ? <span className="map-count" style={{ color: tagStyle.color, background: tagStyle.background, borderColor: tagStyle.borderColor }}>{count}</span> : null}
                </button>
              )
            })}
            </div>
          </div>
          </div>
        </Card>
        </aside>

        <main className="room-reading-main community-main">
          <Card className="room-long-text-card">
            <div className="between mb18">
              <div>
                <div className="row-title compact">长文本共读</div>
                <div className="small muted">附近有 {nearbyPartners.length} 位伙伴正在读或回看。</div>
              </div>
              <span className="tag">第 {activeRoomParagraph + 1} 段附近</span>
            </div>
            <div className="room-long-text" ref={roomArticleRef}>
              {roomParagraphItems.map((item) => {
                const paragraphNumber = item.index + 1
                const paragraph = item.text
                const rawMessages = groupedMessages[paragraphNumber] || []
                const messageTags = getParagraphDiscussionTags(rawMessages)
                const messages = filterMessages(rawMessages, activeResonanceTag)
                const isExpanded = expandedParagraph === paragraphNumber
                const isSelected = activeRoomParagraph === item.index
                const activeTagForParagraph = activeResonanceTag !== '全部' ? activeResonanceTag : messageTags[0] || '全部'
                const primaryTag = getPrimaryDiscussionTag(rawMessages, activeResonanceTag)
                const primaryStyle = getDiscussionTagInlineStyle(primaryTag || '全部', isDark)
                const fallbackStyle = getDiscussionTagInlineStyle('全部', isDark)
                return (
                  <section
                    ref={(node) => { paragraphRefs.current[item.index] = node }}
                    data-paragraph-index={item.index}
                    className={`co-read-paragraph ${isSelected ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
                    key={item.id}
                  >
                    <div
                      className="co-read-paragraph-body"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setActiveRoomParagraph(item.index)
                        setSelectedParagraph(paragraphNumber)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setActiveRoomParagraph(item.index)
                          setSelectedParagraph(paragraphNumber)
                        }
                      }}
                    >
                      <span className="co-read-index">{String(paragraphNumber).padStart(2, '0')}</span>
                      <span className="co-read-text">{paragraph}</span>
                      {rawMessages.length ? (
                        <button
                          className={`paragraph-discussion-trigger ${activeResonanceTag !== '全部' && messages.length ? 'matched' : ''} ${activeResonanceTag !== '全部' && !messages.length ? 'dimmed' : ''}`}
                          type="button"
                          title={`${messages.length || rawMessages.length} 条讨论 · ${primaryTag || '全部'}`}
                          style={primaryStyle}
                          onClick={(event) => {
                            event.stopPropagation()
                            setActiveRoomParagraph(item.index)
                            setSelectedParagraph(paragraphNumber)
                            setExpandedParagraph(isExpanded ? null : paragraphNumber)
                          }}
                        >
                          <MessageCircle size={15} color={primaryStyle.color} />
                          <span>{messages.length || rawMessages.length}</span>
                        </button>
                      ) : (
                        <button
                          className="paragraph-discussion-trigger add-trigger"
                          type="button"
                          title="添加讨论"
                          style={fallbackStyle}
                          onClick={(event) => {
                            event.stopPropagation()
                            setActiveRoomParagraph(item.index)
                            setSelectedParagraph(paragraphNumber)
                            setExpandedParagraph(isExpanded ? null : paragraphNumber)
                          }}
                        >
                          <MessageCircle size={14} color={fallbackStyle.color} />
                        </button>
                      )}
                    </div>
                    {isExpanded ? (
                      <div className="co-read-thread" style={getThreadInlineStyle(activeTagForParagraph, isDark)}>
                        <div className="between mb18">
                          <strong>第 {paragraphNumber} 段讨论</strong>
                          <span className="tag" style={getDiscussionTagInlineStyle(activeResonanceTag, isDark)}>
                            {activeResonanceTag === '全部' ? '全部回应' : activeResonanceTag}
                          </span>
                        </div>
                        {messages.length ? messages.map((item) => <MessageItem item={item} key={item.id} />) : (
                          <div className="note-empty resonance-empty" style={getDiscussionTagInlineStyle(activeResonanceTag, isDark)}>
                            <MessageCircle size={15} color={getDiscussionTagInlineStyle(activeResonanceTag, isDark).color} />
                            这个标签下还没有共读回应。
                          </div>
                        )}
                        <SharedNoteComposer
                          selectedParagraph={paragraphNumber}
                          setSelectedParagraph={setSelectedParagraph}
                          paragraphCount={paragraphCount}
                          message={message}
                          setMessage={setMessage}
                          selectedTag={selectedTag}
                          setSelectedTag={setSelectedTag}
                          onSend={onSend}
                        />
                      </div>
                    ) : null}
                  </section>
                )
              })}
            </div>
          </Card>
        </main>

        <aside ref={rightRailRef} className="room-right-rail">
          <div ref={filterAnchorRef} className="discussion-filter-anchor">
            {!filterFloating ? (
              <div ref={filterCardRef} className="discussion-filter-inline">
                <DiscussionTagPanel
                  stats={resonanceStats}
                  activeFilter={activeResonanceTag}
                  setActiveFilter={setActiveResonanceTag}
                  isDark={isDark}
                />
              </div>
            ) : (
              <div className="discussion-filter-placeholder" style={{ height: filterHeight }} aria-hidden="true" />
            )}
          </div>
          <div className="discussion-filter-mobile">
            <DiscussionTagPanel
              stats={resonanceStats}
              activeFilter={activeResonanceTag}
              setActiveFilter={setActiveResonanceTag}
              isDark={isDark}
              commonTag={resonanceStats[0]?.tag || '共鸣'}
            />
          </div>
          <RoomThemePicker roomTheme={roomTheme} setRoomTheme={setRoomTheme} />
          <RoomSideStatus
            partners={partners}
            paragraphCount={paragraphCount}
            totalReaders={18}
            topParagraph={getTopParagraph(chapterMessages)}
            revisitParagraph={getRevisitParagraph(chapterMessages)}
            commonTag={resonanceStats[0]?.tag || '共鸣'}
            nextParagraph={Math.min(activeRoomParagraph + 2, paragraphCount)}
            latestRecap={sharedRecaps?.[0]}
          />
        </aside>
      </div>
      {filterFloating && floatingFilterStyle && typeof document !== 'undefined' ? createPortal(
        <div
          className={`discussion-filter-floating ${isDark ? 'is-dark' : ''}`}
          style={{
            left: floatingFilterStyle.left,
            width: floatingFilterStyle.width,
          }}
        >
          <div className="discussion-filter-floating-inner">
            <DiscussionTagPanel
              stats={resonanceStats}
              activeFilter={activeResonanceTag}
              setActiveFilter={setActiveResonanceTag}
              isDark={isDark}
            />
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  )
}

function CoReadingRoomCard({ room, active, currentParagraph, paragraphCount, onEnter }) {
  return (
    <Card className={`co-room-card ${active ? 'active-room' : ''}`}>
      <div className="co-room-head">
        <span className="tag active">{room.status}</span>
        <Users size={22} />
      </div>
      <h2>{room.title}</h2>
      <p className="muted">{room.bookTitle}</p>
      <div className="room-progress">
        <span style={{ width: `${Math.min(100, Math.max(0, room.progress))}%` }} />
      </div>
      <div className="room-metrics">
        <RoomMetric label="当前在线" value={`${room.online} 人`} />
        <RoomMetric label="共同进度" value={`${room.progress}%`} />
        <RoomMetric label="共鸣回应" value={`${room.resonanceCount} 条`} />
        <RoomMetric label="房间氛围" value={roomThemes.find((theme) => theme.key === room.theme)?.label || '安静'} />
      </div>
      <div className="my-co-state">
        {room.latest}。你在第 {Math.max(currentParagraph + 1, 1)} / {Math.max(paragraphCount, 1)} 段附近，可以进入房间查看相邻段落的轻回应。
      </div>
      <Button className="w-full" onClick={onEnter}>进入共读房间</Button>
    </Card>
  )
}

function CommunityRecapHub({ latestRecap, progress, room, onEnter }) {
  return (
    <Card className="community-recap-hub">
      <div className="recap-hub-main">
        <span className="tag active">今日 / 最近共读复盘</span>
        <h2>{latestRecap ? latestRecap.bookTitle : room.bookTitle}</h2>
        <p>
          {latestRecap
            ? latestRecap.rhythmSummary
            : '还没有新的分享复盘，可以先进入共读房间继续阅读，再把阅读总结带回这里。'}
        </p>
        <div className="recap-hub-meta">
          <span>当前房间：{room.title}</span>
          <span>共读进度 {progress}%</span>
          {latestRecap ? <span>最近分享：{latestRecap.owner}</span> : null}
        </div>
      </div>
      <div className="recap-hub-actions">
        <Button onClick={onEnter}>继续共读</Button>
        <Button variant="secondary" onClick={onEnter}>进入共读房间</Button>
        <button type="button" className="quiet-create-btn">创建共读 · 原型待开放</button>
      </div>
    </Card>
  )
}

function CommunityHeroStats({ dynamicCount, activeReaders, roomCount, myShareCount }) {
  const stats = [
    ['今日阅读动态', `${dynamicCount} 条`],
    ['好友正在读', `${activeReaders} 人`],
    ['推荐共读房', `${roomCount} 个`],
    ['我的分享', `${myShareCount} 条`],
  ]
  return (
    <div className="community-hero-stats">
      {stats.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function ReadingFeed({ recaps, activeFilter, onReact, onDelete, onEnterRoom, onContinue, joinedRooms = [] }) {
  const hasJoinedRoom = joinedRooms.length > 0
  return (
    <Card className="reading-feed-card">
      <div className="reading-feed-head">
        <div>
          <div className="row-title compact">
            <Sparkles size={18} /> 阅读复盘墙
          </div>
          <p>朋友们最近读过、讨论过、标记过的内容，会在这里沉淀成安静的阅读动态。</p>
        </div>
        <div className="reading-feed-actions">
          {hasJoinedRoom ? <Button onClick={onContinue}>继续上次共读</Button> : null}
          <Button variant="secondary" onClick={onContinue}>创建共读房间</Button>
        </div>
      </div>

      <div className="reading-feed-filter-note">
        {activeFilter === '全部' ? '正在查看全部阅读动态' : `正在查看：${activeFilter}`}
      </div>

      <div className="reading-feed-list">
        {recaps.length ? recaps.map((recap) => (
          <article className={`reading-feed-item ${recap.isMine ? 'is-mine' : ''}`} key={recap.id}>
            <div className="feed-item-head">
              <div className="avatar">{recap.avatar}</div>
              <div>
                <strong>{recap.owner}</strong>
                <span>{getFeedSentence(recap)} · {recap.sharedAt}</span>
              </div>
              {recap.isMine ? (
                <button className="delete-recap-btn" onClick={() => onDelete(recap)} title="删除分享">
                  <Trash2 size={15} /> 删除分享
                </button>
              ) : null}
            </div>

            <h3>{recap.bookTitle}</h3>
            <div className="feed-meta-grid">
              <span>模式 {recap.mode}</span>
              <span>进度 {recap.progress}%</span>
              <span>时长 {recap.durationText}</span>
              <span>便签 {recap.notesCount} · 难读 {recap.difficultCount}</span>
            </div>

            <p className="feed-rhythm">{recap.rhythmSummary}</p>
            <blockquote>{recap.quote}</blockquote>
            <p>{recap.insight}</p>

            <div className="keyword-cloud feed-tags">
              {(recap.tags || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
            </div>

            <div className="feed-actions-row">
              <div className="quick community-reactions">
                <button onClick={() => onReact(recap.id, 'resonance')}>有同感 · {recap.reactions?.resonance || 0}</button>
                <button onClick={() => onReact(recap.id, 'wantRead')}>我也想读 · {recap.reactions?.wantRead || recap.reactions?.readTogether || 0}</button>
                <button onClick={() => onReact(recap.id, 'revisit')}>想回看 · {recap.reactions?.revisit || 0}</button>
              </div>
              <Button variant="secondary" onClick={() => onEnterRoom(recap.highlightParagraph)}>进入共读房间</Button>
            </div>
          </article>
        )) : (
          <div className="note-empty">这个标签下还没有阅读动态。</div>
        )}
      </div>
    </Card>
  )
}

function ContinueRoomCard({ rooms, onEnter }) {
  const room = rooms[0]
  if (!room) return null
  return (
    <Card className="continue-room-card">
      <div className="row-title compact">
        <BookOpen size={18} /> 继续共读
      </div>
      <h3>{room.title}</h3>
      <p>{room.latest}</p>
      <div className="room-progress">
        <span style={{ width: `${Math.min(100, Math.max(0, room.progress))}%` }} />
      </div>
      <Button className="w-full" onClick={() => onEnter(1, room.id)}>回到这个房间</Button>
    </Card>
  )
}

function FriendActivity({ activities, activeFilter, isDark }) {
  const activeStyle = getFeedTagStyle(activeFilter, isDark)
  return (
    <Card className="friend-activity-card">
      <div className="row-title compact">
        <BookOpen size={18} /> 好友阅读动态
      </div>
      <div className="small muted">这些是个人阅读动作，不是房间聊天消息。</div>
      {activeFilter !== '全部' ? (
        <div className="resonance-active-hint" style={activeStyle}>
          <MessageCircle size={15} color={activeStyle.color} />
          正在查看：{activeFilter} · 共 {activities.length} 条动态
        </div>
      ) : null}
      <div className="friend-activity-list">
        {activities.length ? activities.map((item) => {
          const style = getFeedTagStyle(item.tag, isDark)
          return (
            <div className="friend-activity-item" key={item.id}>
              <div className="avatar">{item.avatar}</div>
              <div>
                <strong>{item.user}</strong>
                <p>{item.action}</p>
                <span>{item.bookTitle} · {item.detail}</span>
                <div className="friend-activity-foot">
                  <i style={{ background: style.color, boxShadow: `0 0 0 5px ${style['--tag-glow']}` }} />
                  <em style={{ color: style.color }}>{item.tag}</em>
                  <small>{item.time}</small>
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="note-empty resonance-empty" style={activeStyle}>
            <MessageCircle size={15} color={activeStyle.color} />
            这个标签下还没有好友阅读动态。
          </div>
        )}
      </div>
    </Card>
  )
}

function ResonanceIsland({ stats, activeFilter, setActiveFilter, isDark = false }) {
  const activeStyle = getFeedTagStyle(activeFilter, isDark)
  return (
    <Card className="resonance-map feed-resonance-panel">
      <div className="row-title compact">
        <Sparkles size={18} /> 共鸣筛选
      </div>
      <div className="small muted">筛选阅读复盘墙和好友动态，不进入房间留言流。</div>
      <div className="resonance-active-hint" style={activeStyle}>
        <MessageCircle size={15} color={activeStyle.color} />
        正在查看：{activeFilter} · 共 {stats.find((item) => item.tag === activeFilter)?.count || 0} 条动态
      </div>
      <div className="feed-filter-chips">
        {feedFilters.map((tag) => {
          const style = getFeedTagStyle(tag, isDark)
          const active = activeFilter === tag
          return (
            <button
              key={tag}
              className={active ? 'active' : ''}
              style={active ? style : undefined}
              onClick={() => setActiveFilter(active ? '全部' : tag)}
            >
              <span>{tag}</span>
              <strong>{stats.find((item) => item.tag === tag)?.count || 0}</strong>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function RecommendedRooms({ rooms, activeRoom, readingSession, paragraphCount, onEnter }) {
  return (
    <section className="recommended-rooms">
      <div className="section-block-title">
        <h2>推荐共读房间</h2>
        <p>阅读动态看完后，可以安静地进入具体房间，继续围绕段落共读。</p>
      </div>
      <div className="recommended-room-list">
        {rooms.map((room) => (
          <CoReadingRoomCard
            key={room.id}
            room={room}
            active={room.id === activeRoom}
            currentParagraph={room.id === activeRoom ? readingSession.currentParagraph || 0 : 0}
            paragraphCount={sampleTexts.find((text) => text.id === room.textId)?.content.split('\n').filter(Boolean).length || paragraphCount}
            onEnter={() => onEnter(1, room.id)}
          />
        ))}
      </div>
    </section>
  )
}

function SharedRecapWall({
  recaps,
  activeFilter,
  setActiveFilter,
  onReact,
  onDelete,
  onEnterRoom,
  title = '共读复盘墙',
  description = '每张卡都来自一次阅读总结，锚定到段落和阅读行为。',
  showActions = false,
  featured = false,
  onContinue,
}) {
  return (
    <Card className={`shared-recap-wall ${featured ? 'featured' : ''}`}>
      <div className="between mb18">
        <div>
          <div className="row-title compact">
            <Sparkles size={18} /> {title}
          </div>
          <div className="small muted">{description}</div>
        </div>
        <span className="tag">{recaps.length} 条</span>
      </div>
      {showActions ? (
        <div className="recap-wall-actions">
          <Button onClick={onContinue}>继续上次共读</Button>
          <Button variant="secondary" onClick={onContinue}>创建共读房间</Button>
        </div>
      ) : (
        <div className="comment-filters">
          {recapFilters.map((filter) => (
            <button key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>
          ))}
        </div>
      )}
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
                <button className="delete-recap-btn" onClick={() => onDelete(recap)} title="删除分享">
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
        )) : <div className="note-empty">这个标签下还没有共读回应。</div>}
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

function ResonanceMap({ stats, activeFilter, setActiveFilter, isDark = false }) {
  const withAll = [{ tag: '全部', count: stats.reduce((sum, item) => sum + item.count, 0) }, ...stats]
  const activeStyle = getTagInlineStyle(activeFilter, isDark)
  return (
    <Card className="resonance-map">
      <div className="row-title compact">
        <Sparkles size={18} /> 共鸣浮岛
      </div>
      <div className="resonance-active-hint" style={activeStyle}>
        <MessageCircle size={15} color={activeStyle.color} />
        正在查看：{activeFilter} · 共 {withAll.find((item) => item.tag === activeFilter)?.count || 0} 条回应
      </div>
      <div className="resonance-islands">
        {withAll.map((item, index) => (
          <button
            key={item.tag}
            className={`resonance-island island-${index % 3} ${activeFilter === item.tag ? 'active' : ''}`}
            style={activeFilter === item.tag ? getTagInlineStyle(item.tag, isDark) : undefined}
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

function DiscussionTagPanel({ stats, activeFilter, setActiveFilter, isDark = false }) {
  const withAll = resonanceFilters.map((tag) => ({
    tag,
    count: tag === '全部' ? stats.reduce((sum, item) => sum + item.count, 0) : stats.find((item) => item.tag === tag)?.count || 0,
  }))
  const activeStyle = getDiscussionTagInlineStyle(activeFilter, isDark)
  return (
    <Card className="discussion-tag-panel">
      <div className="row-title compact">
        <MessageCircle size={18} color={activeStyle.color} /> 段落讨论标签
      </div>
      <div className="discussion-tag-hint" style={activeStyle}>
        <MessageCircle size={15} color={activeStyle.color} />
        正在查看：{activeFilter} · 共 {withAll.find((item) => item.tag === activeFilter)?.count || 0} 条讨论
      </div>
      <div className="discussion-tag-list">
        {withAll.map((item) => (
          <button
            key={item.tag}
            className={activeFilter === item.tag ? 'active' : ''}
            style={activeFilter === item.tag ? getDiscussionTagInlineStyle(item.tag, isDark) : undefined}
            onClick={() => setActiveFilter(activeFilter === item.tag ? '全部' : item.tag)}
          >
            <span>{item.tag}</span>
            <strong>{item.count}</strong>
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

function RoomSideStatus({ partners, paragraphCount, totalReaders, topParagraph, revisitParagraph, commonTag, nextParagraph, latestRecap }) {
  return (
    <Card className="room-side-status shared-recap">
      <div className="row-title compact">伙伴状态 / 房间小结</div>
      <div className="mini-presence-list">
        {partners.slice(0, 4).map((partner) => (
          <div className="mini-presence-item" key={partner.name}>
            <div className="avatar small-avatar">{partner.avatar}</div>
            <div>
              <strong>{partner.name}</strong>
              <span>{partner.status} · 第 {partner.paragraph} / {paragraphCount} 段附近</span>
            </div>
          </div>
        ))}
      </div>
      <div className="recap-list compact-recap-list">
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

function RoomThemePicker({ roomTheme, setRoomTheme }) {
  const isRoomOwner = true
  const [customHint, setCustomHint] = useState(false)
  const IconMap = { calm: Sparkles, ocean: Waves, forest: Leaf, dusk: SunMedium, custom: Settings }
  const handleThemeClick = (theme) => {
    if (theme.key === 'custom') {
      setCustomHint(true)
      window.setTimeout(() => setCustomHint(false), 1800)
      return
    }
    setRoomTheme(theme.key)
  }
  return (
    <Card className="room-theme-picker">
      <div className="row-title compact">
        <Waves size={17} /> 房间氛围
      </div>
      {isRoomOwner ? (
        <div className="room-theme-options">
          {roomThemes.map((theme) => {
            const Icon = IconMap[theme.key] || Sparkles
            const disabled = theme.key === 'custom'
            return (
            <button key={theme.key} className={roomTheme === theme.key ? 'active' : ''} aria-disabled={disabled} title={disabled ? '自定义氛围待开放' : theme.label} onClick={() => handleThemeClick(theme)}>
              <Icon size={14} />
              {theme.label}
            </button>
          )})}
        </div>
      ) : <div className="small muted">当前氛围：{roomThemes.find((item) => item.key === roomTheme)?.label}</div>}
      {customHint ? <div className="room-theme-hint">自定义氛围待开放</div> : null}
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

function DeleteConfirm({ recap, onCancel, onConfirm }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="community-confirm-backdrop" onClick={onCancel}>
      <div className="community-confirm-card" onClick={(event) => event.stopPropagation()}>
        <strong>确认删除这条共读复盘吗？</strong>
        <p>删除后，共读空间将不再显示它，但不会影响你的本地阅读总结。</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>取消</Button>
          <Button onClick={onConfirm}>确认删除</Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function RoomAtmosphereBackground({ theme, isDark }) {
  if (theme === 'ocean') {
    return (
      <div className={`room-atmosphere-background room-atmosphere-ocean ${isDark ? 'is-dark' : ''}`} aria-hidden="true">
        <span className="room-wave room-wave-1" />
        <span className="room-wave room-wave-2" />
        <span className="room-wave room-wave-3" />
      </div>
    )
  }

  if (theme === 'forest') {
    return (
      <div className={`room-atmosphere-background room-atmosphere-forest ${isDark ? 'is-dark' : ''}`} aria-hidden="true">
        <span className="room-leaf-shadow room-leaf-shadow-1" />
        <span className="room-leaf-shadow room-leaf-shadow-2" />
        <span className="room-leaf-dot room-leaf-dot-1" />
        <span className="room-leaf-dot room-leaf-dot-2" />
      </div>
    )
  }

  if (theme === 'dusk') {
    return (
      <div className={`room-atmosphere-background room-atmosphere-dusk ${isDark ? 'is-dark' : ''}`} aria-hidden="true">
        <span className="room-dusk-glow room-dusk-glow-1" />
        <span className="room-dusk-glow room-dusk-glow-2" />
        <span className="room-dusk-haze" />
      </div>
    )
  }

  return (
    <div className={`room-atmosphere-background room-atmosphere-calm ${isDark ? 'is-dark' : ''}`} aria-hidden="true">
      <span className="room-calm-glow" />
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

function getFeedSentence(recap) {
  if (recap.isMine) return '我刚刚分享了一次阅读复盘'
  if (recap.tags?.some((tag) => tagMatchesFilter(tag, '慢读'))) return `${recap.owner} 完成了一次慢读复盘`
  if (recap.tags?.some((tag) => tagMatchesFilter(tag, '难读'))) return `${recap.owner} 分享了一个难读标记`
  if (recap.tags?.some((tag) => tagMatchesFilter(tag, '回看'))) return `${recap.owner} 标记了一段想回看的内容`
  return `${recap.owner} 分享了一条阅读复盘`
}

function getFeedTagStyle(tag, isDark = false) {
  const normalized = normalizeDiscussionTag(tag)
  return getTagInlineStyle(normalized, isDark)
}

function getDiscussionTagInlineStyle(tag, isDark = false) {
  const palette = discussionTagStyles[normalizeDiscussionTag(tag)] || discussionTagStyles.全部
  const theme = isDark ? palette.dark : palette.light
  return {
    color: theme.text,
    background: theme.bg,
    borderColor: theme.border,
    '--tag-glow': theme.bg,
    '--tag-icon': theme.icon,
  }
}

function getTagInlineStyle(tag, isDark = false) {
  const direct = discussionTagStyles[normalizeDiscussionTag(tag)]
  if (direct) return getDiscussionTagInlineStyle(tag, isDark)
  const palette = resonanceTagStyles[normalizeDiscussionTag(tag)] || resonanceTagStyles.全部
  return {
    color: isDark ? palette.darkText : palette.text,
    background: isDark ? palette.darkBg : palette.bg,
    borderColor: isDark ? palette.darkText : palette.text,
    '--tag-glow': isDark ? palette.darkGlow : palette.glow,
  }
}

function getThreadInlineStyle(tag, isDark = false) {
  const style = getDiscussionTagInlineStyle(tag, isDark)
  return {
    borderColor: style.borderColor,
    boxShadow: `0 18px 42px ${style['--tag-glow']}`,
  }
}

function normalizeDiscussionTag(tag) {
  if (tag === '感受' || tag === '喜欢' || tag === '雨声' || tag === '心事') return '喜欢'
  if (tag === '重点' || tag === '难读' || tag === '便签') return '难读'
  if (tag === '慢读') return '慢读'
  if (tag === '回看') return '回看'
  if (tag === '疑问') return '疑问'
  if (tag === '分歧') return '回看'
  if (tag === '全部') return '全部'
  return '共鸣'
}

function getParagraphDiscussionTags(messages) {
  return [...new Set(messages.map((message) => normalizeDiscussionTag(message.tag)))]
}

function getPrimaryDiscussionTag(messages, activeFilter) {
  if (!messages.length) return null
  const normalizedActive = normalizeDiscussionTag(activeFilter)
  const counts = messages.reduce((map, item) => {
    const tag = normalizeDiscussionTag(item.tag)
    map[tag] = (map[tag] || 0) + 1
    return map
  }, {})
  if (normalizedActive !== '全部' && counts[normalizedActive]) return normalizedActive
  return Object.entries(counts).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]
    return discussionTagPriority.indexOf(a[0]) - discussionTagPriority.indexOf(b[0])
  })[0]?.[0] || null
}

function filterRecaps(recaps, filter) {
  if (filter === '全部') return recaps
  if (filter === '我的') return recaps.filter((item) => item.isMine)
  return recaps.filter((item) => item.tags?.some((tag) => normalizeDiscussionTag(tag) === filter))
}

function filterFeedRecaps(recaps, filter) {
  if (filter === '全部') return recaps
  return recaps.filter((item) => item.tags?.some((tag) => tagMatchesFilter(tag, filter)))
}

function filterFriendActivities(activities, filter) {
  if (filter === '全部') return activities
  return activities.filter((item) => tagMatchesFilter(item.tag, filter))
}

function buildFeedStats(recaps, activities) {
  return feedFilters.map((tag) => {
    if (tag === '全部') {
      return { tag, count: recaps.length + activities.length }
    }
    const recapCount = recaps.filter((item) => item.tags?.some((recapTag) => tagMatchesFilter(recapTag, tag))).length
    const activityCount = activities.filter((item) => tagMatchesFilter(item.tag, tag)).length
    return { tag, count: recapCount + activityCount }
  })
}

function tagMatchesFilter(tag, filter) {
  if (filter === '全部') return true
  if (tag === filter) return true
  const normalizedTag = normalizeDiscussionTag(tag)
  const normalizedFilter = normalizeDiscussionTag(filter)
  if (normalizedTag === normalizedFilter) return true
  if (filter === '慢读' && tag === '舒缓') return true
  if (filter === '喜欢' && normalizedTag === '感受') return true
  if (filter === '难读' && normalizedTag === '重点') return true
  if (filter === '回看' && (tag === '回看' || tag === '便签')) return true
  return false
}

function filterMessages(messages, filter) {
  if (filter === '全部') return messages
  const normalizedFilter = normalizeDiscussionTag(filter)
  return messages.filter((item) => normalizeDiscussionTag(item.tag) === normalizedFilter || (normalizedFilter === '回看' && item.reactions?.revisit > 0))
}

function buildResonanceStats(recaps, messages) {
  const counts = { 共鸣: 0, 慢读: 0, 难读: 0, 回看: 0, 喜欢: 0, 疑问: 0 }
  recaps.forEach((recap) => recap.tags?.forEach((tag) => {
    const normalized = normalizeDiscussionTag(tag)
    if (normalized in counts) counts[normalized] += 1
  }))
  messages.forEach((message) => {
    const normalized = normalizeDiscussionTag(message.tag)
    if (normalized in counts) counts[normalized] += 1
    if (message.reactions?.revisit) counts.回看 += message.reactions.revisit
  })
  return resonanceFilters.filter((tag) => tag !== '全部').map((tag) => ({ tag, count: counts[tag] || 0 }))
}

function groupMessages(messages) {
  return messages.reduce((groups, item) => {
    groups[item.paragraph] = groups[item.paragraph] || []
    groups[item.paragraph].push(item)
    return groups
  }, {})
}

function getParagraphQuote(paragraph = '') {
  const clean = paragraph.trim()
  if (!clean) return '这一段像是把心事轻轻放在纸面上。'
  return clean.length > 52 ? `${clean.slice(0, 52)}……` : clean
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

function splitParagraphs(content = '') {
  return content.split('\n').map((item) => item.trim()).filter(Boolean)
}
