import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useLang } from "./lang.jsx";
import { Reveal } from "./chrome.jsx";
import { PROPERTIES, COMMON_FEATS, LISTINGS, LIFE_IMAGES, PROCESS, FEATURES, SERVICES, SOCIAL, wa } from "./data.js";
import { GalleryRing, ScrollHero } from "./three3d.jsx";

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
};
const ServiceIcon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor"
    strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name] ?? ICONS.building}
  </svg>
);

/* ═══════════ SERVICES — compact boxes inside "Begin Your Story" ═══════════ */
function ServicesBoxes() {
  const { L } = useLang();
  return (
    <div className="svc-block" id="services">
      <Reveal as="p" className="svc-eyebrow">{L({ en: "WHAT WE DO", ar: "ماذا نقدّم" })}</Reveal>
      <div className="svc-grid">
        {SERVICES.map((s, i) => (
          <Reveal as="article" className="svc-box" key={s.n} delay={i * 70}>
            <span className="svc-icon"><ServiceIcon name={s.icon} /></span>
            <h3 className="svc-title">{L(s.t)}</h3>
            <p className="svc-text">{L(s.p)}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ HOME ═══════════ */
export function Home() {
  const { L } = useLang();
  const heroRef = useRef(null);
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

  useEffect(() => {
    let raf;
    const zoom = () => {
      const el = heroRef.current;
      if (el) {
        const y = window.scrollY;
        const p = Math.min(y / window.innerHeight, 1);
        el.style.transform = `translateY(${y * 0.16}px) scale(${1 + p * 0.3})`;
      }
      raf = requestAnimationFrame(zoom);
    };
    raf = requestAnimationFrame(zoom);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <header className="hero" id="hero">
        <div className="hero-bg" ref={heroRef}>
          <img src="/assets/hero-clean.jpg" alt="Al Shatherwan residence at night" />
        </div>
        <div className="hero-veil"></div>
        <div className="hero-content">
          <p className="hero-eyebrow reveal visible">{L({ en: `EST. 2010 — AMMAN, JORDAN`, ar: "تأسست عام ٢٠١٠ — عمّان، الأردن" })}</p>
          <h1 className="hero-calligraphy reveal visible">الشاذروان</h1>
          <p className="hero-title reveal visible">{L({ en: "AL SHATHERWAN FOR HOUSING", ar: "شركة الشاذروان للإسكان" })}</p>
          <p className="hero-tagline reveal visible">{L({ en: "Where comfort meets value.", ar: "حيث تلتقي الراحة بالقيمة." })}</p>
        </div>
        <div className="scroll-hint">
          <span>{L({ en: "SCROLL", ar: "مرر" })}</span>
          <div className="scroll-line"></div>
        </div>
      </header>

      <ScrollHero />

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
          <ServicesBoxes />
          <Reveal className="contact-actions">
            <a className="btn-solid" href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">{L({ en: "FOLLOW ON INSTAGRAM", ar: "تابعنا على إنستغرام" })}</a>
            <a className="btn-ghost" href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer">{L({ en: "WHATSAPP US", ar: "راسلنا على واتساب" })}</a>
            <a className="btn-ghost" href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">{L({ en: "FACEBOOK", ar: "تابعنا على فيسبوك" })}</a>
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
              <div className="house-frame"><img src="/assets/building-1719.jpg" alt="Al Shatherwan residence" /></div>
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
              <p className="vm-text">{L({ en: "To be one of Jordan's leading real estate developers, trusted for quality, innovation, and long-term value.", ar: "أن نكون من أبرز شركات التطوير العقاري في الأردن، موثوقين بالجودة والابتكار والقيمة طويلة الأمد." })}</p>
            </Reveal>
            <Reveal className="vm-card" delay={180}>
              <p className="vm-label">{L({ en: "OUR MISSION", ar: "رسالتنا" })}</p>
              <p className="vm-text">{L({ en: "To develop modern, reliable, and comfortable homes that meet the needs of every family.", ar: "تطوير منازل عصرية موثوقة ومريحة تلبي احتياجات كل عائلة." })}</p>
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
              <div className="craft-img"><img src="/assets/detail-balconies.jpg" alt="Balcony detail" /></div>
              <figcaption>{L({ en: "The Balconies", ar: "الشرفات" })}</figcaption>
            </Reveal>
            <Reveal as="figure" className="craft-item" delay={160}>
              <div className="craft-img"><img src="/assets/detail-entrance.jpg" alt="Entrance colonnade" /></div>
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
          <Reveal as="p" className="process-lead" delay={180}>{L({ en: "From the first survey to the final key — every Shatherwan home follows the same uncompromising path.", ar: "من أول مسح للأرض حتى تسليم المفتاح — كل منزل من الشاذروان يتبع النهج ذاته دون تنازل." })}</Reveal>
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
          <div className="residence-img"><img src="/assets/building-1719.jpg" alt="Residence 1719 by night" /></div>
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
          <Reveal as="p" className="listings-lead">{L({ en: "Move-in-ready apartments in Residence 1719 — reserve yours before they're gone.", ar: "شقق جاهزة للسكن في مشروع ١٧١٩ — احجز شقتك قبل نفادها." })}</Reveal>
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
          <Reveal as="p" className="listings-note">{L({ en: "* Sample availability — contact us for the current list and prices.", ar: "* نماذج توضيحية — تواصل معنا لقائمة الشقق والأسعار الحالية." })}</Reveal>
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
      <PageHero eyebrow={{ en: "EXPLORE", ar: "استكشف" }} title={{ en: "The Gallery", ar: "المعرض" }} />
      <section className="chapter chapter-lifestyle" id="lifestyle">
        <div className="pattern-bg"></div>
        <div className="chapter-inner wide">
          <Reveal as="p" className="chapter-num">{L({ en: "CHAPTER I", ar: "الفصل الأول" })}</Reveal>
          <Reveal as="h2" className="chapter-title">{L({ en: "The Lifestyle", ar: "أسلوب الحياة" })}</Reveal>
          <Reveal className="chapter-rule"></Reveal>
          <Reveal as="p" className="lifestyle-lead">{L({ en: "Interiors designed to breathe — warm, calm, and made for everyday beauty.", ar: "تصاميم داخلية تتنفس — دافئة، هادئة، وصُنعت لجمال الحياة اليومية." })}</Reveal>
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
          <Reveal as="p" className="gallery-lead">{L({ en: "Drag to explore our world in three dimensions — from first stone to final key.", ar: "اسحب لتستكشف عالمنا بثلاثة أبعاد — من أول حجر حتى تسليم المفتاح." })}</Reveal>
          <GalleryRing />
          <Reveal as="p" className="gallery-hint">{L({ en: "— DRAG OR SWIPE TO ROTATE —", ar: "— اسحب أو مرر للاستكشاف —" })}</Reveal>
        </div>
      </section>
    </>
  );
}

/* ═══════════ BOOKING ═══════════ */
export function Booking() {
  const { L } = useLang();
  const [params] = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);
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
    window.open(wa(msg), "_blank");
    setConfirmed(true);
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
            {confirmed && <p className="booking-confirm">{L({ en: "✓ Your viewing request is ready in WhatsApp — just press send.", ar: "✓ طلب المعاينة جاهز في واتساب — فقط اضغط إرسال." })}</p>}
          </Reveal>
          <Reveal className="binfo-row">
            {[
              { t: { en: "Private & Personal", ar: "خاصة وشخصية" }, p: { en: "Every viewing is one-on-one with our team — no crowds, no pressure, all your questions answered.", ar: "كل معاينة تتم بشكل فردي مع فريقنا — دون ازدحام أو ضغط، مع إجابة على كل أسئلتك." } },
              { t: { en: "45 Minutes", ar: "٤٥ دقيقة" }, p: { en: "A full walkthrough of the residence, the building, and the neighbourhood around it.", ar: "جولة كاملة في الشقة والمبنى والحي المحيط به." } },
              { t: { en: "Amman, Jordan", ar: "عمّان، الأردن" }, p: { en: "We'll send the exact location pin on WhatsApp as soon as your time is confirmed.", ar: "نرسل لك الموقع الدقيق على واتساب فور تأكيد موعدك." } },
            ].map((b, i) => (
              <div className="binfo" key={i}>
                <h3>{langText(b.t)}</h3>
                <p>{langText(b.p)}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
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
