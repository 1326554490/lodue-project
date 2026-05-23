import { FileText, Globe, Languages, Link, Upload, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import Tag from '../components/common/Tag.jsx'
import { sampleTexts } from '../data/sampleTexts.js'

const modeLabel = {
  gentle: '舒缓模式',
  focus: '专注模式',
  clear: '清晰模式',
}

function getParagraphs(content = '') {
  return content.split(/\n+/).map((item) => item.trim()).filter(Boolean)
}

function estimateText(text) {
  const paragraphs = getParagraphs(text.content)
  const chars = text.content.replace(/\s/g, '').length
  const estimatedMinutes = text.estimatedMinutes || Math.max(1, Math.round(chars / 420))
  const density = text.density || (chars / Math.max(paragraphs.length, 1) > 140 ? '高' : chars / Math.max(paragraphs.length, 1) > 80 ? '中' : '低')
  const keywords = text.keywords || ['自定义', '阅读材料', '校准']
  const recommendedMode = text.recommendedMode || (density === '高' ? 'focus' : paragraphs.length >= 8 ? 'clear' : 'gentle')

  return { paragraphs, chars, estimatedMinutes, density, keywords, recommendedMode }
}

export default function HomePage({ goTo, setSelectedText, setTestState }) {
  const [customText, setCustomText] = useState('')
  const [previewText, setPreviewText] = useState(null)
  const customPreview = useMemo(() => {
    const value = customText.trim()
    if (!value) return null
    return {
      id: 'custom',
      tag: '自定义内容',
      title: '我的阅读材料',
      desc: '由你粘贴导入的阅读内容。',
      content: value,
    }
  }, [customText])

  const resetCalibration = () => setTestState({ step: 1, selfCheck: [], feedback: [], seconds: 0, baselineStarted: false })

  const startCalibration = (text) => {
    setSelectedText(text)
    resetCalibration()
    goTo('test')
  }

  const startReader = (text) => {
    setSelectedText(text)
    goTo('reader')
  }

  const startCustom = () => {
    if (!customPreview) return
    startCalibration(customPreview)
  }

  const openPreview = (text) => setPreviewText(text)
  const preview = previewText ? estimateText(previewText) : null

  return (
    <section>
      <PageHero eyebrow="高保真内容入口页" title="选择今天的阅读内容">
        你可以从示例文本开始，也可以粘贴自己的内容。Lodue 会先做轻量阅读状态校准，再进入个性化阅读空间。
      </PageHero>

      <div className="row-title">
        <FileText size={22} /> 精选示例
      </div>
      <div className="grid-3">
        {sampleTexts.map((item) => {
          const meta = estimateText(item)
          return (
            <Card key={item.id} className="sample-card">
              <div>
                <Tag active>{item.tag}</Tag>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="sample-meta">
                  <span>{meta.estimatedMinutes} 分钟</span>
                  <span>{meta.paragraphs.length} 段</span>
                  <span>{meta.density}密度</span>
                </div>
              </div>
              <div className="sample-actions">
                <Button variant="secondary" onClick={() => openPreview(item)}>
                  预览内容
                </Button>
                <Button onClick={() => startCalibration(item)}>开始校准</Button>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="row-title mt-section">
        <Upload size={22} /> 粘贴你的文本
      </div>
      <Card>
        <textarea
          value={customText}
          onChange={(event) => setCustomText(event.target.value)}
          placeholder="将文章、资料、论文段落粘贴到这里..."
        />
        <div className="grid-2 mt24">
          <Button onClick={startCustom}>导入并开始校准</Button>
          <Button variant="secondary" disabled={!customPreview} onClick={() => openPreview(customPreview)}>
            预览自定义文本
          </Button>
        </div>
      </Card>

      <div className="row-title mt-section">
        <Globe size={22} /> 更多方式
      </div>
      <div className="grid-3">
        <Card className="helper-card">
          <Link className="helper-icon" />
          <strong>导入网页链接</strong>
          <div className="disabled-bar">即将开放</div>
        </Card>
        <Card className="helper-card">
          <Upload className="helper-icon" />
          <strong>上传文档</strong>
          <div className="disabled-bar">即将开放</div>
        </Card>
        <Card className="helper-card">
          <Languages className="helper-icon" />
          <strong>双语辅助</strong>
          <div className="disabled-bar">即将开放</div>
        </Card>
      </div>

      {previewText ? (
        <div className="preview-backdrop" onClick={() => setPreviewText(null)}>
          <div className="preview-card" onClick={(event) => event.stopPropagation()}>
            <button className="preview-close" onClick={() => setPreviewText(null)} aria-label="关闭预览">
              <X size={18} />
            </button>
            <Tag active>{previewText.tag}</Tag>
            <h2>{previewText.title}</h2>
            <p className="muted">{previewText.desc}</p>
            <div className="preview-stats">
              <div><span>预计阅读</span><strong>{preview.estimatedMinutes} 分钟</strong></div>
              <div><span>段落数量</span><strong>{preview.paragraphs.length} 段</strong></div>
              <div><span>文本密度</span><strong>{preview.density}</strong></div>
              <div><span>推荐模式</span><strong>{modeLabel[preview.recommendedMode]}</strong></div>
            </div>
            <div className="keyword-cloud preview-keywords">
              {preview.keywords.map((word, index) => (
                <span className={`tag ${index % 3 === 0 ? 'orange' : index % 3 === 1 ? 'purple' : 'teal'}`} key={word}>
                  {word}
                </span>
              ))}
            </div>
            <div className="preview-body">
              {preview.paragraphs.slice(0, 5).map((paragraph, index) => (
                <p key={`${paragraph.slice(0, 12)}-${index}`}>{paragraph}</p>
              ))}
            </div>
            <div className="sample-actions mt24">
              <Button onClick={() => startCalibration(previewText)}>使用该文本开始校准</Button>
              <Button variant="secondary" onClick={() => startReader(previewText)}>
                直接进入阅读
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
