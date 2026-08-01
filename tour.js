/* ═══════ الشاذروان — 3D Experience: building, floor plan, virtual tour ═══════ */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const stage = document.getElementById("tourStage");
if (stage) init();

function init() {
  const STONE = 0xdfd4bf, STONE_DARK = 0xcbbda0, GOLD = 0xc99a5b, WARM = 0xffd9a0;
  const panel = document.getElementById("tourPanel");
  const hint = document.getElementById("tourHint");

  const UNITS = {
    0: { id: "garden", en: "Garden Apartment — Ground Floor", ar: "شقة أرضية مع حديقة", specs: { en: "4 Beds · 4 Baths · 235 m²", ar: "٤ غرف · ٤ حمامات · ٢٣٥ م²" } },
    1: { id: "first", en: "First-Floor Apartment", ar: "شقة الطابق الأول", specs: { en: "3 Beds · 3 Baths · 185 m²", ar: "٣ غرف · ٣ حمامات · ١٨٥ م²" } },
    2: { id: "second", en: "Second-Floor Apartment", ar: "شقة الطابق الثاني", specs: { en: "3 Beds · 3 Baths · 185 m²", ar: "٣ غرف · ٣ حمامات · ١٨٥ م²" } },
    3: { id: "roof", en: "Rooftop Apartment & Terrace", ar: "شقة الروف مع تراس", specs: { en: "4 Beds · 4 Baths · 210 m²", ar: "٤ غرف · ٤ حمامات · ٢١٠ م²" } },
  };

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.prepend(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  const loader = new THREE.TextureLoader();
  const tex = (src) => { const t = loader.load(src); t.colorSpace = THREE.SRGBColorSpace; return t; };

  function label(en, ar, scale = 1) {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 192;
    const g = c.getContext("2d");
    g.fillStyle = "rgba(255,255,255,0)";
    g.fillRect(0, 0, 512, 192);
    g.fillStyle = "#123a52";
    g.textAlign = "center";
    g.font = "500 44px Georgia, serif";
    g.fillText(en, 256, 78);
    g.font = "52px Amiri, serif";
    g.fillText(ar, 256, 148);
    const t = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
    s.scale.set(3.4 * scale, 1.28 * scale, 1);
    return s;
  }

  /* ─────────── SCENE 1: THE BUILDING ─────────── */
  const buildingScene = new THREE.Scene();
  buildingScene.background = new THREE.Color(0x071e2c);
  buildingScene.fog = new THREE.Fog(0x071e2c, 40, 90);
  const floorMeshes = [];
  {
    const s = buildingScene;
    s.add(new THREE.AmbientLight(0x8899bb, 0.55));
    const moon = new THREE.DirectionalLight(0xbfd4ff, 0.55);
    moon.position.set(-14, 22, 10);
    moon.castShadow = true;
    s.add(moon);
    const warm = new THREE.PointLight(WARM, 60, 40);
    warm.position.set(0, 4, 9);
    s.add(warm);

    // ground
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(26, 26, 0.4, 48),
      new THREE.MeshStandardMaterial({ color: 0x0e2f42, roughness: 0.9 })
    );
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    s.add(ground);

    const W = 11, D = 8.5, FH = 2.7;
    for (let f = 0; f < 4; f++) {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(W, FH - 0.12, D),
        new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.8 })
      );
      body.castShadow = body.receiveShadow = true;
      body.userData.floor = f;
      grp.add(body);
      floorMeshes.push(body);

      // window strips (emissive warm)
      for (const side of [1, -1]) {
        for (let i = 0; i < 4; i++) {
          const win = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.35, 0.12),
            new THREE.MeshStandardMaterial({ color: 0x2a2417, emissive: WARM, emissiveIntensity: Math.random() > 0.25 ? 1.1 : 0.15 })
          );
          win.position.set(-3.9 + i * 2.6, 0.05, side * (D / 2 + 0.02));
          grp.add(win);
        }
      }
      // balcony slab + glass rail
      const balc = new THREE.Mesh(
        new THREE.BoxGeometry(W * 0.72, 0.16, 1.5),
        new THREE.MeshStandardMaterial({ color: STONE_DARK, roughness: 0.7 })
      );
      balc.position.set(-0.6, -FH / 2 + 0.4, D / 2 + 0.8);
      balc.castShadow = true;
      grp.add(balc);
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(W * 0.72, 0.7, 0.05),
        new THREE.MeshPhysicalMaterial({ color: 0xbcd6e2, transparent: true, opacity: 0.32, roughness: 0.1 })
      );
      rail.position.set(-0.6, -FH / 2 + 0.85, D / 2 + 1.5);
      grp.add(rail);
      // under-balcony light strip
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(W * 0.72, 0.05, 1.4),
        new THREE.MeshStandardMaterial({ emissive: WARM, emissiveIntensity: 1.6, color: 0x000000 })
      );
      strip.position.set(-0.6, -FH / 2 + 0.3, D / 2 + 0.8);
      grp.add(strip);

      grp.position.y = FH / 2 + f * FH;
      s.add(grp);
    }
    // entrance portico
    const portico = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.3, 2.4),
      new THREE.MeshStandardMaterial({ color: STONE_DARK })
    );
    portico.position.set(3.2, 2.5, D / 2 + 1.2);
    portico.castShadow = true;
    s.add(portico);
    for (const dx of [-1.3, 1.3]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 2.4, 12),
        new THREE.MeshStandardMaterial({ color: STONE })
      );
      col.position.set(3.2 + dx, 1.2, D / 2 + 2);
      col.castShadow = true;
      s.add(col);
    }
    // roof slab + pergola
    const roof = new THREE.Mesh(new THREE.BoxGeometry(W + 0.5, 0.25, D + 0.5), new THREE.MeshStandardMaterial({ color: STONE_DARK }));
    roof.position.y = 4 * FH + 0.12;
    roof.castShadow = true;
    s.add(roof);
    const perg = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 3), new THREE.MeshStandardMaterial({ color: 0x6d5335 }));
    perg.position.set(-2.4, 4 * FH + 1.5, 1.4);
    s.add(perg);
    for (const [px, pz] of [[-4.3, 0.2], [-0.5, 0.2], [-4.3, 2.6], [-0.5, 2.6]]) {
      const pcol = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x6d5335 }));
      pcol.position.set(px, 4 * FH + 0.85, pz);
      s.add(pcol);
    }
    // trees
    for (const [tx, tz] of [[-8.5, 6], [8.8, 5.4], [-9, -5], [9, -5.5]]) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 8), new THREE.MeshStandardMaterial({ color: 0x4a3826 }));
      trunk.position.set(tx, 0.8, tz);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.25, 12, 10), new THREE.MeshStandardMaterial({ color: 0x1d3b2a, roughness: 1 }));
      crown.position.set(tx, 2.2, tz);
      crown.castShadow = true;
      s.add(trunk, crown);
    }
  }

  /* ─────────── SCENE 2: 3D FLOOR PLAN ─────────── */
  const planScene = new THREE.Scene();
  planScene.background = new THREE.Color(0xf3efe7);
  {
    const s = planScene;
    s.add(new THREE.AmbientLight(0xffffff, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    s.add(sun);

    // the real plan (from the reference) as ground
    const PW = 14, PD = 14 * (590 / 850);
    const planTex = tex("assets/plan-tex.jpg");
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(PW, 0.22, PD),
      [
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
        new THREE.MeshStandardMaterial({ map: planTex }),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
      ]
    );
    base.receiveShadow = true;
    s.add(base);

    // extruded outer walls (cutaway)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xeae2d2, roughness: 0.7 });
    function wall(x, z, w, d, h = 1.15, mat = wallMat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, h / 2 + 0.11, z);
      m.castShadow = m.receiveShadow = true;
      s.add(m);
    }
    const T = 0.18;
    wall(0, -PD / 2 + T / 2, PW, T);              // back
    wall(0, PD / 2 - T / 2, PW, T);               // front
    wall(-PW / 2 + T / 2, 0, T, PD);              // left
    wall(PW / 2 - T / 2, 0, T, PD);               // right
    // main partitions (approximate to the plan)
    wall(0.55, 1.15, T, PD * 0.52, 1.15, innerMat);          // living | bedroom zone
    wall(3.9, -0.15, PW * 0.44, T, 1.15, innerMat);           // bedroom | balcony
    wall(2.6, 2.6, PW * 0.3, T, 1.15, innerMat);              // bath partition
    wall(-1.6, 2.2, T, PD * 0.33, 1.15, innerMat);            // wc

    // furniture hints
    const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 1), new THREE.MeshStandardMaterial({ color: 0xcfc4ad }));
    sofa.position.set(-4.6, 0.46, 0.4); sofa.castShadow = true; s.add(sofa);
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 20), new THREE.MeshStandardMaterial({ color: GOLD }));
    table.position.set(-3.4, 0.41, 1.4); table.castShadow = true; s.add(table);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 2.1), new THREE.MeshStandardMaterial({ color: 0xd9d0bd }));
    bed.position.set(2.5, 0.44, 1.8); bed.castShadow = true; s.add(bed);

    // labels
    const L1 = label("Living · Dining · Kitchen", "معيشة · سفرة · مطبخ", 1.1); L1.position.set(-3.4, 1.9, 0.6); s.add(L1);
    const L2 = label("Bedroom", "غرفة نوم", 0.8); L2.position.set(2.5, 1.7, 1.8); s.add(L2);
    const L3 = label("Balcony", "شرفة", 0.8); L3.position.set(3.9, 1.6, -2.6); s.add(L3);
    const L4 = label("Bathroom", "حمام", 0.7); L4.position.set(4.6, 1.55, 3.4); s.add(L4);
  }

  /* ─────────── SCENE 3: VIRTUAL TOUR (look-around room) ─────────── */
  const tourScene = new THREE.Scene();
  tourScene.background = new THREE.Color(0xf6f2ea);
  {
    const s = tourScene;
    s.add(new THREE.AmbientLight(0xfff6e8, 0.85));
    const sun = new THREE.PointLight(0xffe6c0, 45, 30);
    sun.position.set(0, 2.6, 0);
    s.add(sun);

    const RW = 9, RD = 9, RH = 3.2;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1ebdf, roughness: 0.9, side: THREE.BackSide });
    const room = new THREE.Mesh(new THREE.BoxGeometry(RW, RH, RD), wallMat);
    room.position.y = RH / 2;
    s.add(room);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(RW, RD),
      new THREE.MeshStandardMaterial({ color: 0xb99b72, roughness: 0.65 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01;
    s.add(floor);
    const rug = new THREE.Mesh(new THREE.CircleGeometry(2.2, 40), new THREE.MeshStandardMaterial({ color: 0xe4dccb }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.y = 0.02;
    s.add(rug);

    // "window" wall showing their real neighbourhood
    const view = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 2.5),
      new THREE.MeshBasicMaterial({ map: tex("assets/ig-aerial.jpg") })
    );
    view.position.set(0, 1.7, -RD / 2 + 0.02);
    s.add(view);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x123a52 });
    const wf1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.1, 0.08), frameMat); wf1.position.set(0, 2.99, -RD / 2 + 0.05); s.add(wf1);
    const wf2 = wf1.clone(); wf2.position.y = 0.44; s.add(wf2);
    for (const dx of [-2.4, 0, 2.4]) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.6, 0.08), frameMat); v.position.set(dx, 1.7, -RD / 2 + 0.05); s.add(v); }

    // framed photos of their real interiors
    function art(src, x, z, ry, w = 1.7) {
      const g = new THREE.Group();
      const img = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 1.25), new THREE.MeshBasicMaterial({ map: tex(src) }));
      const fr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, w * 1.25 + 0.14, 0.05), new THREE.MeshStandardMaterial({ color: GOLD }));
      fr.position.z = -0.035;
      g.add(fr, img);
      g.position.set(x, 1.75, z);
      g.rotation.y = ry;
      s.add(g);
    }
    art("assets/life-1.jpg", -RW / 2 + 0.05, -1.4, Math.PI / 2);
    art("assets/life-5.jpg", -RW / 2 + 0.05, 1.6, Math.PI / 2);
    art("assets/gallery-1719.jpg", RW / 2 - 0.05, 0, -Math.PI / 2, 2);
    art("assets/ig-finished.jpg", 0, RD / 2 - 0.05, Math.PI, 1.9);

    // furniture
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xded5c2, roughness: 0.95 });
    const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.65, 1.1), sofaMat);
    sofa.position.set(-0.2, 0.33, 1.6);
    s.add(sofa);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.55, 0.25), sofaMat);
    back.position.set(-0.2, 0.9, 2.1);
    s.add(back);
    const ct = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.36, 24), new THREE.MeshStandardMaterial({ color: 0x123a52, roughness: 0.3 }));
    ct.position.set(-0.2, 0.2, 0.2);
    s.add(ct);
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.7, 8), new THREE.MeshStandardMaterial({ color: GOLD }));
    lampPole.position.set(2.6, 0.85, 1.9);
    s.add(lampPole);
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 20, 1, true), new THREE.MeshStandardMaterial({ color: GOLD, emissive: 0xffd9a0, emissiveIntensity: 0.7, side: THREE.DoubleSide }));
    lampShade.position.set(2.6, 1.8, 1.9);
    s.add(lampShade);
  }

  /* ─────────── mode switching ─────────── */
  let mode = "building";
  let lookYaw = 0, lookPitch = 0, looking = false, lx = 0, ly = 0;

  function setMode(m) {
    mode = m;
    panel.hidden = true;
    document.querySelectorAll(".tour-tab").forEach((b) => b.classList.toggle("active", b.dataset.mode === m));
    const lang = document.documentElement.lang === "ar" ? "ar" : "en";
    if (m === "building") {
      camera.position.set(16, 10, 20);
      controls.target.set(0, 5, 0);
      controls.enabled = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.7;
      controls.maxPolarAngle = Math.PI / 2.05;
      hint.textContent = lang === "ar" ? "اسحب للتدوير · مرر للتقريب · انقر على طابق" : "Drag to rotate · Scroll to zoom · Click a floor";
    } else if (m === "plan") {
      camera.position.set(6, 12, 11);
      controls.target.set(0, 0, 0);
      controls.enabled = true;
      controls.autoRotate = false;
      controls.maxPolarAngle = Math.PI / 2.2;
      hint.textContent = lang === "ar" ? "اسحب للتدوير · مرر للتقريب" : "Drag to rotate · Scroll to zoom";
    } else {
      controls.enabled = false;
      controls.autoRotate = false;
      camera.position.set(0, 1.55, 0.6);
      lookYaw = 0; lookPitch = 0;
      hint.textContent = lang === "ar" ? "اسحب لتنظر حولك" : "Drag to look around";
    }
  }
  document.querySelectorAll(".tour-tab").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  window.addEventListener("langchange", () => setMode(mode));

  // look-around for tour mode
  stage.addEventListener("pointerdown", (e) => { if (mode === "tour") { looking = true; lx = e.clientX; ly = e.clientY; } });
  stage.addEventListener("pointermove", (e) => {
    if (mode !== "tour" || !looking) return;
    lookYaw -= (e.clientX - lx) * 0.004;
    lookPitch = Math.max(-0.6, Math.min(0.6, lookPitch + (e.clientY - ly) * 0.003));
    lx = e.clientX; ly = e.clientY;
  });
  window.addEventListener("pointerup", () => (looking = false));

  // floor picking in building mode
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null;
  function pick(e, click) {
    if (mode !== "building") return;
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(floorMeshes)[0];
    if (hovered) { hovered.material.emissive = new THREE.Color(0x000000); hovered = null; }
    stage.style.cursor = hit ? "pointer" : "grab";
    if (hit) {
      hovered = hit.object;
      hovered.material.emissive = new THREE.Color(0x33507a);
      if (click) {
        const u = UNITS[hovered.userData.floor];
        const lang = document.documentElement.lang === "ar" ? "ar" : "en";
        document.getElementById("tpTitle").textContent = u[lang];
        document.getElementById("tpSpecs").textContent = u.specs[lang];
        const link = document.getElementById("tpLink");
        link.href = "property.html?id=" + u.id;
        link.textContent = lang === "ar" ? "عرض التفاصيل ←" : "View details →";
        panel.hidden = false;
      }
    }
  }
  renderer.domElement.addEventListener("pointermove", (e) => pick(e, false));
  renderer.domElement.addEventListener("click", (e) => pick(e, true));

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  setMode("building");
  (function tick() {
    if (mode === "tour") {
      camera.rotation.set(0, 0, 0);
      camera.rotateY(lookYaw);
      camera.rotateX(lookPitch);
    } else {
      controls.update();
    }
    renderer.render(mode === "building" ? buildingScene : mode === "plan" ? planScene : tourScene, camera);
    requestAnimationFrame(tick);
  })();
}
