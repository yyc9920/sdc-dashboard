import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { STUDENTS, cleAt, cleAvg, toeflAt } from '../../data';
import Radar from '../../components/Radar';

const radarTheme = {
  stroke: '#ff5a3c',
  fill: 'rgba(255,90,60,.22)',
  grid: 'rgba(20,20,20,.12)',
  label: '#141414',
};

export default function Dashboard() {
  const cursor = useStore(s => s.cursor);
  const selectedId = useStore(s => s.selectedId);
  const setSelected = useStore(s => s.setSelected);
  const roster = [...STUDENTS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const selected = roster.find(s => s.id === selectedId) ?? roster[0];
  const cle = cleAt(selected, cursor);

  return (
    <div className="min-h-screen px-3 lg:px-6 py-3 lg:py-4 flex flex-col gap-3 lg:h-full lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 lg:col-span-12">
        <div>
          <div className="micro">Variant E · Bento Issue №05 · {cursor}</div>
          <div className="display text-3xl sm:text-4xl font-black leading-none mt-1"><em>Six skills.</em> 한 화면의 성장기록.</div>
        </div>
        <div className="sm:text-right">
          <div className="micro">COVER</div>
          <div className="display text-xl">{selected.name} · G{selected.grade}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:col-span-12 lg:grid-cols-12 lg:min-h-0 lg:grid-rows-[repeat(3,minmax(0,1fr))]">
        {/* Cover student */}
        <div className="bento dark flex flex-col justify-between min-h-[260px] lg:min-h-0 lg:col-span-4 lg:row-span-2">
          <div>
            <div className="micro opacity-60">Cover Student</div>
            <div className="display text-3xl font-black mt-1">{selected.name}</div>
            <div className="text-xs opacity-80 mt-0.5">{selected.grade}학년 · {selected.enrollDate} 입학</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><div className="micro opacity-60">CLE</div><div className="display text-2xl font-bold">{cleAvg(cle)}</div></div>
            <div><div className="micro opacity-60">TOEFL</div><div className="display text-2xl font-bold">{toeflAt(selected, cursor).total}</div></div>
            <div><div className="micro opacity-60">Grade</div><div className="display text-2xl font-bold">{selected.grade}</div></div>
          </div>
          <Link to={`/e/student/${selected.id}`} className="mt-2 inline-block text-sm underline underline-offset-4 hover:opacity-80">Open growth reel →</Link>
        </div>

        {/* Radar */}
        <div className="bento cream flex flex-col min-h-[280px] lg:min-h-0 lg:col-span-5 lg:row-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="micro">Fig. 01 · CLE Hexagon</div>
              <div className="display text-xl font-bold">어학 6개 지표</div>
            </div>
            <div className="text-[10px] opacity-60">독해·작문·청해·회화·문법·어휘</div>
          </div>
          <div className="h-[220px] lg:h-auto lg:flex-1 lg:min-h-0 mt-1"><Radar current={cle} theme={radarTheme} /></div>
        </div>

        {/* Big accent stat */}
        <div className="bento accent flex flex-col justify-center min-h-[120px] lg:min-h-0 lg:col-span-3 lg:row-span-1">
          <div className="micro opacity-80">Class Size</div>
          <div className="display text-5xl font-black leading-none">{roster.length}</div>
          <div className="text-xs opacity-80">students · ㄱ→ㅎ</div>
        </div>

        <div className="bento flex flex-col justify-center min-h-[120px] lg:min-h-0 lg:col-span-3 lg:row-span-1">
          <div className="micro">Class CLE</div>
          <div className="display text-5xl font-black leading-none">{(roster.reduce((a,s)=>a+cleAvg(cleAt(s,cursor)),0)/roster.length).toFixed(1)}</div>
          <div className="text-xs opacity-70 mt-1">6-skill avg</div>
        </div>

        {/* Roster strip */}
        <div className="bento min-h-[120px] lg:min-h-0 lg:col-span-6 lg:row-span-1">
          <div className="flex items-center justify-between mb-1">
            <div className="micro">Roster · ㄱ→ㅎ</div>
            <div className="text-[10px] opacity-60">{roster.length}명</div>
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {roster.map((s) => (
              <button key={s.id} onClick={() => setSelected(s.id)}
                className={`flex-shrink-0 min-w-[72px] px-2 py-1.5 rounded-xl text-center ${s.id === selectedId ? 'bg-[#ff5a3c] text-white' : 'hover:bg-black/5'}`}>
                <div className="display text-lg font-bold leading-tight">{s.name[0]}</div>
                <div className="text-[10px] leading-tight">{s.name.slice(1)}</div>
                <div className="display text-xs mt-0.5">{cleAvg(cleAt(s, cursor))}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bento cream flex flex-col sm:flex-row sm:items-center gap-3 min-h-[100px] lg:min-h-0 lg:col-span-6 lg:row-span-1">
          <div className="micro">Field Note</div>
          <div className="flex-1 display text-sm italic leading-snug">
            "학습만 남기고, 데이터로 가르친다." — 초등부 세미나는 입학 시점부터 한 명 한 명의 지표를 축적합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
