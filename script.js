/* ═══════ الشاذروان — interactions ═══════ */

// ── Intro loader: count 2010 → 2026, then reveal the site
(function () {
  const loader = document.getElementById("loader");
  const yearEl = document.getElementById("loaderYear");
  if (!loader || !yearEl) return;
  const START = 2010, END = 2026, DURATION = 1800;
  const t0 = performance.now();

  function tick(now) {
    const p = Math.min((now - t0) / DURATION, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    yearEl.textContent = Math.round(START + (END - START) * eased);
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        loader.classList.add("done");
        document.querySelectorAll(".hero .reveal").forEach((el, i) => {
          setTimeout(() => el.classList.add("visible"), 150 + i * 220);
        });
      }, 500);
    }
  }
  requestAnimationFrame(tick);
})();

// ── Nav: solid background after scrolling past the hero top
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

// ── Mobile menu
const navToggle = document.getElementById("navToggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    nav.classList.toggle("menu-open");
  });
  nav.querySelectorAll(".nav-side a").forEach((a) =>
    a.addEventListener("click", () => {
      navToggle.classList.remove("open");
      nav.classList.remove("menu-open");
    })
  );
}

// ── Scroll reveals
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal:not(.hero .reveal)").forEach((el) => revealObserver.observe(el));

// ── Stat counters
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const t0 = performance.now();
      const DURATION = 1600;
      (function tick(now) {
        const p = Math.min((now - t0) / DURATION, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

// ── Booking: build a WhatsApp message and open it
const WHATSAPP_NUMBER = "962790489291"; // from the company's Facebook page
(function () {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  const dateInput = document.getElementById("bfDate");
  dateInput.min = new Date().toISOString().split("T")[0];

  // preselect unit passed from a listing card (booking.html?unit=garden)
  const unit = new URLSearchParams(location.search).get("unit");
  if (unit) {
    const opt = document.querySelector(`#bfProject option[data-unit="${unit}"]`);
    if (opt) opt.selected = true;
  }

  const phoneInput = document.getElementById("bfPhone");
  const phoneErr = document.getElementById("bfPhoneErr");
  phoneInput.addEventListener("input", () => { phoneErr.hidden = true; });

  const modal = document.getElementById("bookingModal");
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ""; };
  document.getElementById("bmDone").addEventListener("click", closeModal);
  document.getElementById("bmX").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("bfName").value.trim();
    const phone = phoneInput.value.trim();
    const project = document.getElementById("bfProject").value;
    const date = dateInput.value;
    const time = document.getElementById("bfTime").value;

    // Jordanian mobile: 07[789]XXXXXXX, optionally prefixed +962 / 00962
    if (!/^(?:\+?962|00962|0)?7[789]\d{7}$/.test(phone.replace(/[\s-]/g, ""))) {
      phoneErr.hidden = false;
      phoneInput.focus();
      return;
    }

    const msg =
      `مرحباً شركة الشاذروان للإسكان\n` +
      `أرغب بحجز موعد لمعاينة منزل.\n\n` +
      `Viewing request:\n` +
      `• Name: ${name}\n` +
      `• Phone: ${phone}\n` +
      `• Project: ${project}\n` +
      `• Date: ${date}\n` +
      `• Time: ${time}`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
    document.getElementById("bmWhatsApp").href = waUrl;
    document.getElementById("bmSummary").textContent = `${project} · ${date} · ${time}`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  });
})();

