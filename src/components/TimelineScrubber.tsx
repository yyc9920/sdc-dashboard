import { useMemo, useEffect } from 'react';
import { useStore, useSelectedStudent } from '../store';
import { TODAY, monthsBetween } from '../data';

export default function TimelineScrubber({ variant }: { variant: 'a'|'b'|'c'|'d'|'e' }) {
  const s = useSelectedStudent();
  const cursor = useStore(st => st.cursor);
  const setCursor = useStore(st => st.setCursor);
  const resetCursor = useStore(st => st.resetCursor);
  const isPlaying = useStore(st => st.isPlaying);
  const setPlaying = useStore(st => st.setPlaying);
  const playSpeed = useStore(st => st.playSpeed);
  const setSpeed = useStore(st => st.setSpeed);

  const totalMonths = useMemo(() => monthsBetween(s.enrollDate, TODAY), [s.enrollDate]);
  const cursorMonths = useMemo(() => monthsBetween(s.enrollDate, cursor), [s.enrollDate, cursor]);

  // snap cursor into range when student changes
  useEffect(() => {
    if (cursor < s.enrollDate) setCursor(s.enrollDate);
    if (cursor > TODAY) setCursor(TODAY);
  }, [s.id, s.enrollDate]);

  // auto-play driver (Growth Reel lives in variant E but shared loop here)
  useEffect(() => {
    if (!isPlaying) return;
    const startCursor = cursor;
    const duration = 6000 / playSpeed; // ms to traverse start→today
    const startMs = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - startMs;
      const t = Math.min(1, elapsed / duration);
      const startMonths = monthsBetween(s.enrollDate, startCursor);
      const m = startMonths + t * (totalMonths - startMonths);
      const newCursor = addMonths(s.enrollDate, Math.round(m));
      setCursor(newCursor);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, playSpeed, s.id]);

  const pct = totalMonths === 0 ? 100 : (cursorMonths / totalMonths) * 100;

  const track = variant === 'b' ? 'rgba(255,255,255,.1)' : variant === 'd' ? '#e5ddce' : variant === 'c' ? '#2d1b3d22' : '#e5e7eb';
  const fill  = variant === 'b' ? '#7dd3fc'            : variant === 'd' ? '#8b1e2e' : variant === 'c' ? '#e11d48' : variant === 'e' ? '#ff5a3c' : '#c6604a';
  const knob  = fill;

  return (
    <div className="px-5 py-3 border-t flex items-center gap-4"
      style={{
        backgroundColor: variant === 'b' ? 'rgba(10,12,18,.6)' : 'rgba(255,255,255,.6)',
        borderColor: variant === 'b' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)',
        backdropFilter: 'blur(6px)',
        color: variant === 'b' ? '#e5e7eb' : undefined,
      }}>
      <div className="flex items-center gap-2">
        <button onClick={() => setPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full grid place-items-center text-sm font-bold"
          style={{ background: fill, color: '#fff' }} aria-label="play">
          {isPlaying ? '❙❙' : '▶'}
        </button>
        <div className="flex gap-0.5">
          {[1,2,4].map(n => (
            <button key={n} onClick={() => setSpeed(n as 1|2|4)}
              className={`px-1.5 py-0.5 text-[10px] rounded ${playSpeed===n ? 'bg-black/20 font-bold' : 'opacity-50 hover:opacity-100'}`}>
              {n}×
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3">
        <div className="text-[11px] opacity-70 font-mono whitespace-nowrap">{s.enrollDate}</div>
        <div className="relative flex-1 h-2 rounded-full" style={{ background: track }}>
          <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
          <input
            type="range"
            min={0}
            max={totalMonths}
            value={cursorMonths}
            onChange={(e) => setCursor(addMonths(s.enrollDate, Number(e.target.value)))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow"
            style={{ left: `${pct}%`, background: knob }} />
        </div>
        <div className="text-[11px] opacity-70 font-mono whitespace-nowrap">{TODAY}</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold tabular-nums">{cursor}</div>
        <button onClick={resetCursor} className="text-[11px] px-2 py-1 rounded bg-black/5 hover:bg-black/10">오늘로</button>
      </div>
    </div>
  );
}

function addMonths(date: string, m: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + m);
  return d.toISOString().slice(0, 10);
}
