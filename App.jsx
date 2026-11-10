import { useMemo, useRef, useState } from 'react'
import { Activity, ArrowUpRight, BarChart3, CandlestickChart, CheckCircle2, ChevronDown, CircleHelp, ImagePlus, Layers3, ShieldCheck, SlidersHorizontal, Trash2, UploadCloud, Wallet } from 'lucide-react'

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']

export default function App() {
  const [platform, setPlatform] = useState('TradingView')
  const [timeframes, setTimeframes] = useState(['H4', 'H1', 'M15', 'M1'])
  const [screenshots, setScreenshots] = useState([])
  const [activeTab, setActiveTab] = useState('Scanner')
  const fileRef = useRef(null)

  const totalSize = useMemo(() => screenshots.reduce((sum, item) => sum + item.file.size, 0), [screenshots])

  function addFiles(fileList) {
    const accepted = Array.from(fileList || []).filter(file =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
    const additions = accepted.map(file => ({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, url: URL.createObjectURL(file) }))
    setScreenshots(current => [...current, ...additions].slice(0, 8))
  }

  function removeImage(id) {
    setScreenshots(current => {
      const target = current.find(item => item.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return current.filter(item => item.id !== id)
    })
  }

  function toggleTimeframe(tf) {
    setTimeframes(current => current.includes(tf) ? current.filter(item => item !== tf) : [...current, tf])
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-mark"><CandlestickChart size={22} /></div>
      <div className="brand-copy"><strong>CRT ICT <span>MOBILE LAB</span></strong><small>V2 · TRADING WORKSPACE</small></div>
      <div className="online"><i /> LOCAL MODE</div>
    </header>

    <main>
      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-line" /> SCREENSHOT INTELLIGENCE</div>
        <h1>Read the market.<br /><em>Trade with a plan.</em></h1>
        <p>Upload chart screenshots to prepare a structured CRT / ICT review. AI analysis is not connected yet.</p>
        <div className="hero-stats">
          <div><span className="stat-icon"><ShieldCheck size={16}/></span><b>Risk first</b><small>Plan before entry</small></div>
          <div><span className="stat-icon"><Layers3 size={16}/></span><b>Multi-timeframe</b><small>Context to execution</small></div>
        </div>
      </section>

      <nav className="tabs" aria-label="Main navigation">
        {['Dashboard', 'Scanner', 'Signals', 'Journal', 'Risk'].map(tab =>
          <button key={tab} className={activeTab === tab ? 'tab active' : 'tab'} onClick={() => setActiveTab(tab)}>{tab}</button>
        )}
      </nav>

      {activeTab === 'Scanner' || activeTab === 'Dashboard' ? <section className="panel scanner-panel">
        <div className="section-heading">
          <div><div className="section-kicker">01 / INPUT</div><h2>Screenshot scanner</h2></div>
          <span className="step-pill">STEP 1</span>
        </div>
        <label className="field-label">CHART PLATFORM</label>
        <div className="platform-switch">
          {['TradingView', 'MT5 Deriv'].map(name => <button key={name} onClick={() => setPlatform(name)} className={platform === name ? 'platform selected' : 'platform'}>{name === 'TradingView' ? <BarChart3 size={17}/> : <Activity size={17}/>} {name}</button>)}
        </div>

        <div className="upload-zone" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }} role="button" tabIndex="0" onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}>
          <div className="upload-icon"><UploadCloud size={25}/></div>
          <strong>Upload chart screenshots</strong>
          <span>Choose images from your iPhone gallery or drop them here</span>
          <small>JPG · JPEG · PNG · WEBP · UP TO 8 IMAGES</small>
          <button className="choose-btn" type="button" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}><ImagePlus size={16}/> Choose screenshots</button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e => addFiles(e.target.files)} />
        </div>

        {screenshots.length > 0 && <div className="preview-block">
          <div className="preview-head"><b>Selected screenshots ({screenshots.length}/8)</b><span>{(totalSize / 1024 / 1024).toFixed(1)} MB</span></div>
          <div className="preview-grid">{screenshots.map((item, index) => <div className="preview-card" key={item.id}>
            <img src={item.url} alt={`Chart screenshot ${index + 1}`} />
            <div className="preview-meta"><span>{item.file.name}</span><button aria-label="Remove screenshot" onClick={() => removeImage(item.id)}><Trash2 size={14}/></button></div>
          </div>)}</div>
        </div>}

        <div className="divider" />
        <div className="section-heading compact">
          <div><div className="section-kicker">02 / CONTEXT</div><h2>Timeframe configuration</h2></div>
          <SlidersHorizontal size={18} className="muted-icon"/>
        </div>
        <p className="helper">Select the timeframes represented by your uploaded screenshots.</p>
        <div className="timeframe-grid">{TIMEFRAMES.map(tf => <button key={tf} className={timeframes.includes(tf) ? 'timeframe chosen' : 'timeframe'} onClick={() => toggleTimeframe(tf)}>{tf}{timeframes.includes(tf) && <CheckCircle2 size={12}/>}</button>)}</div>
        <div className="default-note"><CheckCircle2 size={15}/> Default workflow: H4 context · H1 bias · M15 range · M1 entry</div>

        <button className="analyse-btn" disabled={screenshots.length === 0 || timeframes.length === 0} onClick={() => setActiveTab('Signals')}>Prepare analysis <ArrowUpRight size={17}/></button>
        <p className="disclaimer">This starter build only stores image previews in this browser session. It does not yet read chart prices, generate signals, or connect to a broker.</p>
      </section> : <section className="panel placeholder-panel">
        <div className="section-kicker">WORKSPACE MODULE</div><h2>{activeTab}</h2>
        <div className="coming-card"><CircleHelp size={22}/><div><b>{activeTab} module is not connected yet</b><p>The interface will be added in a later development stage. No live or simulated trading results are shown here.</p></div></div>
        <button className="back-btn" onClick={() => setActiveTab('Scanner')}>Back to screenshot scanner</button>
      </section>}

      <section className="safety-strip"><div className="safety-icon"><Wallet size={18}/></div><div><b>Protect your capital</b><p>Use demo trading and verify every level manually. Never risk money based on an unverified screenshot reading.</p></div></section>
    </main>
    <footer><span>CRT ICT MOBILE LAB V2</span><span>BUILD 0.1.0 · STARTER</span></footer>
  </div>
}