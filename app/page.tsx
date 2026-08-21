"use client";

import { useEffect, useMemo, useState } from "react";

type Job = {
  id: number;
  company: string;
  size: string;
  logo: string;
  title: string;
  category: string;
  duties: string;
  type: "인턴";
  location: string;
  region: "대전" | "수도권" | "기타";
  duration: "방학 단기" | "3개월 이상" | "6개월";
  deadline: string;
  deadlineDays: number | null;
  pay: string;
  eligibility: string;
  skills: string[];
  dataAnalysis: boolean;
  detailLevel: "구체적" | "보통";
  broadExperience: boolean;
};

const jobs: Job[] = [
  { id: 1, company: "한국과학기술원", size: "중견·중소", logo: "KA", title: "실험 데이터 분석 인턴", category: "데이터·분석", duties: "센서 실험 데이터 정리와 결과 리포트 작성", type: "인턴", location: "대전 유성구", region: "대전", duration: "방학 단기", deadline: "D-18", deadlineDays: 18, pay: "급여 210만원/월", eligibility: "물리학·자연과학 전공 우대", skills: ["Python", "데이터 분석"], dataAnalysis: true, detailLevel: "구체적", broadExperience: true },
  { id: 2, company: "LG디스플레이", size: "대기업", logo: "LG", title: "공정 데이터 분석 체험형 인턴", category: "반도체·디스플레이", duties: "공정 지표를 분석하고 개선 아이디어를 제안", type: "인턴", location: "경기 파주", region: "수도권", duration: "3개월 이상", deadline: "D-24", deadlineDays: 24, pay: "급여 220만원/월", eligibility: "이공계 전공자", skills: ["Excel", "통계"], dataAnalysis: true, detailLevel: "구체적", broadExperience: true },
  { id: 3, company: "토스", size: "대기업", logo: "T", title: "서비스 지표 운영 인턴", category: "데이터·분석", duties: "서비스 지표를 모니터링하고 운영 인사이트를 정리", type: "인턴", location: "서울 강남", region: "수도권", duration: "3개월 이상", deadline: "D-7", deadlineDays: 7, pay: "급여 200만원/월", eligibility: "전공 무관", skills: ["SQL", "문제 해결"], dataAnalysis: true, detailLevel: "구체적", broadExperience: true },
  { id: 4, company: "국가핵융합연구소", size: "중견·중소", logo: "NF", title: "플라즈마 연구 지원 인턴", category: "연구·실험", duties: "실험 장비 기록과 연구 데이터 관리 지원", type: "인턴", location: "대전 유성구", region: "대전", duration: "방학 단기", deadline: "D-31", deadlineDays: 31, pay: "급여 190만원/월", eligibility: "물리학과 재학생·졸업예정자", skills: ["실험 기록", "문서 작성"], dataAnalysis: false, detailLevel: "구체적", broadExperience: true },
  { id: 5, company: "카카오페이", size: "대기업", logo: "KP", title: "데이터 서비스 리서치 인턴", category: "데이터·분석", duties: "사용자 데이터를 살펴보고 리서치 결과를 공유", type: "인턴", location: "경기 성남", region: "수도권", duration: "6개월", deadline: "D-4", deadlineDays: 4, pay: "급여 210만원/월", eligibility: "전공 무관", skills: ["리서치", "Tableau"], dataAnalysis: true, detailLevel: "보통", broadExperience: false },
  { id: 6, company: "한화시스템", size: "대기업", logo: "HS", title: "R&D 프로젝트 인턴", category: "연구·실험", duties: "R&D 프로젝트 운영 지원", type: "인턴", location: "서울 중구", region: "수도권", duration: "6개월", deadline: "상시", deadlineDays: null, pay: "급여 별도 협의", eligibility: "이공계 전공자", skills: ["프로젝트", "커뮤니케이션"], dataAnalysis: false, detailLevel: "보통", broadExperience: true },
];

type Filters = { intern: boolean; data: boolean; region: boolean; short: boolean; long: boolean; deadlineKnown: boolean; deadlineRoom: boolean; detailed: boolean; broad: boolean };
const emptyFilters: Filters = { intern: false, data: false, region: false, short: false, long: false, deadlineKnown: false, deadlineRoom: false, detailed: false, broad: false };

function score(job: Job) {
  let value = 0;
  if (job.type === "인턴" && job.dataAnalysis) value += 4;
  if (job.region === "대전" || job.region === "수도권") value += 3;
  if (job.duration === "방학 단기" || job.duration === "3개월 이상") value += 2;
  if (job.deadlineDays !== null && job.deadlineDays >= 7) value += 2;
  if (job.detailLevel === "구체적") value += 2;
  if (job.broadExperience) value += 2;
  return value;
}

