import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useLang } from "./lang.jsx";
import { Reveal } from "./chrome.jsx";
import { PROPERTIES, COMMON_FEATS, LISTINGS, LIFE_IMAGES, PROCESS, FEATURES, WORK_IMAGES, SOCIAL, wa, asset } from "./data.js";
import { GalleryRing } from "./three3d.jsx";

const PageHero = ({ eyebrow, title }) => {
  const { L } = useLang();
  return (
    <header className="page-hero">
      <div className="pattern-bg light"></div>
      <div className="page-hero-inner">
        <p className="page-eyebrow reveal visible">{L(eyebrow)}</p>
        <h1 className="page-title reveal visible">{L(title)}</h1>
        <div className="chapter-rule gold reveal visible"></div>
      </div>
    </header>
  );
};

/* ═══════════ SERVICE ICONS — thin gold line-work ═══════════ */
const ICONS = {
  building: <><path d="M4 21V6.5L12 3l8 3.5V21" /><path d="M9 21v-5h6v5" /><path d="M8 9.5h2M14 9.5h2M8 13h2M14 13h2" /></>,
  key: <><circle cx="8" cy="12" r="4" /><path d="M12 12h9M17.5 12v3.2M20.2 12v2.4" /></>,
  trowel: <><path d="M14.5 3.5 20.5 9.5" /><path d="M17.5 6.5 12 12" /><path d="M12 12 4 15.5 7.5 20 12 12Z" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M16 3v4M8 3v4M3.5 10.5h17" /><path d="M9 14.5h2M9 17.5h6M13 14.5h2" /></>,
  shield: <><path d="M12 3.2 20 6v6c0 4.6-3.3 7.6-8 8.9-4.7-1.3-8-4.3-8-8.9V6l8-2.8Z" /><path d="m9 12 2.2 2.2L15.4 10" /></>,
  compass: <><circle cx="12" cy="12" r="8.8" /><path d="m15.4 8.6-2 5.4-5.4 2 2-5.4 5.4-2Z" /></>,
  person: <><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" /></>,
  clock: <><circle cx="12" cy="12" r="8.8" /><path d="M12 7.2V12l3.2 2" /></>,
  pin: <><path d="M19.5 10.2c0 5.4-7.5 11.3-7.5 11.3S4.5 15.6 4.5 10.2a7.5 7.5 0 1 1 15 0Z" /><circle cx="12" cy="10" r="2.8" /></>,
};
const ServiceIcon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor"
    strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name] ?? ICONS.building}
  </svg>
);

/* ═══════════ HERO — scroll-scrubbed build sequence ═══════════
   240 WebP frames at 1080p, so scrolling walks the building from bare
   footings to the finished residence opening apart. Mirrors the vanilla
   implementation in ../../script.js — keep the two in step. */
const BUILD_FRAMES = 240;
const buildFrame = (i) => asset(`/assets/buildseq/frame_${String(i + 1).padStart(4, "0")}.webp`);

/* Windows track the build: footings to ~0.15, floors rising to ~0.45, complete
   around 0.55, opening apart from ~0.62 on. The finished building gets a
   caption-free beat to itself. */
const stageAt = (p) =>
  p > 0.15 && p < 0.30 ? 0 : p > 0.36 && p < 0.50 ? 1 : p > 0.66 ? 2 : -1;

/* The type lifts into the upper third and the model drops toward the lower
   frame, so the two never sit on top of each other. */
const LIFT = 0.1;
const DROP = 0.07;
/* The model's own bounding box across the sequence, measured at 1275x963 of the
   1920x1080 frame. Cover-fitting a 16:9 frame into a portrait phone crops ~74%
   of the width away, so on narrow screens we fit this box instead. */
const CONTENT_W = 1300, CONTENT_H = 1000;
const SEQ_BG = "#11100f";

