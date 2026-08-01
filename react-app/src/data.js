export const WHATSAPP = "962790489291"; // from the company's Facebook page
export const wa = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

export const PROPERTIES = {
  garden: {
    imgs: ["/assets/gallery-1719.jpg", "/assets/detail-entrance.jpg", "/assets/life-1.jpg", "/assets/ig-interior.jpg"],
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
    imgs: ["/assets/detail-balconies.jpg", "/assets/gallery-1719.jpg", "/assets/life-2.jpg", "/assets/ig-interior.jpg"],
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
    imgs: ["/assets/ig-interior.jpg", "/assets/gallery-1719.jpg", "/assets/life-3.jpg", "/assets/detail-balconies.jpg"],
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
    imgs: ["/assets/detail-entrance.jpg", "/assets/gallery-1719.jpg", "/assets/life-4.jpg", "/assets/ig-finished.jpg"],
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

export const COMMON_FEATS = [
  { en: "Natural stone façade", ar: "واجهة حجر طبيعي" },
  { en: "Elevator", ar: "مصعد" },
  { en: "Covered parking", ar: "موقف مغطى" },
  { en: "Central heating", ar: "تدفئة مركزية" },
  { en: "Video intercom & security", ar: "إنتركم مرئي وحماية" },
  { en: "Landscaped surroundings", ar: "محيط منسّق بالخضرة" },
];

export const LISTINGS = [
  { id: "garden", img: "/assets/gallery-1719.jpg", specs: { en: "4 Beds · 4 Baths · 235 m²", ar: "٤ غرف نوم · ٤ حمامات · ٢٣٥ م²" } },
  { id: "first", img: "/assets/detail-balconies.jpg", specs: { en: "3 Beds · 3 Baths · 185 m²", ar: "٣ غرف نوم · ٣ حمامات · ١٨٥ م²" } },
  { id: "second", img: "/assets/ig-interior.jpg", specs: { en: "3 Beds · 3 Baths · 185 m²", ar: "٣ غرف نوم · ٣ حمامات · ١٨٥ م²" } },
  { id: "roof", img: "/assets/detail-entrance.jpg", specs: { en: "4 Beds · 4 Baths · 210 m²", ar: "٤ غرف نوم · ٤ حمامات · ٢١٠ م²" } },
];

export const GALLERY_IMAGES = [
  { src: "/assets/gallery-1719.jpg", caption: { en: "Residence 1719", ar: "مشروع ١٧١٩" } },
  { src: "/assets/ig-finished.jpg", caption: { en: "Delivered Home", ar: "منزل مُسلَّم" } },
  { src: "/assets/ig-interior.jpg", caption: { en: "Light-Filled Interiors", ar: "مساحات مضيئة" } },
  { src: "/assets/ig-aerial.jpg", caption: { en: "Prime Districts", ar: "أرقى المناطق" } },
  { src: "/assets/detail-balconies.jpg", caption: { en: "The Balconies", ar: "الشرفات" } },
  { src: "/assets/ig-construction.jpg", caption: { en: "Built From the Ground Up", ar: "من الأساس إلى القمة" } },
  { src: "/assets/ig-street.jpg", caption: { en: "Amman, Jordan", ar: "عمّان، الأردن" } },
  { src: "/assets/ig-keys.jpg", caption: { en: "Every Home, a New Beginning", ar: "كل منزل بداية جديدة" } },
];

export const LIFE_IMAGES = [
  { src: "/assets/life-1.jpg", cap: { en: "The Living Room", ar: "غرفة المعيشة" } },
  { src: "/assets/life-2.jpg", cap: { en: "Soft Curves", ar: "انحناءات ناعمة" } },
  { src: "/assets/life-3.jpg", cap: { en: "Golden Hour", ar: "الساعة الذهبية" } },
  { src: "/assets/life-4.jpg", cap: { en: "The Hearth", ar: "المدفأة" } },
  { src: "/assets/life-5.jpg", cap: { en: "Editorial Calm", ar: "هدوء أنيق" } },
  { src: "/assets/life-6.jpg", cap: { en: "Quiet Details", ar: "تفاصيل هادئة" } },
];

export const PROCESS = [
  { img: "/assets/ig-aerial.jpg", n: "01", t: { en: "The Land", ar: "الأرض" }, p: { en: "We choose prime, well-connected districts and study every plot before a single stone is laid.", ar: "نختار أرقى المناطق وأكثرها حيوية، وندرس كل قطعة أرض قبل وضع أول حجر." } },
  { img: "/assets/ig-construction.jpg", n: "02", t: { en: "The Structure", ar: "الهيكل" }, p: { en: "Reinforced concrete and natural stone, engineered and inspected to last for generations.", ar: "خرسانة مسلحة وحجر طبيعي، بهندسة وإشراف يدومان لأجيال." } },
  { img: "/assets/ig-interior.jpg", n: "03", t: { en: "The Finishing", ar: "التشطيب" }, p: { en: "Light-filled interiors completed with premium materials and painstaking detail.", ar: "مساحات مضيئة تُنجز بمواد فاخرة وعناية بأدق التفاصيل." } },
  { img: "/assets/ig-finished.jpg", n: "04", t: { en: "The Delivery", ar: "التسليم" }, p: { en: "A completed home, handed over ready for life — on time and exactly as promised.", ar: "منزل مكتمل يُسلَّم جاهزاً للحياة — في موعده وكما وعدنا تماماً." } },
];

export const FEATURES = [
  { n: "01", t: { en: "Spacious Layouts", ar: "مساحات رحبة" }, p: { en: "Expansive apartments planned for modern family living, with light-filled rooms and open flow.", ar: "شقق واسعة مخططة لحياة العائلة العصرية، بغرف مضيئة وتوزيع مفتوح." } },
  { n: "02", t: { en: "Premium Façades", ar: "واجهات فاخرة" }, p: { en: "Natural stone elevations with classical detailing and warm architectural lighting.", ar: "واجهات من الحجر الطبيعي بتفاصيل كلاسيكية وإضاءة معمارية دافئة." } },
  { n: "03", t: { en: "Private Balconies", ar: "شرفات خاصة" }, p: { en: "Deep terraces off every principal room, framed by landscaped greenery.", ar: "شرفات عميقة تطل من كل غرفة رئيسية، تحيط بها مساحات خضراء منسقة." } },
  { n: "04", t: { en: "Prime Location", ar: "موقع مميز" }, p: { en: "Set in one of Amman's most desirable districts, minutes from everything that matters.", ar: "في واحدة من أرقى مناطق عمّان، على دقائق من كل ما يهمك." } },
];

export const SOCIAL = {
  instagram: "https://instagram.com/alshatherwan._",
  facebook: "https://web.facebook.com/p/%D8%A7%D9%84%D8%B4%D8%A7%D8%B0%D8%B1%D9%88%D8%A7%D9%86-%D9%84%D9%84%D8%A7%D8%B3%D9%83%D8%A7%D9%86-Shatherwan-Housing-61583853203737/",
  whatsapp: `https://wa.me/${WHATSAPP}`,
};

export const SEARCH_INDEX = [
  { t: { en: "The Story", ar: "قصتنا" }, tag: { en: "Home", ar: "الرئيسية" }, href: "/#story", k: "story home history 2010 قصة تاريخ" },
  { t: { en: "About — Vision & Mission", ar: "من نحن — رؤيتنا ورسالتنا" }, tag: { en: "About", ar: "من نحن" }, href: "/about", k: "about vision mission craft process من نحن رؤية رسالة" },
  { t: { en: "Residence 1719", ar: "مشروع ١٧١٩" }, tag: { en: "Projects", ar: "مشاريع" }, href: "/projects", k: "residence 1719 apartment building شقة مشروع مبنى" },
  { t: { en: "Homes for Sale", ar: "شقق للبيع" }, tag: { en: "Listings", ar: "عروض" }, href: "/projects#homes", k: "homes sale apartments price buy شقق للبيع سعر شراء" },
  { t: { en: "3D Experience", ar: "تجربة ثلاثية الأبعاد" }, tag: { en: "3D", ar: "ثلاثي الأبعاد" }, href: "/tour", k: "3d building floor plan virtual tour مجسم مخطط جولة" },
  { t: { en: "The Gallery", ar: "المعرض" }, tag: { en: "Gallery", ar: "المعرض" }, href: "/gallery", k: "gallery 3d photos lifestyle صور معرض تصميم" },
  { t: { en: "Book a Private Viewing", ar: "احجز موعد معاينة" }, tag: { en: "Visit", ar: "زيارة" }, href: "/booking", k: "book viewing visit appointment حجز معاينة موعد" },
  { t: { en: "Contact Us", ar: "تواصل معنا" }, tag: { en: "Contact", ar: "تواصل" }, href: "/#contact", k: "contact phone whatsapp تواصل هاتف واتساب" },
];