export default function Home() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("careerfit-bookmarks");
    if (stored) setSaved(JSON.parse(stored));
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;
  const visibleJobs = useMemo(() => jobs.filter((job) => {
    if (savedOnly && !saved.includes(job.id)) return false;
    if (filters.intern && job.type !== "인턴") return false;
    if (filters.data && !job.dataAnalysis) return false;
    if (filters.region && !["대전", "수도권"].includes(job.region)) return false;
    if (filters.short && job.duration !== "방학 단기") return false;
    if (filters.long && job.duration !== "3개월 이상") return false;
    if (filters.deadlineKnown && job.deadlineDays === null) return false;
    if (filters.deadlineRoom && (job.deadlineDays === null || job.deadlineDays < 7)) return false;
    if (filters.detailed && job.detailLevel !== "구체적") return false;
    if (filters.broad && !job.broadExperience) return false;
    return true;
  }).sort((a, b) => score(b) - score(a)), [filters, saved, savedOnly]);

  const updateFilter = (key: keyof Filters) => setFilters((current) => ({ ...current, [key]: !current[key] }));
  const toggleSaved = (id: number) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem("careerfit-bookmarks", JSON.stringify(next));
  };

  return <main className="finder-shell">
    <header className="finder-header">
      <a className="finder-brand" href="#top"><span className="finder-mark">C</span><span>커리어핏</span></a>
      <span className="header-note">대학생 인턴 공고 파인더</span>
      <button className={`saved-view ${savedOnly ? "active" : ""}`} onClick={() => setSavedOnly((value) => !value)} aria-pressed={savedOnly}>저장한 공고 <b>{saved.length}</b></button>
    </header>

    <section className="finder-intro" id="top">
      <div className="intro-copy"><span className="intro-label">CHUNGNAM NATIONAL UNIVERSITY · PHYSICS</span><h1>내게 맞는 인턴,<br /><strong>지원할 이유부터</strong> 찾아요.</h1><p>데이터 분석과 연구 경험을 중심으로, 지금 확인할 만한 공고를 정리했어요.</p></div>
      <div className="intro-side"><span className="side-number">{visibleJobs.length.toString().padStart(2, "0")}</span><span>추천 공고</span><small>공고 데이터 기반으로<br />추천순을 계산했어요.</small></div>
    </section>

    <section className="finder-content" id="jobs">
      <div className="content-top"><div><span className="content-label">RECOMMENDED FOR YOU</span><h2>추천 공고 <em>{visibleJobs.length}</em></h2></div><div className="content-actions"><button className={`filter-trigger ${filterOpen ? "active" : ""}`} onClick={() => setFilterOpen((value) => !value)} aria-expanded={filterOpen}>필터 <span>{activeCount || "＋"}</span></button><button className={`sort-trigger ${savedOnly ? "active" : ""}`} onClick={() => setSavedOnly((value) => !value)}>{savedOnly ? "저장한 공고만" : "추천순"} <span>↕</span></button></div></div>

      {filterOpen && <div className="filter-panel" aria-label="공고 필터">
        <div className="filter-group"><b>지원 형태</b><button className={filters.intern ? "chosen" : ""} onClick={() => updateFilter("intern")}>인턴</button></div>
        <div className="filter-group"><b>업무·지역</b><button className={filters.data ? "chosen" : ""} onClick={() => updateFilter("data")}>데이터 분석</button><button className={filters.region ? "chosen" : ""} onClick={() => updateFilter("region")}>대전·수도권</button></div>
        <div className="filter-group"><b>기간</b><button className={filters.short ? "chosen" : ""} onClick={() => updateFilter("short")}>방학 단기</button><button className={filters.long ? "chosen" : ""} onClick={() => updateFilter("long")}>3개월 이상</button></div>
        <div className="filter-group"><b>공고 정보</b><button className={filters.deadlineKnown ? "chosen" : ""} onClick={() => updateFilter("deadlineKnown")}>마감일 명확</button><button className={filters.deadlineRoom ? "chosen" : ""} onClick={() => updateFilter("deadlineRoom")}>마감 여유</button><button className={filters.detailed ? "chosen" : ""} onClick={() => updateFilter("detailed")}>업무 상세</button><button className={filters.broad ? "chosen" : ""} onClick={() => updateFilter("broad")}>경험 범위</button></div>
        <button className="reset-filter" onClick={() => setFilters(emptyFilters)}>초기화</button>
      </div>}

      <div className="job-grid" aria-live="polite">
        {visibleJobs.map((job, index) => <article className={`finder-card ${expanded === job.id ? "expanded" : ""}`} key={job.id}>
          <button className="card-main" onClick={() => setExpanded(expanded === job.id ? null : job.id)} aria-expanded={expanded === job.id}>
            <span className="rank">{String(index + 1).padStart(2, "0")}</span><span className="company-stamp">{job.logo}</span>
            <span className="card-copy"><span className="company-line">{job.company} <i>{job.size}</i></span><strong>{job.title}</strong><span className="duties">{job.duties}</span><span className="card-meta"><b>{job.deadline}</b><span>{job.eligibility}</span></span></span>
            <span className="card-arrow">{expanded === job.id ? "−" : "+"}</span>
          </button>
          <div className="card-tags"><span>{job.type}</span><span>{job.category}</span><span>{job.location}</span><span>{job.duration}</span><span className="score-chip">추천 {score(job)}점</span></div>
          <button className={`card-save ${saved.includes(job.id) ? "saved" : ""}`} onClick={() => toggleSaved(job.id)} aria-label={`${job.company} ${job.title} 저장`}>{saved.includes(job.id) ? "♥" : "♡"}</button>
          {expanded === job.id && <div className="card-detail"><div><b>주요 업무</b><p>{job.duties}</p></div><div><b>지원 자격</b><p>{job.eligibility}</p></div><div><b>인턴 조건</b><p>{job.duration} · {job.pay}</p></div><div><b>추천 근거</b><p>{job.dataAnalysis ? "데이터 분석 업무 포함 · " : ""}{job.region} 근무 · {job.detailLevel} 업무 안내{job.broadExperience ? " · 다양한 경험" : ""}</p></div></div>}
        </article>)}
        {!visibleJobs.length && <div className="no-results"><strong>조건에 맞는 공고가 없어요.</strong><p>필터를 초기화하고 전체 공고를 확인해보세요.</p><button onClick={() => { setFilters(emptyFilters); setSavedOnly(false); }}>전체 공고 보기</button></div>}
      </div>
    </section>
    <footer className="finder-footer"><span>커리어핏 · 공고 데이터 기반 추천</span><span>로그인 · 지원서 제출 · 알림은 이번 버전에서 제공하지 않아요.</span></footer>
  </main>;
}