function BuildHero() {
  const { L } = useLang();
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);
  const hintRef = useRef(null);
  const veilRef = useRef(null);
  const progressRef = useRef(null);
  const [stage, setStage] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext("2d");
    const frames = new Array(BUILD_FRAMES).fill(null);
    let current = -1, raf = 0, ticking = false, dead = false;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };

    const nearest = (i) => {
      if (frames[i]) return i;
      for (let d = 1; d < BUILD_FRAMES; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    };

    const draw = (i, force) => {
      const idx = nearest(Math.max(0, Math.min(BUILD_FRAMES - 1, i)));
      if (idx < 0 || (idx === current && !force)) return;
      current = idx;
      const img = frames[idx];
      const cw = canvas.width, ch = canvas.height;
      if (!cw || !ch) return;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      // Cover on landscape; on portrait that would crop the model away, so fall
      // back to whichever scale keeps the whole model on screen.
      const cover = Math.max(cw / iw, ch / ih);
      const content = Math.min(cw / CONTENT_W, ch / CONTENT_H);
      const s = Math.min(cover, content);
      const w = iw * s, h = ih * s;
      const dx = (cw - w) / 2;
      const dy = (ch - h) / 2 + DROP * ch;
      ctx.fillStyle = SEQ_BG;
      ctx.fillRect(0, 0, cw, ch);
      // Letterbox bands get the frame's own edge rows stretched across them, so
      // they stay seamless as the lighting shifts through the sequence.
      if (dy > 0) ctx.drawImage(img, 0, 0, iw, 2, dx, 0, w, Math.ceil(dy) + 1);
      const below = ch - (dy + h);
      if (below > 0) ctx.drawImage(img, 0, ih - 2, iw, 2, dx, ch - Math.ceil(below) - 1, w, Math.ceil(below) + 1);
      ctx.drawImage(img, dx, dy, w, h);
    };

    sizeCanvas();

    // Coarse pass first so early scrubbing lands near the right frame,
    // then progressively fill the gaps.
    const order = [];
    for (let step = 16; step >= 1; step >>= 1)
      for (let i = 0; i < BUILD_FRAMES; i += step)
        if (!order.includes(i)) order.push(i);

    const timers = [];
    let loaded = 0;
    order.forEach((i, rank) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        if (dead) return;
        if (img.naturalWidth) frames[i] = img;
        loaded++;
        const bg = bgRef.current;
        if (frames[0] && bg && !bg.classList.contains("frames-ready")) {
          bg.classList.add("frames-ready");
          draw(current < 0 ? 0 : current, true);
        }
        if (loaded === BUILD_FRAMES) draw(current < 0 ? 0 : current, true);
      };
      timers.push(setTimeout(() => { img.src = buildFrame(i); }, rank * 10));
    });

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(() => {
        ticking = false;
        const rect = track.getBoundingClientRect();
        const range = rect.height - window.innerHeight;
        const p = range > 0 ? Math.max(0, Math.min(1, -rect.top / range)) : 0;
        draw(Math.round(p * (BUILD_FRAMES - 1)));
        // Title clears early so the first caption can land while the base is
        // still going down
        const fade = Math.max(0, 1 - p / 0.13);
        if (contentRef.current) {
          contentRef.current.style.opacity = fade;
          // LIFT pushes the type into the upper third so it never sits across
          // the model; shares `transform` with the scroll translate.
          contentRef.current.style.transform =
            `translateY(${-LIFT * window.innerHeight + p * -80}px)`;
          contentRef.current.style.visibility = fade === 0 ? "hidden" : "visible";
        }
        if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p / 0.08));
        // The scrim only exists to hold the wordmark. Once that's gone, lift it
        // so the finished building lands at full strength.
        if (veilRef.current) veilRef.current.style.opacity = String(1 - 0.5 * Math.min(1, p / 0.28));
        if (progressRef.current) progressRef.current.style.width = (p * 100).toFixed(2) + "%";
        setStage(stageAt(p));
      });
    };
    const onResize = () => { sizeCanvas(); draw(current, true); };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    return () => {
      dead = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const STAGES = [
    { k: { en: "THE FOUNDATION", ar: "الأساس" }, t: { en: "Columns, footings, bedrock.", ar: "أعمدة وقواعد وصخر." } },
    { k: { en: "FLOOR BY FLOOR", ar: "طابقاً بطابق" }, t: { en: "Slabs, walls, then light.", ar: "بلاطات وجدران ثم ضوء." } },
    { k: { en: "LAYER BY LAYER", ar: "طبقة بطبقة" }, t: { en: "See what goes into every home.", ar: "شاهد مما يُبنى كل بيت." } },
  ];

  return (
    <div className="hero-track" ref={trackRef}>
      <header className="hero" id="hero">
        <div className="hero-bg" ref={bgRef}>
          <img fetchpriority="high" src={asset("/assets/buildseq/poster.webp")} alt="Al Shatherwan residence" />
          <canvas ref={canvasRef} aria-hidden="true"></canvas>
        </div>
        <div className="hero-veil" ref={veilRef}></div>
        <div className="hero-content" ref={contentRef}>
          <p className="hero-eyebrow reveal visible">{L({ en: `EST. 2010 — AMMAN, JORDAN`, ar: "تأسست عام ٢٠١٠ — عمّان، الأردن" })}</p>
          <h1 className="hero-calligraphy reveal visible">الشاذروان</h1>
          <p className="hero-title reveal visible">
            {L({
              en: <>AL SHATHERWAN <span>FOR HOUSING</span></>,
              ar: <>شركة الشاذروان <span>للإسكان</span></>,
            })}
          </p>
          <p className="hero-tagline reveal visible">{L({ en: "Where comfort meets value.", ar: "حيث تلتقي الراحة بالقيمة." })}</p>
        </div>
        {STAGES.map((s, i) => (
          <div key={i} className={`hero-stage ${i === 1 ? "right" : ""} ${stage === i ? "on" : ""}`}>
            <span className="stage-num">{`0${i + 1}`}</span>
            <p className="stage-eyebrow">{L(s.k)}</p>
            <p className="stage-title">{L(s.t)}</p>
          </div>
        ))}
        <div className="scroll-hint" ref={hintRef}>
          <span>{L({ en: "SCROLL", ar: "مرر" })}</span>
          <div className="scroll-line"></div>
        </div>
        <div className="hero-progress" aria-hidden="true"><span ref={progressRef}></span></div>
      </header>
    </div>
  );
}

