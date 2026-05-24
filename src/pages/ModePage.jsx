import { Brain, Leaf, ScanText, SlidersHorizontal } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { modePresets, surfaceOptions, themeOptions } from '../data/modes.js'

const icons = { gentle: Leaf, focus: Brain, clear: ScanText }

export default function ModePage({ mode, settings, updateSetting, toggleSetting, chooseMode, goTo }) {
  const current = modePresets[mode]
  const isDark = settings.theme === 'dark' || settings.bg === 'dark'

  return (
    <section>
      <PageHero eyebrow="个性化阅读设置" title="已为你生成今日阅读模式">
        阅读模式只决定字号、间距、高亮和阅读尺等策略；浅色、深色和纸张质感属于阅读外观，会在切换模式后保持。
      </PageHero>

      <div className="split">
        <Card className="mode-card">
          <span className="tag active">推荐模式</span>
          <h2>{current.label}</h2>
          <p className="muted">{current.desc}</p>
          <div className="keyword-cloud mt24">
            {current.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="mode-choices">
            {Object.entries(modePresets).map(([key, item]) => {
              const Icon = icons[key]
              return (
                <button key={key} className={`mode-choice ${mode === key ? 'active' : ''}`} onClick={() => chooseMode(key)}>
                  <div className="mode-icon">
                    <Icon size={22} />
                  </div>
                  <div className="mode-title">{item.label}</div>
                  <div className="mode-desc">{item.desc}</div>
                </button>
              )
            })}
          </div>
          <div className="grid-2 mt24">
            <Button onClick={() => goTo('reader')}>使用当前设置进入阅读</Button>
            <Button variant="secondary" onClick={() => goTo('reader')}>
              跳过，直接阅读
            </Button>
          </div>
        </Card>

        <Card>
          <div className="row-title compact">
            <SlidersHorizontal size={20} /> 手动微调
          </div>
          <Slider label="字号" value={`${settings.font}px`} min="15" max="23" step="1" current={settings.font} onChange={(v) => updateSetting('font', Number(v))} />
          <Slider label="行距" value={Number(settings.line).toFixed(2)} min="1.4" max="2.4" step="0.05" current={settings.line} onChange={(v) => updateSetting('line', Number(v))} />
          <Slider label="字间距" value={`${settings.letter}px`} min="0" max="2" step="0.1" current={settings.letter} onChange={(v) => updateSetting('letter', Number(v))} />

          <div className="appearance-panel">
            <div className="small strong mb10">阅读外观</div>
            <div className="appearance-group">
              <div className="appearance-label">主题</div>
              <div className="bg-grid">
                {themeOptions.map((option) => (
                  <button key={option.key} className={`bg-chip ${settings.theme === option.key ? 'active' : ''}`} onClick={() => updateSetting('theme', option.key)}>
                    <span className="swatch" style={{ background: option.color }} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={`appearance-group ${isDark ? 'is-muted' : ''}`}>
              <div className="appearance-label">浅色文本表面</div>
              <div className="bg-grid">
                {surfaceOptions.map((option) => (
                  <button
                    key={option.key}
                    className={`bg-chip ${settings.theme !== 'dark' && settings.surface === option.key ? 'active' : ''}`}
                    onClick={() => updateSetting('surface', option.key)}
                  >
                    <span className="swatch" style={{ background: option.color }} />
                    {option.label}
                  </button>
                ))}
              </div>
              {isDark ? <div className="small muted mt-2">纸张质感仅在浅色主题中生效；点击任一表面会切回浅色。</div> : null}
            </div>
          </div>

          <div className="mt24">
            {[
              ['focus', '当前段落高亮'],
              ['ruler', '阅读尺辅助'],
              ['keywords', '关键词提示'],
            ].map(([key, label]) => (
              <button className="toggle-row" key={key} onClick={() => toggleSetting(key)}>
                {label}
                <span className={`toggle ${settings[key] ? 'on' : ''}`} />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

function Slider({ label, value, min, max, step, current, onChange }) {
  return (
    <div className="slider-row">
      <div className="slider-head">
        <span>{label}</span>
        <span className="slider-value">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={current} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
