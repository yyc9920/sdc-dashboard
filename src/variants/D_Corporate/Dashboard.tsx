import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { STUDENTS, cleAt, cleAvg, toeflAt, attendanceAt, memoAt } from '../../data';
import Radar from '../../components/Radar';

const radarTheme = {
  stroke: '#8b1e2e',
  fill: 'rgba(139,30,46,.18)',
  grid: '#e5ddce',
  label: '#5b1220',
};

export default function Dashboard() {
  const cursor = useStore(s => s.cursor);
  const selectedId = useStore(s => s.selectedId);
  const setSelected = useStore(s => s.setSelected);
  const roster = [...STUDENTS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const selected = roster.find(s => s.id === selectedId) ?? roster[0];

  const classCLE = +(roster.reduce((a, s) => a + cleAvg(cleAt(s, cursor)), 0) / roster.length).toFixed(1);
  const classAtt = +(roster.reduce((a, s) => a + attendanceAt(s, cursor), 0) / roster.length).toFixed(1);
  const classMemo500 = +((roster.reduce((a, s) => a + memoAt(s, cursor), 0) / roster.length) / 500 * 100).toFixed(1);

  return (
    <div className="min-h-screen px-3 lg:px-6 py-3 lg:py-4 flex flex-col gap-3 lg:h-full lg:grid lg:grid-cols-12 lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b-2 border-burgundy-500 lg:col-span-12">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-burgundy-700 font-semibold">VARIANT D · CORPORATE EDITION</div>
          <div className="text-xl sm:text-2xl font-bold">Students' Management Data <span className="text-slate-400 font-normal">· SDC Edu Solutions</span></div>
        </div>
        <div className="text-xs sm:text-right">
          <div className="text-burgundy-700 font-semibold">Current Period · {cursor}</div>
          <div className="text-slate-500">Total Performance Overview</div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:col-span-12">
        <div className="kpi p-3">
          <div className="text-[10px] opacity-70 tracking-[0.14em]">ENROLLED</div>
          <div className="text-2xl font-bold tabular">{roster.length}</div>
          <div className="text-[10px] opacity-60 mt-0.5">G3: {roster.filter(s=>s.grade===3).length} / G4: {roster.filter(s=>s.grade===4).length}</div>
        </div>
        <div className="kpi p-3">
          <div className="text-[10px] opacity-70 tracking-[0.14em]">ATTENDANCE % YTD</div>
          <div className="text-2xl font-bold tabular">{classAtt}%</div>
        </div>
        <div className="kpi gold p-3">
          <div className="text-[10px] opacity-70 tracking-[0.14em]">CLE 500 SENT. MEMO. RATE YTD</div>
          <div className="text-2xl font-bold tabular">{classMemo500}%</div>
        </div>
        <div className="kpi p-3">
          <div className="text-[10px] opacity-70 tracking-[0.14em]">AVG CLE (GRADE)</div>
          <div className="text-2xl font-bold tabular">{classCLE}</div>
        </div>
        <div className="kpi p-3">
          <div className="text-[10px] opacity-70 tracking-[0.14em]">AVG TOEFL</div>
          <div className="text-2xl font-bold tabular">{Math.round(roster.reduce((a,s)=>a+toeflAt(s,cursor).total,0)/roster.length)}</div>
        </div>
      </div>

      <aside className="card hidden lg:flex lg:flex-col lg:col-span-4 lg:min-h-0 lg:overflow-hidden">
        <div className="th px-3 py-1.5 flex items-center justify-between">
          <span>STUDENT ROSTER · ㄱ–ㅎ</span>
          <span className="opacity-70">{roster.length} records</span>
        </div>
        <div className="max-h-[320px] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase border-b bg-burgundy-50/50">
                <th className="text-left p-1.5">Name</th>
                <th className="text-center p-1.5">G</th>
                <th className="text-right p-1.5">CLE</th>
                <th className="text-right p-1.5">ATT%</th>
                <th className="text-right p-1.5">TOEFL</th>
              </tr>
            </thead>
            <tbody>
              {roster.map(s => (
                <tr key={s.id} onClick={() => setSelected(s.id)}
                  className={`cursor-pointer border-b border-slate-100 ${s.id === selectedId ? 'bg-gold-100 font-semibold' : 'hover:bg-slate-50'}`}>
                  <td className="p-1.5">
                    <div>{s.name}</div>
                    <div className="text-[10px] text-slate-500">{s.enrollDate}</div>
                  </td>
                  <td className="p-1.5 text-center tabular">{s.grade}</td>
                  <td className="p-1.5 text-right tabular">{cleAvg(cleAt(s, cursor))}</td>
                  <td className="p-1.5 text-right tabular">{attendanceAt(s, cursor)}</td>
                  <td className="p-1.5 text-right tabular">{toeflAt(s, cursor).total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>

      <section className="flex flex-col gap-3 lg:col-span-8 lg:grid lg:grid-cols-12 lg:grid-rows-2 lg:gap-3 lg:min-h-0">
        <div className="card p-3 flex flex-col min-h-[360px] lg:min-h-0 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] tracking-[0.14em] text-burgundy-700 font-semibold">SUBJECT · {selected.name}</div>
              <div className="text-lg font-bold">{selected.name} · {selected.grade}th Grade</div>
            </div>
            <Link to={`/d/student/${selected.id}`} className="text-xs px-3 py-1 rounded-sm bg-burgundy-500 text-white hover:bg-burgundy-700">
              DRILL DOWN →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[
              ['CLE', cleAvg(cleAt(selected, cursor))],
              ['ATT %', `${attendanceAt(selected, cursor)}%`],
              ['500-SENT', memoAt(selected, cursor)],
              ['TOEFL', toeflAt(selected, cursor).total],
            ].map(([l, v]) => (
              <div key={String(l)} className="bg-slate-50 border border-slate-200 p-2">
                <div className="text-[9px] text-slate-500 uppercase">{l}</div>
                <div className="text-xl font-bold tabular">{v}</div>
              </div>
            ))}
          </div>
          <div className="h-[180px] lg:h-auto lg:flex-1 lg:min-h-0 mt-2">
            <AttendanceTrend />
          </div>
        </div>

        <div className="card p-3 flex flex-col min-h-[260px] lg:min-h-0 lg:col-span-4">
          <div className="text-[10px] tracking-[0.14em] text-burgundy-700 font-semibold">FIG. 1 · CLE RADAR</div>
          <div className="h-[220px] lg:h-auto lg:flex-1 lg:min-h-0"><Radar current={cleAt(selected, cursor)} theme={radarTheme} /></div>
        </div>

        <div className="card p-3 flex flex-col min-h-[220px] lg:min-h-0 lg:col-span-12">
          <div className="text-[10px] tracking-[0.14em] text-burgundy-700 font-semibold">FIG. 2 · CLASS ATTENDANCE % BY MONTH</div>
          <div className="h-[180px] lg:h-auto lg:flex-1 lg:min-h-0"><ClassAttendanceBars /></div>
        </div>
      </section>
    </div>
  );
}

// Small trend bar chart of attendance across months for selected
function AttendanceTrend() {
  const cursor = useStore(s => s.cursor);
  const id = useStore(s => s.selectedId);
  const s = STUDENTS.find(st => st.id === id) ?? STUDENTS[0];
  const data = s.attendance.filter(a => a.month + '-01' <= cursor);
  const max = 100, min = 70;
  return (
    <div className="flex items-end gap-1 h-full pt-2">
      {data.slice(-12).map(d => {
        const h = ((d.rate - min) / (max - min)) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
            <div className="text-[9px] tabular">{d.rate}</div>
            <div className="w-full" style={{ height: `${h}%`, background: '#8b1e2e' }} />
            <div className="text-[8px] text-slate-500">{d.month.slice(5)}</div>
          </div>
        );
      })}
    </div>
  );
}

function ClassAttendanceBars() {
  const cursor = useStore(s => s.cursor);
  const roster = STUDENTS;
  const allMonths = Array.from(new Set(roster.flatMap(s => s.attendance.map(a => a.month)))).sort().filter(m => m + '-01' <= cursor).slice(-12);
  const data = allMonths.map(m => {
    const rates = roster.flatMap(s => s.attendance.filter(a => a.month === m).map(a => a.rate));
    return { m, avg: rates.length ? +(rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1) : 0 };
  });
  const max = 100, min = 70;
  return (
    <div className="flex items-end gap-1.5 h-full pt-2">
      {data.map(d => (
        <div key={d.m} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
          <div className="text-[9px] tabular">{d.avg}%</div>
          <div className="w-full" style={{ height: `${Math.max(0, ((d.avg - min) / (max - min)) * 100)}%`, background: '#c99b3b' }} />
          <div className="text-[9px] text-slate-500">{d.m.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}
