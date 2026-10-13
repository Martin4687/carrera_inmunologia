import { useState, useEffect } from 'react'

const COLORS = ['#ff4d6d', '#ffb703', '#06d6a0', '#4cc9f0', '#b388ff', '#ff8fab']
const ICONS = ['🦠', '🧬', '💉', '🛡️', '🔬', '🧫']
const Q = (q, o, a) => ({ q, o, a })
const DEFAULT_QS = [
  Q('¿Cuál es la función principal del sistema inmunológico?', ['Digerir los alimentos', 'Defender al organismo de patógenos', 'Transportar oxígeno', 'Producir hormonas sexuales'], 1),
  Q('¿Qué células producen los anticuerpos?', ['Eritrocitos', 'Plaquetas', 'Linfocitos B (células plasmáticas)', 'Neuronas'], 2),
  Q('¿Qué tipo de inmunidad otorga una vacuna?', ['Adquirida activa artificial', 'Pasiva natural', 'Innata', 'Pasiva artificial'], 0),
  Q('¿En qué órgano maduran los linfocitos T?', ['Bazo', 'Timo', 'Hígado', 'Páncreas'], 1),
  Q('¿Cuál es la inmunoglobulina más abundante en la sangre?', ['IgE', 'IgM', 'IgA', 'IgG'], 3),
  Q('¿Qué células presentan antígenos a los linfocitos T?', ['Células presentadoras de antígeno (macrófagos, dendríticas)', 'Glóbulos rojos', 'Osteoblastos', 'Adipocitos'], 0),
  Q('La inmunidad innata se caracteriza por ser…', ['Específica y lenta', 'Rápida e inespecífica', 'Solo adquirida tras una infección', 'Exclusiva de los linfocitos B'], 1),
  Q('¿Qué anticuerpo se asocia principalmente a las reacciones alérgicas?', ['IgG', 'IgA', 'IgE', 'IgD'], 2),
  Q('¿Qué virus ataca a los linfocitos T CD4+?', ['VIH', 'Influenza', 'Rotavirus', 'Virus del papiloma'], 0),
  Q('¿Cómo se llaman las moléculas que sirven de señal química entre células inmunes?', ['Enzimas digestivas', 'Citocinas', 'Lípidos', 'Electrolitos'], 1),
]

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

export default function App() {
  const [screen, setScreen] = useState('setup')
  const [names, setNames] = useState(() => load('ci_names', ['Jugador 1', 'Jugador 2']))
  const [qs, setQs] = useState(() => load('ci_qs', DEFAULT_QS))
  const [g, setG] = useState(null)

  useEffect(() => { localStorage.setItem('ci_names', JSON.stringify(names)) }, [names])
  useEffect(() => { localStorage.setItem('ci_qs', JSON.stringify(qs)) }, [qs])

  const start = () => {
    const bad = qs.some(x => !x.q.trim() || x.o.some(t => !t.trim()))
    if (!qs.length || bad) return alert('Completa todas las preguntas y respuestas (o elimina las vacías).')
    setG({ players: names.map((n, i) => ({ name: n.trim() || `Jugador ${i + 1}`, pos: 0, ok: 0, bad: 0 })), turn: 0, dice: null, phase: 'roll', pick: null })
    setScreen('play')
  }

  if (screen === 'setup') return <Setup {...{ names, setNames, qs, setQs, start }} />
  if (screen === 'end') return <End g={g} N={qs.length} again={() => setScreen('setup')} replay={start} />
  return <Play g={g} setG={setG} qs={qs} finish={() => setScreen('end')} />
}

function Setup({ names, setNames, qs, setQs, start }) {
  const setQ = (i, f) => setQs(qs.map((x, j) => (j === i ? f(x) : x)))
  return (
    <main className="wrap">
      <h1 className="title">Carrera Inmune <span>🦠🏁</span></h1>
      <p className="sub">Responde bien, tira el dado y llega primero a la meta.</p>

      <section className="panel">
        <h2>Jugadores ({names.length})</h2>
        <div className="players-edit">
          {names.map((n, i) => (
            <label key={i} className="pl" style={{ '--c': COLORS[i] }}>
              <b>{ICONS[i]}</b>
              <input value={n} onChange={e => setNames(names.map((x, j) => (j === i ? e.target.value : x)))} />
            </label>
          ))}
        </div>
        <div className="row">
          <button className="btn ghost" disabled={names.length <= 2} onClick={() => setNames(names.slice(0, -1))}>− Quitar jugador</button>
          <button className="btn ghost" disabled={names.length >= 6} onClick={() => setNames([...names, `Jugador ${names.length + 1}`])}>+ Agregar jugador</button>
        </div>
      </section>

      <section className="panel">
        <h2>Preguntas ({qs.length} casillas + meta)</h2>
        <p className="hint">Cada pregunta es una casilla del tablero. Marca con el círculo la respuesta correcta.</p>
        {qs.map((x, i) => (
          <div className="qcard" key={i}>
            <div className="qhead">
              <b>Casilla {i + 1}</b>
              <button className="x" onClick={() => setQs(qs.filter((_, j) => j !== i))} title="Eliminar pregunta">✕</button>
            </div>
            <input className="qin" value={x.q} placeholder="Escribe la pregunta" onChange={e => setQ(i, o => ({ ...o, q: e.target.value }))} />
            {x.o.map((t, k) => (
              <label key={k} className="opt-edit">
                <input type="radio" name={`c${i}`} checked={x.a === k} onChange={() => setQ(i, o => ({ ...o, a: k }))} />
                <input value={t} placeholder={`Respuesta ${k + 1}`} onChange={e => setQ(i, o => ({ ...o, o: o.o.map((y, m) => (m === k ? e.target.value : y)) }))} />
              </label>
            ))}
          </div>
        ))}
        <div className="row">
          <button className="btn ghost" onClick={() => setQs([...qs, Q('', ['', '', '', ''], 0)])}>+ Agregar pregunta</button>
          <button className="btn ghost" onClick={() => confirm('¿Restaurar las 10 preguntas originales?') && setQs(DEFAULT_QS)}>Restaurar originales</button>
        </div>
      </section>
      <button className="btn big" onClick={start}>¡Comenzar la carrera!</button>
    </main>
  )
}

