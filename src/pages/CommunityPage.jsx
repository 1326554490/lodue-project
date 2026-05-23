import { Users } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { activityItems } from '../data/community.js'
import { useReadingSession } from '../hooks/useReadingSession.js'

export default function CommunityPage({ goTo, community, setCommunity, selectedText }) {
  const [message, setMessage] = useState('')
  const { readingSession } = useReadingSession()

  const sendMessage = () => {
    const text = message.trim()
    if (!text) return
    setCommunity((current) => [{ name: '我', text, tag: '新留言' }, ...current])
    setMessage('')
  }

  return (
    <section>
      <PageHero eyebrow="轻社交陪伴系统" title="和朋友一起慢慢读">
        Lodue 不强调热闹聊天，而是通过共读房间、章节留言和安静打卡，让阅读产生有人同行的陪伴感。
      </PageHero>

      <div className="split">
        <div>
          <Card className="room-card mb18">
            <div className="room-hero">
              <div className="between">
                <span className="tag active">今晚共读房间</span>
                <Users size={24} />
              </div>
              <h2>{selectedText.title}</h2>
              <p>安静房间 / 可见状态 / 不强制聊天</p>
            </div>
            <div className="room-stats">
              <RoomStat label="正在阅读" value="6 人" />
              <RoomStat label="我的进度" value={`${readingSession.progress}%`} />
              <RoomStat label="当前段落" value={`${readingSession.currentParagraph + 1} / ${readingSession.paragraphCount || 1}`} />
              <RoomStat label="共鸣留言" value={`${community.length + readingSession.notes.length + 15} 条`} />
            </div>
            <div className="room-action">
              <Button className="w-full">进入共读房间</Button>
            </div>
          </Card>

          <Card>
            <h3 className="card-title">好友阅读动态</h3>
            <div className="activity-list">
              {activityItems.map((item) => (
                <div className="activity" key={`${item.name}-${item.time}`}>
                  <div className="avatar">{item.name[0]}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <div className="small muted">{item.detail}</div>
                    <div className="small muted">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="mb18">
            <div className="between mb18">
              <strong>章节留言</strong>
              <span className="tag">第 1 章</span>
            </div>
            <div className="message-row">
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="写一句轻轻的回应..." />
              <Button onClick={sendMessage}>发送</Button>
            </div>
            <div className="community-list">
              {community.map((item, index) => (
                <div className="msg-card" key={`${item.name}-${item.text}-${index}`}>
                  <div className="between mb18">
                    <div className="flex items-center gap-3">
                      <div className="avatar small-avatar">{item.name[0]}</div>
                      <strong>{item.name}</strong>
                    </div>
                    <span className="tag">{item.tag}</span>
                  </div>
                  <div className="small muted quote">“{item.text}”</div>
                  <div className="quick">
                    <button>我也有这种感觉</button>
                    <button>这一段我读得有点慢</button>
                    <button>适合做批注</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="actions">
        <Button variant="secondary" onClick={() => goTo('reader')}>
          回到阅读空间
        </Button>
      </div>
    </section>
  )
}

function RoomStat({ label, value }) {
  return (
    <div className="room-stat">
      <div className="small muted">{label}</div>
      <div className="report-number">{value}</div>
    </div>
  )
}
