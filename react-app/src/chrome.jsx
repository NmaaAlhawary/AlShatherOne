import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLang } from "./lang.jsx";
import { SOCIAL, SEARCH_INDEX, LOCATION, wa, mailto, asset } from "./data.js";

/* reveal-on-scroll wrapper: same .reveal/.visible classes as the CSS.
   `delay` (ms) staggers siblings; motion is skipped entirely for visitors
   who ask for reduced motion. */
export function Reveal({ as: Tag = "div", className = "", delay = 0, style, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("visible");
      return;
    }
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); ob.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Nav({ onSearch }) {
  const { lang, toggle, L } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => setOpen(false), [loc]);

  const links = [
    { to: "/about", t: { en: "About", ar: "من نحن" } },
    { to: "/projects", t: { en: "Projects", ar: "المشاريع" } },
    { to: "/gallery", t: { en: "Gallery", ar: "المعرض" } },
    { to: "/tour", t: { en: "3D", ar: "ثلاثي الأبعاد" } },
  ];

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""} ${open ? "menu-open" : ""}`} id="nav">
      <button className={`nav-toggle ${open ? "open" : ""}`} aria-label="Menu" onClick={() => setOpen(!open)}>
        <span></span><span></span>
      </button>
      <div className="nav-side nav-left">
        {links.map((l) => <NavLink key={l.to} to={l.to}>{L(l.t)}</NavLink>)}
        <Link to="/booking" className="m-only">{L({ en: "Book a Viewing", ar: "احجز معاينة" })}</Link>
        <Link to="/#contact" className="m-only">{L({ en: "Contact", ar: "تواصل معنا" })}</Link>
      </div>
      <Link to="/" className="nav-brand">
        <span className="nav-brand-ar">الشاذروان</span>
        <span className="nav-brand-en">AL SHATHERWAN</span>
      </Link>
      <div className="nav-side nav-right">
        <NavLink to="/booking">{L({ en: "Book a Viewing", ar: "احجز معاينة" })}</NavLink>
        <Link to="/#contact">{L({ en: "Contact", ar: "تواصل معنا" })}</Link>
        <button className="nav-search" aria-label="Search" onClick={onSearch}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        </button>
        <button className="lang-toggle" onClick={toggle}>{lang === "ar" ? "EN" : "عربي"}</button>
      </div>
    </nav>
  );
}

export function Footer() {
  const { L, lang } = useLang();
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    if (!email) return;
    const subject = lang === "ar" ? "الانضمام إلى القائمة البريدية" : "Newsletter signup";
    const body = lang === "ar"
      ? `مرحباً شركة الشاذروان للإسكان،\n\nأرغب بالانضمام إلى قائمتكم البريدية.\nبريدي الإلكتروني: ${email}\n`
      : `Hello Al Shatherwan for Housing,\n\nI would like to join your mailing list.\nMy email: ${email}\n`;
    // Static site, no backend — this hands the message to the visitor's mail client.
    window.location.href = mailto(subject, body);
    setDone(true);
    e.target.reset();
  };
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-news">
          <h3 className="footer-news-title">{L({ en: "Stay in Touch", ar: "ابقَ على تواصل" })}</h3>
          <p className="footer-news-sub">{L({ en: "Be the first to hear about new residences and private viewings.", ar: "كن أول من يصله خبر مشاريعنا الجديدة ومواعيد المعاينات الخاصة." })}</p>
          <form className="news-form" onSubmit={submit}>
            {/* clearing `done` on edit stops a stale confirmation sitting under an empty field */}
            <input
              type="email" name="email" required
              placeholder={L({ en: "Email address", ar: "البريد الإلكتروني" })}
              onChange={() => done && setDone(false)}
            />
            <button type="submit">{L({ en: "SUBSCRIBE", ar: "اشترك" })}</button>
          </form>
          {done && <p className="news-done">{L({ en: "Your email is ready to send — just press send.", ar: "رسالتك جاهزة — اضغط إرسال فقط." })}</p>}
        </div>
        <div className="footer-cols">
          <div className="fcol">
            <h4>{L({ en: "Explore", ar: "استكشف" })}</h4>
            <Link to="/about">{L({ en: "About", ar: "من نحن" })}</Link>
            <Link to="/projects">{L({ en: "Projects", ar: "المشاريع" })}</Link>
            <Link to="/gallery">{L({ en: "Gallery", ar: "المعرض" })}</Link>
          </div>
          <div className="fcol">
            <h4>{L({ en: "Visit", ar: "زيارة" })}</h4>
            <Link to="/booking">{L({ en: "Book a Viewing", ar: "احجز معاينة" })}</Link>
            <Link to="/#contact">{L({ en: "Contact", ar: "تواصل معنا" })}</Link>
          </div>
          <div className="fcol">
            <h4>{L({ en: "Follow", ar: "تابعنا" })}</h4>
            <div className="social-icons">
              <a className="sicon" aria-label="Instagram" href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="3" width="18" height="18" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" /></svg>
              </a>
              <a className="sicon" aria-label="Facebook" href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9" /><path d="M14.8 7.8h-1.3c-1.2 0-2 .8-2 2.1v1.5H9.6v2.2h1.9v5.2h2.3v-5.2h2l.3-2.2h-2.3V10c0-.4.2-.6.6-.6h1.4z" fill="currentColor" stroke="none" /></svg>
              </a>
              <a className="sicon" aria-label="WhatsApp" href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M20.5 11.9a8.5 8.5 0 0 1-12.4 7.5L4 20.5l1.1-4a8.5 8.5 0 1 1 15.4-4.6z" /><path d="M9.2 9.4c.5 2.6 2.6 4.7 5.2 5.2l1.2-1.2 2.1 1.1-.5 1.5c-4 .4-8.7-3.6-9-8.1l1.5-.5 1.1 2z" fill="currentColor" stroke="none" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-mark" aria-hidden="true">الشاذروان</div>
      <div className="footer-bottom">
        <span>{L({ en: "© 2026 Al Shatherwan for Housing — Est. 2010", ar: "© ٢٠٢٦ شركة الشاذروان للإسكان — تأسست ٢٠١٠" })}</span>
        <span>{L({ en: "Amman, Jordan · ", ar: "عمّان، الأردن · " })}<a href="tel:+962790489291">{L({ en: "07 9048 9291", ar: "٠٧٩٠٤٨٩٢٩١" })}</a></span>
      </div>
    </footer>
  );
}

/* ── concierge chatbot ── */
export function ChatWidget() {
  const { L, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (open && msgs.length === 0)
      setMsgs([{ who: "bot", text: L({
        en: "Welcome to Al Shatherwan.\nAsk me about our homes, prices, or book a private viewing.",
        ar: "أهلاً بك في الشاذروان.\nاسألني عن شققنا وأسعارها، أو احجز موعد معاينة خاصة.",
      }) }]);
  }, [open]); // eslint-disable-line
  useEffect(() => { bodyRef.current?.scrollTo(0, 1e6); }, [msgs]);

  const answer = (raw) => {
    const t = raw.toLowerCase();
    // Follow the site language — the quick-reply chips send English keywords
    // for matching, so keying off the question alone answered an Arabic
    // visitor in English. Typing in the other script still switches.
    const ar = lang === "ar" || /[؀-ۿ]/.test(raw);
    const A = (en, arr, ...actions) => ({ who: "bot", text: ar ? arr : en, actions: actions.filter(Boolean) });
    if (/(book|viewing|visit|appointment|حجز|معاينة|موعد|زيارة)/.test(t))
      return A("With pleasure! You can reserve a private viewing on our booking page.", "بكل سرور! يمكنك حجز موعد المعاينة من صفحة الحجز.", { label: ar ? "احجز الآن" : "Book now", to: "/booking" });
    if (/(price|cost|سعر|أسعار|التكلفة|بكم)/.test(t))
      return A("Prices vary by project, floor, and apartment size. Message us directly and we'll send the current price list.", "الأسعار تختلف حسب المشروع والمساحة والطابق. راسلنا وسنرسل لك قائمة الأسعار.", { label: "WhatsApp", href: SOCIAL.whatsapp });
    // more specific topics run first: "apartment size" would otherwise be
    // caught by the broad available-homes rule below
    if (/(service|services|offer|do you do|خدمات|خدماتكم|تقدمون|ماذا تعملون)/.test(t))
      return A(
        "We're a full developer: we build residential projects on our own land, sell apartments direct from the developer with no broker, handle construction and finishing ourselves, arrange private viewings, and stay reachable after handover.",
        "نحن مطوّر عقاري متكامل: نبني مشاريعنا السكنية على أرضنا، ونبيع الشقق منّا إليك مباشرة بلا وسيط، وننفّذ البناء والتشطيب بأنفسنا، ونرتّب لك معاينة خاصة، ونبقى على تواصل معك بعد التسليم.",
        { label: ar ? "كيف نبني" : "How we build", to: "/about" });
    if (/(payment|installment|instalment|finance|mortgage|bank|دفع|تقسيط|أقساط|تمويل|بنك)/.test(t))
      return A(
        "Payment terms are arranged case by case, depending on the apartment. Message us on WhatsApp and we'll walk you through the available options in detail.",
        "طريقة الدفع تُرتَّب حسب كل حالة والشقة المختارة. راسلنا على واتساب وسنشرح لك الخيارات المتاحة بالتفصيل.",
        { label: "WhatsApp", href: SOCIAL.whatsapp });
    if (/(size|area|square|metre|meter|m2|how big|مساحة|مساحات|متر|كم متر)/.test(t))
      return A(
        "The layouts are generous — the garden apartment, for instance, is 235 m². Each apartment's exact area and details are listed on the projects page.",
        "الشقق مصمّمة بمساحات واسعة — الشقة الأرضية مع الحديقة مثلاً ٢٣٥ م². تجد مساحة كل شقة وتفاصيلها في صفحة المشاريع.",
        { label: ar ? "شاهد الشقق" : "See the apartments", to: "/projects" });
    if (/(finish|finishing|material|spec|quality|kitchen|bathroom|تشطيب|تشطيبات|مواصفات|مواد|جودة|مطبخ|حمام)/.test(t))
      return A(
        "Natural stone elevations with classical detailing and warm architectural lighting, plus deep terraces off every principal room. For the full specification of a specific apartment, message us on WhatsApp.",
        "واجهات حجر طبيعي بتفاصيل كلاسيكية وإضاءة معمارية دافئة، وشرفات عميقة لكل غرفة رئيسية. للمواصفات الكاملة لكل شقة راسلنا على واتساب.",
        { label: ar ? "تفاصيل المشروع" : "Project details", to: "/projects" });
    if (/(deliver|handover|ready|when|timeline|complete|تسليم|جاهز|متى|الإنجاز)/.test(t))
      return A(
        "We build in clear stages — footings and structure, then walls and finishing, then a final walkthrough before the keys change hands. For the handover date on a specific apartment, message us on WhatsApp.",
        "نبني على مراحل واضحة: الأساسات والهيكل، ثم الجدران والتشطيب، ثم الفحص النهائي قبل تسليم المفتاح. ولمعرفة موعد تسليم شقة بعينها، راسلنا على واتساب.",
        { label: "WhatsApp", href: SOCIAL.whatsapp });
    if (/(3d|tour|virtual|walk|ثلاثي|جولة|افتراضي|تجول)/.test(t))
      return A(
        "You can walk the building in 3D before visiting — explore the model and the floor plan right from your browser.",
        "يمكنك التجوّل في المبنى بتقنية ثلاثية الأبعاد قبل زيارته — استعرض المجسّم والمخطط من المتصفح مباشرة.",
        { label: ar ? "ابدأ الجولة" : "Start the tour", to: "/tour" });
    if (/(photo|photos|picture|image|gallery|see inside|صور|معرض|الصور)/.test(t))
      return A(
        "You can see the project inside and out in our gallery.",
        "يمكنك مشاهدة صور المشروع من الداخل والخارج في المعرض.",
        { label: ar ? "افتح المعرض" : "Open the gallery", to: "/gallery" });
    if (/(deed|title|ownership|legal|registration|طابو|ملكية|تسجيل|قانوني)/.test(t))
      return A(
        "We handle registration and ownership paperwork with the buyer step by step. Message us on WhatsApp and we'll explain the details for the apartment you're interested in.",
        "نتولى إجراءات التسجيل والملكية مع المشتري خطوة بخطوة. راسلنا على واتساب وسنوضح لك التفاصيل الخاصة بالشقة التي تهمك.",
        { label: "WhatsApp", href: SOCIAL.whatsapp });
    if (/(parking|garage|lift|elevator|storage|amenity|amenities|موقف|مواقف|كراج|مصعد|مستودع)/.test(t))
      return A(
        "Parking, lift and building amenities vary by apartment and floor. Message us on WhatsApp and we'll send you the exact details.",
        "تفاصيل المواقف والمصعد والخدمات تختلف حسب الشقة والطابق. راسلنا على واتساب وسنرسل لك التفاصيل الدقيقة.",
        { label: "WhatsApp", href: SOCIAL.whatsapp });
    if (/(available|homes|apartment|شقق|متوفر|مشاريع)/.test(t))
      return A("Currently featuring Residence 1719 — spacious apartments in a prime Amman district.", "حالياً: مشروع الشاذروان ١٧١٩ — شقق واسعة في موقع مميّز بعمّان.", { label: ar ? "شاهد المشروع" : "See the residence", to: "/projects" });
    if (/(where|location|address|directions|map|أين|موقع|عنوان|خريطة)/.test(t))
      return A(
        `We build in ${LOCATION.city.en}. Our current project, ${LOCATION.project.en}, is in one of the city's most desirable districts — walking distance to schools, shops, and daily essentials.\nWe send the exact location pin on WhatsApp once a viewing is booked, so you arrive at the door, not the street.`,
        `نبني في ${LOCATION.city.ar}. مشروعنا الحالي، ${LOCATION.project.ar}، في واحدة من أرقى مناطق المدينة — على مسافة قريبة من المدارس والمحال والخدمات اليومية.\nنرسل الموقع الدقيق عبر واتساب فور حجز المعاينة، لتصل إلى الباب مباشرة.`,
        { label: ar ? "افتح الخريطة" : "Open in Maps", href: LOCATION.maps },
        { label: ar ? "أرسل لي الموقع" : "Send me the pin", href: SOCIAL.whatsapp },
        { label: ar ? "احجز معاينة" : "Book a viewing", to: "/booking" },
      );
    if (/(contact|phone|whatsapp|تواصل|هاتف|واتس)/.test(t))
      return A("Message us on WhatsApp, or follow @alshatherwan._ on Instagram.", "راسلنا على واتساب أو تابعنا على إنستغرام @alshatherwan._", { label: "WhatsApp", href: SOCIAL.whatsapp });
    if (/(hello|hi|مرحبا|السلام|اهلا|أهلا)/.test(t))
      return A("Welcome to Al Shatherwan! How may I assist you today?", "أهلاً وسهلاً بك في الشاذروان! كيف يمكنني مساعدتك؟");
    return A("Thank you! For the most accurate answer, message our team on WhatsApp — we reply within the hour.", "شكراً لسؤالك! تواصل مع فريقنا على واتساب — نرد خلال ساعة.", { label: "WhatsApp", href: SOCIAL.whatsapp });
  };

  // `display` is what the visitor sees; `q` is the keyword we match on, so a
  // localised chip label never shows up as an English bubble.
  const send = (q, display) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { who: "user", text: display || q }]);
    setTimeout(() => setMsgs((m) => [...m, answer(q)]), 650);
  };

  const chips = [
    { label: L({ en: "Available homes", ar: "الشقق المتوفرة" }), q: "available homes" },
    { label: L({ en: "Book a viewing", ar: "احجز معاينة" }), q: "book a viewing" },
    { label: L({ en: "Our services", ar: "خدماتنا" }), q: "services" },
    { label: L({ en: "Payment", ar: "طريقة الدفع" }), q: "payment" },
    { label: L({ en: "Location", ar: "الموقع" }), q: "location" },
  ];

  return (
    <div className="chat-widget">
      <button className="chat-fab" aria-label="Chat with us" onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
      </button>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <img src={asset("/assets/logo.jpg")} alt="" />
            <div>
              <p className="chat-title">{L({ en: "Shatherwan Concierge", ar: "مساعد الشاذروان" })}</p>
              <p className="chat-status"><span className="chat-dot"></span>{L({ en: "Online", ar: "في خدمتك" })}</p>
            </div>
            <button className="chat-close" aria-label="Close chat" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="chat-messages" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.who}`}>
                {m.text}
                {m.actions?.length > 0 && (
                  <span className="chat-actions">
                    {m.actions.map((a) => a.to
                      ? <Link key={a.label} to={a.to} onClick={() => setOpen(false)}>{a.label} →</Link>
                      : <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer">{a.label} →</a>)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="chat-chips">
            {chips.map((c) => <button key={c.q} type="button" onClick={() => send(c.q, c.label)}>{c.label}</button>)}
          </div>
          <form className="chat-inputbar" onSubmit={(e) => { e.preventDefault(); send(input); setInput(""); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={L({ en: "Ask anything…", ar: "اسأل عن أي شيء…" })} />
            <button type="submit" aria-label="Send">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── site search overlay ── */
export function SearchOverlay({ open, onClose }) {
  const { L } = useLang();
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [open]);
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);
  if (!open) return null;
  const query = q.trim().toLowerCase();
  const matches = SEARCH_INDEX.filter((e) =>
    !query || e.t.en.toLowerCase().includes(query) || e.t.ar.includes(query) || e.k.toLowerCase().includes(query));
  return (
    <div className="search-overlay" onClick={(e) => e.target.classList.contains("search-overlay") && onClose()}>
      <button className="search-close" aria-label="Close search" onClick={onClose}>×</button>
      <div className="search-box">
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={L({ en: "Search the site…", ar: "ابحث في الموقع…" })} />
        <div className="search-results">
          {matches.length === 0 && <p className="search-empty">{L({ en: "No results — try another word.", ar: "لا نتائج — جرب كلمة أخرى." })}</p>}
          {matches.map((e) => (
            <Link key={e.href} to={e.href} onClick={onClose}>
              <span>{L(e.t)}</span><small>{L(e.tag)}</small>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