function Board({ players, N }) {
  const cols = 5
  const cells = Array.from({ length: N + 1 }, (_, i) => i)
  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {cells.map(i => {
        const r = Math.floor(i / cols), c = i % cols
        const here = players.map((p, k) => ({ ...p, k })).filter(p => p.pos === i)
        return (
          <div key={i} className={`cell ${i === N ? 'goal' : ''}`} style={{ gridRow: r + 1, gridColumn: (r % 2 ? cols - c : c + 1), '--c': COLORS[i % COLORS.length] }}>
            <span className="num">{i === N ? '🏁' : i === 0 ? 'Salida' : i + 1}</span>
            <div className="tokens">
              {here.map(p => <i key={p.k} className="token" style={{ background: COLORS[p.k] }}>{ICONS[p.k]}</i>)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Play({ g, setG, qs, finish }) {
  const N = qs.length
  const me = g.players[g.turn]
  const q = qs[Math.min(me.pos, N - 1)]
  const won = me.pos >= N

  const roll = () => setG({ ...g, dice: 1 + Math.floor(Math.random() * 6), phase: 'question', pick: null })
  const answer = i => {
    const right = i === q.a
    const players = g.players.map((p, k) => k !== g.turn ? p : { ...p, ok: p.ok + right, bad: p.bad + !right, pos: right ? Math.min(p.pos + g.dice, N) : p.pos })
    setG({ ...g, players, pick: i, phase: 'result' })
  }
  const next = () => (won ? finish() : setG({ ...g, turn: (g.turn + 1) % g.players.length, dice: null, phase: 'roll', pick: null }))
  const right = g.pick === q.a

  return (
    <main className="wrap play">
      <Board players={g.players} N={N} />
      <section className="panel turn" style={{ '--c': COLORS[g.turn] }}>
        <h2><b>{ICONS[g.turn]}</b> Turno de {me.name}</h2>
        {g.phase === 'roll' && <button className="btn big" onClick={roll}>🎲 Tirar el dado</button>}
        {g.phase !== 'roll' && (
          <>
            <div className="dice" key={g.dice}>{g.dice}</div>
            <p className="qtext">{q.q}</p>
            <div className="opts">
              {q.o.map((t, i) => (
                <button key={i} disabled={g.phase === 'result'} onClick={() => answer(i)}
                  className={`opt ${g.phase === 'result' ? (i === q.a ? 'good' : i === g.pick ? 'bad' : '') : ''}`}>{t}</button>
              ))}
            </div>
          </>
        )}
        {g.phase === 'result' && (
          <div className={`result ${right ? 'good' : 'bad'}`}>
            <p>{won ? `🏆 ¡${me.name} llegó a la meta!` : right ? `¡Correcto! Avanza ${g.dice} casillas.` : 'Incorrecto. Se queda en su casilla.'}</p>
            <button className="btn" onClick={next}>{won ? 'Ver resultados' : 'Siguiente jugador'}</button>
          </div>
        )}
      </section>
      <section className="panel score">
        {g.players.map((p, k) => (
          <span key={k} style={{ '--c': COLORS[k] }} className={k === g.turn ? 'on' : ''}>{ICONS[k]} {p.name}: casilla {Math.min(p.pos + 1, N + 1)} · ✔ {p.ok} ✘ {p.bad}</span>
        ))}
      </section>
    </main>
  )
}

function End({ g, N, again, replay }) {
  const rank = g.players.map((p, k) => ({ ...p, k })).sort((a, b) => b.pos - a.pos || b.ok - a.ok)
  return (
    <main className="wrap">
      <h1 className="title">🏆 ¡{rank[0].name} ganó!</h1>
      <section className="panel">
        {rank.map((p, i) => (
          <div key={p.k} className={`rank ${i === 0 ? 'first' : ''}`} style={{ '--c': COLORS[p.k] }}>
            <b className="pos">{i + 1}°</b>
            <span className="who">{ICONS[p.k]} {p.name}</span>
            <span className="bar"><i style={{ width: `${Math.min(100, (p.pos / N) * 100)}%` }} /></span>
            <span className="stats">{p.pos >= N ? 'Meta' : `Casilla ${p.pos + 1}/${N}`} · ✔ {p.ok} · ✘ {p.bad}</span>
          </div>
        ))}
      </section>
      <div className="row">
        <button className="btn" onClick={replay}>Jugar de nuevo</button>
        <button className="btn ghost" onClick={again}>Editar jugadores y preguntas</button>
      </div>
    </main>
  )
}
