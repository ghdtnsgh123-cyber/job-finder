"use client";

import { useEffect, useMemo, useState } from "react";
import recruitmentData from "../jobs.json";

type Job = {
  id: number;
  company: string;
  size: string;
  logo: string;
  title: string;
  category: string;
  duties: string;
  type: "인턴" | "신입";
  intern: boolean;
  location: string;
  region: "대전" | "수도권" | "기타";
  duration: string;
  deadline: string;
  deadlineDays: number | null;
  pay: string;
  eligibility: string;
  skills: string[];
  dataAnalysis: boolean;
  detailLevel: "구체적" | "보통" | "";
  broadExperience: boolean;
};

type RecruitmentRecord = (typeof recruitmentData)[number];

function toRegion(location: string): Job["region"] {
  if (location.includes("대전")) return "대전";
  if (/(서울|경기|인천)/.test(location)) return "수도권";
  return "기타";
}

function formatDeadline(value: string) {
  if (!value || value.length !== 8) return "";
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

const jobs: Job[] = (recruitmentData as RecruitmentRecord[]).map((record) => {
  const title = record.recrutPbancTtl ?? "";
  const category = record.ncsCdNmLst ?? "";
  const employmentType = record.hireTypeNmLst ?? "";
  const location = record.workRgnNmLst ?? "";
  const searchableText = `${title} ${category}`;
  const duties = "";
  return {
    id: record.recrutPblntSn,
    company: record.instNm ?? "",
    size: "",
    logo: "",
    title,
    category,
    duties,
    type: employmentType.includes("인턴") || title.includes("인턴") ? "인턴" : "신입",
    intern: employmentType.includes("인턴") || title.includes("인턴"),
    location,
    region: toRegion(location),
    duration: "",
    deadline: formatDeadline(record.pbancEndYmd ?? ""),
    deadlineDays: typeof record.decimalDay === "number" ? record.decimalDay : null,
    pay: "",
    eligibility: record.aplyQlfcCn ?? "",
    skills: [],
    dataAnalysis: /데이터|분석/.test(searchableText),
    detailLevel: duties ? "구체적" : "",
    broadExperience: false,
  };
});

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
          {expanded === job.id && <div className="card-detail"><div><b>주요 업무</b><p>{job.duties}</p></div><div><b>지원 자격</b><p>{job.eligibility}</p></div><div><b>인턴 조건</b><p>{[job.duration, job.pay].filter(Boolean).join(" · ")}</p></div><div><b>추천 근거</b><p>{[job.dataAnalysis ? "데이터 분석 업무 포함" : "", job.region !== "기타" ? `${job.region} 근무` : "", job.detailLevel ? `${job.detailLevel} 업무 안내` : "", job.broadExperience ? "다양한 경험" : ""].filter(Boolean).join(" · ")}</p></div></div>}
        </article>)}
        {!visibleJobs.length && <div className="no-results"><strong>조건에 맞는 공고가 없어요.</strong><p>필터를 초기화하고 전체 공고를 확인해보세요.</p><button onClick={() => { setFilters(emptyFilters); setSavedOnly(false); }}>전체 공고 보기</button></div>}
      </div>
    </section>
    <footer className="finder-footer"><span>커리어핏 · 공고 데이터 기반 추천</span><span>로그인 · 지원서 제출 · 알림은 이번 버전에서 제공하지 않아요.</span></footer>
  </main>;
}
