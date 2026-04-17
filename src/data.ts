export type CLE = {
  reading: number; writing: number; listening: number;
  speaking: number; grammar: number; vocab: number;
};

export type Test = { date: string; type: '월례' | '중간' | '기말'; score: number };

export type ToeflSnapshot = {
  date: string;
  total: number; reading: number; listening: number; speaking: number; writing: number;
};

export type Award = { title: string; org: string; date: string; icon?: string };

export type Attendance = { month: string; rate: number };           // YYYY-MM, 0..100
export type Memo = { month: string; cumulative: number };           // 500 sentences progress

export type Student = {
  id: number;
  name: string;
  grade: 3 | 4;
  enrollDate: string;
  photo?: string;                                                   // emoji/initial avatar color key
  cleHistory: Array<{ date: string } & CLE>;
  tests: Test[];
  toeflHistory: ToeflSnapshot[];
  attendance: Attendance[];
  memorization: Memo[];
  awards: Award[];
};

const avatar = (i: number) =>
  ['#fff3b0', '#b8ecd2', '#ffc6c9', '#c9d7ff', '#fde5c3', '#e9d5ff',
    '#ffe0b8', '#d0f4de', '#ffd1dc', '#c6e2ff', '#fde8f6', '#e0f4ff'][i % 12];

/* ---------- helpers to build realistic history series ---------- */
function addMonths(date: string, m: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + m);
  return d.toISOString().slice(0, 10);
}
function monthStr(date: string) { return date.slice(0, 7); }
function interp(a: number, b: number, t: number) { return +(a + (b - a) * t).toFixed(1); }

/**
 * Build a monotonic-ish CLE growth series:
 * start values → end values, 6 quarterly snapshots from enroll date to today.
 */
function buildCleHistory(enroll: string, start: CLE, end: CLE): Array<{ date: string } & CLE> {
  const today = new Date('2026-04-17');
  const startDate = new Date(enroll);
  const months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
  const stepCount = Math.max(4, Math.min(10, Math.floor(months / 3)));
  const out: Array<{ date: string } & CLE> = [];
  for (let i = 0; i <= stepCount; i++) {
    const t = i / stepCount;
    // add some wobble so growth looks organic
    const wobble = (k: keyof CLE) => (i === 0 || i === stepCount) ? 0 : ((i * 7 + k.charCodeAt(0)) % 5 - 2);
    out.push({
      date: addMonths(enroll, Math.round(t * months)),
      reading:   Math.max(40, Math.min(100, interp(start.reading,   end.reading,   t) + wobble('reading'))),
      writing:   Math.max(40, Math.min(100, interp(start.writing,   end.writing,   t) + wobble('writing'))),
      listening: Math.max(40, Math.min(100, interp(start.listening, end.listening, t) + wobble('listening'))),
      speaking:  Math.max(40, Math.min(100, interp(start.speaking,  end.speaking,  t) + wobble('speaking'))),
      grammar:   Math.max(40, Math.min(100, interp(start.grammar,   end.grammar,   t) + wobble('grammar'))),
      vocab:     Math.max(40, Math.min(100, interp(start.vocab,     end.vocab,     t) + wobble('vocab'))),
    });
  }
  return out;
}

function buildTests(enroll: string, monthlyScores: number[], midtermScores: number[], finalScores: number[]): Test[] {
  const tests: Test[] = [];
  monthlyScores.forEach((s, i) => tests.push({ date: addMonths(enroll, 1 + Math.round(i * 1.5)), type: '월례', score: s }));
  midtermScores.forEach((s, i) => tests.push({ date: addMonths(enroll, 4 + i * 6), type: '중간', score: s }));
  finalScores.forEach((s, i) => tests.push({ date: addMonths(enroll, 7 + i * 6), type: '기말', score: s }));
  return tests.sort((a, b) => a.date.localeCompare(b.date));
}

