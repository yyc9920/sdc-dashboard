import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { STUDENTS, cleAt, cleAvg, toeflAt, attendanceAt, memoAt } from '../../data';
import Radar from '../../components/Radar';

const radarTheme = {
  stroke: '#7dd3fc',
  fill: 'rgba(125,211,252,.22)',
  grid: 'rgba(255,255,255,.08)',
  label: '#cbd5e1',
};

export default function Dashboard() {
  const cursor = useStore(s => s.cursor);
  const selectedId = useStore(s => s.selectedId);
  const setSelected = useStore(s => s.setSelected);
  const roster = [...STUDENTS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const selected = roster.find(s => s.id === selectedId) ?? roster[0];

  // rank of selected by CLE avg at cursor
  const byAvg = [...roster].map(s => ({ s, avg: cleAvg(cleAt(s, cursor)) })).sort((a, b) => b.avg - a.avg);
  const rank = byAvg.findIndex(r => r.s.id === selected.id) + 1;
  const pct = Math.round((rank / roster.length) * 100);

  const classCLE = +(byAvg.reduce((a, b) => a + b.avg, 0) / byAvg.length).toFixed(1);
  const classAtt = +(roster.reduce((a, s) => a + attendanceAt(s, cursor), 0) / roster.length).toFixed(1);
  const classMemo = Math.round(roster.reduce((a, s) => a + memoAt(s, cursor), 0) / roster.length);
  const classTOEFL = Math.round(roster.reduce((a, s) => a + toeflAt(s, cursor).total, 0) / roster.length);

  const cle = cleAt(selected, cursor);

  return (
    <div className="min-h-screen px-3 lg:px-6 py-3 lg:py-4 flex flex-col gap-3 lg:gap-4 lg:h-full lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:col-span-12">
        <div>
          <div className="mono text-[10px] tracking-[0.2em] text-sky-300/80">VARIANT B · DARK · T = {cursor}</div>
          <div className="text-2xl sm:text-3xl font-black leading-tight">
            <span className="grad">DATA-DRIVEN</span> LEARNING OPS
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Stat label="CLASS CLE" value={classCLE} />
          <Stat label="ATTEND %" value={`${classAtt}%`} />
          <Stat label="500-SENT" value={classMemo} />
          <Stat label="TOEFL" value={classTOEFL} />
        </div>
      </div>

      <aside className="card p-3 flex flex-col lg:col-span-3 lg:min-h-0 lg:overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="mono text-[10px] tracking-[0.2em] opacity-70">ROSTER</div>
          <div className="tag mono">{roster.length} REC</div>
        </div>
        <div className="max-h-[280px] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-auto space-y-1 pr-1">
          {byAvg.map((r, i) => (
            <button key={r.s.id} onClick={() => setSelected(r.s.id)}
              className={`w-full text-left px-2.5 py-2 rounded-xl border flex items-center gap-2
                ${r.s.id === selectedId ? 'bg-white/10 border-sky-400/50 glow' : 'border-white/5 hover:bg-white/5'}`}>
              <div className="mono text-[10px] opacity-70 w-4">{i + 1}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{r.s.name}</div>
                <div className="text-[10px] opacity-60">G{r.s.grade} · {r.s.enrollDate.slice(2, 7)}</div>
              </div>
              <div className="mono text-xs text-sky-300">{r.avg}</div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-col gap-3 lg:col-span-9 lg:grid lg:grid-cols-12 lg:grid-rows-2 lg:gap-4 lg:min-h-0">
        <div className="card glow p-4 flex flex-col min-h-[320px] lg:min-h-0 lg:col-span-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="mono text-[10px] opacity-60">COHORT RANK · KILLER</div>
              <div className="text-3xl font-black mt-1">{selected.name}</div>
              <div className="text-xs opacity-60">G{selected.grade} · enrolled {selected.enrollDate}</div>
            </div>
            <Link to={`/b/student/${selected.id}`} className="text-xs px-3 py-1.5 rounded-full tag">DEEP DIVE →</Link>
          </div>
          <div className="flex items-center gap-5 mt-3 flex-1 min-h-0">
            <RankRing rank={rank} total={roster.length} pct={pct} />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Mini label="CLE" value={cleAvg(cle)} />
              <Mini label="TOEFL" value={toeflAt(selected, cursor).total} />
              <Mini label="ATT %" value={`${attendanceAt(selected, cursor)}%`} />
              <Mini label="500-SENT" value={`${memoAt(selected, cursor)} / 500`} />
            </div>
          </div>
        </div>

        <div className="card p-4 flex flex-col min-h-[280px] lg:min-h-0 lg:col-span-5">
          <div className="mono text-[10px] opacity-60">HEXAGON</div>
          <div className="text-sm mt-0.5">어학 6개 지표</div>
          <div className="h-[220px] lg:h-auto lg:flex-1 lg:min-h-0"><Radar current={cle} theme={radarTheme} /></div>
        </div>

        <div className="card p-4 flex flex-col min-h-[240px] lg:min-h-0 lg:col-span-12">
          <div className="flex items-center justify-between mb-2">
            <div className="mono text-[10px] opacity-60">COHORT AVG · {cursor}</div>
            <div className="flex gap-2">
              <Chip dot="#7dd3fc" label="CLE avg" />
              <Chip dot="#a78bfa" label="출석 %" />
              <Chip dot="#f472b6" label="500-sent / 5" />
            </div>
          </div>
          <CohortStrip />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card px-3 py-2">
      <div className="mono text-[9px] opacity-60">{label}</div>
      <div className="mono text-xl font-bold">{value}</div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 px-3 py-2">
      <div className="mono text-[9px] opacity-60">{label}</div>
      <div className="mono text-lg font-bold">{value}</div>
    </div>
  );
}
function Chip({ dot, label }: { dot: string; label: string }) {
  return <span className="tag mono flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: dot }} />{label}</span>;
}

function RankRing({ rank, total, pct }: { rank: number; total: number; pct: number }) {
  const size = 160, stroke = 14, r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * (1 - pct / 100));
  return (
    <svg width={size} height={size}>
      <defs>
        <linearGradient id="ringGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,.08)" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="url(#ringGrad)" strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset .4s ease' }} />
      <text x="50%" y="47%" textAnchor="middle" fill="#fff" className="mono" fontSize="26" fontWeight="900">
        {rank}<tspan fontSize="14" opacity=".6">/{total}</tspan>
      </text>
      <text x="50%" y="62%" textAnchor="middle" fill="#7dd3fc" className="mono" fontSize="11" fontWeight="700">
        상위 {Math.max(1, Math.round(rank / total * 100))}%
      </text>
    </svg>
  );
}

function CohortStrip() {
  const cursor = useStore(s => s.cursor);
  const roster = [...STUDENTS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  return (
    <div className="flex-1 min-h-0 flex items-end gap-1.5 pt-2">
      {roster.map(s => {
        const cle = cleAvg(cleAt(s, cursor));
        const att = attendanceAt(s, cursor);
        const memo = memoAt(s, cursor) / 5;
        return (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="w-full flex items-end gap-0.5 h-full">
              <div className="flex-1 rounded-t-sm" style={{ height: `${cle}%`,  background: '#7dd3fc' }} />
              <div className="flex-1 rounded-t-sm" style={{ height: `${att}%`,  background: '#a78bfa' }} />
              <div className="flex-1 rounded-t-sm" style={{ height: `${memo}%`, background: '#f472b6' }} />
            </div>
            <div className="text-[9px] opacity-60 whitespace-nowrap">{s.name}</div>
          </div>
        );
      })}
    </div>
  );
}
