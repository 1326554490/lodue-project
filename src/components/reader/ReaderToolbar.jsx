import { Highlighter, Minus, Plus, Ruler, StickyNote } from 'lucide-react'

export default function ReaderToolbar({ modeLabel, settings, updateSetting, toggleSetting, onAddNote }) {
  return (
    <div className="reader-tools">
      <div className="flex flex-wrap items-center gap-3">
        <span className="tag active">{modeLabel}</span>
        <span className="small muted">第 1 章 / 阅读中</span>
      </div>
      <div className="tool-list">
        <button className="small-tool" onClick={() => updateSetting('font', Math.max(15, settings.font - 1))}>
          <Minus size={14} /> A
        </button>
        <button className="small-tool" onClick={() => updateSetting('font', Math.min(23, settings.font + 1))}>
          <Plus size={14} /> A
        </button>
        <button className={`small-tool ${settings.focus ? 'active' : ''}`} onClick={() => toggleSetting('focus')}>
          <Highlighter size={14} /> 高亮
        </button>
        <button className={`small-tool ${settings.ruler ? 'active' : ''}`} onClick={() => toggleSetting('ruler')}>
          <Ruler size={14} /> 阅读尺
        </button>
        <button className="small-tool" onClick={onAddNote}>
          <StickyNote size={14} /> 便签
        </button>
      </div>
    </div>
  )
}