function buildToefl(enroll: string, endScores: Omit<ToeflSnapshot, 'date'>): ToeflSnapshot[] {
  const steps = 5;
  const snaps: ToeflSnapshot[] = [];
  const start: Omit<ToeflSnapshot, 'date'> = {
    total: Math.max(50, endScores.total - 30),
    reading: Math.max(12, endScores.reading - 8),
    listening: Math.max(12, endScores.listening - 8),
    speaking: Math.max(12, endScores.speaking - 7),
    writing: Math.max(12, endScores.writing - 7),
  };
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    snaps.push({
      date: addMonths(enroll, Math.round(t * 24)),
      total:     Math.round(interp(start.total, endScores.total, t)),
      reading:   Math.round(interp(start.reading, endScores.reading, t)),
      listening: Math.round(interp(start.listening, endScores.listening, t)),
      speaking:  Math.round(interp(start.speaking, endScores.speaking, t)),
      writing:   Math.round(interp(start.writing, endScores.writing, t)),
    });
  }
  return snaps;
}

function buildAttendance(enroll: string, baseRate: number): Attendance[] {
  const out: Attendance[] = [];
  const startDate = new Date(enroll);
  const endDate = new Date('2026-04-17');
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  for (let i = 0; i <= months; i++) {
    const wobble = ((i * 11 + baseRate) % 10) - 5;
    out.push({
      month: monthStr(addMonths(enroll, i)),
      rate: Math.max(70, Math.min(100, baseRate + wobble)),
    });
  }
  return out;
}

function buildMemo(enroll: string, ratePerMonth: number): Memo[] {
  const out: Memo[] = [];
  const startDate = new Date(enroll);
  const endDate = new Date('2026-04-17');
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  let cum = 0;
  for (let i = 0; i <= months; i++) {
    cum = Math.min(500, cum + ratePerMonth + ((i * 3) % 6 - 3));
    out.push({ month: monthStr(addMonths(enroll, i)), cumulative: Math.round(cum) });
  }
  return out;
}

