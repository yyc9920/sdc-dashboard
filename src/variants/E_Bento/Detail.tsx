import { motion } from 'framer-motion';
import { useSelectedStudent, useStore } from '../../store';
import { cleAt, cleAvg, testsAt, toeflAt, attendanceAt, memoAt, awardsAt, monthsBetween, TODAY } from '../../data';
import Radar from '../../components/Radar';
import ScoreLine from '../../components/ScoreLine';

const radarTheme = {
  stroke: '#ff5a3c',
  fill: 'rgba(255,90,60,.22)',
  grid: 'rgba(20,20,20,.12)',
  label: '#141414',
};
const lineTheme = { line: '#141414', mon: '#141414', mid: '#ff5a3c', fin: '#c99b3b', grid: 'rgba(20,20,20,.12)', text: '#141414' };

export default function Detail() {
  const s = useSelectedStudent();
  const cursor = useStore(st => st.cursor);
  const isPlaying = useStore(st => st.isPlaying);
  const playSpeed = useStore(st => st.playSpeed);
  const setPlaying = useStore(st => st.setPlaying);
  const setCursor = useStore(st => st.setCursor);

  const cle = cleAt(s, cursor);
  const tests = testsAt(s, cursor);
  const toefl = toeflAt(s, cursor);
  const awards = awardsAt(s, cursor);
  const totalMonths = monthsBetween(s.enrollDate, TODAY);
  const monthsIn = monthsBetween(s.enrollDate, cursor);
  const progress = totalMonths === 0 ? 100 : (monthsIn / totalMonths) * 100;

  const startReel = () => {
    setCursor(s.enrollDate);
    requestAnimationFrame(() => setPlaying(true));
  };

  return (
    <div className="h-full px-6 py-4 grid grid-cols-12 gap-3 overflow-hidden" style={{ gridTemplateRows: 'auto 1fr' }}>
      {/* Header with Growth Reel CTA */}
      <div className="col-span-12 flex items-end justify-between">
        <div>
          <div className="micro">Variant E · KILLER · Growth Reel</div>
          <div className="display text-3xl font-black leading-tight">{s.name}의 성장 리플레이</div>
          <div className="text-xs opacity-60 mt-0.5">{s.enrollDate} 입학 · {monthsIn} / {totalMonths} 개월차</div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={startReel}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="px-4 py-2 rounded-full bg-[#ff5a3c] text-white font-bold shadow-lg">
            {isPlaying ? '▶ 재생 중…' : '▶ 입학부터 재생'}
          </motion.button>
          <div className="text-[10px] opacity-60">{playSpeed}× 속도 (하단 컨트롤)</div>
        </div>
      </div>

      <div className="col-span-12 grid grid-cols-12 gap-3 min-h-0" style={{ gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}>
        {/* Cover card with live progress ring */}
        <div className="bento dark col-span-4 row-span-2 flex flex-col justify-between">
          <div>
            <div className="micro opacity-70">Reel · Now Playing</div>
            <motion.div
              key={cursor}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="display text-4xl font-black mt-2">
              {cursor}
            </motion.div>
            <div className="text-xs opacity-80 mt-1">{s.grade}학년 · 입학 {s.enrollDate}</div>
          </div>

          <div className="flex items-center gap-4 my-4">
            <svg width="96" height="96">
              <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,.1)" strokeWidth="10" fill="none" />
              <motion.circle cx="48" cy="48" r="40" stroke="#ff5a3c" strokeWidth="10" fill="none"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                transform="rotate(-90 48 48)" />
            </svg>
            <div>
              <div className="micro opacity-60">Timeline</div>
              <div className="display text-3xl font-black">{progress.toFixed(0)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Mini label="CLE"   value={cleAvg(cle)} />
            <Mini label="TOEFL" value={toefl.total} />
            <Mini label="500"   value={memoAt(s, cursor)} />
          </div>
        </div>

        {/* Radar animates as cursor moves */}
        <div className="bento cream col-span-5 row-span-2 min-h-0 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <div className="micro">Fig. A · CLE</div>
              <div className="display text-xl font-bold">실력 모양의 변화</div>
            </div>
            <div className="text-[10px] opacity-60">{cursor} 시점</div>
          </div>
          <motion.div
            key={cursor}
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-h-0 mt-1">
            <Radar current={cle} theme={radarTheme} />
          </motion.div>
        </div>

        <div className="bento accent col-span-3 row-span-1 flex flex-col justify-center">
          <div className="micro opacity-80">Tests Logged</div>
          <motion.div key={tests.length} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="display text-5xl font-black leading-none">{tests.length}</motion.div>
          <div className="text-xs opacity-80">누적 (월례·중간·기말)</div>
        </div>

        <div className="bento col-span-3 row-span-1 flex flex-col justify-center">
          <div className="micro">Attendance</div>
          <motion.div key={attendanceAt(s, cursor)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="display text-5xl font-black leading-none">{attendanceAt(s, cursor)}%</motion.div>
          <div className="h-1 mt-2 bg-black/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-[#ff5a3c]"
              animate={{ width: `${attendanceAt(s, cursor)}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Score stream */}
        <div className="bento col-span-8 row-span-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="micro">Fig. B · Score Stream</div>
              <div className="display text-lg font-bold">월례 · 중간 · 기말</div>
            </div>
            <div className="text-[10px] opacity-60">{tests.length}건 누적</div>
          </div>
          <div className="flex-1 min-h-0"><ScoreLine tests={tests} theme={lineTheme} /></div>
        </div>

        {/* Awards bar */}
        <div className="bento accent col-span-4 row-span-1 flex flex-col">
          <div className="micro opacity-80">Awards · {awards.length}</div>
          <div className="flex-1 mt-1 flex items-center gap-2 overflow-x-auto">
            {awards.slice(0, 4).map(a => (
              <motion.div key={a.title + a.date}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0 bg-white/15 backdrop-blur rounded-xl px-2 py-1.5 flex items-center gap-1.5">
                <span className="text-lg">{a.icon ?? '✶'}</span>
                <div>
                  <div className="text-xs font-semibold truncate max-w-[140px]">{a.title}</div>
                  <div className="text-[10px] opacity-80">{a.date}</div>
                </div>
              </motion.div>
            ))}
            {awards.length === 0 && <div className="text-sm opacity-80">아직 수상 없음 — 곧 추가될 거예요!</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="micro opacity-60">{label}</div>
      <div className="display text-xl font-bold">{value}</div>
    </div>
  );
}
