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

  return (
    <div className={`v-${variant} flex flex-col w-full min-h-screen lg:h-screen lg:w-screen lg:grid lg:grid-rows-[52px_1fr_auto]`}>
      <header className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 lg:py-0 flex-wrap lg:flex-nowrap border-b border-black/5 bg-white/60 backdrop-blur-sm sticky top-0 z-30"
        style={{ backgroundColor: variant === 'b' ? 'rgba(10,12,18,.7)' : undefined, color: variant === 'b' ? '#e5e7eb' : undefined, borderColor: variant === 'b' ? 'rgba(255,255,255,.08)' : undefined }}>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg grid place-items-center text-sm font-black"
            style={{ background: variant === 'd' ? '#8b1e2e' : variant === 'c' ? '#ff9eae' : variant === 'b' ? '#7dd3fc' : '#1a1a1a', color: '#fff' }}>S</div>
          <div className="leading-tight">
            <div className="text-sm font-bold">SDC Dashboard</div>
            <div className="text-[10px] opacity-60 hidden sm:block">초등부 세미나 · v2 interactive</div>
          </div>
        </div>

        <nav className="flex gap-1 order-3 lg:order-none w-full lg:w-auto overflow-x-auto -mx-1 px-1 lg:mx-0 lg:px-0 lg:ml-2 scrollbar-thin">
          {VARIANTS.map(v => (
            <button key={v.id}
              onClick={() => switchVariant(v.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition
                ${v.id === variant
                  ? (variant === 'b' ? 'bg-white text-slate-900' : variant === 'd' ? 'bg-burgundy-500 text-white' : variant === 'c' ? 'bg-[#2d1b3d] text-white' : 'bg-slate-900 text-white')
                  : 'opacity-60 hover:opacity-100'}`}>
              <span className="opacity-70">{v.code}</span><span>{v.label}</span>
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] opacity-60 hidden xl:inline">
            {VARIANTS.find(v => v.id === variant)?.desc}
          </span>
          <select
            value={selectedId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelected(id);
              if (isDetail) nav(`/${variant}/student/${id}`);
            }}
            className="text-xs rounded-lg border border-black/10 px-2 py-1 bg-white/80 text-slate-800 max-w-[130px] sm:max-w-none">
            {[...STUDENTS].sort((a,b)=>a.name.localeCompare(b.name,'ko')).map(s => (
              <option key={s.id} value={s.id}>{s.name} · {s.grade}학년</option>
            ))}
          </select>
          {isDetail ? (
            <Link to={`/${variant}`} className="text-xs px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10 whitespace-nowrap">← 대시보드</Link>
          ) : (
            <Link to={`/${variant}/student/${selectedId}`} className="text-xs px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10 whitespace-nowrap">상세 →</Link>
          )}
        </div>
      </header>

      <main className="min-h-0 lg:overflow-hidden">
        {children}
      </main>

      <div className="sticky bottom-0 z-20 lg:static">
        <TimelineScrubber variant={variant} />
      </div>
    </div>
  );
}
