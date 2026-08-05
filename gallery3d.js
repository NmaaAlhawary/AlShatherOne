/* ═══════ الشاذروان — Three.js 3D gallery ═══════ */
import * as THREE from "three";

const stage = document.getElementById("threeStage");
const captionEl = document.getElementById("threeCaption");
if (stage) init();

function init() {
  const IMAGES = [
    { src: "assets/gallery-1719.jpg", caption: { en: "Residence 1719", ar: "مشروع ١٧١٩" } },
    { src: "assets/ig-finished.jpg", caption: { en: "Delivered Home", ar: "منزل مُسلَّم" } },
    { src: "assets/ig-interior.jpg", caption: { en: "Light-Filled Interiors", ar: "مساحات مضيئة" } },
    { src: "assets/ig-aerial.jpg", caption: { en: "Prime Districts", ar: "أرقى المناطق" } },
    { src: "assets/detail-balconies.jpg", caption: { en: "The Balconies", ar: "الشرفات" } },
    { src: "assets/ig-construction.jpg", caption: { en: "Built From the Ground Up", ar: "من الأساس إلى القمة" } },
    { src: "assets/ig-street.jpg", caption: { en: "Amman, Jordan", ar: "عمّان، الأردن" } },
    { src: "assets/ig-keys.jpg", caption: { en: "Every Home, a New Beginning", ar: "كل منزل بداية جديدة" } },
    { src: "assets/work/work-alshatherwan-render.jpg", caption: { en: "Al Shatherwan Residences", ar: "مساكن الشاذروان" } },
    { src: "assets/work/work-white-residence.jpg", caption: { en: "Completed Residence", ar: "مبنى مُنجَز" } },
    { src: "assets/work/work-stone-facade.jpg", caption: { en: "Stone Fa\u00e7ade", ar: "واجهة حجرية" } },
    { src: "assets/work/work-under-construction.jpg", caption: { en: "Under Construction", ar: "قيد الإنشاء" } },
    { src: "assets/work/work-render-stone.jpg", caption: { en: "Design Study", ar: "دراسة تصميمية" } },
  ];
  const N = IMAGES.length;
  // Radius follows the count: at a fixed 4.1 the panels (2.1 wide) overlapped
  // once the ring grew past ~8. 0.62 leaves a comfortable gap between them.
  const RADIUS = Math.max(4.1, (N * 2.1) / (Math.PI * 2 * 0.62));
  const NAVY = new THREE.Color(0x071e2c);

  const scene = new THREE.Scene();
  scene.background = NAVY;
  scene.fog = new THREE.Fog(NAVY, RADIUS + 3, RADIUS * 2.6 + 6);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  const CAM_Z = RADIUS + 6.4;
  camera.position.set(0, 0.4, CAM_Z);
  camera.lookAt(0, -0.15, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.prepend(renderer.domElement);

  // ring of image panels + mirrored reflections
  const ring = new THREE.Group();
  scene.add(ring);
  const loader = new THREE.TextureLoader();
  const panels = [];

  IMAGES.forEach((item, i) => {
    const tex = loader.load(item.src, (t) => {
      const aspect = t.image.width / t.image.height;
      panel.scale.x = aspect > 1 ? 1 : 0.8;
      panel.scale.y = aspect > 1 ? 1 / aspect : 0.8 / aspect;
      mirror.scale.copy(panel.scale);
      frame.scale.set(panel.scale.x * 1.035, panel.scale.y * 1.035, 1);
    });
    tex.colorSpace = THREE.SRGBColorSpace;

    const angle = (i / N) * Math.PI * 2;
    const x = Math.sin(angle) * RADIUS;
    const z = Math.cos(angle) * RADIUS;

    const geo = new THREE.PlaneGeometry(2.1, 2.65);
    const panel = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex }));
    panel.position.set(x, 0.45, z);
    panel.lookAt(new THREE.Vector3(x * 2, 0.45, z * 2));

    // thin gold frame behind the panel
    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 2.65),
      new THREE.MeshBasicMaterial({ color: 0xc99a5b })
    );
    frame.position.copy(panel.position).addScaledVector(panel.position.clone().normalize(), -0.015);
    frame.quaternion.copy(panel.quaternion);

    // faded mirror copy for the "reflection"
    const mirror = new THREE.Mesh(
      geo.clone(),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.14 })
    );
    mirror.position.set(x, -2.4, z);
    mirror.quaternion.copy(panel.quaternion);
    mirror.scale.y = -1;

    ring.add(frame, panel, mirror);
    panels.push({ angle, caption: item.caption });
  });

  // dark glossy floor
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(11, 48),
    new THREE.MeshBasicMaterial({ color: 0x0a2536, transparent: true, opacity: 0.85 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.22;
  scene.add(floor);

  // soft gold particles for atmosphere
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(240 * 3);
  for (let i = 0; i < 240; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 22;
    starPos[i * 3 + 1] = Math.random() * 7 - 1;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xe0bd8f, size: 0.025, transparent: true, opacity: 0.55 })
  );
  scene.add(stars);

  // drag / inertia rotation
  let rotation = 0, velocity = 0.0035, dragging = false, lastX = 0, idleTimer = null;

  stage.addEventListener("pointerdown", (e) => {
    dragging = true; lastX = e.clientX;
    stage.setPointerCapture(e.pointerId);
    clearTimeout(idleTimer);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    rotation += dx * 0.006;
    velocity = dx * 0.0006;
  });
  const release = () => {
    dragging = false;
    idleTimer = setTimeout(() => { velocity = 0.0035; }, 4000);
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 1 ? CAM_Z + 3.5 : CAM_Z;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let lastCaption = "";
  function tick(t) {
    if (!dragging) {
      rotation += velocity;
      velocity *= 0.99;
      if (Math.abs(velocity) < 0.0035) velocity = Math.sign(velocity || 1) * 0.0035;
    }
    ring.rotation.y = rotation;
    stars.rotation.y = t * 0.00002;

    // caption of the panel currently facing the camera
    let best = 0, bestScore = -Infinity;
    panels.forEach((p, i) => {
      const score = Math.cos(p.angle + rotation);
      if (score > bestScore) { bestScore = score; best = i; }
    });
    const lang = document.documentElement.lang === "ar" ? "ar" : "en";
    const cap = panels[best].caption[lang];
    if (cap !== lastCaption) {
      lastCaption = cap;
      captionEl.textContent = cap;
      captionEl.classList.remove("swap");
      void captionEl.offsetWidth;
      captionEl.classList.add("swap");
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