/* ---------- 12 students (ㄱ→ㅎ alphabetical) ---------- */
export const STUDENTS: Student[] = [
  {
    id: 1, name: '강민준', grade: 4, enrollDate: '2023-03-02',
    cleHistory: buildCleHistory('2023-03-02',
      { reading:60, writing:55, listening:65, speaking:58, grammar:62, vocab:59 },
      { reading:86, writing:74, listening:92, speaking:81, grammar:88, vocab:83 }),
    tests: buildTests('2023-03-02', [72,78,80,83,85,88,86,90,92], [78,82,85,88], [80,84,87,91]),
    toeflHistory: buildToefl('2023-03-02', { total:96, reading:25, listening:24, speaking:22, writing:25 }),
    attendance: buildAttendance('2023-03-02', 93),
    memorization: buildMemo('2023-03-02', 15),
    awards: [
      { title:'교내 스피치 대회 금상', org:'초등부 세미나', date:'2024-06-15', icon:'🥇' },
      { title:'월례 시험 최우수', org:'SDC', date:'2024-09-30', icon:'⭐' },
      { title:'영어 에세이 대회 우수상', org:'교육청', date:'2025-02-10', icon:'📝' },
    ],
  },
  {
    id: 2, name: '김서연', grade: 3, enrollDate: '2024-03-04',
    cleHistory: buildCleHistory('2024-03-04',
      { reading:58, writing:64, listening:56, speaking:68, grammar:58, vocab:60 },
      { reading:78, writing:82, listening:74, speaking:88, grammar:76, vocab:80 }),
    tests: buildTests('2024-03-04', [68,72,75,78,82,85], [74,80], [76,82]),
    toeflHistory: buildToefl('2024-03-04', { total:84, reading:20, listening:21, speaking:22, writing:21 }),
    attendance: buildAttendance('2024-03-04', 95),
    memorization: buildMemo('2024-03-04', 18),
    awards: [
      { title:'한영 낭독 대회 동상', org:'SDC', date:'2024-11-20', icon:'🎤' },
      { title:'독서왕 인증', org:'초등부 세미나', date:'2025-01-15', icon:'📚' },
    ],
  },
  {
    id: 3, name: '박지호', grade: 4, enrollDate: '2022-09-01',
    cleHistory: buildCleHistory('2022-09-01',
      { reading:68, writing:60, listening:62, speaking:58, grammar:70, vocab:64 },
      { reading:92, writing:85, listening:86, speaking:78, grammar:94, vocab:90 }),
    tests: buildTests('2022-09-01', [70,74,78,82,85,84,88,90,92,94,93,95], [76,82,86,90], [80,85,89,93]),
    toeflHistory: buildToefl('2022-09-01', { total:104, reading:28, listening:26, speaking:24, writing:26 }),
    attendance: buildAttendance('2022-09-01', 97),
    memorization: buildMemo('2022-09-01', 14),
    awards: [
      { title:'전국 영어 올림피아드 은상', org:'한국영어교육학회', date:'2024-10-12', icon:'🏅' },
      { title:'SDC Honor Roll · 2024', org:'SDC', date:'2024-12-20', icon:'🎖️' },
      { title:'기말 고사 수석', org:'초등부 세미나', date:'2024-12-05', icon:'👑' },
    ],
  },
  {
    id: 4, name: '서하윤', grade: 3, enrollDate: '2024-09-02',
    cleHistory: buildCleHistory('2024-09-02',
      { reading:55, writing:52, listening:58, speaking:57, grammar:53, vocab:55 },
      { reading:72, writing:68, listening:80, speaking:75, grammar:70, vocab:74 }),
    tests: buildTests('2024-09-02', [62,66,70,74,76], [68], [72]),
    toeflHistory: buildToefl('2024-09-02', { total:76, reading:18, listening:20, speaking:20, writing:18 }),
    attendance: buildAttendance('2024-09-02', 91),
    memorization: buildMemo('2024-09-02', 12),
    awards: [{ title:'신입생 적응 우수상', org:'SDC', date:'2024-12-15', icon:'🌱' }],
  },
  {
    id: 5, name: '신도현', grade: 4, enrollDate: '2023-09-04',
    cleHistory: buildCleHistory('2023-09-04',
      { reading:62, writing:65, listening:60, speaking:64, grammar:63, vocab:60 },
      { reading:80, writing:86, listening:78, speaking:84, grammar:82, vocab:79 }),
    tests: buildTests('2023-09-04', [70,75,78,80,82,85,83,86,88], [74,80,84], [78,83,86]),
    toeflHistory: buildToefl('2023-09-04', { total:90, reading:22, listening:23, speaking:23, writing:22 }),
    attendance: buildAttendance('2023-09-04', 92),
    memorization: buildMemo('2023-09-04', 16),
    awards: [
      { title:'스피치 대회 은상', org:'교육청', date:'2024-05-20', icon:'🎤' },
      { title:'월례 연속 90점 달성', org:'SDC', date:'2024-08-15', icon:'🔥' },
    ],
  },
  {
    id: 6, name: '양시우', grade: 3, enrollDate: '2024-03-04',
    cleHistory: buildCleHistory('2024-03-04',
      { reading:58, writing:56, listening:62, speaking:60, grammar:56, vocab:58 },
      { reading:76, writing:72, listening:82, speaking:80, grammar:74, vocab:78 }),
    tests: buildTests('2024-03-04', [65,70,73,76,78,80], [72,78], [74,80]),
    toeflHistory: buildToefl('2024-03-04', { total:82, reading:20, listening:21, speaking:21, writing:20 }),
    attendance: buildAttendance('2024-03-04', 90),
    memorization: buildMemo('2024-03-04', 13),
    awards: [{ title:'교내 토론 대회 우수상', org:'초등부 세미나', date:'2024-10-05', icon:'💬' }],
  },
  {
    id: 7, name: '유채원', grade: 4, enrollDate: '2022-03-02',
    cleHistory: buildCleHistory('2022-03-02',
      { reading:68, writing:66, listening:64, speaking:70, grammar:65, vocab:68 },
      { reading:90, writing:88, listening:85, speaking:92, grammar:86, vocab:91 }),
    tests: buildTests('2022-03-02',
      [68,72,76,78,82,85,88,86,90,92,93,94,95,93],
      [74,80,85,89,92], [78,84,88,92,94]),
    toeflHistory: buildToefl('2022-03-02', { total:108, reading:28, listening:27, speaking:27, writing:26 }),
    attendance: buildAttendance('2022-03-02', 98),
    memorization: buildMemo('2022-03-02', 17),
    awards: [
      { title:'전국 스피치 대회 대상', org:'한국어문학회', date:'2024-07-18', icon:'🏆' },
      { title:'SDC Top 1% · 2024', org:'SDC', date:'2024-12-31', icon:'💎' },
      { title:'TOEFL Junior 만점', org:'ETS', date:'2024-04-22', icon:'🎯' },
      { title:'교과 전 과목 A+', org:'초등부 세미나', date:'2024-12-05', icon:'📊' },
    ],
  },
  {
    id: 8, name: '이주원', grade: 3, enrollDate: '2024-03-04',
    cleHistory: buildCleHistory('2024-03-04',
      { reading:55, writing:60, listening:54, speaking:56, grammar:62, vocab:58 },
      { reading:74, writing:78, listening:70, speaking:72, grammar:80, vocab:76 }),
    tests: buildTests('2024-03-04', [64,68,72,74,76,78], [70,75], [72,77]),
    toeflHistory: buildToefl('2024-03-04', { total:78, reading:19, listening:19, speaking:20, writing:20 }),
    attendance: buildAttendance('2024-03-04', 89),
    memorization: buildMemo('2024-03-04', 11),
    awards: [{ title:'작문 대회 장려상', org:'초등부 세미나', date:'2024-11-08', icon:'✏️' }],
  },
  {
    id: 9, name: '장예린', grade: 4, enrollDate: '2023-03-02',
    cleHistory: buildCleHistory('2023-03-02',
      { reading:65, writing:70, listening:62, speaking:66, grammar:65, vocab:68 },
      { reading:84, writing:90, listening:82, speaking:86, grammar:85, vocab:88 }),
    tests: buildTests('2023-03-02', [72,76,80,82,84,86,88,87,90], [76,82,85,88], [80,84,88,91]),
    toeflHistory: buildToefl('2023-03-02', { total:98, reading:25, listening:24, speaking:24, writing:25 }),
    attendance: buildAttendance('2023-03-02', 94),
    memorization: buildMemo('2023-03-02', 16),
    awards: [
      { title:'영어 글쓰기 대회 금상', org:'교육청', date:'2024-09-12', icon:'✍️' },
      { title:'SDC 우수 학생', org:'SDC', date:'2024-06-30', icon:'⭐' },
    ],
  },
  {
    id: 10, name: '정은호', grade: 3, enrollDate: '2024-09-02',
    cleHistory: buildCleHistory('2024-09-02',
      { reading:52, writing:55, listening:56, speaking:60, grammar:54, vocab:55 },
      { reading:68, writing:72, listening:74, speaking:78, grammar:70, vocab:72 }),
    tests: buildTests('2024-09-02', [60,64,68,72,74], [66], [70]),
    toeflHistory: buildToefl('2024-09-02', { total:72, reading:17, listening:18, speaking:19, writing:18 }),
    attendance: buildAttendance('2024-09-02', 88),
    memorization: buildMemo('2024-09-02', 10),
    awards: [{ title:'성실 출석상', org:'SDC', date:'2024-12-15', icon:'🎖️' }],
  },
  {
    id: 11, name: '최하린', grade: 4, enrollDate: '2023-03-02',
    cleHistory: buildCleHistory('2023-03-02',
      { reading:66, writing:60, listening:68, speaking:62, grammar:65, vocab:63 },
      { reading:88, writing:80, listening:90, speaking:83, grammar:86, vocab:85 }),
    tests: buildTests('2023-03-02', [74,78,82,84,85,87,88,90,92], [78,84,86,90], [82,86,89,92]),
    toeflHistory: buildToefl('2023-03-02', { total:100, reading:26, listening:26, speaking:23, writing:25 }),
    attendance: buildAttendance('2023-03-02', 96),
    memorization: buildMemo('2023-03-02', 17),
    awards: [
      { title:'스피치 대회 금상', org:'SDC', date:'2024-06-15', icon:'🎤' },
      { title:'월례 최우수 3회 연속', org:'초등부 세미나', date:'2024-11-30', icon:'🔥' },
      { title:'리딩 챌린지 완주', org:'SDC', date:'2024-12-20', icon:'📖' },
    ],
  },
  {
    id: 12, name: '한지안', grade: 3, enrollDate: '2024-03-04',
    cleHistory: buildCleHistory('2024-03-04',
      { reading:60, writing:56, listening:58, speaking:62, grammar:56, vocab:60 },
      { reading:80, writing:74, listening:78, speaking:82, grammar:76, vocab:80 }),
    tests: buildTests('2024-03-04', [68,72,76,80,82,84], [74,80], [78,82]),
    toeflHistory: buildToefl('2024-03-04', { total:86, reading:21, listening:22, speaking:22, writing:21 }),
    attendance: buildAttendance('2024-03-04', 93),
    memorization: buildMemo('2024-03-04', 14),
    awards: [
      { title:'교내 영어 퀴즈 대회 우수상', org:'초등부 세미나', date:'2024-10-25', icon:'🧠' },
      { title:'신입생 대표 인사', org:'SDC', date:'2024-03-04', icon:'🎀' },
    ],
  },
];

