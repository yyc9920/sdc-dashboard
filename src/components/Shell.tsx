import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStore } from '../store';
import { STUDENTS } from '../data';
import TimelineScrubber from './TimelineScrubber';

const VARIANTS = [
  { id: 'a', code: 'A', label: '미니멀',   desc: 'Ghost Self overlay' },
  { id: 'b', code: 'B', label: '다크모드', desc: 'Live Cohort Rank' },
  { id: 'c', code: 'C', label: '키즈',     desc: 'AI 코치 말풍선' },
  { id: 'd', code: 'D', label: '코퍼릿',   desc: 'Heat Pivot Matrix' },
  { id: 'e', code: 'E', label: '벤토',     desc: 'Growth Reel ▶' },
] as const;

export default function VariantShell({ variant, children }: { variant: 'a'|'b'|'c'|'d'|'e'; children: ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const selectedId = useStore(s => s.selectedId);
  const setSelected = useStore(s => s.setSelected);
  const isDetail = /\/student\//.test(pathname);

  const switchVariant = (id: string) => {
    if (isDetail) nav(`/${id}/student/${selectedId}`);
    else nav(`/${id}`);
  };

  // Dark-variant color overrides (shell chrome adapts to each variant's palette)
  const isDark = variant === 'b';
  const headerBg = isDark ? 'rgba(10,12,18,.85)' : 'rgba(255,255,255,.9)';
  const headerBorder = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
  const headerText = isDark ? '#e5e7eb' : undefined;
  const accent =
    variant === 'd' ? '#8b1e2e' :
    variant === 'c' ? '#e11d48' :
    variant === 'e' ? '#ff5a3c' :
    variant === 'b' ? '#7dd3fc' :
    '#1a1a1a';

  return (
    <div className={`v-${variant} min-h-screen w-full flex flex-col lg:h-screen lg:w-screen lg:grid lg:grid-rows-[56px_1fr_auto]`}>
      {/* Header: 2 rows on mobile (brand+picker / tabs), 1 row on lg+ */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md border-b flex flex-col lg:flex-row"
        style={{ backgroundColor: headerBg, borderColor: headerBorder, color: headerText }}>
        {/* Row 1: brand + student picker + detail toggle */}
        <div className="flex items-center gap-2 px-3 sm:px-5 h-12 lg:h-auto lg:py-0 lg:flex-1 lg:w-auto">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg grid place-items-center text-sm font-black" style={{ background: accent, color: '#fff' }}>S</div>
            <div className="leading-tight hidden sm:block">
              <div className="text-sm font-bold">SDC Dashboard</div>
              <div className="text-[10px] opacity-60">초등부 세미나</div>
            </div>
          </div>

          {/* Tab bar — inline on lg+, on its own row below on mobile */}
          <nav className="hidden lg:flex gap-1 ml-4">
            {VARIANTS.map(v => (
              <button key={v.id} onClick={() => switchVariant(v.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition shrink-0
                  ${v.id === variant
                    ? (isDark ? 'bg-white text-slate-900' : 'text-white')
                    : 'opacity-60 hover:opacity-100'}`}
                style={v.id === variant && !isDark ? { background: accent } : undefined}>
                <span className="opacity-70">{v.code}</span><span>{v.label}</span>
              </button>
            ))}
            <div className="hidden xl:flex items-center ml-3 text-[11px] opacity-60">
              {VARIANTS.find(v => v.id === variant)?.desc}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <select
              value={selectedId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelected(id);
                if (isDetail) nav(`/${variant}/student/${id}`);
              }}
              aria-label="Select student"
              className="h-9 text-sm rounded-lg border border-black/10 px-2.5 bg-white/90 text-slate-800 font-medium"
              style={{ maxWidth: '11rem' }}>
              {[...STUDENTS].sort((a,b)=>a.name.localeCompare(b.name,'ko')).map(s => (
                <option key={s.id} value={s.id}>{s.name} · {s.grade}학년</option>
              ))}
            </select>
            {isDetail ? (
              <Link to={`/${variant}`} aria-label="대시보드로"
                className="h-9 px-3 grid place-items-center text-xs font-semibold rounded-lg bg-black/5 hover:bg-black/10 whitespace-nowrap">
                <span className="hidden sm:inline">← 대시보드</span><span className="sm:hidden">←</span>
              </Link>
            ) : (
              <Link to={`/${variant}/student/${selectedId}`} aria-label="상세로"
                className="h-9 px-3 grid place-items-center text-xs font-semibold rounded-lg text-white whitespace-nowrap"
                style={{ background: accent }}>
                <span className="hidden sm:inline">상세 →</span><span className="sm:hidden">→</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile tab row (hidden on lg+) */}
        <nav className="flex lg:hidden gap-1 px-3 pb-2 pt-0.5 overflow-x-auto scrollbar-thin" aria-label="Variants">
          {VARIANTS.map(v => (
            <button key={v.id} onClick={() => switchVariant(v.id)}
              className={`px-3 h-8 rounded-full text-xs font-semibold flex items-center gap-1.5 transition shrink-0
                ${v.id === variant
                  ? (isDark ? 'bg-white text-slate-900' : 'text-white')
                  : 'bg-black/5 hover:bg-black/10 opacity-70'}`}
              style={v.id === variant && !isDark ? { background: accent } : undefined}>
              <span className="opacity-70">{v.code}</span><span>{v.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main: natural flow on mobile (with bottom padding to clear fixed timeline), fixed viewport on lg+ */}
      <main className="flex-1 min-w-0 pb-[72px] lg:pb-0 lg:min-h-0 lg:overflow-hidden">
        {children}
      </main>

      {/* Timeline: fixed at viewport bottom on mobile, normal flow on lg+ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:static">
        <TimelineScrubber variant={variant} />
      </div>
    </div>
  );
}