// ── Concierge chatbot (rule-based, bilingual)
(function () {
  const fab = document.getElementById("chatFab");
  const panel = document.getElementById("chatPanel");
  const closeBtn = document.getElementById("chatClose");
  const messagesEl = document.getElementById("chatMessages");
  const chipsEl = document.getElementById("chatChips");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  if (!fab) return;

  const CHIPS = [
    { en: "Available homes", ar: "الشقق المتوفرة", q: "available homes" },
    { en: "Book a viewing", ar: "احجز معاينة", q: "book a viewing" },
    { en: "Location", ar: "الموقع", q: "location" },
    { en: "Contact", ar: "تواصل معنا", q: "contact" },
  ];

  const isArabic = (t) => /[؀-ۿ]/.test(t);
  const siteArabic = () => document.documentElement.lang === "ar";

  function answer(raw) {
    const t = raw.toLowerCase();
    // Follow the site language — the quick-reply chips send English keywords
    // for matching, so keying off the question alone answered an Arabic
    // visitor in English. Typing in the other script still switches.
    const ar = siteArabic() || isArabic(raw);

    if (/(book|viewing|visit|appointment|حجز|معاينة|موعد|زيارة)/.test(t))
      return {
        text: ar
          ? "بكل سرور! يمكنك حجز موعد المعاينة من صفحة الحجز — اختر اليوم والوقت المناسب وسنكون بانتظارك."
          : "With pleasure! You can reserve a private viewing on our booking page — pick the day and time that suits you and our team will be waiting.",
        action: { label: ar ? "احجز الآن" : "Book now", href: "booking.html" },
      };

    if (/(price|cost|كم|سعر|أسعار|التكلفة)/.test(t))
      return {
        text: ar
          ? "الأسعار تختلف حسب المشروع والمساحة والطابق. تواصل معنا مباشرة وسنرسل لك قائمة الأسعار والمخططات المتوفرة."
          : "Prices vary by project, floor, and apartment size. Message us directly and we'll send you the current price list and floor plans.",
        action: { label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}` },
      };

    if (/(available|homes|apartment|units|شقق|متوفر|مشاريع|منازل)/.test(t))
      return {
        text: ar
          ? "حالياً: مشروع الشاذروان 1719 — شقق واسعة بواجهات حجرية فاخرة في موقع مميز بعمّان، بالإضافة إلى مشاريع قادمة قريباً."
          : "Currently featuring Residence 1719 — spacious apartments with premium stone façades in a prime Amman district, with more projects coming soon.",
        action: { label: ar ? "شاهد المشروع" : "See the residence", href: "projects.html" },
      };

    if (/(where|location|address|أين|موقع|عنوان|منطقة)/.test(t))
      return {
        text: ar
          ? "مشاريعنا في أرقى مناطق عمّان، الأردن. أخبرنا بالمنطقة التي تفضلها وسنقترح عليك الأنسب."
          : "Our projects are in Amman's most desirable districts in Jordan. Tell us which area you prefer and we'll suggest the best match.",
      };

    if (/(contact|phone|call|whatsapp|تواصل|اتصال|هاتف|واتس)/.test(t))
      return {
        text: ar
          ? "يسعدنا تواصلك! راسلنا على واتساب أو تابعنا على إنستغرام @alshatherwan._"
          : "We'd love to hear from you! Message us on WhatsApp, or follow us on Instagram @alshatherwan._",
        action: { label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}` },
      };

    if (/(who|about|company|من|عن الشركة|الشاذروان)/.test(t))
      return {
        text: ar
          ? "شركة الشاذروان للإسكان — منذ عام ٢٠١٠ نبني منازل تعكس الجودة والراحة والقيمة طويلة الأمد. خياركم الأمثل لحياة عصرية."
          : "Al Shatherwan for Housing — since 2010 we've been building homes that reflect quality, comfort, and long-term value across Jordan.",
        action: { label: ar ? "قصتنا" : "Our story", href: "about.html" },
      };

    if (/(hello|hi|hey|مرحبا|السلام|اهلا|أهلا|هلا)/.test(t))
      return {
        text: ar
          ? "أهلاً وسهلاً بك في الشاذروان! كيف يمكنني مساعدتك اليوم؟"
          : "Welcome to Al Shatherwan! How may I assist you today?",
      };

    return {
      text: ar
        ? "شكراً لسؤالك! لأدق إجابة، تواصل مع فريقنا مباشرة على واتساب — نرد خلال ساعة بإذن الله."
        : "Thank you for asking! For the most accurate answer, message our team directly on WhatsApp — we reply within the hour.",
      action: { label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}` },
    };
  }

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = `chat-msg ${who}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function botReply(q) {
    const typing = addMsg("· · ·", "bot");
    typing.classList.add("typing");
    setTimeout(() => {
      const { text, action } = answer(q);
      typing.classList.remove("typing");
      typing.textContent = text;
      if (action) {
        const a = document.createElement("a");
        a.href = action.href;
        a.textContent = " " + action.label + " →";
        if (action.href.startsWith("http")) a.target = "_blank";
        else a.addEventListener("click", () => togglePanel(false));
        typing.appendChild(document.createTextNode("\n"));
        typing.appendChild(a);
      }
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 700 + Math.random() * 500);
  }

  let opened = false;
  function togglePanel(show) {
    panel.hidden = !show;
    if (show && !opened) {
      opened = true;
      setTimeout(() => {
        addMsg(siteArabic()
          ? "أهلاً بك في الشاذروان.\nاسألني عن شققنا وأسعارها، أو احجز موعد معاينة خاصة."
          : "Welcome to Al Shatherwan.\nAsk me about our homes, prices, or book a private viewing.", "bot");
      }, 350);
    }
    if (show) input.focus();
  }

  function renderChips() {
    chipsEl.innerHTML = "";
    CHIPS.forEach((chip) => {
      const b = document.createElement("button");
      b.type = "button";
      const label = siteArabic() ? chip.ar : chip.en;
      b.textContent = label;
      b.addEventListener("click", () => { addMsg(label, "user"); botReply(chip.q); });
      chipsEl.appendChild(b);
    });
  }
  renderChips();
  window.addEventListener("langchange", renderChips);

  fab.addEventListener("click", () => togglePanel(panel.hidden));
  closeBtn.addEventListener("click", () => togglePanel(false));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    addMsg(q, "user");
    input.value = "";
    botReply(q);
  });
})();