/* ═══════════ HOME ═══════════ */
export function Home() {
  const { L } = useLang();
  const [count, setCount] = useState(2010);

  useEffect(() => {
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / 1600, 1);
      setCount(Math.round(2010 + 16 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <BuildHero />

      <section className="chapter chapter-story" id="story">
        <div className="pattern-bg"></div>
        <div className="chapter-inner">
          <Reveal as="p" className="chapter-num">{L({ en: "CHAPTER I", ar: "الفصل الأول" })}</Reveal>
          <Reveal as="h2" className="chapter-title">{L({ en: "The Story", ar: "قصتنا" })}</Reveal>
          <Reveal className="chapter-rule"></Reveal>
          <Reveal as="p" className="story-lead">
            {L({
              en: `Since ${count > 2024 ? "2010" : count}, Al Shatherwan for Housing has been building high-quality homes in prime locations — where comfort meets value.`,
              ar: "منذ عام ٢٠١٠، وشركة الشاذروان للإسكان تبني منازل عالية الجودة في أرقى المواقع — حيث تلتقي الراحة بالقيمة.",
            })}
          </Reveal>
          <Reveal className="story-stats">
            <div className="stat">
              <span className="stat-value"><span className="stat-num">15</span><span className="stat-plus">+</span></span>
              <span className="stat-rule"></span>
              <span className="stat-label">{L({ en: "Years of Building", ar: "عاماً من البناء" })}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value"><span className="stat-num">100</span><span className="stat-plus">%</span></span>
              <span className="stat-rule"></span>
              <span className="stat-label">{L({ en: "Commitment to Quality", ar: "التزام بالجودة" })}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value"><span className="stat-num-text">{L({ en: "Prime", ar: "الأرقى" })}</span></span>
              <span className="stat-rule"></span>
              <span className="stat-label">{L({ en: "Locations Only", ar: "مواقع مميزة فقط" })}</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="book-cta">
        <Link to="/booking" className="book-cta-link reveal visible">
          <span className="book-cta-eyebrow">{L({ en: "PRIVATE VIEWINGS", ar: "معاينات خاصة" })}</span>
          <span className="book-cta-title">{L({ en: "Reserve Your Visit", ar: "احجز زيارتك" })}</span>
          <span className="book-cta-arrow">⟶</span>
        </Link>
      </section>

      <section className="chapter chapter-contact" id="contact">
        <div className="pattern-bg light"></div>
        <div className="chapter-inner">
          <Reveal as="p" className="chapter-num on-blue">{L({ en: "CHAPTER II", ar: "الفصل الثاني" })}</Reveal>
          <Reveal as="h2" className="chapter-title on-blue">{L({ en: "Begin Your Story", ar: "ابدأ قصتك" })}</Reveal>
          <Reveal className="chapter-rule gold"></Reveal>
          <Reveal as="p" className="contact-lead">{L({ en: "Your ideal home in Amman is waiting. Reach out and let us walk you through it.", ar: "منزلك المثالي في عمّان بانتظارك. تواصل معنا ودعنا نرافقك في الجولة." })}</Reveal>
          <Reveal className="contact-actions">
            <a className="cbtn cbtn-primary" href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20.5 11.9a8.5 8.5 0 0 1-12.4 7.5L4 20.5l1.1-4a8.5 8.5 0 1 1 15.4-4.6z" /><path d="M9.2 9.4c.5 2.6 2.6 4.7 5.2 5.2l1.2-1.2 2.1 1.1-.5 1.5c-4 .4-8.7-3.6-9-8.1l1.5-.5 1.1 2z" fill="currentColor" stroke="none" /></svg>
              {L({ en: "WhatsApp Us", ar: "راسلنا على واتساب" })}
            </a>
            <a className="cbtn" href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" /></svg>
              {L({ en: "Instagram", ar: "تابعنا على إنستغرام" })}
            </a>
          </Reveal>
          <Reveal as="p" className="contact-note">@alshatherwan._ &nbsp;·&nbsp; 07 9048 9291 &nbsp;·&nbsp; {L({ en: "Amman, Jordan", ar: "عمّان، الأردن" })}</Reveal>
        </div>
      </section>
    </>
  );
}

/* ═══════════ ABOUT ═══════════ */
const ABOUT_FACTS = [
  { v: "2010", l: { en: "Established", ar: "سنة التأسيس" } },
  { v: "1719", l: { en: "The Current Residence", ar: "المشروع الحالي" } },
  { v: { en: "Amman", ar: "عمّان" }, l: { en: "Where We Build", ar: "حيث نبني" } },
  { v: { en: "Direct", ar: "مباشرة" }, l: { en: "From the Developer", ar: "من المطوّر" } },
];

const ABOUT_VALUES = [
  { k: "I", t: { en: "Honesty", ar: "الصدق" }, p: { en: "A straight answer on every question — the layout, the floor, the finish, the price.", ar: "إجابة صريحة على كل سؤال — التوزيع، الطابق، التشطيب، والسعر." } },
  { k: "II", t: { en: "Trust", ar: "الثقة" }, p: { en: "What we promise at the drawing is what we hand over at the door.", ar: "ما نعد به على المخطط هو ما نسلّمه عند الباب." } },
  { k: "III", t: { en: "Integrity", ar: "النزاهة" }, p: { en: "No shortcuts inside the walls — the parts you never see are built like the parts you do.", ar: "لا اختصارات داخل الجدران — ما لا تراه يُبنى كما يُبنى ما تراه." } },
];

export function About() {
  const { L } = useLang();
  return (
    <>
      <PageHero eyebrow={{ en: "OUR COMPANY", ar: "من نحن" }} title={{ en: "About Al Shatherwan", ar: "عن الشاذروان" }} />

      {/* ── editorial opening: portrait of the company ── */}
      <section className="chapter chapter-house" id="house">
        <div className="pattern-bg light"></div>
        <div className="chapter-inner wide">
          <div className="house-split">
            <Reveal className="house-media">
              <div className="house-frame"><img src={asset("/assets/building-1719-portrait.jpg")} alt="Al Shatherwan residence at night" /></div>
            </Reveal>
            <div className="house-copy">
              <Reveal as="p" className="chapter-num">{L({ en: "CHAPTER I", ar: "الفصل الأول" })}</Reveal>
              <Reveal as="h2" className="chapter-title left" delay={70}>{L({ en: "A house that builds houses", ar: "بيتٌ يبني البيوت" })}</Reveal>
              <Reveal className="chapter-rule left" delay={130}></Reveal>
              <Reveal as="p" className="house-lead" delay={180}>
                {L({
                  en: "Since 2010, Al Shatherwan for Housing has been building high-quality homes in prime locations across Amman — where comfort meets value.",
                  ar: "منذ عام ٢٠١٠، وشركة الشاذروان للإسكان تبني منازل عالية الجودة في أرقى مواقع عمّان — حيث تلتقي الراحة بالقيمة.",
                })}
              </Reveal>
              <Reveal as="p" className="house-body" delay={240}>
                {L({
                  en: "We are not brokers. We choose the land, design the building, raise it, finish it, and hand you the key ourselves — which is why every answer you get about a Shatherwan home comes from the people who built it.",
                  ar: "نحن لسنا وسطاء. نختار الأرض، ونصمم المبنى، ونبنيه، ونشطّبه، ونسلّمك المفتاح بأنفسنا — لذلك تأتيك كل إجابة عن منزل الشاذروان ممن بنوه.",
                })}
              </Reveal>
              <Reveal className="house-facts" delay={300}>
                {ABOUT_FACTS.map((f) => (
                  <div className="fact" key={f.l.en}>
                    <span className="fact-v">{typeof f.v === "string" ? f.v : L(f.v)}</span>
                    <span className="fact-l">{L(f.l)}</span>
                  </div>
                ))}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="chapter chapter-vision" id="vision">
        <div className="pattern-bg light"></div>
        <div className="chapter-inner">
          <Reveal as="p" className="chapter-num">{L({ en: "CHAPTER II", ar: "الفصل الثاني" })}</Reveal>
          <Reveal as="h2" className="chapter-title" delay={70}>{L({ en: "The Vision", ar: "رؤيتنا" })}</Reveal>
          <Reveal className="chapter-rule" delay={130}></Reveal>
          <div className="vm-grid">
            <Reveal className="vm-card" delay={60}>
              <p className="vm-label">{L({ en: "OUR VISION", ar: "رؤيتنا" })}</p>
              <p className="vm-text">{L({ en: "To be one of Jordan's leading real estate developers, trusted for quality, innovation, and long-term value.", ar: "أن نكون في مقدمة شركات التطوير العقاري في الأردن، نُعرَف بجودتنا وابتكارنا وبقيمةٍ تدوم." })}</p>
            </Reveal>
            <Reveal className="vm-card" delay={180}>
              <p className="vm-label">{L({ en: "OUR MISSION", ar: "رسالتنا" })}</p>
              <p className="vm-text">{L({ en: "To develop modern, reliable, and comfortable homes that meet the needs of every family.", ar: "أن نبني منازل عصرية تجمع الراحة والثقة، وتناسب كل عائلة." })}</p>
            </Reveal>
          </div>
          <Reveal as="p" className="values-line" delay={120}>{L({ en: "We leave our mark on real estate development — and we believe in honesty, trust, and integrity.", ar: "نضع بصمتنا في عالم التطوير العقاري — ونؤمن بالصدق والثقة والنزاهة." })}</Reveal>
        </div>
      </section>

      {/* ── the three values, given room ── */}
      <section className="chapter chapter-values" id="values">
        <div className="pattern-bg"></div>
        <div className="chapter-inner wide">
          <Reveal as="p" className="chapter-num on-blue">{L({ en: "CHAPTER III", ar: "الفصل الثالث" })}</Reveal>
          <Reveal as="h2" className="chapter-title on-blue" delay={70}>{L({ en: "What We Stand On", ar: "ما نقوم عليه" })}</Reveal>
          <Reveal className="chapter-rule gold" delay={130}></Reveal>
          <div className="values-grid">
            {ABOUT_VALUES.map((v, i) => (
              <Reveal as="article" className="value-card" key={v.k} delay={i * 110}>
                <span className="value-k">{v.k}</span>
                <h3>{L(v.t)}</h3>
                <p>{L(v.p)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="chapter chapter-craft" id="craft">
        <div className="pattern-bg"></div>
        <div className="chapter-inner">
          <Reveal as="p" className="chapter-num">{L({ en: "CHAPTER IV", ar: "الفصل الرابع" })}</Reveal>
          <Reveal as="h2" className="chapter-title" delay={70}>{L({ en: "The Craft", ar: "الإتقان" })}</Reveal>
          <Reveal className="chapter-rule" delay={130}></Reveal>
          <Reveal as="p" className="craft-lead" delay={180}>{L({ en: "Every Shatherwan home is built to be lived in for generations — quality you can see, and quality you can feel.", ar: "كل منزل من الشاذروان يُبنى ليُسكن لأجيال — جودة تراها بعينك، وجودة تلمسها بإحساسك." })}</Reveal>
          <div className="craft-grid">
            <Reveal as="figure" className="craft-item">
              <div className="craft-img"><img src={asset("/assets/detail-balconies.jpg")} alt="Balcony detail" /></div>
              <figcaption>{L({ en: "The Balconies", ar: "الشرفات" })}</figcaption>
            </Reveal>
            <Reveal as="figure" className="craft-item" delay={160}>
              <div className="craft-img"><img src={asset("/assets/detail-entrance.jpg")} alt="Entrance colonnade" /></div>
              <figcaption>{L({ en: "The Entrance", ar: "المدخل" })}</figcaption>
            </Reveal>
          </div>
          <Reveal className="craft-values" delay={120}>
            <span>{L({ en: "QUALITY", ar: "الجودة" })}</span><span className="dot">·</span>
            <span>{L({ en: "COMFORT", ar: "الراحة" })}</span><span className="dot">·</span>
            <span>{L({ en: "LASTING VALUE", ar: "قيمة تدوم" })}</span>
          </Reveal>
        </div>
      </section>

      <section className="chapter chapter-process" id="process">
        <div className="pattern-bg"></div>
        <div className="chapter-inner wide">
          <Reveal as="p" className="chapter-num">{L({ en: "CHAPTER V", ar: "الفصل الخامس" })}</Reveal>
          <Reveal as="h2" className="chapter-title" delay={70}>{L({ en: "How We Build", ar: "كيف نبني" })}</Reveal>
          <Reveal className="chapter-rule" delay={130}></Reveal>
          <Reveal as="p" className="process-lead" delay={180}>{L({ en: "From the first survey to the final key — every Shatherwan home follows the same uncompromising path.", ar: "من أول معاينة للأرض حتى تسليم المفتاح — كل منزل من الشاذروان يمر بالنهج ذاته دون تنازل." })}</Reveal>
          <div className="process-grid">
            {PROCESS.map((s, i) => (
              <Reveal key={s.n} className="process-step" delay={i * 110}>
                <div className="process-img"><img src={s.img} alt={L(s.t)} /></div>
                <span className="process-n">{s.n}</span>
                <h3>{L(s.t)}</h3>
                <p>{L(s.p)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── closing invitation ── */}
      <section className="chapter chapter-invite">
        <div className="pattern-bg light"></div>
        <div className="chapter-inner">
          <Reveal as="p" className="chapter-num on-blue">{L({ en: "AN INVITATION", ar: "دعوة" })}</Reveal>
          <Reveal as="h2" className="chapter-title on-blue" delay={70}>{L({ en: "Come and see it", ar: "تعال وشاهده" })}</Reveal>
          <Reveal className="chapter-rule gold" delay={130}></Reveal>
          <Reveal as="p" className="invite-lead" delay={180}>
            {L({
              en: "The stone, the light, the balconies — none of it photographs the way it feels in person. Spend forty-five minutes with us.",
              ar: "الحجر، والضوء، والشرفات — لا تُنقل بالصور كما تُحسّ على الطبيعة. امنحنا خمساً وأربعين دقيقة.",
            })}
          </Reveal>
          <Reveal className="invite-actions" delay={240}>
            <Link to="/booking" className="btn-gold">{L({ en: "BOOK A PRIVATE VIEWING", ar: "احجز معاينة خاصة" })}</Link>
            <Link to="/projects" className="btn-outline-gold">{L({ en: "SEE THE RESIDENCE", ar: "شاهد المشروع" })}</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ═══════════ PROJECTS ═══════════ */
export function Projects() {
  const { L } = useLang();
  return (
    <>
      <PageHero eyebrow={{ en: "OUR WORK", ar: "أعمالنا" }} title={{ en: "The Projects", ar: "المشاريع" }} />
      <section className="chapter chapter-residence" id="residence">
        <div className="residence-hero">
          <div className="residence-img"><img src={asset("/assets/building-1719-hero.jpg")} alt="Residence 1719 by night" /></div>
          <div className="residence-veil"></div>
          <div className="residence-caption">
            <p className="chapter-num light-num reveal visible">{L({ en: "CHAPTER I", ar: "الفصل الأول" })}</p>
            <h2 className="residence-title reveal visible">{L({ en: "Residence", ar: "مشروع" })} <em>1719</em></h2>
            <p className="residence-sub-en reveal visible">{L({ en: "Wider spaces. Greater comfort.", ar: "مساحات أوسع، راحة أكبر" })}</p>
            <Link className="res-tour-btn reveal visible" to="/tour">{L({ en: "EXPLORE THE BUILDING IN 3D →", ar: "استكشف المبنى بتقنية ثلاثية الأبعاد ←" })}</Link>
          </div>
        </div>
        <div className="residence-body">
          <div className="chapter-inner narrow">
            <Reveal as="p" className="residence-copy-en">{L({ en: "Generous floor plans designed around your comfort — stone façades, sweeping balconies, and lighting that celebrates every detail.", ar: "مساحات واسعة صُمّمت لراحتك — واجهات حجرية فاخرة، شرفات ممتدة، وإضاءة تحتفي بكل تفصيل." })}</Reveal>
            <Reveal className="residence-features">
              {FEATURES.map((f) => (
                <div className="feature" key={f.n}>
                  <span className="feature-num">{f.n}</span>
                  <h3>{L(f.t)}</h3>
                  <p>{L(f.p)}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="chapter chapter-listings" id="homes">
        <div className="pattern-bg"></div>
        <div className="chapter-inner wide">
          <Reveal as="p" className="listings-eyebrow">{L({ en: "AVAILABLE NOW", ar: "متوفر الآن" })}</Reveal>
          <Reveal as="h2" className="listings-h">{L({ en: "Homes for Sale", ar: "شقق للبيع" })}</Reveal>
          <Reveal className="chapter-rule"></Reveal>
          <Reveal as="p" className="listings-lead">{L({ en: "Move-in-ready apartments in Residence 1719 — reserve yours before they're gone.", ar: "شقق جاهزة للسكن في مشروع ١٧١٩ — احجز شقتك قبل أن تُحجَز." })}</Reveal>
          <div className="listings-grid">
            {LISTINGS.map((u) => {
              const p = PROPERTIES[u.id];
              return (
                <Reveal as="article" className="listing" key={u.id}>
                  <div className="listing-media">
                    <img src={u.img} alt={L(p.title)} />
                    <span className="listing-badge">{L({ en: "FOR SALE", ar: "للبيع" })}</span>
                    <span className="listing-price">{L({ en: "Price on request", ar: "السعر عند الطلب" })}</span>
                  </div>
                  <div className="listing-body">
                    <h3>{L(p.title)}</h3>
                    <p className="listing-loc">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span>{L({ en: "Amman, Jordan", ar: "عمّان، الأردن" })}</span>
                    </p>
                    <p className="listing-specs">{L(u.specs)}</p>
                    <Link className="listing-view" to={`/property/${u.id}`}>
                      {L({ en: "View Details", ar: "عرض التفاصيل" })}
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </Link>
                    <Link className="listing-btn" to={`/booking?unit=${u.id}`}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>
                      {L({ en: "Book a Viewing", ar: "احجز معاينة" })}
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ═══════════ GALLERY ═══════════ */
export function GalleryPage() {
  const { L } = useLang();
  return (
    <>
      <PageHero eyebrow={{ en: "OUR WORK", ar: "أعمالنا" }} title={{ en: "Projects We've Built", ar: "مشاريع أنجزناها" }} />
      <section className="chapter chapter-work" id="work">
        <div className="pattern-bg"></div>
        <div className="chapter-inner wide">
          <div className="work-grid">
            {WORK_IMAGES.map((im) => (
              <Reveal as="figure" className="work-item" key={im.src}>
                <img loading="lazy" decoding="async" src={im.src} alt={L(im.cap)} />
                <figcaption>{L(im.cap)}</figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="chapter chapter-lifestyle" id="lifestyle">
        <div className="pattern-bg"></div>
        <div className="chapter-inner wide">
          <Reveal as="p" className="chapter-num">{L({ en: "CHAPTER I", ar: "الفصل الأول" })}</Reveal>
          <Reveal as="h2" className="chapter-title">{L({ en: "The Lifestyle", ar: "أسلوب الحياة" })}</Reveal>
          <Reveal className="chapter-rule"></Reveal>
          <Reveal as="p" className="lifestyle-lead">{L({ en: "Interiors designed to breathe — warm, calm, and made for everyday beauty.", ar: "مساحات داخلية تمنحك متّسعاً للراحة — دافئة، هادئة، ومصمّمة لتفاصيل يومك." })}</Reveal>
          <div className="life-grid">
            {LIFE_IMAGES.map((im) => (
              <Reveal as="figure" className="life-item" key={im.src}>
                <img src={im.src} alt={L(im.cap)} />
                <figcaption>{L(im.cap)}</figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="chapter chapter-gallery" id="gallery">
        <div className="chapter-inner wide">
          <Reveal as="p" className="chapter-num light-num">{L({ en: "CHAPTER II", ar: "الفصل الثاني" })}</Reveal>
          <Reveal as="h2" className="chapter-title on-dark">{L({ en: "The Gallery", ar: "المعرض" })}</Reveal>
          <Reveal className="chapter-rule gold"></Reveal>
          <Reveal as="p" className="gallery-lead">{L({ en: "Drag to explore our world in three dimensions — from first stone to final key.", ar: "اسحب لتستكشف مشروعنا بتقنية ثلاثية الأبعاد — من أول حجر حتى تسليم المفتاح." })}</Reveal>
          <GalleryRing />
          <Reveal as="p" className="gallery-hint">{L({ en: "— DRAG OR SWIPE TO ROTATE —", ar: "— اسحب أو مرر للاستكشاف —" })}</Reveal>
        </div>
      </section>
    </>
  );
}

/* ═══════════ BOOKING CONFIRMATION MODAL ═══════════ */
function BookingConfirm({ url, onClose }) {
  const { L } = useLang();
  const cardRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";   // don't let the page scroll behind the scrim
    cardRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Portalled to <body>: the animated .page-fade wrapper in App.jsx establishes
  // a containing block, which would otherwise size this fixed scrim to the page
  // instead of the viewport and let the nav paint over it.
  return createPortal(
    <div className="modal-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="bkTitle" tabIndex={-1} ref={cardRef}>
        <button className="modal-close" type="button" onClick={onClose} aria-label={L({ en: "Close", ar: "إغلاق" })}>×</button>
        <span className="modal-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p className="modal-eyebrow">{L({ en: "ALMOST THERE", ar: "بقيت خطوة واحدة" })}</p>
        <h3 id="bkTitle" className="modal-title">{L({ en: "Your request is written", ar: "طلبك جاهز" })}</h3>
        <p className="modal-copy">
          {L({
            en: "It's waiting in WhatsApp with your name, date, and time already filled in. Press send there and our team replies within the hour.",
            ar: "طلبك بانتظارك في واتساب، وفيه اسمك وتاريخ وموعد المعاينة. اضغط إرسال هناك، وسيرد فريقنا خلال ساعة.",
          })}
        </p>
        <div className="modal-actions">
          <a className="btn-gold" href={url} target="_blank" rel="noopener noreferrer">
            {L({ en: "OPEN WHATSAPP", ar: "افتح واتساب" })}
          </a>
          <button className="btn-outline-navy" type="button" onClick={onClose}>
            {L({ en: "DONE", ar: "تم" })}
          </button>
        </div>
        <p className="modal-note">
          {L({ en: "Didn't open? Your browser may have blocked the pop-up — use the button above.", ar: "لم يُفتح؟ قد يكون متصفحك حجب النافذة — استخدم الزر بالأعلى." })}
        </p>
      </div>
    </div>,
    document.body
  );
}

/* ═══════════ BOOKING ═══════════ */
export function Booking() {
  const { L } = useLang();
  const [params] = useSearchParams();
  const [sent, setSent] = useState(null);   // holds the WhatsApp URL once submitted
  const unit = params.get("unit");
  const unitOptions = [
    { v: "Residence 1719", t: { en: "Residence 1719 — General", ar: "مشروع ١٧١٩ — عام" } },
    ...Object.entries(PROPERTIES).map(([id, p]) => ({ v: p.title.en, id, t: p.title })),
    { v: "Upcoming projects", t: { en: "Upcoming projects", ar: "المشاريع القادمة" } },
  ];
  const defaultV = unitOptions.find((o) => o.id === unit)?.v ?? unitOptions[0].v;

  const submit = (e) => {
    e.preventDefault();
    const f = e.target;
    const msg = `مرحباً شركة الشاذروان للإسكان 🏠\nأرغب بحجز موعد لمعاينة منزل.\n\nViewing request:\n• Name: ${f.name.value}\n• Phone: ${f.phone.value}\n• Project: ${f.project.value}\n• Date: ${f.date.value}\n• Time: ${f.time.value}`;
    const url = wa(msg);
    window.open(url, "_blank");
    setSent(url);
  };

  return (
    <>
      <PageHero eyebrow={{ en: "RESERVATIONS", ar: "الحجوزات" }} title={{ en: "Book a Private Viewing", ar: "احجز موعد معاينة خاصة" }} />
      <section className="chapter chapter-booking">
        <div className="pattern-bg"></div>
        <div className="chapter-inner">
          <Reveal as="form" className="booking-form" onSubmit={submit}>
            <div className="bf-row">
              <div className="bf-field">
                <label htmlFor="bfName">{L({ en: "FULL NAME", ar: "الاسم الكامل" })}</label>
                <input id="bfName" name="name" type="text" placeholder={L({ en: "Your name", ar: "اسمك الكريم" })} required />
              </div>
              <div className="bf-field">
                <label htmlFor="bfPhone">{L({ en: "PHONE", ar: "رقم الهاتف" })}</label>
                <input id="bfPhone" name="phone" type="tel" placeholder="07X XXX XXXX" required />
              </div>
            </div>
            <div className="bf-row">
              <div className="bf-field">
                <label htmlFor="bfProject">{L({ en: "PROJECT", ar: "المشروع" })}</label>
                <select id="bfProject" name="project" defaultValue={defaultV}>
                  {unitOptions.map((o) => <option key={o.v} value={o.v}>{L(o.t)}</option>)}
                </select>
              </div>
              <div className="bf-field">
                <label htmlFor="bfDate">{L({ en: "DATE", ar: "التاريخ" })}</label>
                <input id="bfDate" name="date" type="date" min={new Date().toISOString().split("T")[0]} required />
              </div>
              <div className="bf-field">
                <label htmlFor="bfTime">{L({ en: "TIME", ar: "الوقت" })}</label>
                <select id="bfTime" name="time">
                  {["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-book">{L({ en: "RESERVE MY VIEWING", ar: "احجز موعدي" })}</button>
            <p className="booking-note">{L({ en: "Your request opens in WhatsApp — confirm and send, and our team replies within the hour.", ar: "سيُفتح طلبك في واتساب — أكّد وأرسل، وسيرد فريقنا خلال ساعة." })}</p>
          </Reveal>
          <Reveal className="binfo-row">
            {[
              { icon: "person", t: { en: "Private & Personal", ar: "خاصة وشخصية" }, p: { en: "One-on-one with our team.", ar: "جولة فردية مع فريقنا." } },
              { icon: "clock", t: { en: "45 Minutes", ar: "٤٥ دقيقة" }, p: { en: "Apartment, building, neighbourhood.", ar: "الشقة والمبنى والحي." } },
              { icon: "pin", t: { en: "Amman, Jordan", ar: "عمّان، الأردن" }, p: { en: "Exact pin sent on WhatsApp.", ar: "الموقع الدقيق عبر واتساب." } },
            ].map((b) => (
              <div className="binfo" key={b.icon}>
                <span className="binfo-icon"><ServiceIcon name={b.icon} /></span>
                <h3>{langText(b.t)}</h3>
                <p>{langText(b.p)}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      {sent && <BookingConfirm url={sent} onClose={() => setSent(null)} />}
    </>
  );
}
// plain helper (not a hook) so it can be called inside a map callback
function langText(obj) {
  const lang = document.documentElement.lang === "ar" ? "ar" : "en";
  return obj[lang];
}

/* ═══════════ PROPERTY DETAILS ═══════════ */
export function Property() {
  const { L, lang } = useLang();
  const { id } = useParams();
  const prop = PROPERTIES[id] || PROPERTIES.garden;
  const [img, setImg] = useState(prop.imgs[0]);
  useEffect(() => setImg(prop.imgs[0]), [id]); // eslint-disable-line
  const feats = [...prop.feats, ...COMMON_FEATS];
  const enquireMsg = lang === "ar"
    ? `مرحباً! أرغب بالاستفسار عن: ${prop.title.ar} (مشروع ١٧١٩)`
    : `Hello! I would like to ask about: ${prop.title.en} (Residence 1719)`;

  return (
    <main className="pd-wrap">
      <Link className="pd-back" to="/projects#homes">{L({ en: "← Back to Homes for Sale", ar: "العودة إلى الشقق المعروضة" })}</Link>
      <div className="pd-top">
        <div className="pd-gallery">
          <div className="pd-main"><img src={img} alt={L(prop.title)} /></div>
          <div className="pd-thumbs">
            {prop.imgs.map((s) => (
              <button key={s} type="button" className={`pd-thumb ${s === img ? "active" : ""}`} onClick={() => setImg(s)}>
                <img src={s} alt="" />
              </button>
            ))}
          </div>
        </div>
        <aside className="pd-info">
          <span className="pd-badge">{L({ en: "FOR SALE", ar: "للبيع" })}</span>
          <h1 className="pd-title">{L(prop.title)}</h1>
          <p className="pd-loc">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span>{L({ en: "Amman, Jordan — Residence 1719", ar: "عمّان، الأردن — مشروع ١٧١٩" })}</span>
          </p>
          <p className="pd-price">{L({ en: "Price on request", ar: "السعر عند الطلب" })}</p>
          <div className="pd-specs">
            <div className="pd-spec"><strong>{prop.beds}</strong><span className="spec-label">{L({ en: "Bedrooms", ar: "غرف النوم" })}</span></div>
            <div className="pd-spec"><strong>{prop.baths}</strong><span className="spec-label">{L({ en: "Bathrooms", ar: "الحمامات" })}</span></div>
            <div className="pd-spec"><strong>{prop.area}</strong><span className="spec-label">{L({ en: "Area", ar: "المساحة" })}</span></div>
            <div className="pd-spec"><strong>{L(prop.floor)}</strong><span className="spec-label">{L({ en: "Floor", ar: "الطابق" })}</span></div>
          </div>
          <a className="pd-enquire" href={wa(enquireMsg)} target="_blank" rel="noopener noreferrer">{L({ en: "ENQUIRE ON WHATSAPP", ar: "استفسر عبر واتساب" })}</a>
          <Link className="pd-book" to={`/booking?unit=${id}`}>{L({ en: "BOOK A PRIVATE VIEWING", ar: "احجز موعد معاينة" })}</Link>
          <Link className="pd-tour" to="/tour">{L({ en: "EXPLORE IN 3D", ar: "استكشف بتقنية ثلاثية الأبعاد" })}</Link>
        </aside>
      </div>
      <section className="pd-section">
        <h2 className="pd-h">{L({ en: "Overview", ar: "نبذة عن الشقة" })}</h2>
        <p className="pd-desc">{L(prop.desc)}</p>
      </section>
      <section className="pd-section">
        <h2 className="pd-h">{L({ en: "Features", ar: "المميزات" })}</h2>
        <ul className="pd-feats">{feats.map((f, i) => <li key={i}>{L(f)}</li>)}</ul>
      </section>
      <section className="pd-section">
        <h2 className="pd-h">{L({ en: "Location", ar: "الموقع" })}</h2>
        <div className="pd-map">
          <iframe src="https://www.google.com/maps?q=Amman,Jordan&z=12&output=embed" loading="lazy" title="Location map"></iframe>
        </div>
        <p className="pd-map-note">{L({ en: "We share the exact location pin on WhatsApp once your viewing is confirmed.", ar: "نرسل الموقع الدقيق عبر واتساب فور تأكيد موعدك." })}</p>
      </section>
    </main>
  );
}
