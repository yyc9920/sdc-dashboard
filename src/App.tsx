import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import VariantShell from './components/Shell';
import A_Dashboard from './variants/A_Minimal/Dashboard';
import A_Detail from './variants/A_Minimal/Detail';
import B_Dashboard from './variants/B_Dark/Dashboard';
import B_Detail from './variants/B_Dark/Detail';
import C_Dashboard from './variants/C_Playful/Dashboard';
import C_Detail from './variants/C_Playful/Detail';
import D_Dashboard from './variants/D_Corporate/Dashboard';
import D_Detail from './variants/D_Corporate/Detail';
import E_Dashboard from './variants/E_Bento/Dashboard';
import E_Detail from './variants/E_Bento/Detail';

const DASHBOARDS = { a: A_Dashboard, b: B_Dashboard, c: C_Dashboard, d: D_Dashboard, e: E_Dashboard } as const;
const DETAILS    = { a: A_Detail,    b: B_Detail,    c: C_Detail,    d: D_Detail,    e: E_Detail }    as const;
type Key = keyof typeof DASHBOARDS;

function isKey(x: string | undefined): x is Key {
  return !!x && ['a','b','c','d','e'].includes(x);
}

function Dashboard() {
  const { variant } = useParams();
  if (!isKey(variant)) return <Navigate to="/a" replace />;
  const Cmp = DASHBOARDS[variant];
  return <VariantShell variant={variant}><Cmp /></VariantShell>;
}

function Detail() {
  const { variant } = useParams();
  if (!isKey(variant)) return <Navigate to="/a" replace />;
  const Cmp = DETAILS[variant];
  return <VariantShell variant={variant}><Cmp /></VariantShell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/a" replace />} />
      <Route path="/:variant" element={<Dashboard />} />
      <Route path="/:variant/student/:id" element={<Detail />} />
      <Route path="*" element={<Navigate to="/a" replace />} />
    </Routes>
  );
}
