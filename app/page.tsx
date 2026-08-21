"use client";

import { useEffect, useMemo, useState } from "react";

type Job = { id:number; company:string; logo:string; color:string; title:string; category:string; type:string; location:string; deadline:string; skills:string[]; match:number; featured?:boolean };

const jobs: Job[] = [
  { id:1, company:"토스", logo:"T", color:"#1267e9", title:"Product Operations Assistant", category:"기획·전략", type:"인턴", location:"서울 강남", deadline:"D-4", skills:["데이터 분석","문제 해결"], match:94, featured:true },
  { id:2, company:"당근", logo:"당", color:"#ff6f0f", title:"동네생활 콘텐츠 마케팅 인턴", category:"마케팅", type:"인턴", location:"서울 서초", deadline:"D-8", skills:["콘텐츠","SNS"], match:91 },
  { id:3, company:"네이버웹툰", logo:"N", color:"#00c73c", title:"글로벌 서비스 운영 체험형 인턴", category:"서비스 운영", type:"인턴", location:"경기 성남", deadline:"D-12", skills:["영어","커뮤니케이션"], match:88 },
  { id:4, company:"무신사", logo:"M", color:"#171717", title:"브랜드 비즈니스 AMD", category:"MD·영업", type:"신입", location:"서울 성동", deadline:"D-15", skills:["패션","Excel"], match:85 },
  { id:5, company:"카카오페이", logo:"K", color:"#ffe100", title:"데이터 분석 어시스턴트", category:"개발·데이터", type:"인턴", location:"경기 성남", deadline:"상시", skills:["SQL","Tableau"], match:82 },
  { id:6, company:"29CM", logo:"29", color:"#303033", title:"콘텐츠 에디터 인턴", category:"디자인·콘텐츠", type:"인턴", location:"서울 성동", deadline:"D-18", skills:["카피라이팅","트렌드"], match:79 },
];

const categories = ["전체","기획·전략","마케팅","개발·데이터","디자인·콘텐츠","MD·영업"];

export default function Home() {
  const [category,setCategory] = useState("전체");
  const [query,setQuery] = useState("");
  const [bookmarks,setBookmarks] = useState<number[]>([]);
  const [onlyIntern,setOnlyIntern] = useState(false);

  useEffect(() => { const saved=localStorage.getItem("careerfit-bookmarks"); if(saved) setBookmarks(JSON.parse(saved)); },[]);
  const filtered = useMemo(() => jobs.filter((job) => {
    const term=query.trim().toLowerCase();
    return (category==="전체" || job.category===category) && (!onlyIntern || job.type==="인턴") && `${job.company} ${job.title} ${job.skills.join(" ")}`.toLowerCase().includes(term);
  }),[category,query,onlyIntern]);
  const toggleBookmark = (id:number) => { const next=bookmarks.includes(id)?bookmarks.filter(item=>item!==id):[...bookmarks,id]; setBookmarks(next); localStorage.setItem("careerfit-bookmarks",JSON.stringify(next)); };

  return <main>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="커리어핏 홈"><span className="brand-mark">C</span><span>커리어핏</span></a>
      <nav aria-label="주요 메뉴"><a className="active" href="#jobs">채용공고</a><a href="#guide">커리어 가이드</a><a href="#calendar">채용 캘린더</a></nav>
      <div className="header-actions"><div className="saved-button">♡ 찜한 공고 <span>{bookmarks.length}</span></div><button className="login-button" type="button">로그인</button></div>
    </header>

    <section className="hero" id="top">
      <div className="eyebrow"><span /> 대학생을 위한 채용 큐레이션</div>
      <h1>나에게 맞는 첫 커리어,<br /><em>헤매지 말고</em> 시작해요.</h1>
      <p>관심 직무와 역량을 바탕으로 지금 지원하기 좋은 공고만 모았어요.</p>
      <div className="search-box" role="search"><span className="search-icon" aria-hidden="true" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="기업명, 직무, 역량으로 검색해보세요" aria-label="채용공고 검색" /><button type="button">공고 찾기</button></div>
      <div className="quick-keywords"><span>인기 검색</span><button onClick={()=>setQuery("마케팅")}>#마케팅 인턴</button><button onClick={()=>setQuery("데이터")}>#데이터 분석</button><button onClick={()=>setQuery("콘텐츠")}>#콘텐츠</button></div>
    </section>

    <section className="content" id="jobs">
      <div className="section-heading"><div><span className="section-kicker">TODAY&apos;S PICK</span><h2>오늘의 추천 공고 <b>{filtered.length}</b></h2></div><p>최근 등록순 · 매일 오전 업데이트</p></div>
      <div className="filter-row" aria-label="직무 필터"><div className="category-tabs">{categories.map(item=><button key={item} className={category===item?"selected":""} onClick={()=>setCategory(item)}>{item}</button>)}</div><label className="intern-toggle"><input type="checkbox" checked={onlyIntern} onChange={e=>setOnlyIntern(e.target.checked)} /><span /> 인턴만 보기</label></div>
      <div className="job-layout">
        <div className="job-list">
          {filtered.length ? filtered.map(job=><article className={`job-card ${job.featured?"featured":""}`} key={job.id}>
            {job.featured&&<div className="featured-label">에디터 추천</div>}
            <div className="company-logo" style={{background:job.color,color:job.color==="#ffe100"?"#171717":"white"}}>{job.logo}</div>
            <div className="job-info"><div className="company-name">{job.company} <span className="verified">✓</span></div><h3>{job.title}</h3><div className="job-meta"><span>{job.type}</span><i /><span>{job.location}</span><i /><strong>{job.deadline}</strong></div><div className="skill-list">{job.skills.map(skill=><span key={skill}>#{skill}</span>)}</div></div>
            <div className="job-side"><button className={`bookmark ${bookmarks.includes(job.id)?"on":""}`} onClick={()=>toggleBookmark(job.id)} aria-label={`${job.company} 공고 찜하기`}>{bookmarks.includes(job.id)?"♥":"♡"}</button><div className="match"><strong>{job.match}%</strong><span>나와의 매칭</span></div></div>
          </article>):<div className="empty"><strong>조건에 맞는 공고가 없어요.</strong><p>검색어나 필터를 조금 넓혀보세요.</p><button onClick={()=>{setQuery("");setCategory("전체");setOnlyIntern(false)}}>필터 초기화</button></div>}
        </div>
        <aside>
          <div className="profile-card"><div className="profile-top"><span>FIT PROFILE</span><b>72%</b></div><h3>프로필을 채우면<br />추천이 더 정확해져요.</h3><p>관심 직무와 보유 역량을 알려주세요.</p><div className="progress"><span /></div><ul><li className="done">✓ 기본 정보</li><li className="done">✓ 관심 직무</li><li><span>3</span> 보유 역량</li><li><span>4</span> 선호 근무 조건</li></ul><button type="button">프로필 완성하기 <span>→</span></button></div>
          <div className="tip-card" id="guide"><span className="tip-icon">✦</span><div><b>이번 주 커리어 팁</b><p>경험이 부족해도 통과하는<br />자기소개서 구조 3가지</p><a href="#top">3분 만에 읽기 →</a></div></div>
        </aside>
      </div>
    </section>
    <section className="calendar-strip" id="calendar"><div><span>이번 주 마감</span><strong>놓치면 아쉬운 공고가 12개 있어요.</strong></div><a href="#jobs">채용 캘린더 확인하기 →</a></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">C</span><span>커리어핏</span></a><p>당신의 가능성이 좋은 기회를 만나도록.</p><span>© 2026 Careerfit</span></footer>
  </main>;
}
