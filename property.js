/* ═══════ الشاذروان — property details page ═══════ */

const PROPERTIES = {
  garden: {
    imgs: ["assets/gallery-1719.jpg", "assets/detail-entrance.jpg", "assets/life-1.jpg", "assets/hero-clean.jpg"],
    title: { en: "Garden Apartment — Ground Floor", ar: "شقة أرضية مع حديقة" },
    beds: 4, baths: 4, area: "235 m²",
    floor: { en: "Ground", ar: "أرضي" },
    desc: {
      en: "A rare ground-floor residence in Residence 1719 with its own private garden and terrace. Four generous bedrooms, a double living room, and a stone-framed entrance of its own — designed for families who want villa living with apartment ease.",
      ar: "شقة أرضية مميزة في مشروع ١٧١٩ مع حديقة خاصة وتراس. أربع غرف نوم واسعة، صالون مزدوج، ومدخل مستقل بإطار حجري — صُممت لعائلة تريد حياة الفيلا بسهولة الشقة.",
    },
    feats: [
      { en: "Private garden & terrace", ar: "حديقة وتراس خاص" },
      { en: "Separate private entrance", ar: "مدخل مستقل" },
      { en: "Double living room", ar: "صالون مزدوج" },
    ],
  },
  first: {
    imgs: ["assets/detail-balconies.jpg", "assets/gallery-1719.jpg", "assets/life-1.jpg", "assets/building-1719-hero.jpg"],
    title: { en: "First-Floor Apartment", ar: "شقة الطابق الأول" },
    beds: 3, baths: 3, area: "185 m²",
    floor: { en: "First", ar: "الأول" },
    desc: {
      en: "A light-filled three-bedroom home on the first floor of Residence 1719, with deep balconies off the living room and master suite, open-plan living, and premium finishing throughout.",
      ar: "شقة مضيئة بثلاث غرف نوم في الطابق الأول من مشروع ١٧١٩، مع شرفات عميقة من الصالون وغرفة النوم الرئيسية، وتوزيع مفتوح، وتشطيبات فاخرة.",
    },
    feats: [
      { en: "Two deep balconies", ar: "شرفتان عميقتان" },
      { en: "Master suite with ensuite", ar: "غرفة رئيسية بحمام خاص" },
      { en: "Open-plan living & dining", ar: "معيشة وسفرة مفتوحة" },
    ],
  },
  second: {
    imgs: ["assets/life-4.jpg", "assets/gallery-1719.jpg", "assets/life-1.jpg", "assets/detail-balconies.jpg"],
    title: { en: "Second-Floor Apartment", ar: "شقة الطابق الثاني" },
    beds: 3, baths: 3, area: "185 m²",
    floor: { en: "Second", ar: "الثاني" },
    desc: {
      en: "Three bedrooms on the quiet second floor of Residence 1719 — elevated views, generous natural light, and the same uncompromising stone façade and finishing quality as every Shatherwan home.",
      ar: "ثلاث غرف نوم في الطابق الثاني الهادئ من مشروع ١٧١٩ — إطلالة مرتفعة، إضاءة طبيعية وافرة، ونفس جودة الواجهة الحجرية والتشطيب في كل منازل الشاذروان.",
    },
    feats: [
      { en: "Elevated open views", ar: "إطلالة مرتفعة مفتوحة" },
      { en: "Guest suite", ar: "جناح ضيوف" },
      { en: "Laundry room", ar: "غرفة غسيل" },
    ],
  },
  roof: {
    imgs: ["assets/detail-entrance.jpg", "assets/gallery-1719.jpg", "assets/life-4.jpg", "assets/building-1719-hero.jpg"],
    title: { en: "Rooftop Apartment & Terrace", ar: "شقة الروف مع تراس" },
    beds: 4, baths: 4, area: "210 m²",
    floor: { en: "Rooftop", ar: "الروف" },
    desc: {
      en: "The crown of Residence 1719 — a four-bedroom rooftop home with a sweeping private terrace made for Amman evenings, panoramic views, and indoor-outdoor entertaining.",
      ar: "تاج مشروع ١٧١٩ — شقة روف بأربع غرف نوم مع تراس خاص واسع صُمم لأمسيات عمّان، بإطلالة بانورامية ومساحة ضيافة داخلية وخارجية.",
    },
    feats: [
      { en: "Panoramic private terrace", ar: "تراس خاص بإطلالة بانورامية" },
      { en: "Outdoor entertaining area", ar: "جلسة خارجية" },
      { en: "Top-floor privacy", ar: "خصوصية الطابق الأخير" },
    ],
  },
};

const COMMON_FEATS = [
  { en: "Natural stone façade", ar: "واجهة حجر طبيعي" },
  { en: "Elevator", ar: "مصعد" },
  { en: "Covered parking", ar: "موقف مغطى" },
  { en: "Central heating", ar: "تدفئة مركزية" },
  { en: "Video intercom & security", ar: "إنتركم مرئي وحماية" },
  { en: "Landscaped surroundings", ar: "محيط منسّق بالخضرة" },
];

(function () {
  const titleEl = document.getElementById("pdTitle");
  if (!titleEl) return;
  const id = new URLSearchParams(location.search).get("id");
  const prop = PROPERTIES[id] || PROPERTIES.garden;

  const mainImg = document.getElementById("pdMainImg");
  const thumbsEl = document.getElementById("pdThumbs");

  // gallery
  thumbsEl.innerHTML = "";
  prop.imgs.forEach((src, i) => {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "pd-thumb" + (i === 0 ? " active" : "");
    const im = document.createElement("img");
    im.src = src;
    im.alt = "";
    t.appendChild(im);
    t.addEventListener("click", () => {
      mainImg.style.opacity = 0;
      setTimeout(() => { mainImg.src = src; mainImg.style.opacity = 1; }, 180);
      thumbsEl.querySelectorAll(".pd-thumb").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
    });
    thumbsEl.appendChild(t);
  });
  mainImg.src = prop.imgs[0];

  function renderText() {
    const lang = document.documentElement.lang === "ar" ? "ar" : "en";
    titleEl.textContent = prop.title[lang];
    document.title = prop.title[lang] + " — الشاذروان | Al Shatherwan";
    document.getElementById("pdBeds").textContent = prop.beds;
    document.getElementById("pdBaths").textContent = prop.baths;
    document.getElementById("pdArea").textContent = prop.area;
    document.getElementById("pdFloor").textContent = prop.floor[lang];
    document.getElementById("pdDesc").textContent = prop.desc[lang];
    const feats = [...prop.feats, ...COMMON_FEATS];
    const ul = document.getElementById("pdFeats");
    ul.innerHTML = "";
    feats.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f[lang];
      ul.appendChild(li);
    });
    const msg = lang === "ar"
      ? `مرحباً! أرغب بالاستفسار عن: ${prop.title.ar} (مشروع ١٧١٩)`
      : `Hello! I would like to ask about: ${prop.title.en} (Residence 1719)`;
    document.getElementById("pdEnquire").href =
      `https://wa.me/962790489291?text=${encodeURIComponent(msg)}`;
  }
  renderText();
  window.addEventListener("langchange", renderText);
})();
