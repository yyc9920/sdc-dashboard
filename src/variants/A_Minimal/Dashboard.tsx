import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { STUDENTS, cleAt, cleAvg, toeflAt, attendanceAt, memoAt, awardsAt, testsAt } from '../../data';
import Radar from '../../components/Radar';
import ScoreLine from '../../components/ScoreLine';

const radarTheme = {
  stroke: '#c6604a',
  fill: 'rgba(198,96,74,.18)',
  grid: '#e8e4dc',
  label: '#555',
};

export default function Dashboard() {
  const cursor = useStore(s => s.cursor);
  const selectedId = useStore(s => s.selectedId);
  const setSelected = useStore(s => s.setSelected);

  const roster = [...STUDENTS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const classAvgCLE = +(roster.reduce((sum, s) => sum + cleAvg(cleAt(s, cursor)), 0) / roster.length).toFixed(1);
  const classAvgTOEFL = +(roster.reduce((sum, s) => sum + toeflAt(s, cursor).total, 0) / roster.length).toFixed(0);
  const classAvgAtt = +(roster.reduce((sum, s) => sum + attendanceAt(s, cursor), 0) / roster.length).toFixed(1);
  const classAvgMemo = +(roster.reduce((sum, s) => sum + memoAt(s, cursor), 0) / roster.length).toFixed(0);

  const selected = roster.find(s => s.id === selectedId) ?? roster[0];
  const cle = cleAt(selected, cursor);

  return (
    <div className="min-h-screen px-3 lg:px-6 py-3 lg:py-4 flex flex-col gap-3 lg:gap-4 lg:h-full lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:overflow-hidden">
      {/* Hero headline */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="chip inline-block">Variant A · Minimal · {cursor}</div>
          <div className="display text-[22px] sm:text-[28px] leading-tight font-bold mt-1">
            학습만 남기고, <span className="accent italic">데이터로 가르친다.</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:gap-6 text-right">
          <Kpi label="반 CLE"  value={classAvgCLE} />
          <Kpi label="출석 %" value={`${classAvgAtt}%`} />
          <Kpi label="500문장" value={`${classAvgMemo}`} suffix="/500" />
          <Kpi label="TOEFL"  value={classAvgTOEFL} />
        </div>
      </div>

      {/* Roster */}
      <aside className="card p-3 flex flex-col lg:col-span-3 lg:min-h-0 lg:overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider">명단 · ㄱ–ㅎ</div>
          <div className="muted text-[10px]">{roster.length}명</div>
        </div>
        <div className="max-h-[320px] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-auto space-y-1 pr-1">
          {roster.map(s => {
            const avg = cleAvg(cleAt(s, cursor));
            return (
              <button key={s.id} onClick={() => setSelected(s.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg border flex items-center justify-between transition
                  ${s.id === selectedId ? 'bg-[#f2efe8] border-[#d8d1c0]' : 'border-transparent hover:bg-[#fafaf6]'}`}>
                <div>
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="muted text-[10px]">{s.grade}학년 · {s.enrollDate.slice(0, 7)}</div>
                </div>
                <div className="display text-sm">{avg}</div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main grid */}
      <section className="flex flex-col gap-3 lg:col-span-9 lg:grid lg:grid-cols-12 lg:gap-4 lg:min-h-0 lg:grid-rows-[1fr_1fr]">
        <div className="card p-4 flex flex-col min-h-[320px] lg:min-h-0 lg:col-span-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="chip inline-block mb-1">선택된 학생</div>
              <div className="display text-3xl font-bold leading-tight">{selected.name}</div>
              <div className="muted text-xs mt-0.5">{selected.grade}학년 · {selected.enrollDate} 입학</div>
            </div>
            <Link to={`/a/student/${selected.id}`} className="text-xs px-3 py-1.5 rounded-full border border-[#d8d1c0] hover:bg-[#f2efe8]">
              상세 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <Mini label="CLE 평균" value={cleAvg(cle)} />
            <Mini label="출석" value={`${attendanceAt(selected, cursor)}%`} />
            <Mini label="500문장" value={`${memoAt(selected, cursor)}`} />
            <Mini label="TOEFL" value={toeflAt(selected, cursor).total} />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mt-3">시험 추이</div>
          <div className="h-[180px] lg:h-auto lg:flex-1 lg:min-h-0">
            <ScoreLine tests={testsAt(selected, cursor)} theme={{ line:'#c6604a', mon:'#94a3b8', mid:'#f59e0b', fin:'#e11d48', grid:'#efece6', text:'#7b7b76' }} />
          </div>
        </div>

        <div className="card p-4 flex flex-col min-h-[280px] lg:min-h-0 lg:col-span-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider">CLE · 어학 6개 지표</div>
          <div className="muted text-[10px]">독해/작문/청해/회화/문법/어휘</div>
          <div className="h-[220px] lg:h-auto lg:flex-1 lg:min-h-0"><Radar current={cle} theme={radarTheme} /></div>
        </div>

        <div className="card p-4 flex flex-col min-h-[320px] lg:min-h-0 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider">반 평균 점수 추이</div>
              <div className="muted text-[10px]">최근 10개월</div>
            </div>
          </div>
          <div className="h-[180px] lg:h-auto lg:flex-1 lg:min-h-0"><MonthlyBars /></div>
        </div>
        <div className="card p-4 flex flex-col min-h-[280px] lg:min-h-0 lg:col-span-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider">수상 · 활동 ({awardsAt(selected, cursor).length})</div>
          <ul className="mt-1 overflow-auto text-sm divide-y divide-[#ececea] flex-1 min-h-0">
            {awardsAt(selected, cursor).map(a => (
              <li key={a.title + a.date} className="py-1.5 flex items-center justify-between gap-2">
                <span className="truncate"><span className="mr-1">{a.icon ?? '✶'}</span><span className="font-medium">{a.title}</span></span>
                <span className="muted text-[10px] whitespace-nowrap">{a.date}</span>
              </li>
            ))}
            {awardsAt(selected, cursor).length === 0 && <li className="muted text-xs py-2">아직 수상 이력이 없어요.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div>
      <div className="muted text-[10px] uppercase tracking-wider">{label}</div>
      <div className="display text-2xl font-bold">{value}{suffix && <span className="muted text-xs"> {suffix}</span>}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-[#faf8f2] p-2 text-center">
      <div className="muted text-[10px] uppercase">{label}</div>
      <div className="display text-xl font-bold">{value}</div>
    </div>
  );
}

// Inline tiny bars component showing monthly progress trend across class (quick visual)
function MonthlyBars() {
  const cursor = useStore(s => s.cursor);
  const roster = STUDENTS;
  const monthKeys = Array.from(new Set(roster.flatMap(s => s.tests.filter(t => t.date <= cursor).map(t => t.date.slice(0, 7))))).sort().slice(-10);
  const data = monthKeys.map(m => {
    const scores = roster.flatMap(s => s.tests.filter(t => t.date.slice(0, 7) === m).map(t => t.score));
    return { m, avg: scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null };
  });
  const max = Math.max(...data.map(d => d.avg ?? 0), 100);
  return (
    <div className="flex items-end gap-1.5 h-full pt-2">
      {data.map(d => (
        <div key={d.m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div className="text-[9px] muted tabular">{d.avg ?? ''}</div>
          <div className="w-full rounded-t-md" style={{ height: `${((d.avg ?? 0) / max) * 100}%`, background: '#c6604a', opacity: d.avg ? 0.85 : 0.15 }} />
          <div className="text-[9px] muted">{d.m.slice(2)}</div>
        </div>
      ))}
    </div>
  );
}