// ── Hero: scroll-scrubbed build — drawing, then structure, then the finished home
(function () {
  const canvas = document.getElementById("rotCanvas");
  const track = document.getElementById("heroTrack");
  if (!canvas || !track) return;

  const FRAME_COUNT = 240;
  const src = (i) => `assets/buildseq/frame_${String(i + 1).padStart(4, "0")}.webp`;
  const frames = new Array(FRAME_COUNT).fill(null);
  const ctx = canvas.getContext("2d");
  const heroBg = document.getElementById("heroBg");
  const heroContent = document.getElementById("heroContent");
  const stage1 = document.getElementById("heroStage1");
  const stage2 = document.getElementById("heroStage2");
  const stage3 = document.getElementById("heroStage3");
  const scrollHint = document.getElementById("scrollHint");
  const heroVeil = document.querySelector(".hero-veil");
  const heroProgress = document.getElementById("heroProgress");
  // The type lifts into the upper third and the model drops toward the lower
  // frame, so the two never sit on top of each other. LIFT shares `transform`
  // with the scroll translate below.
  const LIFT = 0.1;
  const DROP = 0.07;
  // The model's own bounding box across the sequence, measured at 1275x963 of
  // the 1920x1080 frame. Cover-fitting a 16:9 frame into a portrait phone crops
  // ~74% of the width away, so on narrow screens we fit this box instead.
  const CONTENT_W = 1300, CONTENT_H = 1000;
  const SEQ_BG = "#11100f";
  let currentFrame = -1;

  // Load key frames first so early scrubbing has something to show, then fill the gaps
  const order = [];
  for (let step = 16; step >= 1; step = step >> 1)
    for (let i = 0; i < FRAME_COUNT; i += step)
      if (!order.includes(i)) order.push(i);

  let loaded = 0;
  order.forEach((i, rank) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      frames[i] = img;
      loaded++;
      if (i === 0) { heroBg.classList.add("frames-ready"); draw(0); }
      if (loaded === FRAME_COUNT) draw(currentFrame < 0 ? 0 : currentFrame, true);
    };
    // Stagger kickoff slightly so the poster and fonts win the first network beats
    setTimeout(() => { img.src = src(i); }, rank * 12);
  });

  function nearestLoaded(i) {
    if (frames[i]) return i;
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (frames[i - d]) return i - d;
      if (frames[i + d]) return i + d;
    }
    return -1;
  }

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }
  sizeCanvas();
  window.addEventListener("resize", () => { sizeCanvas(); draw(currentFrame, true); });

  function draw(i, force) {
    const idx = nearestLoaded(Math.max(0, Math.min(FRAME_COUNT - 1, i)));
    if (idx < 0 || (idx === currentFrame && !force)) return;
    currentFrame = idx;
    const img = frames[idx];
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    // Cover on landscape; on portrait that would crop the model away, so fall
    // back to whichever scale keeps the whole model on screen.
    const cover = Math.max(cw / iw, ch / ih);
    const content = Math.min(cw / CONTENT_W, ch / CONTENT_H);
    const scale = Math.min(cover, content);
    const w = iw * scale, h = ih * scale;
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
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const rect = track.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / range));
      draw(Math.round(p * (FRAME_COUNT - 1)));

      // Title clears early so the first caption can land while the base is
      // still going down
      const fade = Math.max(0, 1 - p / 0.13);
      heroContent.style.opacity = fade;
      heroContent.style.transform = `translateY(${-LIFT * window.innerHeight + p * -80}px)`;
      heroContent.style.visibility = fade === 0 ? "hidden" : "visible";
      scrollHint.style.opacity = Math.max(0, 1 - p / 0.08);
      // The scrim only exists to hold the wordmark. Once that's gone, lift it
      // so the finished building lands at full strength.
      if (heroVeil) heroVeil.style.opacity = String(1 - 0.5 * Math.min(1, p / 0.28));
      if (heroProgress) heroProgress.style.width = (p * 100).toFixed(2) + "%";
      // Windows track the build: footings to ~0.15, floors rising to ~0.45,
      // complete around 0.55, opening apart from ~0.62 on. The finished
      // building gets a caption-free beat to itself.
      stage1.classList.toggle("on", p > 0.15 && p < 0.30);
      stage2.classList.toggle("on", p > 0.36 && p < 0.50);
      stage3.classList.toggle("on", p > 0.66);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// ── Gentle parallax on hero / residence imagery
