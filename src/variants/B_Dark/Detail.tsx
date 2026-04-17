import { useMemo } from 'react';
import { useSelectedStudent, useStore } from '../../store';
import { STUDENTS, cleAt, cleAvg, testsAt, toeflAt, attendanceAt, memoAt, awardsAt } from '../../data';
import Radar from '../../components/Radar';
import ScoreLine from '../../components/ScoreLine';

const radarTheme = {
  stroke: '#7dd3fc',
  fill: 'rgba(125,211,252,.22)',
  grid: 'rgba(255,255,255,.08)',
  label: '#cbd5e1',
  ghostStroke: '#a78bfa',
  ghostFill: 'transparent',
};
const lineTheme = { line: '#7dd3fc', mon: '#7dd3fc', mid: '#a78bfa', fin: '#f472b6', grid: 'rgba(255,255,255,.08)', text: '#cbd5e1', avg: '#a78bfa' };

export default function Detail() {
  const s = useSelectedStudent();
  const cursor = useStore(st => st.cursor);
  const cle = cleAt(s, cursor);
  const tests = testsAt(s, cursor);
  const toefl = toeflAt(s, cursor);

  // cohort avg CLE (for ghost overlay on radar)
  const cohortCLE = useMemo(() => {
    const all = STUDENTS.map(st => cleAt(st, cursor));
    const avg = (k: keyof typeof cle) => +(all.reduce((a, b) => a + b[k], 0) / all.length).toFixed(1);
    return {
      reading: avg('reading'), writing: avg('writing'), listening: avg('listening'),
      speaking: avg('speaking'), grammar: avg('grammar'), vocab: avg('vocab'),
    };
  }, [cursor]);

  // cohort avg line series
  const cohortAvgLine = useMemo(() => {
    const dates = Array.from(new Set(STUDENTS.flatMap(s => s.tests.map(t => t.date)))).sort();
    return dates.map(date => {
      const scores = STUDENTS.flatMap(s => s.tests.filter(t => t.date === date).map(t => t.score));
      return { date, score: scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0 };
    });
  }, []);

  // rank
  const byAvg = [...STUDENTS].map(st => ({ id: st.id, avg: cleAvg(cleAt(st, cursor)) })).sort((a, b) => b.avg - a.avg);
  const rank = byAvg.findIndex(r => r.id === s.id) + 1;
  const percentile = Math.max(1, Math.round((rank / STUDENTS.length) * 100));

  return (
    <div className="h-full px-6 py-4 grid grid-cols-12 grid-rows-6 gap-4 overflow-hidden">
      <div className="col-span-12 row-span-1 card glow p-4 flex items-center justify-between">
        <div>
          <div className="mono text-[10px] tracking-[0.2em] text-sky-300/80">KILLER · LIVE COHORT RANK</div>
          <div className="flex items-baseline gap-3 mt-0.5">
            <div className="text-3xl font-black">{s.name}</div>
            <div className="mono text-[11px] opacity-60">G{s.grade} · enrolled {s.enrollDate}</div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="mono text-[10px] opacity-60">RANK</div>
            <div className="mono text-3xl font-black grad">{rank}<span className="text-lg opacity-60">/{STUDENTS.length}</span></div>
          </div>
          <div className="text-right">
            <div className="mono text-[10px] opacity-60">PERCENTILE</div>
            <div className="mono text-3xl font-black">상위 {percentile}%</div>
          </div>
        </div>
      </div>

      {/* Radar vs cohort avg */}
      <div className="col-span-5 row-span-3 card p-4 flex flex-col">
        <div className="mono text-[10px] opacity-60">CLE · YOU vs COHORT AVG</div>
        <div className="text-xs opacity-70">점선 = 반 평균 / 실선 = {s.name}</div>
        <div className="flex-1 min-h-0"><Radar current={cle} ghost={cohortCLE} theme={radarTheme} /></div>
      </div>

      {/* Score + cohort avg line */}
      <div className="col-span-7 row-span-3 card p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <div className="mono text-[10px] opacity-60">SCORE_STREAM · overlay cohort avg</div>
            <div className="text-xs opacity-70">● 월례 ■ 중간 ◆ 기말 · 점선 = 반 평균</div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ScoreLine tests={tests} theme={lineTheme} cohortAvg={cohortAvgLine.filter(c => c.date <= cursor)} />
        </div>
      </div>

      {/* TOEFL */}
      <div className="col-span-4 row-span-2 card p-4 flex flex-col">
        <div className="mono text-[10px] opacity-60 mb-1">TOEFL iBT</div>
        <div className="flex items-baseline gap-2">
          <div className="mono text-4xl font-black grad">{toefl.total}</div>
          <div className="mono text-xs opacity-60">/ 120</div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-auto">
          {(['reading','listening','speaking','writing'] as const).map(k => (
            <div key={k} className="rounded-lg bg-white/5 border border-white/5 px-2 py-1.5">
              <div className="mono text-[9px] opacity-60 uppercase">{k}</div>
              <div className="mono text-lg font-bold">{toefl[k]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance / 500 sentences */}
      <div className="col-span-4 row-span-2 card p-4 flex flex-col gap-3">
        <div className="mono text-[10px] opacity-60">ATTENDANCE & 500-SENTENCES</div>
        <div>
          <div className="flex items-baseline justify-between">
            <div className="mono text-[10px] opacity-60">ATT %</div>
            <div className="mono text-xl font-bold">{attendanceAt(s, cursor)}%</div>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
            <div className="h-full" style={{ width: `${attendanceAt(s, cursor)}%`, background: 'linear-gradient(90deg,#7dd3fc,#a78bfa)' }} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <div className="mono text-[10px] opacity-60">500-SENT</div>
            <div className="mono text-xl font-bold">{memoAt(s, cursor)} / 500</div>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
            <div className="h-full" style={{ width: `${memoAt(s, cursor) / 500 * 100}%`, background: 'linear-gradient(90deg,#f472b6,#a78bfa)' }} />
          </div>
        </div>
        <div className="mono text-[10px] opacity-50 mt-auto">커서: {cursor}</div>
      </div>

      {/* Awards */}
      <div className="col-span-4 row-span-2 card p-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-1">
          <div className="mono text-[10px] opacity-60">AWARDS & ACHIEVEMENTS</div>
          <div className="mono text-[10px] opacity-60">{awardsAt(s, cursor).length} entries</div>
        </div>
        <div className="flex-1 min-h-0 overflow-auto space-y-1.5">
          {awardsAt(s, cursor).map(a => (
            <div key={a.title + a.date} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-base">{a.icon ?? '✶'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{a.title}</div>
                <div className="mono text-[9px] opacity-60">{a.org} · {a.date}</div>
              </div>
            </div>
          ))}
          {awardsAt(s, cursor).length === 0 && <div className="text-xs opacity-60">No awards yet.</div>}
        </div>
      </div>
    </div>
  );
}
