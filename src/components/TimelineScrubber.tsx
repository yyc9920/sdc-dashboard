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
    const duration = 6000 / playSpeed;
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

  const isDark = variant === 'b';
  const track = isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb';
  const fill =
    variant === 'b' ? '#7dd3fc' :
    variant === 'd' ? '#8b1e2e' :
    variant === 'c' ? '#e11d48' :
    variant === 'e' ? '#ff5a3c' :
    '#c6604a';

  return (
    <div
      className="px-3 sm:px-5 py-2 sm:py-3 border-t backdrop-blur-md flex items-center gap-2 sm:gap-4"
      style={{
        backgroundColor: isDark ? 'rgba(10,12,18,.88)' : 'rgba(255,255,255,.92)',
        borderColor: isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)',
        color: isDark ? '#e5e7eb' : undefined,
      }}>
      {/* Play button — always visible, 44px touch target */}
      <button
        onClick={() => setPlaying(!isPlaying)}
        className="w-11 h-11 sm:w-10 sm:h-10 rounded-full grid place-items-center text-sm font-bold shrink-0 shadow-sm"
        style={{ background: fill, color: '#fff' }}
        aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? '❚❚' : '▶'}
      </button>

      {/* Speed (desktop only) */}
      <div className="hidden sm:flex gap-0.5 shrink-0" role="radiogroup" aria-label="Playback speed">
        {[1, 2, 4].map(n => (
          <button key={n} onClick={() => setSpeed(n as 1 | 2 | 4)}
            className={`px-1.5 py-0.5 text-[10px] rounded ${playSpeed === n ? 'bg-black/20 font-bold' : 'opacity-50 hover:opacity-100'}`}
            aria-pressed={playSpeed === n}>
            {n}×
          </button>
        ))}
      </div>

      {/* Scrubber — takes remaining width */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="text-[10px] opacity-70 font-mono whitespace-nowrap hidden md:block">{s.enrollDate.slice(2)}</div>
        <div className="relative flex-1 h-2 rounded-full" style={{ background: track }}>
          <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
          <input
            type="range"
            min={0}
            max={totalMonths}
            value={cursorMonths}
            onChange={(e) => setCursor(addMonths(s.enrollDate, Number(e.target.value)))}
            aria-label="Timeline cursor"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ touchAction: 'none' }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow pointer-events-none"
            style={{ left: `${pct}%`, background: fill }} />
        </div>
        <div className="text-[10px] opacity-70 font-mono whitespace-nowrap hidden md:block">{TODAY.slice(2)}</div>
      </div>

      {/* Cursor readout */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="text-xs sm:text-sm font-semibold tabular-nums">{cursor.slice(2)}</div>
        <button onClick={resetCursor}
          className="h-8 px-2 text-[10px] font-semibold rounded bg-black/10 hover:bg-black/15"
          aria-label="오늘로 돌아가기">
          <span className="hidden sm:inline">오늘로</span><span className="sm:hidden">Now</span>
        </button>
      </div>
    </div>
  );
}

function addMonths(date: string, m: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + m);
  return d.toISOString().slice(0, 10);
}
