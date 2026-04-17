import { useMemo } from 'react';
import { useSelectedStudent, useStore } from '../../store';
import { cleAt, testsAt, toeflAt, attendanceAt, memoAt, awardsAt } from '../../data';
import Radar from '../../components/Radar';
import ScoreLine from '../../components/ScoreLine';

const radarTheme = {
  stroke: '#c6604a',
  fill: 'rgba(198,96,74,.18)',
  grid: '#e8e4dc',
  label: '#555',
  ghostStroke: '#c6604a',
  ghostFill: 'transparent',
};
const lineTheme = { line: '#c6604a', mon: '#94a3b8', mid: '#f59e0b', fin: '#e11d48', grid: '#efece6', text: '#666' };

export default function Detail() {
  const s = useSelectedStudent();
  const cursor = useStore(st => st.cursor);

  const cle = cleAt(s, cursor);
  const earliestDate = s.cleHistory[0].date;
  const ghostCle = cleAt(s, earliestDate); // "past self" — starting point
  const deltas = useMemo(() => ({
    reading:   +(cle.reading   - ghostCle.reading  ).toFixed(1),
    writing:   +(cle.writing   - ghostCle.writing  ).toFixed(1),
    listening: +(cle.listening - ghostCle.listening).toFixed(1),
    speaking:  +(cle.speaking  - ghostCle.speaking ).toFixed(1),
    grammar:   +(cle.grammar   - ghostCle.grammar  ).toFixed(1),
    vocab:     +(cle.vocab     - ghostCle.vocab    ).toFixed(1),
  }), [cle, ghostCle]);

  const toefl = toeflAt(s, cursor);
  const tests = testsAt(s, cursor);
  const awards = awardsAt(s, cursor);

  return (
    <div className="h-full px-6 py-4 grid grid-cols-12 grid-rows-6 gap-4 overflow-hidden">
      {/* Header / killer: Ghost Self delta chips */}
      <div className="col-span-12 row-span-1 card p-4 flex items-center justify-between">
        <div>
          <div className="chip inline-block">KILLER · Ghost Self</div>
          <div className="flex items-baseline gap-3 mt-0.5">
            <div className="display text-4xl font-bold">{s.name}</div>
            <div className="muted text-xs">{s.grade}학년 · {s.enrollDate} 입학</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] muted mr-1">입학 대비 성장</div>
          {(Object.entries(deltas) as Array<[keyof typeof deltas, number]>).map(([k, v]) => (
            <div key={k} className="px-2 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: v >= 0 ? '#e7f5ef' : '#fbe9e7', color: v >= 0 ? '#1f7a4f' : '#b23a2b' }}>
              {labelOf(k)} {v >= 0 ? '+' : ''}{v}
            </div>
          ))}
        </div>
      </div>

      {/* Radar with ghost overlay */}
      <div className="col-span-5 row-span-3 card p-4 flex flex-col">
        <div className="text-[11px] font-semibold uppercase tracking-wider">CLE · Ghost Overlay</div>
        <div className="muted text-[10px]">점선 = 입학 시점 · 실선 = {cursor.slice(0, 7)}</div>
        <div className="flex-1 min-h-0"><Radar current={cle} ghost={ghostCle} theme={radarTheme} /></div>
      </div>

      {/* Score timeline */}
      <div className="col-span-7 row-span-3 card p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider">교과 성적 추이</div>
            <div className="muted text-[10px]">● 월례 · ■ 중간 · ◆ 기말</div>
          </div>
          <div className="muted text-[10px]">{tests.length}건 (커서 기준)</div>
        </div>
        <div className="flex-1 min-h-0"><ScoreLine tests={tests} theme={lineTheme} /></div>
      </div>

      {/* TOEFL */}
      <div className="col-span-5 row-span-2 card p-4 flex flex-col">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">TOEFL (커서 기준)</div>
        <div className="flex items-baseline gap-2">
          <div className="display text-4xl font-bold">{toefl.total}</div>
          <div className="muted text-xs">/ 120</div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {(['reading','listening','speaking','writing'] as const).map(k => (
            <div key={k} className="rounded-lg bg-[#faf8f2] p-2 text-center">
              <div className="muted text-[9px] uppercase">{k}</div>
              <div className="display text-lg">{toefl[k]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance + Memo */}
      <div className="col-span-7 row-span-2 card p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider">출석 · 500문장 암기 (YTD)</div>
            <div className="muted text-[10px]">커서 날짜 기준</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2 flex-1 min-h-0">
          <div className="rounded-lg bg-[#faf8f2] p-3 flex flex-col justify-center">
            <div className="muted text-[10px] uppercase">출석률</div>
            <div className="display text-3xl font-bold">{attendanceAt(s, cursor)}%</div>
            <div className="h-1 mt-2 rounded-full bg-[#ece6d8]">
              <div className="h-full rounded-full" style={{ width: `${attendanceAt(s, cursor)}%`, background: '#c6604a' }} />
            </div>
          </div>
          <div className="rounded-lg bg-[#faf8f2] p-3 flex flex-col justify-center">
            <div className="muted text-[10px] uppercase">500문장 암기</div>
            <div className="display text-3xl font-bold">{memoAt(s, cursor)}<span className="muted text-sm"> / 500</span></div>
            <div className="h-1 mt-2 rounded-full bg-[#ece6d8]">
              <div className="h-full rounded-full" style={{ width: `${memoAt(s, cursor) / 500 * 100}%`, background: '#c6604a' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Awards strip */}
      <div className="col-span-12 row-span-1 card p-2 px-4 flex items-center gap-3 overflow-x-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider mr-2 whitespace-nowrap">수상 ({awards.length})</div>
        {awards.map(a => (
          <div key={a.title + a.date} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#f2efe8] text-xs whitespace-nowrap">
            <span>{a.icon ?? '✶'}</span>
            <span className="font-medium">{a.title}</span>
            <span className="muted text-[10px]">{a.date}</span>
          </div>
        ))}
        {awards.length === 0 && <span className="muted text-xs">아직 수상 이력이 없어요.</span>}
      </div>
    </div>
  );
}

function labelOf(k: string): string {
  return ({ reading:'독해', writing:'작문', listening:'청해', speaking:'회화', grammar:'문법', vocab:'어휘' } as Record<string,string>)[k] ?? k;
}
