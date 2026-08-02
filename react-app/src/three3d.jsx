import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { useLang } from "./lang.jsx";
import { GALLERY_IMAGES, PROPERTIES, asset } from "./data.js";

const GOLD = "#c99a5b";

/* ═══════════ 3D GALLERY CAROUSEL ═══════════
   Every panel is the same size; the photograph is cropped to fill it
   (the 3D equivalent of object-fit: cover) so nothing bulges out of the
   ring. The front card is scaled up and lit; the rest recede. */

const PANEL_W = 2.12, PANEL_H = 2.78, RING_R = 4.5;

/** Crop a texture to a target aspect ratio, centred — like object-fit: cover. */
function coverFit(tex, targetAspect) {
  const img = tex.image;
  if (!img || !img.width) return;
  const imgAspect = img.width / img.height;
  if (imgAspect > targetAspect) tex.repeat.set(targetAspect / imgAspect, 1);
  else tex.repeat.set(1, imgAspect / targetAspect);
  tex.offset.set((1 - tex.repeat.x) / 2, (1 - tex.repeat.y) / 2);
}

function RingPanels({ ctrl }) {
  const group = useRef();
  const cards = useRef([]);
  const imgMats = useRef([]);
  const frameMats = useRef([]);
  const reflMats = useRef([]);
  const { gl } = useThree();
  const textures = useLoader(THREE.TextureLoader, GALLERY_IMAGES.map((i) => i.src));
  const N = GALLERY_IMAGES.length;

  useMemo(() => {
    const aniso = gl.capabilities.getMaxAnisotropy?.() ?? 1;
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.generateMipmaps = true;
      coverFit(t, PANEL_W / PANEL_H);
      t.needsUpdate = true;
    });
  }, [textures, gl]);

  useFrame(() => {
    const c = ctrl.current;
    if (group.current) group.current.rotation.y = c.angle;
    for (let i = 0; i < N; i++) {
      // 1 when this card faces the camera, 0 when it is edge-on or behind
      const f = Math.max(0, Math.cos(i * c.step + c.angle));
      const focus = f * f; // sharpen the falloff so the front card clearly leads
      const g = cards.current[i];
      if (g) {
        const s = 0.82 + 0.18 * focus;
        g.scale.set(s, s, 1);
        g.position.y = 0.38 + focus * 0.16;
      }
      const im = imgMats.current[i];
      if (im) im.opacity = 0.3 + 0.7 * f;
      const fm = frameMats.current[i];
      if (fm) fm.opacity = 0.16 + 0.74 * focus;
      const rm = reflMats.current[i];
      if (rm) rm.opacity = 0.04 + 0.14 * focus;
    }
  });

  return (
    <group ref={group}>
      {textures.map((t, i) => {
        const a = (i / N) * Math.PI * 2;
        return (
          <group key={i} position={[Math.sin(a) * RING_R, 0, Math.cos(a) * RING_R]} rotation={[0, a, 0]}>
            <group ref={(el) => (cards.current[i] = el)}>
              {/* gold hairline frame */}
              <mesh position={[0, 0, -0.02]}>
                <planeGeometry args={[PANEL_W + 0.085, PANEL_H + 0.085]} />
                <meshBasicMaterial ref={(m) => (frameMats.current[i] = m)} color={GOLD} transparent opacity={0.6} />
              </mesh>
              {/* the photograph */}
              <mesh>
                <planeGeometry args={[PANEL_W, PANEL_H]} />
                <meshBasicMaterial ref={(m) => (imgMats.current[i] = m)} map={t} transparent opacity={1} toneMapped={false} />
              </mesh>
              {/* mirrored reflection on the polished floor */}
              <mesh position={[0, -PANEL_H - 0.14, 0]} scale={[1, -1, 1]}>
                <planeGeometry args={[PANEL_W, PANEL_H]} />
                <meshBasicMaterial ref={(m) => (reflMats.current[i] = m)} map={t} transparent opacity={0.12} depthWrite={false} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}

const FrameHook = ({ cb }) => { useFrame(cb); return null; };

export function GalleryRing() {
  const { lang, L } = useLang();
  const N = GALLERY_IMAGES.length;
  const STEP = (Math.PI * 2) / N;
  const stageRef = useRef(null);
  const ctrl = useRef({ angle: 0, target: 0, step: STEP, dragging: false, lastX: 0, vel: 0, hold: false });
  const [active, setActive] = useState(0);

  const shift = (d) => { ctrl.current.target -= d * STEP; };
  const goTo = (i) => {
    const c = ctrl.current;
    const base = -i * STEP;
    // pick the rotation nearest the current one so it never spins the long way round
    c.target = base + Math.round((c.target - base) / (Math.PI * 2)) * Math.PI * 2;
  };

  // gentle auto-advance, paused while the visitor is interacting
  useEffect(() => {
    const id = setInterval(() => {
      const c = ctrl.current;
      if (!c.hold && !c.dragging) shift(1);
    }, 5200);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const onFrame = () => {
    const c = ctrl.current;
    if (!c.dragging) c.angle += (c.target - c.angle) * 0.075;
    const idx = ((Math.round(-c.angle / STEP) % N) + N) % N;
    setActive((a) => (a === idx ? a : idx));
  };

  const down = (e) => {
    const c = ctrl.current;
    c.dragging = true; c.lastX = e.clientX; c.vel = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    const c = ctrl.current;
    if (!c.dragging) return;
    const dx = e.clientX - c.lastX;
    c.angle += dx * 0.0062;
    c.vel = dx * 0.0062;
    c.target = c.angle;
    c.lastX = e.clientX;
  };
  const up = () => {
    const c = ctrl.current;
    if (!c.dragging) return;
    c.dragging = false;
    const flick = Math.abs(c.vel) > 0.028 ? Math.sign(c.vel) : 0;
    c.target = (Math.round(c.angle / STEP) + flick) * STEP;
  };

  const caption = GALLERY_IMAGES[active].caption;

  return (
    <div className="gallery-viewer reveal visible">
      <div
        className="three-stage"
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label={L({ en: "Photo carousel", ar: "معرض الصور" })}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => (ctrl.current.hold = true)}
        onPointerLeave={() => { ctrl.current.hold = false; up(); }}
        onFocus={() => (ctrl.current.hold = true)}
        onBlur={() => (ctrl.current.hold = false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { shift(1); e.preventDefault(); }
          if (e.key === "ArrowLeft") { shift(-1); e.preventDefault(); }
        }}
      >
        <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0.45, 11.4], fov: 34 }}>
          <FrameHook cb={onFrame} />
          <RingPanels ctrl={ctrl} />
        </Canvas>
        <div className="stage-vignette" aria-hidden="true"></div>
        <button className="gal-nav prev" type="button" aria-label={L({ en: "Previous image", ar: "الصورة السابقة" })} onClick={() => shift(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M15 5 8 12l7 7" /></svg>
        </button>
        <button className="gal-nav next" type="button" aria-label={L({ en: "Next image", ar: "الصورة التالية" })} onClick={() => shift(1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="m9 5 7 7-7 7" /></svg>
        </button>
        <div className="three-caption" key={active}>{caption[lang] ?? caption.en}</div>
      </div>
      <div className="gal-dots">
        {GALLERY_IMAGES.map((im, i) => (
          <button
            key={im.src}
            type="button"
            className={i === active ? "on" : ""}
            aria-label={im.caption[lang] ?? im.caption.en}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════ 3D EXPERIENCE (building / plan / tour) ═══════════ */

function Building({ onPick, selected }) {
  const FH = 2.7, W = 11, D = 8.5;
  const floors = [0, 1, 2, 3];
  const unitIds = ["garden", "first", "second", "roof"];
  const [hover, setHover] = useState(null);
  return (
    <group>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[26, 26, 0.4, 48]} />
        <meshStandardMaterial color="#0e2f42" roughness={0.9} />
      </mesh>
      {floors.map((f) => (
        <group key={f} position={[0, FH / 2 + f * FH, 0]}>
          <mesh
            castShadow receiveShadow
            onClick={(e) => { e.stopPropagation(); onPick(unitIds[f]); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(f); document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { setHover(null); document.body.style.cursor = "auto"; }}
          >
            <boxGeometry args={[W, FH - 0.12, D]} />
            <meshStandardMaterial
              color="#dfd4bf" roughness={0.8}
              emissive={hover === f || selected === unitIds[f] ? "#33507a" : "#000000"}
            />
          </mesh>
          {[1, -1].map((side) =>
            [0, 1, 2, 3].map((i) => (
              <mesh key={`${side}${i}`} position={[-3.9 + i * 2.6, 0.05, side * (D / 2 + 0.02)]}>
                <boxGeometry args={[1.5, 1.35, 0.12]} />
                <meshStandardMaterial color="#2a2417" emissive="#ffd9a0" emissiveIntensity={(i + f) % 4 === 3 ? 0.15 : 1.1} />
              </mesh>
            ))
          )}
          <mesh position={[-0.6, -FH / 2 + 0.4, D / 2 + 0.8]} castShadow>
            <boxGeometry args={[W * 0.72, 0.16, 1.5]} />
            <meshStandardMaterial color="#cbbda0" roughness={0.7} />
          </mesh>
          <mesh position={[-0.6, -FH / 2 + 0.85, D / 2 + 1.5]}>
            <boxGeometry args={[W * 0.72, 0.7, 0.05]} />
            <meshPhysicalMaterial color="#bcd6e2" transparent opacity={0.32} roughness={0.1} />
          </mesh>
          <mesh position={[-0.6, -FH / 2 + 0.3, D / 2 + 0.8]}>
            <boxGeometry args={[W * 0.72, 0.05, 1.4]} />
            <meshStandardMaterial color="#000000" emissive="#ffd9a0" emissiveIntensity={1.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[3.2, 2.5, D / 2 + 1.2]} castShadow>
        <boxGeometry args={[3.4, 0.3, 2.4]} />
        <meshStandardMaterial color="#cbbda0" />
      </mesh>
      {[-1.3, 1.3].map((dx) => (
        <mesh key={dx} position={[3.2 + dx, 1.2, D / 2 + 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 2.4, 12]} />
          <meshStandardMaterial color="#dfd4bf" />
        </mesh>
      ))}
      <mesh position={[0, 4 * FH + 0.12, 0]} castShadow>
        <boxGeometry args={[W + 0.5, 0.25, D + 0.5]} />
        <meshStandardMaterial color="#cbbda0" />
      </mesh>
      {[[-8.5, 6], [8.8, 5.4], [-9, -5], [9, -5.5]].map(([tx, tz]) => (
        <group key={`${tx}${tz}`}>
          <mesh position={[tx, 0.8, tz]}><cylinderGeometry args={[0.12, 0.18, 1.6, 8]} /><meshStandardMaterial color="#4a3826" /></mesh>
          <mesh position={[tx, 2.2, tz]} castShadow><sphereGeometry args={[1.25, 12, 10]} /><meshStandardMaterial color="#1d3b2a" roughness={1} /></mesh>
        </group>
      ))}
    </group>
  );
}

function FloorPlan() {
  const planTex = useLoader(THREE.TextureLoader, asset("/assets/plan-tex.jpg"));
  planTex.colorSpace = THREE.SRGBColorSpace;
  const PW = 14, PD = 14 * (590 / 850), T = 0.18;
  const walls = [
    [0, -PD / 2 + T / 2, PW, T], [0, PD / 2 - T / 2, PW, T],
    [-PW / 2 + T / 2, 0, T, PD], [PW / 2 - T / 2, 0, T, PD],
    [0.55, 1.15, T, PD * 0.52], [3.9, -0.15, PW * 0.44, T],
    [2.6, 2.6, PW * 0.3, T], [-1.6, 2.2, T, PD * 0.33],
  ];
  const labels = [
    { p: [-3.4, 1.6, 0.6], en: "Living · Dining · Kitchen", ar: "معيشة · سفرة · مطبخ" },
    { p: [2.5, 1.4, 1.8], en: "Bedroom", ar: "غرفة نوم" },
    { p: [3.9, 1.3, -2.6], en: "Balcony", ar: "شرفة" },
    { p: [4.6, 1.3, 3.4], en: "Bathroom", ar: "حمام" },
  ];
  return (
    <group>
      <mesh receiveShadow>
        <boxGeometry args={[PW, 0.22, PD]} />
        <meshStandardMaterial attach="material-0" color="#ffffff" />
        <meshStandardMaterial attach="material-1" color="#ffffff" />
        <meshStandardMaterial attach="material-2" map={planTex} />
        <meshStandardMaterial attach="material-3" color="#ffffff" />
        <meshStandardMaterial attach="material-4" color="#ffffff" />
        <meshStandardMaterial attach="material-5" color="#ffffff" />
      </mesh>
      {walls.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.685, z]} castShadow receiveShadow>
          <boxGeometry args={[w, 1.15, d]} />
          <meshStandardMaterial color={i < 4 ? "#ffffff" : "#eae2d2"} roughness={0.65} />
        </mesh>
      ))}
      <mesh position={[-4.6, 0.46, 0.4]} castShadow><boxGeometry args={[2.6, 0.5, 1]} /><meshStandardMaterial color="#cfc4ad" /></mesh>
      <mesh position={[-3.4, 0.41, 1.4]} castShadow><cylinderGeometry args={[0.5, 0.5, 0.4, 20]} /><meshStandardMaterial color={GOLD} /></mesh>
      <mesh position={[2.5, 0.44, 1.8]} castShadow><boxGeometry args={[1.8, 0.45, 2.1]} /><meshStandardMaterial color="#d9d0bd" /></mesh>
      {labels.map((l, i) => (
        <group key={i}>
          <Text position={l.p} fontSize={0.42} color="#123a52" anchorX="center" outlineWidth={0.012} outlineColor="#f9f7f3">{l.en}</Text>
          <Text position={[l.p[0], l.p[1] - 0.5, l.p[2]]} fontSize={0.4} color="#123a52" anchorX="center" outlineWidth={0.012} outlineColor="#f9f7f3">{l.ar}</Text>
        </group>
      ))}
    </group>
  );
}

function TourRoom() {
  const [aerial, life1, life5, g1719, finished] = useLoader(THREE.TextureLoader, [
    asset("/assets/ig-aerial.jpg"), asset("/assets/life-1.jpg"), asset("/assets/life-5.jpg"), asset("/assets/gallery-1719.jpg"), asset("/assets/ig-finished.jpg"),
  ]);
  [aerial, life1, life5, g1719, finished].forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
  const RW = 9, RD = 9, RH = 3.2;
  const Art = ({ tx, pos, ry, w = 1.7 }) => (
    <group position={pos} rotation={[0, ry, 0]}>
      <mesh position={[0, 0, -0.035]}><boxGeometry args={[w + 0.14, w * 1.25 + 0.14, 0.05]} /><meshStandardMaterial color={GOLD} /></mesh>
      <mesh><planeGeometry args={[w, w * 1.25]} /><meshBasicMaterial map={tx} /></mesh>
    </group>
  );
  return (
    <group>
      <mesh position={[0, RH / 2, 0]}>
        <boxGeometry args={[RW, RH, RD]} />
        <meshStandardMaterial color="#f1ebdf" roughness={0.9} side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[RW, RD]} />
        <meshStandardMaterial color="#b99b72" roughness={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[2.2, 40]} />
        <meshStandardMaterial color="#e4dccb" />
      </mesh>
      <mesh position={[0, 1.7, -RD / 2 + 0.02]}>
        <planeGeometry args={[4.6, 2.5]} />
        <meshBasicMaterial map={aerial} />
      </mesh>
      <Art tx={life1} pos={[-RW / 2 + 0.05, 1.75, -1.4]} ry={Math.PI / 2} />
      <Art tx={life5} pos={[-RW / 2 + 0.05, 1.75, 1.6]} ry={Math.PI / 2} />
      <Art tx={g1719} pos={[RW / 2 - 0.05, 1.75, 0]} ry={-Math.PI / 2} w={2} />
      <Art tx={finished} pos={[0, 1.75, RD / 2 - 0.05]} ry={Math.PI} w={1.9} />
      <mesh position={[-0.2, 0.33, 1.6]}><boxGeometry args={[2.8, 0.65, 1.1]} /><meshStandardMaterial color="#ded5c2" roughness={0.95} /></mesh>
      <mesh position={[-0.2, 0.9, 2.1]}><boxGeometry args={[2.8, 0.55, 0.25]} /><meshStandardMaterial color="#ded5c2" roughness={0.95} /></mesh>
      <mesh position={[-0.2, 0.2, 0.2]}><cylinderGeometry args={[0.55, 0.55, 0.36, 24]} /><meshStandardMaterial color="#123a52" roughness={0.3} /></mesh>
    </group>
  );
}

export function TourPage() {
  const { L, lang } = useLang();
  const [mode, setMode] = useState("building");
  const [selected, setSelected] = useState(null);
  const prop = selected ? PROPERTIES[selected] : null;

  const tabs = [
    { m: "building", t: { en: "The Building", ar: "المبنى" } },
    { m: "plan", t: { en: "3D Floor Plan", ar: "مخطط ثلاثي الأبعاد" } },
    { m: "tour", t: { en: "Virtual Tour", ar: "جولة افتراضية" } },
  ];
  const hints = {
    building: { en: "Drag to rotate · Scroll to zoom · Click a floor", ar: "اسحب للتدوير · مرر للتقريب · انقر على طابق" },
    plan: { en: "Drag to rotate · Scroll to zoom", ar: "اسحب للتدوير · مرر للتقريب" },
    tour: { en: "Drag to look around", ar: "اسحب لتنظر حولك" },
  };

  return (
    <>
      <header className="page-hero tour-hero">
        <div className="pattern-bg light"></div>
        <div className="page-hero-inner">
          <p className="page-eyebrow reveal visible">{L({ en: "INTERACTIVE", ar: "تجربة تفاعلية" })}</p>
          <h1 className="page-title reveal visible">{L({ en: "The 3D Experience", ar: "تجربة ثلاثية الأبعاد" })}</h1>
          <div className="chapter-rule gold reveal visible"></div>
        </div>
      </header>
      <section className="tour-wrap">
        <div className="tour-tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t.m} className={`tour-tab ${mode === t.m ? "active" : ""}`} onClick={() => { setMode(t.m); setSelected(null); }}>
              {L(t.t)}
            </button>
          ))}
        </div>
        <div className="tour-stage">
          {mode === "building" && (
            <Canvas shadows camera={{ position: [16, 10, 20], fov: 45 }} onCreated={({ scene }) => {
              scene.background = new THREE.Color("#071e2c");
              scene.fog = new THREE.Fog("#071e2c", 40, 90);
            }}>
              <ambientLight color="#8899bb" intensity={0.55} />
              <directionalLight color="#bfd4ff" intensity={0.55} position={[-14, 22, 10]} castShadow />
              <pointLight color="#ffd9a0" intensity={60} distance={40} position={[0, 4, 9]} />
              <Building onPick={setSelected} selected={selected} />
              <OrbitControls enableDamping autoRotate autoRotateSpeed={0.7} target={[0, 5, 0]} maxPolarAngle={Math.PI / 2.05} />
            </Canvas>
          )}
          {mode === "plan" && (
            <Canvas shadows camera={{ position: [6, 12, 11], fov: 45 }} onCreated={({ scene }) => { scene.background = new THREE.Color("#f3efe7"); }}>
              <ambientLight intensity={0.95} />
              <directionalLight intensity={1.1} position={[8, 14, 6]} castShadow />
              <FloorPlan />
              <OrbitControls enableDamping maxPolarAngle={Math.PI / 2.2} />
            </Canvas>
          )}
          {mode === "tour" && (
            <Canvas camera={{ position: [0, 1.55, 0.101], fov: 60 }} onCreated={({ scene }) => { scene.background = new THREE.Color("#f6f2ea"); }}>
              <ambientLight color="#fff6e8" intensity={0.85} />
              <pointLight color="#ffe6c0" intensity={45} distance={30} position={[0, 2.6, 0]} />
              <TourRoom />
              <OrbitControls enableZoom={false} enablePan={false} target={[0, 1.55, 0]} rotateSpeed={-0.4} />
            </Canvas>
          )}
          <div className="tour-hint">{L(hints[mode])}</div>
          {prop && (
            <div className="tour-panel">
              <h3>{L(prop.title)}</h3>
              <p>{lang === "ar" ? `${prop.beds} غرف · ${prop.baths} حمامات · ${prop.area}` : `${prop.beds} Beds · ${prop.baths} Baths · ${prop.area}`}</p>
              <Link className="tp-link" to={`/property/${selected}`}>{L({ en: "View details →", ar: "عرض التفاصيل ←" })}</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ═══════════ SCROLL-DRIVEN ASSEMBLY HERO ═══════════
   The building rises floor-by-floor as the visitor scrolls,
   while the camera orbits — pure black void, gold accents. */

const easeOut = (t) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

function AssemblyBuilding({ progressRef }) {
  const camGroup = useRef();
  const floorRefs = useRef([]);
  const FH = 2.7, W = 11, D = 8.5, FLOORS = 4;

  useFrame(({ camera }) => {
    const p = progressRef.current;
    // camera: slow clockwise orbit, front-right → front
    const angle = 0.65 - p * 0.85;
    const r = 23 - p * 3;
    camera.position.set(Math.sin(angle) * r, 7.5 + p * 2.5, Math.cos(angle) * r);
    camera.lookAt(0, 5.5, 0);
    // floors assemble between p=0.15 and p=0.85, bottom-up
    for (let f = 0; f <= FLOORS; f++) {
      const g = floorRefs.current[f];
      if (!g) continue;
      const t = easeOut((p - (0.15 + f * 0.14)) / 0.12);
      const targetY = f < FLOORS ? FH / 2 + f * FH : FLOORS * FH + 0.12;
      g.position.y = targetY + (1 - t) * 10;
      g.visible = t > 0.001;
    }
  });

  const floorBody = (f) => (
    <group key={f} ref={(el) => (floorRefs.current[f] = el)}>
      <mesh castShadow>
        <boxGeometry args={[W, FH - 0.12, D]} />
        <meshStandardMaterial color="#d8cbb0" roughness={0.75} metalness={0.05} />
      </mesh>
      {[1, -1].map((side) =>
        [0, 1, 2, 3].map((i) => (
          <mesh key={`${side}${i}`} position={[-3.9 + i * 2.6, 0.05, side * (D / 2 + 0.02)]}>
            <boxGeometry args={[1.5, 1.35, 0.12]} />
            <meshStandardMaterial color="#1c1610" emissive="#ffca7a" emissiveIntensity={1.3} />
          </mesh>
        ))
      )}
      <mesh position={[-0.6, -FH / 2 + 0.4, D / 2 + 0.8]}>
        <boxGeometry args={[W * 0.72, 0.16, 1.5]} />
        <meshStandardMaterial color="#c2b394" roughness={0.7} />
      </mesh>
      <mesh position={[-0.6, -FH / 2 + 0.3, D / 2 + 0.8]}>
        <boxGeometry args={[W * 0.72, 0.05, 1.4]} />
        <meshStandardMaterial color="#000000" emissive="#ffca7a" emissiveIntensity={2} />
      </mesh>
    </group>
  );

  return (
    <group ref={camGroup}>
      {/* podium — always present */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[W + 3, 0.7, D + 3]} />
        <meshStandardMaterial color="#161616" roughness={0.4} metalness={0.4} />
      </mesh>
      {[0, 1, 2, 3].map((f) => floorBody(f))}
      {/* roof slab as the final "floor" */}
      <group ref={(el) => (floorRefs.current[4] = el)}>
        <mesh castShadow>
          <boxGeometry args={[W + 0.5, 0.25, D + 0.5]} />
          <meshStandardMaterial color="#c2b394" />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[W * 0.4, 0.55, D * 0.4]} />
          <meshStandardMaterial color="#8a7754" emissive="#c99a5b" emissiveIntensity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

export function ScrollHero() {
  const { L } = useLang();
  const wrapRef = useRef(null);
  const progressRef = useRef(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let raf;
    const tick = () => {
      const el = wrapRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const p = Math.max(0, Math.min(1, -rect.top / total));
        progressRef.current = p;
        setStage(p < 0.18 ? 0 : p < 0.42 ? 1 : p < 0.68 ? 2 : p < 0.9 ? 3 : 4);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stages = [
    { k: { en: "THE MAKING OF", ar: "قصة البناء" }, t: { en: "Residence 1719", ar: "مشروع ١٧١٩" }, p: { en: "Scroll to watch it rise.", ar: "مرر لتشاهده يرتفع." } },
    { k: { en: "THE FOUNDATION", ar: "الأساس" }, t: { en: "Built on bedrock", ar: "مبني على صخر" }, p: { en: "Reinforced concrete engineered for generations.", ar: "خرسانة مسلحة بهندسة تدوم لأجيال." } },
    { k: { en: "FOUR FLOORS", ar: "أربعة طوابق" }, t: { en: "185 – 235 m² homes", ar: "شقق من ١٨٥ إلى ٢٣٥ م²" }, p: { en: "Garden, first, second, and rooftop residences.", ar: "شقة أرضية، طابق أول وثانٍ، وروف مميز." } },
    { k: { en: "THE FINISH", ar: "التشطيب" }, t: { en: "Stone, light & detail", ar: "حجر وضوء وتفاصيل" }, p: { en: "Natural stone façades with warm architectural lighting.", ar: "واجهات حجر طبيعي بإضاءة معمارية دافئة." } },
    { k: { en: "COMPLETE", ar: "اكتمل البناء" }, t: { en: "Your home is ready", ar: "منزلك جاهز" }, p: { en: "Book a private viewing today.", ar: "احجز موعد معاينتك اليوم." } },
  ];
  const s = stages[stage];

  return (
    <section className="scrollhero" ref={wrapRef}>
      <div className="scrollhero-sticky">
        <Canvas shadows camera={{ position: [14, 8, 20], fov: 40 }} onCreated={({ scene }) => { scene.background = new THREE.Color("#000000"); }}>
          <ambientLight color="#334455" intensity={0.5} />
          <directionalLight color="#ffffff" intensity={0.9} position={[-16, 24, 12]} castShadow />
          <pointLight color="#c99a5b" intensity={160} distance={60} position={[14, 6, 14]} />
          <pointLight color="#ffd9a0" intensity={90} distance={40} position={[0, 3, 12]} />
          <AssemblyBuilding progressRef={progressRef} />
        </Canvas>
        <div className="scrollhero-copy" key={stage}>
          <p className="sh-kicker">{L(s.k)}</p>
          <h2 className="sh-title">{L(s.t)}</h2>
          <p className="sh-text">{L(s.p)}</p>
          {stage === 4 && <Link to="/booking" className="sh-cta">{L({ en: "BOOK A VIEWING", ar: "احجز معاينة" })}</Link>}
        </div>
        <div className="scrollhero-progress"><span style={{ width: `${Math.round(progressRef.current * 100)}%` }}></span></div>
      </div>
    </section>
  );
}
