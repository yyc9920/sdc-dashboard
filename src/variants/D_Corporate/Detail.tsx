import { useMemo, useState } from 'react';
import { useSelectedStudent, useStore } from '../../store';
import { cleAt, cleAvg, testsAt, toeflAt, attendanceAt, memoAt, awardsAt } from '../../data';
import Radar from '../../components/Radar';

const radarTheme = {
  stroke: '#8b1e2e',
  fill: 'rgba(139,30,46,.18)',
  grid: '#e5ddce',
  label: '#5b1220',
};

export default function Detail() {
  const s = useSelectedStudent();
  const cursor = useStore(st => st.cursor);
  const cle = cleAt(s, cursor);
  const tests = testsAt(s, cursor);
  const toefl = toeflAt(s, cursor);
  const awards = awardsAt(s, cursor);

  return (
    <div className="h-full px-6 py-3 grid grid-cols-12 grid-rows-6 gap-3 overflow-hidden">
      {/* Header strip */}
      <div className="col-span-12 row-span-1 flex items-center justify-between pb-2 border-b-2 border-burgundy-500">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-burgundy-700 font-semibold">VARIANT D · KILLER · HEAT PIVOT MATRIX</div>
          <div className="text-2xl font-bold">{s.name} <span className="text-slate-400 font-normal">· {s.grade}th Grade · Enrolled {s.enrollDate}</span></div>
        </div>
        <div className="grid grid-cols-5 gap-2 text-right">
          {[
            ['CLE', cleAvg(cle)],
            ['ATT %', `${attendanceAt(s, cursor)}%`],
            ['500-SENT', `${memoAt(s, cursor)} / 500`],
            ['TOEFL', toefl.total],
            ['AWARDS', awards.length],
          ].map(([l, v]) => (
            <div key={String(l)} className="bg-burgundy-50 border border-burgundy-100 p-1.5 text-left">
              <div className="text-[9px] text-burgundy-700 uppercase">{l}</div>
              <div className="text-base font-bold tabular">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Heat Pivot Matrix — THE KILLER */}
      <div className="col-span-8 row-span-3 card p-3 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] tracking-[0.14em] text-burgundy-700 font-semibold">HEAT PIVOT · SKILL × PERIOD</div>
            <div className="text-[10px] text-slate-500">행 = CLE 지표 · 열 = 기간 스냅샷 · 색이 진할수록 높음</div>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <div className="w-4 h-3 bg-burgundy-50 border border-burgundy-100" /><span>낮음</span>
            <div className="w-4 h-3 bg-burgundy-500 border border-burgundy-100" /><span>높음</span>
          </div>
        </div>
        <HeatPivot />
      </div>

      {/* Radar */}
      <div className="col-span-4 row-span-3 card p-3 flex flex-col min-h-0">
        <div className="text-[10px] tracking-[0.14em] text-burgundy-700 font-semibold">FIG. 1 · CLE PROFILE</div>
        <div className="flex-1 min-h-0"><Radar current={cle} theme={radarTheme} /></div>
      </div>

      {/* Score table */}
      <div className="col-span-5 row-span-2 card p-3 flex flex-col min-h-0">
        <div className="text-[10px] tracking-[0.14em] text-burgundy-700 font-semibold mb-1">SCORE LEDGER (커서 기준)</div>
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[9px] text-slate-500 uppercase border-b">
                <th className="text-left p-1">Date</th><th className="text-left p-1">Type</th><th className="text-right p-1">Score</th><th className="text-left p-1">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {tests.slice(-12).reverse().map((t, i) => (
                <tr key={i} className="border-b border-slate-100 tabular">
                  <td className="p-1 text-slate-600">{t.date}</td>
                  <td className="p-1"><span className={`px-1.5 py-0.5 rounded text-[10px] text-white ${t.type === '월례' ? 'bg-slate-500' : t.type === '중간' ? 'bg-gold-500' : 'bg-burgundy-500'}`}>{t.type}</span></td>
                  <td className="p-1 text-right font-semibold">{t.score}</td>
                  <td className="p-1 w-20">
                    <div className="h-1.5 rounded bg-slate-100">
                      <div className="h-full bg-burgundy-500 rounded" style={{ width: `${t.score}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOEFL breakdown */}
      <div className="col-span-4 row-span-2 card p-3 flex flex-col">
        <div className="text-[10px] tracking-[0.14em] text-burgundy-700 font-semibold mb-1">TOEFL iBT BREAKDOWN</div>
        <table className="w-full text-sm flex-1">
          <tbody>
            {(['reading','listening','speaking','writing'] as const).map(k => (
              <tr key={k} className="border-b border-slate-100">
                <td className="py-1.5 text-[10px] text-slate-500 uppercase tracking-wider">{k}</td>
                <td className="py-1.5 text-right tabular font-semibold">{toefl[k]} / 30</td>
                <td className="py-1.5 pl-3 w-24">
                  <div className="h-1 rounded bg-slate-100"><div className="h-full bg-burgundy-500 rounded" style={{ width: `${toefl[k] / 30 * 100}%` }} /></div>
                </td>
              </tr>
            ))}
            <tr className="bg-burgundy-500 text-white">
              <td className="py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider">Total</td>
              <td className="py-1.5 px-2 text-right tabular font-bold">{toefl.total} / 120</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Awards table */}
      <div className="col-span-3 row-span-2 card p-3 flex flex-col min-h-0">
        <div className="text-[10px] tracking-[0.14em] text-burgundy-700 font-semibold mb-1">AWARDS · {awards.length}</div>
        <div className="flex-1 min-h-0 overflow-auto space-y-1">
          {awards.map(a => (
            <div key={a.title + a.date} className="text-xs border-l-2 border-gold-500 pl-2 py-1">
              <div className="font-semibold">{a.title}</div>
              <div className="text-[10px] text-slate-500">{a.org} · {a.date}</div>
            </div>
          ))}
          {awards.length === 0 && <div className="text-xs text-slate-500">No awards.</div>}
        </div>
      </div>
    </div>
  );
}

function HeatPivot() {
  const s = useSelectedStudent();
  const cursor = useStore(st => st.cursor);
  const history = useMemo(() => s.cleHistory.filter(h => h.date <= cursor).slice(-8), [s, cursor]);
  const skills: Array<{ key: 'reading'|'writing'|'listening'|'speaking'|'grammar'|'vocab'; label: string }> = [
    { key:'reading', label:'독해' }, { key:'writing', label:'작문' }, { key:'listening', label:'청해' },
    { key:'speaking', label:'회화' }, { key:'grammar', label:'문법' }, { key:'vocab', label:'어휘' },
  ];
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  const shade = (v: number) => {
    const t = Math.max(0, Math.min(1, (v - 50) / 50));
    // burgundy ramp #fdf4f4 → #8b1e2e
    const r = Math.round(253 - (253 - 139) * t);
    const g = Math.round(244 - (244 - 30) * t);
    const b = Math.round(244 - (244 - 46) * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white p-1 text-left text-[10px] font-semibold text-burgundy-700">SKILL</th>
            {history.map((h, c) => (
              <th key={h.date} className={`p-1 text-center text-[10px] font-semibold tabular ${hover?.col === c ? 'bg-burgundy-50' : ''}`}>{h.date.slice(2, 7)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {skills.map((sk, r) => (
            <tr key={sk.key}>
              <td className={`sticky left-0 bg-white p-1 font-semibold text-[11px] ${hover?.row === r ? 'text-burgundy-700' : 'text-slate-700'}`}>{sk.label}</td>
              {history.map((h, c) => {
                const v = h[sk.key];
                const active = hover?.row === r || hover?.col === c;
                return (
                  <td key={h.date}
                    onMouseEnter={() => setHover({ row: r, col: c })}
                    onMouseLeave={() => setHover(null)}
                    className="p-1 text-center tabular text-[10px] cursor-pointer transition"
                    style={{
                      background: shade(v),
                      color: v > 80 ? '#fff' : '#3a0a12',
                      outline: active ? '2px solid #c99b3b' : 'none',
                      outlineOffset: -1,
                    }}>
                    {v.toFixed(0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {hover && (
        <div className="mt-2 text-[11px] text-burgundy-700">
          <span className="font-semibold">{skills[hover.row].label}</span> · <span>{history[hover.col].date.slice(0, 7)}</span> · 값 {history[hover.col][skills[hover.row].key].toFixed(1)}
        </div>
      )}
    </div>
  );
}
