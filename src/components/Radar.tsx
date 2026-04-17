import { Radar as RRadar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { CLE } from '../data';

export type RadarTheme = {
  stroke: string;
  fill: string;
  grid: string;
  label: string;
  ghostStroke?: string;
  ghostFill?: string;
};

const LABELS: Array<{ key: keyof CLE; label: string }> = [
  { key: 'reading',   label: '독해' },
  { key: 'writing',   label: '작문' },
  { key: 'listening', label: '청해' },
  { key: 'speaking',  label: '회화' },
  { key: 'grammar',   label: '문법' },
  { key: 'vocab',     label: '어휘' },
];

export default function Radar({ current, ghost, theme }: { current: CLE; ghost?: CLE; theme: RadarTheme }) {
  const data = LABELS.map(({ key, label }) => ({
    label,
    current: current[key],
    ghost:   ghost ? ghost[key] : undefined,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
        <PolarGrid stroke={theme.grid} />
        <PolarAngleAxis dataKey="label" tick={{ fill: theme.label, fontSize: 11, fontWeight: 600 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        {ghost && (
          <RRadar name="ghost"   dataKey="ghost"   stroke={theme.ghostStroke ?? theme.grid} fill={theme.ghostFill ?? 'transparent'} strokeDasharray="4 4" fillOpacity={0.35} isAnimationActive={false} />
        )}
        <RRadar name="current" dataKey="current" stroke={theme.stroke} fill={theme.fill} strokeWidth={2} fillOpacity={1} isAnimationActive={false} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
