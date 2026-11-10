import React, { useEffect, useMemo, useRef, useState } from "react";

const NAV = [
  ["⌂", "Dashboard"], ["▣", "Scanner"], ["⌁", "Analysis"],
  ["◈", "Risk"], ["▤", "Journal"], ["⚙", "Settings"]
];
const TF = ["W1", "D1", "H4", "H1", "M15", "M5", "M1"];
const emptyJournal = [];

function money(value, currency = "USD") {
  const n = Number(value || 0);
  return `${currency} ${n.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
}
function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [platform, setPlatform] = useState("TradingView");
  const [pair, setPair] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("M15");
  const [images, setImages] = useState([]);
  const [checks, setChecks] = useState({bias:false, sweep:false, displacement:false, structure:false, pd:false});
  const [direction, setDirection] = useState("BUY");
  const [entry, setEntry] = useState("1.08500");
  const [sl, setSl] = useState("1.08200");
  const [tp1, setTp1] = useState("1.09100");
  const [tp2, setTp2] = useState("1.09700");
  const [tp3, setTp3] = useState("1.10300");
  const [balance, setBalance] = useState("1000");
  const [riskPct, setRiskPct] = useState("1");
  const [dailyLimit, setDailyLimit] = useState("3");
  const [maxTrades, setMaxTrades] = useState("5");
  const [journal, setJournal] = useState(() => readStore("crtict-journal", emptyJournal));
  const [currency, setCurrency] = useState("USD");
  const [notice, setNotice] = useState("");
  const fileRef = useRef(null);

  useEffect(() => localStorage.setItem("crtict-journal", JSON.stringify(journal)), [journal]);

  const confirmed = Object.values(checks).filter(Boolean).length;
  const riskAmount = Math.max(0, Number(balance) * Number(riskPct) / 100);
  const stopDistance = Math.abs(Number(entry) - Number(sl));
  const targetDistance = Math.abs(Number(tp1) - Number(entry));
  const rr = stopDistance > 0 ? targetDistance / stopDistance : 0;
  const signal = confirmed >= 4 ? direction : "NO TRADE";
  const wins = journal.filter(t => t.result === "Win").length;
  const losses = journal.filter(t => t.result === "Loss").length;
  const total = wins + losses;
  const winRate = total ? Math.round(wins / total * 100) : 0;

  function uploadFiles(fileList) {
    const allowed = [...fileList].filter(f => ["image/png","image/jpeg","image/webp"].includes(f.type));
    const slots = Math.max(0, 8 - images.length);
    const selected = allowed.slice(0, slots);
    const additions = selected.map(file => ({id: crypto.randomUUID(), name:file.name, url:URL.createObjectURL(file), size:file.size}));
    setImages(prev => [...prev, ...additions]);
    if (allowed.length > slots) setNotice("Maximum 8 screenshots per scan.");
    else if (!selected.length) setNotice("Choose PNG, JPG or WEBP screenshots.");
    else setNotice(`${selected.length} screenshot(s) added. They stay on this device.`);
  }
  function removeImage(id) {
    setImages(prev => {
      const item = prev.find(x => x.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter(x => x.id !== id);
    });
  }
  function saveTrade() {
    if (signal === "NO TRADE") { setNotice("Add at least 4 confirmations before saving a trade setup."); return; }
    const trade = {id:crypto.randomUUID(), date:new Date().toISOString(), pair, timeframe, direction, entry:Number(entry), sl:Number(sl), tp1:Number(tp1), tp2:Number(tp2), tp3:Number(tp3), result:"Open", note:`${confirmed}/5 confirmations`, screenshotNames:images.map(x=>x.name)};
    setJournal(prev => [trade, ...prev]);
    setNotice("Trade setup saved to your journal.");
    setPage("Journal");
  }
  function setResult(id, result) {
    setJournal(prev => prev.map(t => t.id === id ? {...t, result} : t));
  }
  function deleteTrade(id) { setJournal(prev => prev.filter(t => t.id !== id)); }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">CRT</div><div><strong>ICT MOBILE LAB</strong><small>V2 · TRADING WORKSPACE</small></div></div>
      <div className="status"><span className="live-dot"/> LOCAL MODE</div>
    </header>

    <main className="main-content">
      <div className="welcome-row">
        <div><div className="eyebrow">CRT × ICT ANALYSIS TERMINAL</div><h1>{page}</h1><p className="muted">Screenshot-first trading workspace</p></div>
        <div className="date-chip">{new Date().toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"})}</div>
      </div>

      {notice && <button className="notice" onClick={()=>setNotice("")}>{notice} <span>×</span></button>}

      {page === "Dashboard" && <section className="stack">
        <div className="hero-card">
          <div><span className="eyebrow">WORKSPACE STATUS</span><h2>Plan the trade.<br/><em>Protect the capital.</em></h2><p>Upload your chart screenshots and work through a structured CRT / ICT checklist.</p><button className="primary" onClick={()=>setPage("Scanner")}>Open screenshot scanner <b>↗</b></button></div>
          <div className="hero-graphic"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="candles"><i/><i/><i/><i/><i/></div><span>ICT</span></div>
        </div>
        <div className="stat-grid">
          <Stat label="JOURNAL TRADES" value={journal.length} sub="Saved locally"/>
          <Stat label="WIN RATE" value={`${winRate}%`} sub={`${wins} wins · ${losses} losses`}/>
          <Stat label="RISK PER TRADE" value={`${Number(riskPct)||0}%`} sub={money(riskAmount,currency)}/>
          <Stat label="OPEN SETUPS" value={journal.filter(t=>t.result==="Open").length} sub="In your journal"/>
        </div>
        <div className="panel">
          <div className="panel-head"><div><h3>Latest journal activity</h3><p className="muted">Your most recent saved setups</p></div><button className="text-btn" onClick={()=>setPage("Journal")}>View journal →</button></div>
          {journal.length ? <TradeRows trades={journal.slice(0,3)} setResult={setResult} deleteTrade={deleteTrade}/> : <Empty title="No trades saved yet" text="Your saved setups will appear here. Start in the screenshot scanner."/>}
        </div>
        <div className="disclaimer">⚠ <b>Analysis workspace only.</b> This build does not read chart prices automatically, provide verified signals, connect to a broker or execute trades.</div>
      </section>}

      {page === "Scanner" && <section className="stack">
        <div className="panel">
          <div className="panel-head"><div><h3>Chart screenshot scanner</h3><p className="muted">Add screenshots from your charting platform</p></div><span className="tag">STEP 01</span></div>
          <div className="segmented">{["TradingView","Deriv MT5"].map(x=><button className={platform===x?"selected":""} onClick={()=>setPlatform(x)} key={x}>{x}</button>)}</div>
          <div className="form-grid">
            <Field label="TRADING PAIR"><input value={pair} onChange={e=>setPair(e.target.value.toUpperCase())} placeholder="e.g. EURUSD"/></Field>
            <Field label="ANALYSIS TIMEFRAME"><select value={timeframe} onChange={e=>setTimeframe(e.target.value)}>{TF.map(t=><option key={t}>{t}</option>)}</select></Field>
          </div>
          <input ref={fileRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={e=>uploadFiles(e.target.files)}/>
          <button className="upload-zone" onClick={()=>fileRef.current?.click()}><span className="upload-icon">＋</span><strong>Tap to upload chart screenshots</strong><small>PNG, JPG or WEBP · Up to 8 images · Stored on this device</small></button>
          {images.length>0 && <div className="image-grid">{images.map(img=><div className="preview" key={img.id}><img src={img.url} alt={img.name}/><button onClick={()=>removeImage(img.id)}>×</button><small>{img.name}</small></div>)}</div>}
          <div className="tip">For best manual review, include a higher-timeframe view and a clear lower-timeframe entry chart.</div>
        </div>
        <div className="panel">
          <div className="panel-head"><div><h3>CRT / ICT confirmation checklist</h3><p className="muted">Tick only what you can verify on the screenshots</p></div><span className="tag">STEP 02</span></div>
          <div className="check-list">
            <Check label="Higher-timeframe directional bias is clear" checked={checks.bias} onChange={v=>setChecks(p=>({...p,bias:v}))}/>
            <Check label="Liquidity sweep is visible (BSL / SSL)" checked={checks.sweep} onChange={v=>setChecks(p=>({...p,sweep:v}))}/>
            <Check label="Displacement candle is present" checked={checks.displacement} onChange={v=>setChecks(p=>({...p,displacement:v}))}/>
            <Check label="MSS / CHoCH / BOS confirms structure" checked={checks.structure} onChange={v=>setChecks(p=>({...p,structure:v}))}/>
            <Check label="Price location / premium-discount is aligned" checked={checks.pd} onChange={v=>setChecks(p=>({...p,pd:v}))}/>
          </div>
          <div className="progress-line"><span style={{width:`${confirmed/5*100}%`}}/></div>
          <div className="progress-label">{confirmed} of 5 confirmations selected</div>
          <div className="tip">This is a user-driven checklist, not automated image recognition. The app does not infer candles, levels or prices from uploaded images.</div>
          <button className="primary full" onClick={()=>setPage("Analysis")}>Continue to trade plan <b>→</b></button>
        </div>
      </section>}

      {page === "Analysis" && <section className="stack">
        <div className="panel">
          <div className="panel-head"><div><h3>Trade plan builder</h3><p className="muted">{pair || "PAIR"} · {timeframe} · {platform}</p></div><span className="tag">RULE CHECK</span></div>
          <div className={`signal-box ${signal==="NO TRADE"?"neutral":signal==="BUY"?"bull":"bear"}`}>
            <div><small>WORKSPACE OUTPUT</small><strong>{signal}</strong><span>{signal==="NO TRADE"?"Insufficient confirmations":"Checklist threshold met — verify manually"}</span></div>
            <div className="score"><b>{confirmed}/5</b><small>CHECKS</small></div>
          </div>
          <div className="form-grid">
            <Field label="DIRECTION"><select value={direction} onChange={e=>setDirection(e.target.value)}><option>BUY</option><option>SELL</option></select></Field>
            <Field label="PAIR"><input value={pair} onChange={e=>setPair(e.target.value.toUpperCase())}/></Field>
            <Field label="TIMEFRAME"><select value={timeframe} onChange={e=>setTimeframe(e.target.value)}>{TF.map(t=><option key={t}>{t}</option>)}</select></Field>
            <Field label="ENTRY PRICE"><input inputMode="decimal" value={entry} onChange={e=>setEntry(e.target.value)}/></Field>
            <Field label="STOP LOSS"><input inputMode="decimal" value={sl} onChange={e=>setSl(e.target.value)}/></Field>
            <Field label="TAKE PROFIT 1"><input inputMode="decimal" value={tp1} onChange={e=>setTp1(e.target.value)}/></Field>
            <Field label="TAKE PROFIT 2"><input inputMode="decimal" value={tp2} onChange={e=>setTp2(e.target.value)}/></Field>
            <Field label="TAKE PROFIT 3"><input inputMode="decimal" value={tp3} onChange={e=>setTp3(e.target.value)}/></Field>
          </div>
          <div className="metrics">
            <Metric label="RISK AMOUNT" value={money(riskAmount,currency)}/>
            <Metric label="TP1 R:R" value={`1 : ${rr.toFixed(2)}`}/>
            <Metric label="CONFIRMATIONS" value={`${confirmed}/5`}/>
          </div>
          <div className="tip">Invalidation: the setup is invalid if the selected stop-loss level is reached, or if your structural premise is disproven. Confirm price precision and direction before using any plan.</div>
          <button className="primary full" onClick={saveTrade} disabled={signal==="NO TRADE"}>Save setup to journal <b>＋</b></button>
          {signal==="NO TRADE" && <p className="muted center small">No trade is suggested until at least 4 of 5 checklist items are confirmed.</p>}
        </div>
      </section>}

      {page === "Risk" && <section className="stack">
        <div className="panel">
          <div className="panel-head"><div><h3>Risk management</h3><p className="muted">Position planning calculator</p></div><span className="tag">CAPITAL FIRST</span></div>
          <Field label="ACCOUNT BALANCE"><input type="number" min="0" value={balance} onChange={e=>setBalance(e.target.value)}/></Field>
          <Field label="ACCOUNT CURRENCY"><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>USD</option><option>EUR</option><option>GBP</option><option>NAD</option><option>ZAR</option></select></Field>
          <div className="risk-control"><div className="field-label"><span>RISK PER TRADE</span><b>{riskPct}%</b></div><input type="range" min="0.25" max="5" step="0.25" value={riskPct} onChange={e=>setRiskPct(e.target.value)}/><div className="range-labels"><span>0.25%</span><span>5%</span></div></div>
          <div className="risk-result"><small>MAXIMUM PLANNED RISK</small><strong>{money(riskAmount,currency)}</strong><span>{riskPct}% of {money(balance,currency)}</span></div>
          <div className="form-grid">
            <Field label="ENTRY PRICE"><input inputMode="decimal" value={entry} onChange={e=>setEntry(e.target.value)}/></Field>
            <Field label="STOP LOSS"><input inputMode="decimal" value={sl} onChange={e=>setSl(e.target.value)}/></Field>
          </div>
          <div className="metrics">
            <Metric label="STOP DISTANCE" value={stopDistance.toFixed(5)}/>
            <Metric label="RISK AMOUNT" value={money(riskAmount,currency)}/>
          </div>
          <div className="tip">A precise lot-size calculation requires the instrument's contract size, pip value, quote currency and account currency conversion. This build deliberately does not guess lot size.</div>
        </div>
        <div className="panel">
          <h3>Daily guardrails</h3>
          <div className="form-grid">
            <Field label="DAILY LOSS LIMIT (%)"><input type="number" min="0" max="100" value={dailyLimit} onChange={e=>setDailyLimit(e.target.value)}/></Field>
            <Field label="MAX TRADES PER DAY"><input type="number" min="1" max="100" value={maxTrades} onChange={e=>setMaxTrades(e.target.value)}/></Field>
          </div>
          <p className="muted small">Suggested limits are planning settings only. They are not connected to a broker and cannot block live orders.</p>
        </div>
      </section>}

      {page === "Journal" && <section className="stack">
        <div className="stat-grid compact">
          <Stat label="TOTAL SETUPS" value={journal.length} sub="Saved on this device"/>
          <Stat label="WIN RATE" value={`${winRate}%`} sub={`${wins} wins · ${losses} losses`}/>
        </div>
        <div className="panel">
          <div className="panel-head"><div><h3>Trade journal</h3><p className="muted">Record outcomes to track your process</p></div><span className="tag">{journal.length} RECORDS</span></div>
          {journal.length ? <TradeRows trades={journal} setResult={setResult} deleteTrade={deleteTrade}/> : <Empty title="Your journal is empty" text="Save a setup from the Analysis screen to begin tracking."/>}
        </div>
        <div className="panel">
          <h3>Performance summary</h3>
          <div className="metrics"><Metric label="WINS" value={wins}/><Metric label="LOSSES" value={losses}/><Metric label="OPEN" value={journal.filter(t=>t.result==="Open").length}/></div>
          <p className="muted small">Profit factor, drawdown and realised P/L are not calculated because broker fills and trade outcomes are not imported.</p>
        </div>
      </section>}

      {page === "Settings" && <section className="stack">
        <div className="panel">
          <h3>Application settings</h3>
          <div className="setting-row"><div><b>Workspace</b><small>CRT ICT Mobile Lab V2 · 0.2.0</small></div><span className="tag">LOCAL</span></div>
          <div className="setting-row"><div><b>Storage</b><small>Journal stored in this browser on this device</small></div><span className="green-text">Enabled</span></div>
          <div className="setting-row"><div><b>Offline support</b><small>App shell can be cached after first online visit</small></div><span className="green-text">PWA</span></div>
          <div className="setting-row"><div><b>Broker connection</b><small>Deriv MT5 integration is not implemented</small></div><span className="muted">Not connected</span></div>
          <button className="secondary full" onClick={()=>{if(confirm("Clear all saved journal entries on this device?")){setJournal([]);setNotice("Journal cleared.");}}}>Clear local journal</button>
        </div>
        <div className="panel">
          <h3>Install on iPhone</h3>
          <ol className="install-steps"><li>Publish this app to a free HTTPS static host.</li><li>Open the published address in Safari.</li><li>Tap Share, then Add to Home Screen.</li><li>Tap Add. The app icon will appear on your Home Screen.</li></ol>
          <div className="tip">Installation is available after the app has been deployed over HTTPS. It is not published yet.</div>
        </div>
        <div className="panel">
          <h3>Privacy & safety</h3>
          <p className="muted small">Screenshots are previewed in browser memory. Journal entries are stored in local browser storage. Do not enter broker passwords, API secrets or account credentials. No automated execution is available.</p>
        </div>
      </section>}
    </main>

    <nav className="bottom-nav">{NAV.map(([icon,label])=><button key={label} className={page===label?"active":""} onClick={()=>setPage(label)}><span>{icon}</span><small>{label}</small></button>)}</nav>
  </div>;
}

function Stat({label,value,sub}) { return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>; }
function Field({label,children}) { return <label className="field"><span className="field-label">{label}</span>{children}</label>; }
function Metric({label,value}) { return <div className="metric"><small>{label}</small><b>{value}</b></div>; }
function Check({label,checked,onChange}) { return <label className="check-row"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span className="fake-check">{checked?"✓":""}</span><span>{label}</span></label>; }
function Empty({title,text}) { return <div className="empty"><span>◌</span><b>{title}</b><p>{text}</p></div>; }
function TradeRows({trades,setResult,deleteTrade}) {
  return <div className="trade-list">{trades.map(t=><div className="trade-row" key={t.id}>
    <div className="trade-main"><div className={`direction ${t.direction==="BUY"?"buy":"sell"}`}>{t.direction}</div><div><b>{t.pair} <small>{t.timeframe}</small></b><span>{new Date(t.date).toLocaleString()} · Entry {t.entry}</span></div></div>
    <div className="trade-actions"><select aria-label="Trade result" value={t.result} onChange={e=>setResult(t.id,e.target.value)}><option>Open</option><option>Win</option><option>Loss</option><option>Break-even</option></select><button className="delete-btn" onClick={()=>deleteTrade(t.id)} aria-label="Delete trade">×</button></div>
  </div>)}</div>;
}