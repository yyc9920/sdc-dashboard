import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { STUDENTS, cleAt, cleAvg, toeflAt, attendanceAt, memoAt, avatar } from '../../data';
import Radar from '../../components/Radar';

const radarTheme = {
  stroke: '#e11d48',
  fill: 'rgba(251,113,133,.3)',
  grid: '#2d1b3d22',
  label: '#2d1b3d',
};

export default function Dashboard() {
  const cursor = useStore(s => s.cursor);
  const selectedId = useStore(s => s.selectedId);
  const setSelected = useStore(s => s.setSelected);
  const roster = [...STUDENTS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const selected = roster.find(s => s.id === selectedId) ?? roster[0];
  const selectedIdx = roster.findIndex(s => s.id === selectedId);
  const cle = cleAt(selected, cursor);

  return (
    <div className="min-h-screen px-3 lg:px-6 py-3 lg:py-4 flex flex-col gap-3 lg:gap-4 lg:h-full lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 lg:col-span-12">
        <div>
          <span className="pill fun inline-block text-base" style={{ background:'#fff3b0' }}>📚 Variant C · 키즈</span>
          <div className="fun text-3xl sm:text-4xl font-bold mt-1 leading-tight">우리반 성장 다이어리 ✨ <span className="text-sm opacity-60">{cursor} 기준</span></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="card px-3 py-2 text-center" style={{ background:'#fff3b0' }}>
            <div className="fun text-[11px]">친구들</div>
            <div className="fun text-2xl font-bold">{roster.length}명</div>
          </div>
          <div className="card px-3 py-2 text-center" style={{ background:'#ffc6c9' }}>
            <div className="fun text-[11px]">반 CLE</div>
            <div className="fun text-2xl font-bold">{(roster.reduce((a,s)=>a+cleAvg(cleAt(s,cursor)),0)/roster.length).toFixed(1)}</div>
          </div>
          <div className="card px-3 py-2 text-center" style={{ background:'#b8ecd2' }}>
            <div className="fun text-[11px]">TOEFL</div>
            <div className="fun text-2xl font-bold">{Math.round(roster.reduce((a,s)=>a+toeflAt(s,cursor).total,0)/roster.length)}</div>
          </div>
        </div>
      </div>

      <aside className="card p-3 flex flex-col lg:col-span-3 lg:min-h-0 lg:overflow-hidden">
        <div className="fun text-xl font-bold mb-2">친구들 🎒</div>
        <div className="max-h-[280px] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-auto space-y-1.5 pr-1">
          {roster.map((s, i) => (
            <button key={s.id} onClick={() => setSelected(s.id)}
              className={`btn-pop w-full text-left px-2.5 py-2 flex items-center gap-2
                ${s.id === selectedId ? 'bg-yellow-200' : 'bg-white hover:bg-yellow-50'}`}>
              <div className="w-8 h-8 rounded-full grid place-items-center text-base border-2 border-[#2d1b3d]"
                style={{ background: avatar(i) }}>{s.name[0]}</div>
              <div className="flex-1">
                <div className="fun text-base leading-none">{s.name}</div>
                <div className="text-[10px]">{s.grade}학년 · {s.enrollDate.slice(0,4)}년</div>
              </div>
              <div className="fun text-sm font-bold">{cleAvg(cleAt(s, cursor))}</div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-col gap-3 lg:col-span-9 lg:grid lg:grid-cols-12 lg:grid-rows-2 lg:gap-4 lg:min-h-0">
        <div className="card p-4 flex flex-col sm:flex-row items-center gap-4 lg:col-span-7 lg:min-h-0">
          <div className="w-20 h-20 rounded-full grid place-items-center text-3xl border-4 border-[#2d1b3d] shadow-[4px_4px_0_#2d1b3d]"
            style={{ background: avatar(selectedIdx) }}>{selected.name[0]}</div>
          <div className="flex-1">
            <div className="fun text-3xl font-bold">{selected.name} 친구 🌟</div>
            <div className="text-xs mt-0.5">{selected.grade}학년 · {selected.enrollDate} 입학</div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="pill" style={{ background:'#b8ecd2' }}>CLE {cleAvg(cle)}</span>
              <span className="pill" style={{ background:'#fff3b0' }}>출석 {attendanceAt(selected, cursor)}%</span>
              <span className="pill" style={{ background:'#ffc6c9' }}>500문장 {memoAt(selected, cursor)}</span>
              <span className="pill" style={{ background:'#c9d7ff' }}>TOEFL {toeflAt(selected, cursor).total}</span>
            </div>
          </div>
          <Link to={`/c/student/${selected.id}`} className="btn-pop px-4 py-2 bg-yellow-300 fun font-bold">
            자세히 →
          </Link>
        </div>

        <div className="card p-4 flex flex-col min-h-[280px] lg:min-h-0 lg:col-span-5">
          <div className="fun text-xl font-bold">✏️ 6가지 실력</div>
          <div className="h-[220px] lg:h-auto lg:flex-1 lg:min-h-0"><Radar current={cle} theme={radarTheme} /></div>
        </div>

        <div className="card p-4 min-h-[220px] lg:min-h-0 lg:col-span-12">
          <div className="fun text-xl font-bold mb-2">🌟 친구들 성장 리더보드</div>
          <div className="grid grid-cols-12 gap-2 h-[180px] lg:h-full">
            {roster.slice(0,12).map((s, i) => {
              const pct = (cleAvg(cleAt(s, cursor)) / 100) * 100;
              return (
                <div key={s.id} className="col-span-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full rounded-t-xl border-2 border-[#2d1b3d]"
                    style={{ height: `${pct}%`, background: avatar(i) }} />
                  <div className="fun text-[11px] leading-none">{s.name[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