const parallaxEls = document.querySelectorAll(".parallax");
function parallax() {
  const vh = window.innerHeight;
  parallaxEls.forEach((el) => {
    const rect = el.parentElement.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    const speed = +el.dataset.speed || 0.3;
    const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
    el.style.transform = `translateY(${offset}px)`;
  });
  requestAnimationFrame(parallax);
}
requestAnimationFrame(parallax);

// ── Bilingual EN/AR toggle: caches English innerHTML, swaps to Arabic, flips dir
const I18N_AR = {
  ".nav-side a": ["من نحن", "المشاريع", "المعرض", "احجز معاينة", "تواصل معنا", "احجز معاينة", "تواصل معنا"],
  ".hero-eyebrow": "تأسست عام ٢٠١٠ — عمّان، الأردن",
  ".hero-title": "شركة الشاذروان للإسكان",
  ".hero-tagline": "حيث تلتقي الراحة بالقيمة.",
  ".scroll-hint span": "مرر",
  ".process-lead": "من أول مسح للأرض حتى تسليم المفتاح — كل منزل من الشاذروان يتبع النهج ذاته دون تنازل.",
  ".process-step h3": ["الأرض", "الهيكل", "التشطيب", "التسليم"],
  ".process-step p": [
    "نختار أرقى المناطق وأكثرها حيوية، وندرس كل قطعة أرض قبل وضع أول حجر.",
    "خرسانة مسلحة وحجر طبيعي، بهندسة وإشراف يدومان لأجيال.",
    "مساحات مضيئة تُنجز بمواد فاخرة وعناية بأدق التفاصيل.",
    "منزل مكتمل يُسلَّم جاهزاً للحياة — في موعده وكما وعدنا تماماً.",
  ],
  ".story-lead": "منذ عام ٢٠١٠، وشركة الشاذروان للإسكان تبني منازل عالية الجودة في أرقى المواقع — حيث تلتقي الراحة بالقيمة.",
  ".stat-label": ["عاماً من البناء", "التزام بالجودة", "مواقع مميزة فقط"],
  ".stat-num-text": "الأرقى",
  ".vm-label": ["رؤيتنا — OUR VISION", "رسالتنا — OUR MISSION"],
  ".vm-text": [
    "أن نكون من أبرز شركات التطوير العقاري في الأردن، موثوقين بالجودة والابتكار والقيمة طويلة الأمد.",
    "تطوير منازل عصرية موثوقة ومريحة تلبي احتياجات كل عائلة.",
  ],
  ".residence-title": "مشروع <em>١٧١٩</em>",
  ".feature h3": ["مساحات رحبة", "واجهات فاخرة", "شرفات خاصة", "موقع مميز"],
  ".feature p": [
    "شقق واسعة مخططة لحياة العائلة العصرية، بغرف مضيئة وتوزيع مفتوح.",
    "واجهات من الحجر الطبيعي بتفاصيل كلاسيكية وإضاءة معمارية دافئة.",
    "شرفات عميقة تطل من كل غرفة رئيسية، تحيط بها مساحات خضراء منسقة.",
    "في واحدة من أرقى مناطق عمّان، على دقائق من كل ما يهمك.",
  ],
  ".listings-eyebrow": "متوفر الآن",
  ".listings-h": "شقق للبيع",
  ".listings-lead": "شقق جاهزة للسكن في مشروع ١٧١٩ — احجز شقتك قبل نفادها.",
  ".listing h3": ["شقة أرضية مع حديقة", "شقة الطابق الأول", "شقة الطابق الثاني", "شقة الروف مع تراس"],
  ".listing-loc .loc-t": "عمّان، الأردن",
  ".listing-specs": [
    "٤ غرف نوم &nbsp;·&nbsp; ٤ حمامات &nbsp;·&nbsp; ٢٣٥ م²",
    "٣ غرف نوم &nbsp;·&nbsp; ٣ حمامات &nbsp;·&nbsp; ١٨٥ م²",
    "٣ غرف نوم &nbsp;·&nbsp; ٣ حمامات &nbsp;·&nbsp; ١٨٥ م²",
    "٤ غرف نوم &nbsp;·&nbsp; ٤ حمامات &nbsp;·&nbsp; ٢١٠ م²",
  ],
  ".listing-btn": "احجز معاينة",
  ".listing-view": "عرض التفاصيل",
  ".pd-back": "العودة إلى الشقق المعروضة",
  ".pd-badge": "للبيع",
  ".pd-price": "السعر عند الطلب",
  ".pd-loc-t": "عمّان، الأردن — مشروع ١٧١٩",
  ".pd-enquire": "استفسر عبر واتساب",
  ".pd-book": "احجز موعد معاينة",
  ".pd-tour": "استكشف بتقنية ثلاثية الأبعاد",
  ".tour-hint": "اسحب للتدوير · مرر للتقريب · انقر على طابق",
  ".tp-link": "عرض التفاصيل ←",
  ".spec-label": ["غرف النوم", "الحمامات", "المساحة", "الطابق"],
  ".pd-h-overview": "نبذة عن الشقة",
  ".pd-h-features": "المميزات",
  ".pd-h-location": "الموقع",
  ".pd-map-note": "نرسل الموقع الدقيق عبر واتساب فور تأكيد موعدك.",
  ".listing-badge": "للبيع",
  ".listing-price": "السعر عند الطلب",
  ".listings-note": "* نماذج توضيحية — تواصل معنا لقائمة الشقق والأسعار الحالية.",
  ".portfolio-title": "أعمالنا<span>مشاريع الشاذروان</span>",
  ".pf-more": "شاهد المزيد من المشاريع",
  ".craft-lead": "كل منزل من الشاذروان يُبنى ليُسكن لأجيال — جودة تراها بعينك، وجودة تلمسها بإحساسك.",
  ".craft-item figcaption": ["الشرفات", "المدخل"],
  ".lifestyle-lead": "تصاميم داخلية تتنفس — دافئة، هادئة، وصُنعت لجمال الحياة اليومية.",
  ".life-item figcaption": ["غرفة المعيشة", "انحناءات ناعمة", "الساعة الذهبية", "المدفأة", "هدوء أنيق", "تفاصيل هادئة"],
  ".gallery-lead": "اسحب لتستكشف عالمنا بثلاثة أبعاد — من أول حجر حتى تسليم المفتاح.",
  ".book-cta-eyebrow": "معاينات خاصة — PRIVATE VIEWINGS",
  ".book-cta-title": "احجز زيارتك",
  ".contact-lead": "منزلك المثالي في عمّان بانتظارك. تواصل معنا ودعنا نرافقك في الجولة.",
  ".chat-title": "مساعد الشاذروان",
  // footer
  ".footer-news-title": "انضم إلى قائمتنا",
  ".footer-news-sub": "كن أول من يعرف عن مشاريعنا الجديدة ومواعيد المعاينات الخاصة.",
  ".news-form button": "اشترك",
  ".news-done": "✓ شكراً لك — سنتواصل معك قريباً.",
  ".fcol h4": ["استكشف", "زيارة", "تابعنا"],
  ".fcol a:not(.sicon)": ["من نحن", "المشاريع", "المعرض", "احجز معاينة", "تواصل معنا"],
  ".footer-bottom span": ["© ٢٠٢٦ شركة الشاذروان للإسكان — تأسست ٢٠١٠", "عمّان، الأردن · ٠٧٩٠٤٨٩٢٩١"],
  // booking page
  ".page-sub": "عاين منزلك القادم بنفسك. اختر الوقت المناسب وسيكون فريقنا بانتظارك.",
  ".bf-field label": ["الاسم الكامل", "رقم الهاتف", "المشروع", "التاريخ", "الوقت"],
  "#bfProject option": ["مشروع 1719 — عام", "شقة أرضية مع حديقة", "شقة الطابق الأول", "شقة الطابق الثاني", "شقة الروف مع تراس", "المشاريع القادمة"],
  ".btn-book": "احجز موعدي",
  ".booking-note": "سيُفتح طلبك في واتساب — أكّد وأرسل، وسيرد فريقنا خلال ساعة.",
  ".booking-confirm": "✓ طلب المعاينة جاهز في واتساب — فقط اضغط إرسال.",
  ".binfo h3": ["خاصة وشخصية", "٤٥ دقيقة", "عمّان، الأردن"],
  ".binfo p": [
    "كل معاينة تتم بشكل فردي مع فريقنا — دون ازدحام أو ضغط، مع إجابة على كل أسئلتك.",
    "جولة كاملة في الشقة والمبنى والحي المحيط به.",
    "نرسل لك الموقع الدقيق على واتساب فور تأكيد موعدك.",
  ],
};
const I18N_PLACEHOLDERS = [
  ["chatInput", "اسأل عن أي شيء…"],
  ["bfName", "اسمك الكريم"],
  ["newsEmail", "البريد الإلكتروني"],
  ["searchInput", "ابحث في الموقع…"],
];

