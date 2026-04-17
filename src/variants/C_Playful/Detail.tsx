import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelectedStudent, useStore } from '../../store';
import { cleAt, testsAt, toeflAt, attendanceAt, memoAt, awardsAt, avatar, monthsBetween } from '../../data';
import Radar from '../../components/Radar';
import ScoreLine from '../../components/ScoreLine';

const radarTheme = {
  stroke: '#e11d48',
  fill: 'rgba(251,113,133,.3)',
  grid: '#2d1b3d22',
  label: '#2d1b3d',
};
const lineTheme = { line: '#e11d48', mon: '#38bdf8', mid: '#f59e0b', fin: '#e11d48', grid: '#2d1b3d22', text: '#2d1b3d' };

export default function Detail() {
  const s = useSelectedStudent();
  const cursor = useStore(st => st.cursor);
  const cle = cleAt(s, cursor);
  const tests = testsAt(s, cursor);
  const toefl = toeflAt(s, cursor);
  const cleStart = cleAt(s, s.cleHistory[0].date);
  const awards = awardsAt(s, cursor);
  const monthsIn = monthsBetween(s.enrollDate, cursor);

  // Template-based AI coach narration based on deltas
  const message = useMemo(() => {
    if (cursor <= s.enrollDate) return `${s.name} 친구, 입학 첫날이에요! 앞으로 함께 성장해요 🌱`;
    const deltas = {
      reading: +(cle.reading - cleStart.reading).toFixed(1),
      writing: +(cle.writing - cleStart.writing).toFixed(1),
      listening: +(cle.listening - cleStart.listening).toFixed(1),
      speaking: +(cle.speaking - cleStart.speaking).toFixed(1),
      grammar: +(cle.grammar - cleStart.grammar).toFixed(1),
      vocab: +(cle.vocab - cleStart.vocab).toFixed(1),
    } as const;
    const best = (Object.entries(deltas) as Array<[keyof typeof deltas, number]>)
      .sort((a, b) => b[1] - a[1])[0];
    const label: Record<string, string> = { reading:'독해', writing:'작문', listening:'청해', speaking:'회화', grammar:'문법', vocab:'어휘' };
    const memoNow = memoAt(s, cursor);
    const att = attendanceAt(s, cursor);
    if (best[1] >= 12) return `${s.name} 친구, ${monthsIn}개월 동안 ${label[best[0]]} 실력이 ${best[1]}점이나 올랐어요! 정말 대단해요 🎉`;
    if (memoNow >= 400) return `와! ${memoNow}문장이나 외웠어요! 500문장 목표까지 ${500 - memoNow}개 남았네요 💪`;
    if (att >= 95) return `${att}% 개근! 꾸준함이 ${s.name} 친구의 최고 무기예요 ⭐`;
    if (best[1] > 0) return `${label[best[0]]} 분야에서 +${best[1]}점 성장! 조금만 더 힘내면 훨씬 좋아질 거예요 🌟`;
    return `잘하고 있어요 ${s.name} 친구! 다음 시험도 화이팅 💪`;
  }, [cursor, s, cle, cleStart, monthsIn]);

  return (
    <div className="h-full px-6 py-4 grid grid-cols-12 grid-rows-6 gap-3 overflow-hidden">
      {/* Hero profile + AI coach (killer) */}
      <div className="col-span-12 row-span-2 card p-4 flex items-center gap-5 relative">
        <div className="w-24 h-24 rounded-full grid place-items-center text-4xl border-4 border-[#2d1b3d] shadow-[4px_4px_0_#2d1b3d]"
          style={{ background: avatar(s.id) }}>{s.name[0]}</div>
        <div className="flex-1">
          <span className="pill inline-block" style={{ background: '#fde5c3' }}>KILLER · AI 코치</span>
          <div className="fun text-4xl font-bold mt-1">{s.name} 친구 🌟</div>
          <div className="text-xs mt-0.5">{s.grade}학년 · {s.enrollDate} 입학 · 함께한 지 {monthsIn}개월</div>
        </div>

        <div className="flex items-end gap-3 max-w-[40%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white border-3 border-[#2d1b3d] rounded-3xl px-4 py-3 text-sm leading-snug max-w-[360px] shadow-[4px_4px_0_#2d1b3d]"
              style={{ borderWidth: 3 }}>
              <div className="fun text-base">{message}</div>
              <div className="absolute -right-2 bottom-4 w-4 h-4 bg-white border-r-[3px] border-b-[3px] border-[#2d1b3d] rotate-[-45deg]" />
            </motion.div>
          </AnimatePresence>
          <motion.div
            className="text-6xl select-none"
            animate={{ rotate: [0, -6, 6, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}>
            🐻
          </motion.div>
        </div>
      </div>

      <div className="col-span-5 row-span-4 card p-4 flex flex-col min-h-0">
        <div className="fun text-2xl font-bold">✏️ 6가지 실력</div>
        <div className="text-[11px]">독해·작문·청해·회화·문법·어휘</div>
        <div className="flex-1 min-h-0"><Radar current={cle} theme={radarTheme} /></div>
      </div>

      <div className="col-span-7 row-span-2 card p-4 flex flex-col min-h-0">
        <div className="fun text-2xl font-bold">📈 시험 점수 타임라인</div>
        <div className="flex-1 min-h-0"><ScoreLine tests={tests} theme={lineTheme} /></div>
      </div>

      <div className="col-span-3 row-span-2 card p-3 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(160deg,#b8ecd2,#c9d7ff)' }}>
        <div className="fun text-lg">🎯 TOEFL</div>
        <div className="fun text-5xl font-bold text-rose-600">{toefl.total}</div>
        <div className="fun text-sm">/ 120</div>
      </div>

      <div className="col-span-4 row-span-2 card p-3 flex flex-col gap-2">
        <div className="fun text-lg">🎟️ 출석 · 📖 500문장</div>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="rounded-2xl grid place-items-center border-3 border-[#2d1b3d] p-2" style={{ background:'#fff3b0' }}>
            <div className="fun text-[11px]">출석</div>
            <div className="fun text-3xl font-bold">{attendanceAt(s, cursor)}%</div>
          </div>
          <div className="rounded-2xl grid place-items-center border-3 border-[#2d1b3d] p-2" style={{ background:'#ffc6c9' }}>
            <div className="fun text-[11px]">500문장</div>
            <div className="fun text-3xl font-bold">{memoAt(s, cursor)}</div>
            <div className="fun text-[10px]">/ 500</div>
          </div>
        </div>
      </div>

      <div className="col-span-12 row-span-2 card p-3 flex flex-col min-h-0">
        <div className="fun text-lg font-bold mb-1">🏆 자랑할 만한 순간들 ({awards.length})</div>
        <div className="flex-1 min-h-0 flex gap-2 overflow-x-auto">
          {awards.map((a, i) => (
            <div key={a.title + a.date} className="flex-shrink-0 p-2 px-3 rounded-2xl border-3 border-[#2d1b3d] shadow-[3px_3px_0_#2d1b3d] flex items-center gap-2"
              style={{ background: ['#fff3b0','#ffc6c9','#b8ecd2','#c9d7ff','#fde5c3','#e9d5ff'][i % 6] }}>
              <span className="text-2xl">{a.icon ?? '✶'}</span>
              <div>
                <div className="fun text-sm font-bold leading-tight">{a.title}</div>
                <div className="text-[10px]">{a.org} · {a.date}</div>
              </div>
            </div>
          ))}
          {awards.length === 0 && <div className="fun text-sm opacity-70">아직 수상 이력이 없어요. 다음 대회 화이팅!</div>}
        </div>
      </div>
    </div>
  );
}
