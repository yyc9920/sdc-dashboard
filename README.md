# SDC Dashboard · 초등부 세미나 데모

학생 한 명 한 명의 **입학 시점부터의 성장**을 데이터로 보여주는 대시보드 프로토타입.
**5개의 서로 다른 스타일**과 각 스타일별 **고유 킬러 기능**을 한 화면에서 비교할 수 있게 구성했습니다.

> Live demo: <https://yyc9920.github.io/sdc-dashboard/>

## 5가지 변형

| # | 스타일 | 킬러 기능 |
|---|--------|----------|
| A | 미니멀 (Notion / Linear) | **Ghost Self** — 입학 시점의 과거 자아 레이더와 현재 레이더를 겹쳐서 delta 칩으로 성장폭 표시 |
| B | 다크 (Vercel / Stripe) | **Live Cohort Rank** — 반 내 순위·퍼센타일 링 + 모든 차트에 반 평균 고스트 오버레이 |
| C | 키즈 (Pastel, Gaegu 손글씨) | **AI 코치 말풍선** — 곰 마스코트가 현재 커서 시점의 성장을 한국어로 나레이션 |
| D | 코퍼릿 (Burgundy + Gold) | **Heat Pivot Matrix** — 스킬 × 기간 히트맵, 호버 cross-highlight |
| E | 벤토 (Magazine asymmetric) | **Growth Reel** — ▶ 버튼으로 입학→오늘 6초 자동 애니메이션 재생 (1×/2×/4×) |

공통 요소:
- 좌·우 탭으로 5개 변형 전환 (선택 학생 상태 유지)
- 하단 타임라인 스크러버 (입학일 → 오늘) — 드래그하면 레이더·시험 추이·TOEFL·출석률·500문장 암기 모두 실시간 갱신
- PC 1440×900 **스크롤 없이** 한눈에

## 스택

- Vite 5 · React 18 · TypeScript 5
- Tailwind CSS 3
- Recharts (레이더, 라인)
- Framer Motion (타임라인 모핑, Growth Reel, AI 코치 말풍선)
- Zustand (전역 상태: 선택 학생, 타임라인 커서, 재생 상태)
- react-router-dom v6 · HashRouter

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:5173/ 접속
```

## 프로덕션 빌드

```bash
npm run build
npm run preview
```

GitHub Actions (`.github/workflows/deploy.yml`) 가 `main` 브랜치 푸시마다
`vite build --base=/sdc-dashboard/` 로 빌드해서 GitHub Pages 에 자동 배포합니다.

## 프로젝트 구조

```
src/
├── main.tsx            # React 진입점 (HashRouter)
├── App.tsx             # 라우팅 테이블 (/:variant, /:variant/student/:id)
├── index.css           # Tailwind base + variant별 CSS 클래스
├── data.ts             # 12명 임의 정형 데이터 + timeline helpers
├── store.ts            # Zustand 스토어
├── components/
│   ├── Shell.tsx       # 탭바 + TimelineScrubber를 감싸는 공통 레이아웃
│   ├── TimelineScrubber.tsx
│   ├── Radar.tsx       # CLE 육각형 레이더 (ghost overlay 지원)
│   └── ScoreLine.tsx   # 월례/중간/기말 혼합 라인 차트
└── variants/
    ├── A_Minimal/   { Dashboard, Detail }   # Ghost Self
    ├── B_Dark/      { Dashboard, Detail }   # Cohort Rank
    ├── C_Playful/   { Dashboard, Detail }   # AI Coach
    ├── D_Corporate/ { Dashboard, Detail }   # Heat Pivot
    └── E_Bento/     { Dashboard, Detail }   # Growth Reel
```

## 데이터 모델

학생 12명 (가나다순), 학년 3·4. 각 학생별로:

- `cleHistory` — 분기별 CLE 6개 지표 스냅샷 (독해/작문/청해/회화/문법/어휘)
- `tests` — 월례/중간/기말 시험 점수 시계열
- `toeflHistory` — TOEFL 분기별 스냅샷
- `attendance`, `memorization` — 월별 출석률, 누적 500문장 암기 개수
- `awards` — 수상·활동 이력

`data.ts` 의 helpers (`cleAt`, `testsAt`, `toeflAt`, `attendanceAt`, `memoAt`, `awardsAt`) 가 타임라인 커서 기반으로 당시 상태를 반환하며, 레이더는 인접 스냅샷 간 선형 보간을 합니다.

## 메모

- 모든 데이터는 **임의 생성된 mock** 입니다 — 실제 학생 정보 아님.
- 레퍼런스 이미지(`dashboard_sample.PNG`, 로컬 전용)에서 영감받아 D 변형에 burgundy+gold 팔레트와 "500문장 암기율 YTD" KPI 를 반영했습니다.
- v1 단일 HTML 파일은 `index.html.v1.bak` 로 보존되어 있습니다.