// ── Newsletter: send the signup to the company WhatsApp
(function () {
  const form = document.getElementById("newsForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsEmail").value.trim();
    const msg = `مرحباً! أرغب بالانضمام إلى قائمة الشاذروان البريدية.\nNewsletter signup: ${email}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    document.getElementById("newsDone").hidden = false;
    form.reset();
  });
})();

function applyLang(lang) {
  const root = document.documentElement;
  root.lang = lang === "ar" ? "ar" : "en";
  root.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-ar]").forEach((el) => {
    if (el.dataset.enHtml === undefined) el.dataset.enHtml = el.innerHTML;
    el.innerHTML = lang === "ar" ? el.dataset.ar : el.dataset.enHtml;
  });
  for (const [sel, ar] of Object.entries(I18N_AR)) {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.dataset.enHtml === undefined) el.dataset.enHtml = el.innerHTML;
      const val = Array.isArray(ar) ? ar[i] : ar;
      if (val === undefined) return;
      el.innerHTML = lang === "ar" ? val : el.dataset.enHtml;
    });
  }
  I18N_PLACEHOLDERS.forEach(([id, arText]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.dataset.enPh === undefined) el.dataset.enPh = el.placeholder;
    el.placeholder = lang === "ar" ? arText : el.dataset.enPh;
  });
  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = lang === "ar" ? "EN" : "عربي";
  localStorage.setItem("shz-lang", lang);
  window.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
}

(function () {
  const btn = document.getElementById("langToggle");
  if (!btn) return;
  const saved = localStorage.getItem("shz-lang") || "en";
  if (saved === "ar") applyLang("ar");
  btn.addEventListener("click", () => {
    applyLang(document.documentElement.lang === "ar" ? "en" : "ar");
  });
})();

// ── Portfolio carousel
(function () {
  const main = document.getElementById("pfMain");
  if (!main) return;
  const left = document.getElementById("pfLeft");
  const right = document.getElementById("pfRight");
  const cap = document.getElementById("pfCaption");
  const ITEMS = [
    { src: "assets/gallery-1719.jpg", en: "Residence 1719", ar: "مشروع ١٧١٩" },
    { src: "assets/ig-finished.jpg", en: "Delivered Home — Amman", ar: "منزل مُسلَّم — عمّان" },
    { src: "assets/detail-entrance.jpg", en: "The Grand Entrance", ar: "المدخل الرئيسي" },
    { src: "assets/detail-balconies.jpg", en: "The Balconies", ar: "الشرفات" },
    { src: "assets/ig-interior.jpg", en: "Light-Filled Interiors", ar: "مساحات مضيئة" },
    { src: "assets/life-1.jpg", en: "Living Spaces", ar: "مساحات المعيشة" },
  ];
  let idx = 0;
  function render(fade) {
    const n = ITEMS.length;
    const lang = document.documentElement.lang === "ar" ? "ar" : "en";
    const apply = () => {
      main.src = ITEMS[idx].src;
      left.src = ITEMS[(idx - 1 + n) % n].src;
      right.src = ITEMS[(idx + 1) % n].src;
      cap.textContent = ITEMS[idx][lang];
      main.style.opacity = 1;
    };
    if (fade) {
      main.style.opacity = 0;
      setTimeout(apply, 250);
    } else apply();
  }
  document.getElementById("pfPrev").addEventListener("click", () => { idx = (idx - 1 + ITEMS.length) % ITEMS.length; render(true); });
  document.getElementById("pfNext").addEventListener("click", () => { idx = (idx + 1) % ITEMS.length; render(true); });
  window.addEventListener("langchange", () => render(false));
  render(false);
})();

// ── Site search
(function () {
  const btn = document.getElementById("navSearch");
  const overlay = document.getElementById("searchOverlay");
  if (!btn || !overlay) return;
  const input = document.getElementById("searchInput");
  const resultsEl = document.getElementById("searchResults");
  const closeBtn = document.getElementById("searchClose");
  const prefix = document.body.classList.contains("page-booking") ? "index.html" : "";

  const INDEX = [
    { en: "The Story", ar: "قصتنا", tag: "Home", tagAr: "الرئيسية", href: "index.html#story", k: "story home history 2010 قصة تاريخ الرئيسية" },
    { en: "About — Vision & Mission", ar: "من نحن — رؤيتنا ورسالتنا", tag: "About", tagAr: "من نحن", href: "about.html", k: "about vision mission values craft build process من نحن رؤية رسالة قيم" },
    { en: "How We Build", ar: "كيف نبني", tag: "About", tagAr: "من نحن", href: "about.html#process", k: "process build construction structure finishing delivery بناء هيكل تشطيب تسليم مراحل" },
    { en: "Residence 1719", ar: "مشروع ١٧١٩", tag: "Projects", tagAr: "مشاريع", href: "projects.html", k: "residence 1719 apartment building project شقة مشروع مبنى عقار" },
    { en: "Homes for Sale", ar: "شقق للبيع", tag: "Listings", tagAr: "عروض", href: "projects.html#homes", k: "homes sale apartments available price listings buy details شقق للبيع سعر شراء متوفر تفاصيل" },
    { en: "Portfolio", ar: "أعمالنا", tag: "Projects", tagAr: "مشاريع", href: "projects.html#portfolio", k: "portfolio projects homes أعمال مشاريع منازل" },
    { en: "The Lifestyle", ar: "أسلوب الحياة", tag: "Gallery", tagAr: "المعرض", href: "gallery.html#lifestyle", k: "lifestyle interior design living تصميم داخلي معيشة" },
    { en: "3D Gallery", ar: "المعرض ثلاثي الأبعاد", tag: "Gallery", tagAr: "المعرض", href: "gallery.html#gallery", k: "gallery 3d photos images صور معرض" },
    { en: "3D Experience — Building, Floor Plan, Tour", ar: "تجربة ثلاثية الأبعاد", tag: "3D", tagAr: "ثلاثي الأبعاد", href: "tour.html", k: "3d building floor plan virtual tour three مجسم مخطط جولة افتراضية ثلاثي" },
    { en: "Book a Private Viewing", ar: "احجز موعد معاينة", tag: "Visit", tagAr: "زيارة", href: "booking.html", k: "book viewing visit appointment tour reserve حجز معاينة موعد زيارة" },
    { en: "Contact Us", ar: "تواصل معنا", tag: "Contact", tagAr: "تواصل", href: "index.html#contact", k: "contact phone whatsapp instagram facebook تواصل هاتف واتساب" },
  ];

  function render(q) {
    const lang = document.documentElement.lang === "ar" ? "ar" : "en";
    const query = q.trim().toLowerCase();
    const matches = INDEX.filter((e) =>
      !query || e.en.toLowerCase().includes(query) || e.ar.includes(query) || e.k.toLowerCase().includes(query)
    );
    resultsEl.innerHTML = "";
    if (!matches.length) {
      const p = document.createElement("p");
      p.className = "search-empty";
      p.textContent = lang === "ar"
        ? "لا نتائج — جرب كلمة أخرى، أو اسأل مساعدنا في الأسفل."
        : "No results — try another word, or ask our concierge below.";
      resultsEl.appendChild(p);
      return;
    }
    matches.forEach((e) => {
      const a = document.createElement("a");
      a.href = e.href;
      const label = document.createElement("span");
      label.textContent = lang === "ar" ? e.ar : e.en;
      const tag = document.createElement("small");
      tag.textContent = lang === "ar" ? e.tagAr : e.tag;
      a.append(label, tag);
      a.addEventListener("click", close);
      resultsEl.appendChild(a);
    });
  }

  function open() {
    overlay.hidden = false;
    render("");
    input.value = "";
    setTimeout(() => input.focus(), 60);
  }
  function close() { overlay.hidden = true; }

  btn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) close(); });
  input.addEventListener("input", () => render(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = resultsEl.querySelector("a");
      if (first) { close(); window.location.href = first.href; }
    }
  });
})();