/* ---------- timeline helpers ---------- */
export const TODAY = '2026-04-17';

export function monthsBetween(from: string, to: string): number {
  const a = new Date(from), b = new Date(to);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

/** Interpolated CLE at cursor date (between nearest snapshots before and after). */
export function cleAt(s: Student, cursor: string): CLE {
  const snaps = s.cleHistory;
  if (cursor <= snaps[0].date) return snaps[0];
  if (cursor >= snaps[snaps.length - 1].date) return snaps[snaps.length - 1];
  let before = snaps[0], after = snaps[snaps.length - 1];
  for (let i = 0; i < snaps.length - 1; i++) {
    if (snaps[i].date <= cursor && snaps[i + 1].date >= cursor) {
      before = snaps[i]; after = snaps[i + 1]; break;
    }
  }
  const span = Math.max(1, monthsBetween(before.date, after.date));
  const t = monthsBetween(before.date, cursor) / span;
  const pick = (k: keyof CLE) => +(before[k] + (after[k] - before[k]) * t).toFixed(1);
  return {
    reading: pick('reading'), writing: pick('writing'), listening: pick('listening'),
    speaking: pick('speaking'), grammar: pick('grammar'), vocab: pick('vocab'),
  };
}

/** Latest TOEFL snapshot ≤ cursor. */
export function toeflAt(s: Student, cursor: string): ToeflSnapshot {
  return [...s.toeflHistory].reverse().find(t => t.date <= cursor) ?? s.toeflHistory[0];
}

/** Tests with date ≤ cursor. */
export function testsAt(s: Student, cursor: string): Test[] {
  return s.tests.filter(t => t.date <= cursor);
}

/** Attendance rate at cursor month (uses last available). */
export function attendanceAt(s: Student, cursor: string): number {
  const target = cursor.slice(0, 7);
  const entry = [...s.attendance].reverse().find(a => a.month <= target);
  return entry?.rate ?? 0;
}

/** Memorization cumulative at cursor month. */
export function memoAt(s: Student, cursor: string): number {
  const target = cursor.slice(0, 7);
  const entry = [...s.memorization].reverse().find(m => m.month <= target);
  return entry?.cumulative ?? 0;
}

/** Awards up to cursor. */
export function awardsAt(s: Student, cursor: string): Award[] {
  return s.awards.filter(a => a.date <= cursor);
}

/** Average of CLE 6 values. */
export function cleAvg(cle: CLE): number {
  return +((cle.reading + cle.writing + cle.listening + cle.speaking + cle.grammar + cle.vocab) / 6).toFixed(1);
}

export { avatar };
