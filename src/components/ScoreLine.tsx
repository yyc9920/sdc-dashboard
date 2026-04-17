import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ComposedChart, ReferenceLine } from 'recharts';
import type { Test } from '../data';

export type LineTheme = {
  line: string;
  mon: string;
  mid: string;
  fin: string;
  grid: string;
  text: string;
  avg?: string; // class-average ghost line
};

export default function ScoreLine({
  tests, theme, cohortAvg, markerCursorDate,
}: {
  tests: Test[];
  theme: LineTheme;
  cohortAvg?: Array<{ date: string; score: number }>;
  markerCursorDate?: string;
}) {
  // merge test data and optional cohort avg into a single series keyed by date
  const dates = Array.from(new Set([
    ...tests.map(t => t.date),
    ...(cohortAvg?.map(c => c.date) ?? []),
  ])).sort();
  const data = dates.map(date => {
    const test = tests.find(t => t.date === date);
    const avg  = cohortAvg?.find(c => c.date === date);
    return {
      date: date.slice(2, 7),
      rawDate: date,
      score: test?.score,
      type:  test?.type,
      avg: avg?.score,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: theme.text, fontSize: 10 }} axisLine={{ stroke: theme.grid }} tickLine={false} />
        <YAxis domain={[50, 100]} tick={{ fill: theme.text, fontSize: 10 }} axisLine={{ stroke: theme.grid }} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
          formatter={(value: any, name: string, props: any) => {
            if (name === 'score') return [`${value}점 · ${props.payload.type ?? ''}`, '시험'];
            if (name === 'avg')   return [`${value}점`, '반 평균'];
            return [value, name];
          }}
          labelFormatter={(v) => `20${v}`}
        />
        {markerCursorDate && (
          <ReferenceLine x={markerCursorDate.slice(2, 7)} stroke={theme.line} strokeDasharray="2 2" />
        )}
        {theme.avg && (
          <Line type="monotone" dataKey="avg" stroke={theme.avg} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        )}
        <Line
          type="monotone" dataKey="score" stroke={theme.line} strokeWidth={2}
          dot={(props: any) => {
            const { cx, cy, payload, index } = props;
            if (payload.score == null) return <g key={`d-${index}`} />;
            const c = payload.type === '월례' ? theme.mon : payload.type === '중간' ? theme.mid : theme.fin;
            const r = payload.type === '월례' ? 3.5 : payload.type === '중간' ? 5 : 5.5;
            return <circle key={`d-${index}`} cx={cx} cy={cy} r={r} fill={c} stroke="#fff" strokeWidth={1.2} />;
          }}
          isAnimationActive={false}
        />
        <Scatter dataKey="score" fill="transparent" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
