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

const PANEL_W = 2.12, PANEL_H = 2.78;
// Radius follows the count: at a fixed 4.5 the panels overlapped once the
// ring grew past ~8. 0.62 leaves a comfortable gap between them.
const RING_R = Math.max(4.5, (GALLERY_IMAGES.length * PANEL_W) / (Math.PI * 2 * 0.62));

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
        <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0.45, RING_R + 6.9], fov: 34 }}>
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

const STONE = "#e3d8c4";
const STONE_DK = "#cdbfa4";
const TRIM = "#f0e8d8";
const GLASS = "#7fa8c4";

/* ── small reusable pieces ─────────────────────────────────── */

/** A window: recessed reveal, frame, mullion, warm glass. */
function Window({ w = 1.5, h = 1.35, lit = true }) {
  return (
    <group>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[w + 0.22, h + 0.22, 0.1]} />
        <meshStandardMaterial color={TRIM} roughness={0.8} />
      </mesh>
      <mesh>
        <boxGeometry args={[w, h, 0.06]} />
        <meshStandardMaterial
          color="#1b1610"
          emissive={lit ? "#ffcf8f" : "#12233a"}
          emissiveIntensity={lit ? 1.15 : 0.25}
          roughness={0.35}
        />
      </mesh>
      {/* mullions */}
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.045, h, 0.04]} />
        <meshStandardMaterial color="#2a2620" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[w, 0.045, 0.04]} />
        <meshStandardMaterial color="#2a2620" roughness={0.7} />
      </mesh>
      {/* sill */}
      <mesh position={[0, -h / 2 - 0.14, 0.06]}>
        <boxGeometry args={[w + 0.34, 0.1, 0.26]} />
        <meshStandardMaterial color={TRIM} roughness={0.75} />
      </mesh>
    </group>
  );
}

/** Balcony slab with a glass balustrade and a gold handrail. */
function Balcony({ w, depth = 1.5 }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, 0.16, depth]} />
        <meshStandardMaterial color={STONE_DK} roughness={0.85} />
      </mesh>
      {/* soffit light strip — the warm line that reads on the real façade */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[w * 0.94, 0.04, depth * 0.88]} />
        <meshStandardMaterial color="#000000" emissive="#ffc98a" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0, 0.55, depth / 2 - 0.03]}>
        <boxGeometry args={[w, 0.95, 0.04]} />
        <meshPhysicalMaterial color={GLASS} transparent opacity={0.26} roughness={0.08} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.05, depth / 2 - 0.03]}>
        <boxGeometry args={[w, 0.06, 0.09]} />
        <meshStandardMaterial color={GOLD} roughness={0.35} metalness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, 0.55, 0]}>
          <boxGeometry args={[0.05, 0.95, depth]} />
          <meshPhysicalMaterial color={GLASS} transparent opacity={0.22} roughness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

/** Stone pilaster with a capital, used on the corners. */
function Pilaster({ h }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.62, h, 0.62]} />
        <meshStandardMaterial color={TRIM} roughness={0.85} />
      </mesh>
      <mesh position={[0, h / 2 - 0.12, 0]}>
        <boxGeometry args={[0.82, 0.2, 0.82]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.12, 0]}>
        <boxGeometry args={[0.82, 0.2, 0.82]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Tree({ pos, scale = 1 }) {
  return (
    <group position={pos} scale={scale}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 1.7, 8]} />
        <meshStandardMaterial color="#4a3826" roughness={1} />
      </mesh>
      <mesh position={[0, 2.15, 0]} castShadow>
        <sphereGeometry args={[1.1, 14, 12]} />
        <meshStandardMaterial color="#1f4030" roughness={1} />
      </mesh>
      <mesh position={[0.45, 1.72, 0.24]} castShadow>
        <sphereGeometry args={[0.72, 12, 10]} />
        <meshStandardMaterial color="#244834" roughness={1} />
      </mesh>
    </group>
  );
}

/* ═══════════ TAB 1 — THE BUILDING ═══════════ */

function Building({ onPick, selected }) {
  const FH = 2.7, W = 11, D = 8.5, FLOORS = 4;
  const unitIds = ["garden", "first", "second", "roof"];
  const [hover, setHover] = useState(null);
  const winX = [-3.9, -1.3, 1.3, 3.9];

  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
        <circleGeometry args={[34, 56]} />
        <meshStandardMaterial color="#0d2a3c" roughness={1} />
      </mesh>
      {/* podium + steps */}
      <mesh position={[0, -0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 3.2, 0.45, D + 3.2]} />
        <meshStandardMaterial color="#20323f" roughness={0.75} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.06 - i * 0.16, D / 2 + 2.0 + i * 0.42]} receiveShadow>
          <boxGeometry args={[5.4 - i * 0.3, 0.16, 0.84]} />
          <meshStandardMaterial color={STONE_DK} roughness={0.9} />
        </mesh>
      ))}

      {/* floors */}
      {[0, 1, 2, 3].map((f) => {
        const active = hover === f || selected === unitIds[f];
        return (
          <group key={f} position={[0, FH / 2 + f * FH, 0]}>
            {/* main stone volume — the click target */}
            <mesh
              castShadow receiveShadow
              onClick={(e) => { e.stopPropagation(); onPick(unitIds[f]); }}
              onPointerOver={(e) => { e.stopPropagation(); setHover(f); document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { setHover(null); document.body.style.cursor = "auto"; }}
            >
              <boxGeometry args={[W, FH - 0.14, D]} />
              <meshStandardMaterial
                color={STONE}
                roughness={0.88}
                emissive={active ? GOLD : "#000000"}
                emissiveIntensity={active ? 0.22 : 0}
              />
            </mesh>

            {/* floor cornice band */}
            <mesh position={[0, -FH / 2 + 0.1, 0]} castShadow>
              <boxGeometry args={[W + 0.34, 0.2, D + 0.34]} />
              <meshStandardMaterial color={TRIM} roughness={0.82} />
            </mesh>

            {/* corner pilasters */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
              <group key={`${sx}${sz}`} position={[(sx * W) / 2, 0, (sz * D) / 2]}>
                <Pilaster h={FH - 0.16} />
              </group>
            ))}

            {/* windows front + back */}
            {[1, -1].map((side) =>
              winX.map((x, i) => (
                <group key={`${side}${i}`} position={[x, 0.06, side * (D / 2 + 0.06)]} rotation={[0, side > 0 ? 0 : Math.PI, 0]}>
                  <Window lit={(i + f) % 5 !== 3} />
                </group>
              ))
            )}
            {/* windows on the side elevations */}
            {[1, -1].map((side) =>
              [-2.1, 2.1].map((z, i) => (
                <group key={`s${side}${i}`} position={[side * (W / 2 + 0.06), 0.06, z]} rotation={[0, (side * Math.PI) / 2, 0]}>
                  <Window w={1.2} lit={(i + f) % 3 !== 2} />
                </group>
              ))
            )}

            {/* front balcony */}
            <group position={[-0.6, -FH / 2 + 0.42, D / 2 + 0.82]}>
              <Balcony w={W * 0.66} depth={1.6} />
            </group>
            {/* rear balcony, shallower */}
            <group position={[0.4, -FH / 2 + 0.42, -(D / 2 + 0.62)]}>
              <Balcony w={W * 0.42} depth={1.2} />
            </group>
          </group>
        );
      })}

      {/* entrance canopy + columns */}
      <group position={[3.3, 0, D / 2 + 1.35]}>
        <mesh position={[0, 2.62, 0]} castShadow>
          <boxGeometry args={[3.8, 0.26, 2.7]} />
          <meshStandardMaterial color={TRIM} roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.44, 0]}>
          <boxGeometry args={[3.4, 0.05, 2.3]} />
          <meshStandardMaterial color="#000000" emissive="#ffc98a" emissiveIntensity={2.4} />
        </mesh>
        {[-1.5, 1.5].map((dx) => (
          <group key={dx} position={[dx, 1.2, 0.95]}>
            <mesh castShadow><cylinderGeometry args={[0.19, 0.22, 2.4, 16]} /><meshStandardMaterial color={TRIM} roughness={0.85} /></mesh>
            <mesh position={[0, 1.28, 0]}><boxGeometry args={[0.56, 0.16, 0.56]} /><meshStandardMaterial color={STONE} roughness={0.8} /></mesh>
            <mesh position={[0, -1.24, 0]}><boxGeometry args={[0.56, 0.16, 0.56]} /><meshStandardMaterial color={STONE} roughness={0.8} /></mesh>
          </group>
        ))}
        {/* glazed lobby door */}
        <mesh position={[0, 1.15, -0.1]}>
          <boxGeometry args={[2.3, 2.3, 0.08]} />
          <meshStandardMaterial color="#12233a" emissive="#ffd9a8" emissiveIntensity={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* roof: slab, parapet, penthouse */}
      <group position={[0, FLOORS * FH, 0]}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[W + 0.7, 0.28, D + 0.7]} />
          <meshStandardMaterial color={TRIM} roughness={0.82} />
        </mesh>
        {[[0, (D + 0.4) / 2], [0, -(D + 0.4) / 2]].map(([x, z], i) => (
          <mesh key={`p${i}`} position={[x, 0.62, z]} castShadow>
            <boxGeometry args={[W + 0.7, 0.68, 0.18]} />
            <meshStandardMaterial color={STONE} roughness={0.85} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[(s * (W + 0.4)) / 2, 0.62, 0]} castShadow>
            <boxGeometry args={[0.18, 0.68, D + 0.7]} />
            <meshStandardMaterial color={STONE} roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[-2.6, 1.05, -1.2]} castShadow>
          <boxGeometry args={[3.6, 1.6, 3.2]} />
          <meshStandardMaterial color={STONE} roughness={0.86} />
        </mesh>
        <mesh position={[-2.6, 1.05, -1.2 + 1.62]}>
          <boxGeometry args={[2.2, 1.0, 0.06]} />
          <meshStandardMaterial color="#1b1610" emissive="#ffcf8f" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* landscaping */}
      {[[-6.4, D / 2 + 2.2], [6.4, D / 2 + 2.2], [-6.4, -(D / 2 + 1.6)], [6.4, -(D / 2 + 1.6)]].map(([x, z]) => (
        <mesh key={`h${x}${z}`} position={[x, 0.28, z]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.7, 1.1]} />
          <meshStandardMaterial color="#1d3b2a" roughness={1} />
        </mesh>
      ))}
      <Tree pos={[-9.4, 0, 6.2]} />
      <Tree pos={[9.6, 0, 5.4]} scale={0.88} />
      <Tree pos={[-9.8, 0, -5.2]} scale={0.94} />
      <Tree pos={[9.9, 0, -5.6]} />
      {/* path lights */}
      {[-4.6, -1.6, 1.6, 4.6].map((x) => (
        <mesh key={`l${x}`} position={[x, 0.12, D / 2 + 3.4]}>
          <cylinderGeometry args={[0.12, 0.12, 0.16, 10]} />
          <meshStandardMaterial color="#000000" emissive="#ffc98a" emissiveIntensity={2.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════ TAB 2 — 3D FLOOR PLAN ═══════════ */

const PW = 14, PD = 14 * (590 / 850), WT = 0.18;

// Clickable rooms. Sizes are indicative of the published 185–235 m² layouts.
const ROOMS = [
  {
    id: "living", x: -3.2, z: 0.5, w: 6.6, d: 6.2,
    t: { en: "Living · Dining · Kitchen", ar: "معيشة · سفرة · مطبخ" },
    area: "48 m²",
    p: { en: "One open volume running the depth of the apartment — the kitchen at the back, dining in the middle, and the living room opening onto the balcony.", ar: "مساحة مفتوحة تمتد بعمق الشقة — المطبخ في الخلف، والسفرة في الوسط، والصالون يفتح على الشرفة." },
  },
  {
    id: "master", x: 2.6, z: 1.7, w: 3.6, d: 3.4,
    t: { en: "Master Bedroom", ar: "غرفة النوم الرئيسية" },
    area: "22 m²",
    p: { en: "The principal suite, with its own ensuite bathroom, a fitted closet wall, and a door straight onto the balcony.", ar: "الجناح الرئيسي بحمام خاص، وخزائن مدمجة، وباب يفتح مباشرة على الشرفة." },
  },
  {
    id: "bedroom2", x: 2.8, z: -2.3, w: 3.4, d: 2.8,
    t: { en: "Second Bedroom", ar: "غرفة النوم الثانية" },
    area: "16 m²",
    p: { en: "A full double room on the quiet side of the plan, away from the living space.", ar: "غرفة مزدوجة كاملة في الجهة الهادئة من المخطط، بعيداً عن مساحة المعيشة." },
  },
  {
    id: "bath", x: 5.2, z: 3.1, w: 2.3, d: 2.2,
    t: { en: "Bathroom", ar: "الحمام" },
    area: "6 m²",
    p: { en: "Fully tiled floor to ceiling, with a window for natural light and ventilation.", ar: "مكسو بالكامل من الأرض حتى السقف، مع نافذة للإضاءة والتهوية الطبيعية." },
  },
  {
    id: "balcony", x: 0.4, z: -4.0, w: 9.5, d: 1.6,
    t: { en: "Balcony", ar: "الشرفة" },
    area: "12 m²",
    p: { en: "A deep terrace running most of the façade — wide enough for a table and chairs, not just a railing.", ar: "شرفة عميقة تمتد على معظم الواجهة — تتسع لطاولة وكراسي، وليست مجرد درابزين." },
  },
];

function FloorPlan({ onPick, selected }) {
  const planTex = useLoader(THREE.TextureLoader, asset("/assets/plan-tex.jpg"));
  planTex.colorSpace = THREE.SRGBColorSpace;
  const [hover, setHover] = useState(null);

  const walls = [
    [0, -PD / 2 + WT / 2, PW, WT], [0, PD / 2 - WT / 2, PW, WT],
    [-PW / 2 + WT / 2, 0, WT, PD], [PW / 2 - WT / 2, 0, WT, PD],
    [0.55, 1.15, WT, PD * 0.52], [3.9, -0.15, PW * 0.44, WT],
    [2.6, 2.6, PW * 0.3, WT], [-1.6, 2.2, WT, PD * 0.33],
  ];

  return (
    <group>
      {/* slab with the plan drawing on top */}
      <mesh receiveShadow>
        <boxGeometry args={[PW, 0.22, PD]} />
        {[0, 1].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color="#ffffff" />)}
        <meshStandardMaterial attach="material-2" map={planTex} />
        {[3, 4, 5].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color="#ffffff" />)}
      </mesh>

      {walls.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.685, z]} castShadow receiveShadow>
          <boxGeometry args={[w, 1.15, d]} />
          <meshStandardMaterial color={i < 4 ? "#ffffff" : "#eae2d2"} roughness={0.65} />
        </mesh>
      ))}

      {/* clickable room zones */}
      {ROOMS.map((r) => {
        const on = hover === r.id || selected === r.id;
        return (
          <group key={r.id}>
            <mesh
              position={[r.x, 0.13, r.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => { e.stopPropagation(); onPick(r.id); }}
              onPointerOver={(e) => { e.stopPropagation(); setHover(r.id); document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { setHover(null); document.body.style.cursor = "auto"; }}
            >
              <planeGeometry args={[r.w, r.d]} />
              <meshBasicMaterial color={GOLD} transparent opacity={on ? 0.34 : 0.06} />
            </mesh>
            {on && (
              <mesh position={[r.x, 0.135, r.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[Math.min(r.w, r.d) * 0.46, Math.min(r.w, r.d) * 0.5, 32]} />
                <meshBasicMaterial color={GOLD} transparent opacity={0.75} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* furniture blocks */}
      <mesh position={[-4.6, 0.46, 0.4]} castShadow><boxGeometry args={[2.6, 0.5, 1]} /><meshStandardMaterial color="#cfc4ad" /></mesh>
      <mesh position={[-3.4, 0.41, 1.4]} castShadow><cylinderGeometry args={[0.5, 0.5, 0.4, 20]} /><meshStandardMaterial color={GOLD} /></mesh>
      <mesh position={[2.5, 0.44, 1.8]} castShadow><boxGeometry args={[1.8, 0.45, 2.1]} /><meshStandardMaterial color="#d9d0bd" /></mesh>
      <mesh position={[2.8, 0.4, -2.3]} castShadow><boxGeometry args={[1.5, 0.4, 1.9]} /><meshStandardMaterial color="#d9d0bd" /></mesh>

      {ROOMS.map((r) => (
        <Text
          key={`t${r.id}`}
          position={[r.x, 1.45, r.z]}
          fontSize={0.4}
          color="#123a52"
          anchorX="center"
          outlineWidth={0.014}
          outlineColor="#f9f7f3"
        >
          {r.t.en}
        </Text>
      ))}
    </group>
  );
}

/* ═══════════ TAB 3 — VIRTUAL TOUR ═══════════ */

const RW = 10, RD = 10, RH = 3.3;

/** Framed picture with a mat, a gold frame and a little picture light.
    Keep w * 1.28 + the hang height inside RH — anything taller punches
    through the floor and ceiling. */
function Art({ tx, pos, ry, w = 1.32 }) {
  const h = w * 1.28;
  return (
    <group position={pos} rotation={[0, ry, 0]}>
      <mesh position={[0, 0, -0.06]} castShadow>
        <boxGeometry args={[w + 0.3, h + 0.3, 0.08]} />
        <meshStandardMaterial color={GOLD} roughness={0.4} metalness={0.45} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[w + 0.16, h + 0.16]} />
        <meshStandardMaterial color="#faf6ee" roughness={0.9} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tx} toneMapped={false} />
      </mesh>
      {/* picture light */}
      <mesh position={[0, h / 2 + 0.3, 0.22]}>
        <boxGeometry args={[w * 0.5, 0.07, 0.16]} />
        <meshStandardMaterial color="#caa96f" metalness={0.6} roughness={0.35} />
      </mesh>
      <pointLight color="#ffe3b8" intensity={5} distance={4.5} position={[0, h / 2 + 0.1, 0.6]} />
    </group>
  );
}

function TourRoom() {
  const [aerial, life1, life5, g1719, finished, interior] = useLoader(THREE.TextureLoader, [
    asset("/assets/ig-aerial.jpg"), asset("/assets/life-1.jpg"), asset("/assets/life-5.jpg"),
    asset("/assets/gallery-1719.jpg"), asset("/assets/ig-finished.jpg"), asset("/assets/ig-interior.jpg"),
  ]);
  [aerial, life1, life5, g1719, finished, interior].forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));

  return (
    <group>
      {/* shell — walls only; the ceiling gets its own brighter plane so it
          doesn't read as a heavy brown mass overhead */}
      <mesh position={[0, RH / 2, 0]}>
        <boxGeometry args={[RW, RH, RD]} />
        <meshStandardMaterial color="#f4eee4" roughness={0.96} side={THREE.BackSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, RH - 0.01, 0]}>
        <planeGeometry args={[RW, RD]} />
        <meshStandardMaterial color="#fdfaf4" roughness={1} emissive="#fff4e4" emissiveIntensity={0.16} />
      </mesh>
      {/* timber floor + rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[RW, RD]} />
        <meshStandardMaterial color="#a9855e" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.6]}>
        <planeGeometry args={[6.2, 4.6]} />
        <meshStandardMaterial color="#e6ded0" roughness={0.95} />
      </mesh>
      {/* skirting + cornice on all four walls */}
      {[[0, RD / 2 - 0.05, 0], [0, -RD / 2 + 0.05, Math.PI], [RW / 2 - 0.05, 0, -Math.PI / 2], [-RW / 2 + 0.05, 0, Math.PI / 2]].map(([x, z, ry], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, ry, 0]}>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[i < 2 ? RW : RD, 0.14, 0.06]} />
            <meshStandardMaterial color="#fbf7ef" roughness={0.9} />
          </mesh>
          <mesh position={[0, RH - 0.12, 0]}>
            <boxGeometry args={[i < 2 ? RW : RD, 0.16, 0.09]} />
            <meshStandardMaterial color="#fbf7ef" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* ceiling cove — a soft recessed panel rather than a hot spot */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, RH - 0.05, 0]}>
        <planeGeometry args={[RW * 0.58, RD * 0.58]} />
        <meshStandardMaterial color="#fffaf1" emissive="#ffeed6" emissiveIntensity={0.34} />
      </mesh>

      {/* the picture hang */}
      <Art tx={g1719} pos={[0, 1.68, -RD / 2 + 0.08]} ry={0} w={1.78} />
      <Art tx={life1} pos={[-RW / 2 + 0.08, 1.68, -1.9]} ry={Math.PI / 2} />
      <Art tx={life5} pos={[-RW / 2 + 0.08, 1.68, 1.9]} ry={Math.PI / 2} />
      <Art tx={interior} pos={[RW / 2 - 0.08, 1.68, -1.9]} ry={-Math.PI / 2} />
      <Art tx={finished} pos={[RW / 2 - 0.08, 1.68, 1.9]} ry={-Math.PI / 2} />
      <Art tx={aerial} pos={[0, 1.68, RD / 2 - 0.08]} ry={Math.PI} w={1.66} />

      {/* furniture */}
      <mesh position={[-0.2, 0.34, 2.1]} castShadow><boxGeometry args={[3.1, 0.68, 1.15]} /><meshStandardMaterial color="#ded5c2" roughness={0.95} /></mesh>
      <mesh position={[-0.2, 0.92, 2.62]} castShadow><boxGeometry args={[3.1, 0.6, 0.26]} /><meshStandardMaterial color="#ded5c2" roughness={0.95} /></mesh>
      {[-1.4, 1.0].map((x) => (
        <mesh key={x} position={[x, 0.78, 2.25]}><boxGeometry args={[0.5, 0.5, 0.16]} /><meshStandardMaterial color="#c8bda6" roughness={1} /></mesh>
      ))}
      <mesh position={[-0.2, 0.2, 0.7]} castShadow><cylinderGeometry args={[0.62, 0.62, 0.38, 28]} /><meshStandardMaterial color="#123a52" roughness={0.35} metalness={0.15} /></mesh>
      <mesh position={[-0.2, 0.44, 0.7]}><cylinderGeometry args={[0.16, 0.16, 0.14, 16]} /><meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} /></mesh>
      {/* plant */}
      <group position={[3.6, 0, -2.6]}>
        <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.34, 0.26, 0.6, 16]} /><meshStandardMaterial color="#cfc4ad" roughness={0.9} /></mesh>
        <mesh position={[0, 1.05, 0]}><sphereGeometry args={[0.62, 14, 12]} /><meshStandardMaterial color="#2c4f38" roughness={1} /></mesh>
      </group>
      {/* floor lamp */}
      <group position={[-3.7, 0, 2.4]}>
        <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.3, 0.3, 0.08, 16]} /><meshStandardMaterial color="#8d7a5e" roughness={0.6} /></mesh>
        <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.03, 0.03, 1.7, 8]} /><meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.3} /></mesh>
        <mesh position={[0, 1.85, 0]}><cylinderGeometry args={[0.34, 0.26, 0.42, 18]} /><meshStandardMaterial color="#fdf6e8" emissive="#ffe6bd" emissiveIntensity={0.8} /></mesh>
        <pointLight color="#ffdcae" intensity={9} distance={7} position={[0, 1.85, 0]} />
      </group>
    </group>
  );
}

/* ═══════════ THE PAGE ═══════════ */

export function TourPage() {
  const { L, lang } = useLang();
  const [mode, setMode] = useState("building");
  const [unit, setUnit] = useState(null);
  const [room, setRoom] = useState(null);

  const prop = unit ? PROPERTIES[unit] : null;
  const theRoom = room ? ROOMS.find((r) => r.id === room) : null;

  const tabs = [
    { m: "building", t: { en: "The Building", ar: "المبنى" } },
    { m: "plan", t: { en: "3D Floor Plan", ar: "مخطط ثلاثي الأبعاد" } },
    { m: "tour", t: { en: "Virtual Tour", ar: "جولة افتراضية" } },
  ];
  const hints = {
    building: { en: "Drag to rotate · Scroll to zoom · Click a floor", ar: "اسحب للتدوير · مرر للتقريب · انقر على طابق" },
    plan: { en: "Drag to rotate · Scroll to zoom · Click a room", ar: "اسحب للتدوير · مرر للتقريب · انقر على غرفة" },
    tour: { en: "Drag to look around", ar: "اسحب لتنظر حولك" },
  };

  const switchTo = (m) => { setMode(m); setUnit(null); setRoom(null); };

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
            <button key={t.m} className={`tour-tab ${mode === t.m ? "active" : ""}`} onClick={() => switchTo(t.m)}>
              {L(t.t)}
            </button>
          ))}
        </div>
        <div className="tour-stage">
          {mode === "building" && (
            <Canvas shadows dpr={[1, 2]} camera={{ position: [18, 11, 22], fov: 42 }} onCreated={({ scene }) => {
              scene.background = new THREE.Color("#071e2c");
              scene.fog = new THREE.Fog("#071e2c", 46, 100);
            }}>
              <ambientLight color="#8fa6c4" intensity={0.5} />
              <hemisphereLight color="#9fc0e0" groundColor="#12303f" intensity={0.55} />
              <directionalLight color="#cfe0ff" intensity={0.75} position={[-16, 26, 14]} castShadow
                shadow-mapSize={[1024, 1024]} shadow-camera-left={-24} shadow-camera-right={24}
                shadow-camera-top={28} shadow-camera-bottom={-8} />
              <pointLight color="#ffd9a0" intensity={90} distance={44} position={[2, 4, 12]} />
              <pointLight color="#c99a5b" intensity={60} distance={40} position={[-12, 8, -8]} />
              <Building onPick={setUnit} selected={unit} />
              <OrbitControls enableDamping dampingFactor={0.06} autoRotate autoRotateSpeed={0.55}
                target={[0, 5.4, 0]} maxPolarAngle={Math.PI / 2.06} minDistance={16} maxDistance={44} />
            </Canvas>
          )}
          {mode === "plan" && (
            <Canvas shadows dpr={[1, 2]} camera={{ position: [6, 12, 11], fov: 45 }} onCreated={({ scene }) => { scene.background = new THREE.Color("#f3efe7"); }}>
              <ambientLight intensity={0.9} />
              <hemisphereLight color="#ffffff" groundColor="#d8cfc0" intensity={0.5} />
              <directionalLight intensity={1.05} position={[8, 14, 6]} castShadow shadow-mapSize={[1024, 1024]} />
              <FloorPlan onPick={setRoom} selected={room} />
              <OrbitControls enableDamping maxPolarAngle={Math.PI / 2.2} minDistance={8} maxDistance={26} />
            </Canvas>
          )}
          {mode === "tour" && (
            <Canvas dpr={[1, 2]} camera={{ position: [0, 1.62, 0.12], fov: 66 }} onCreated={({ scene }) => { scene.background = new THREE.Color("#f4eee4"); }}>
              <ambientLight color="#fff6ea" intensity={0.95} />
              <hemisphereLight color="#ffffff" groundColor="#c19b6d" intensity={0.75} />
              <pointLight color="#ffe6c0" intensity={22} distance={22} position={[0, 2.45, 0]} />
              <TourRoom />
              {/* level eye-line on the picture hang, with the tilt fenced in so
                  the visitor can never end up staring at the floor or ceiling */}
              <OrbitControls enableZoom={false} enablePan={false} target={[0, 1.7, 0]} rotateSpeed={-0.32}
                enableDamping dampingFactor={0.07} minPolarAngle={Math.PI * 0.38} maxPolarAngle={Math.PI * 0.6} />
            </Canvas>
          )}
          <div className="tour-hint">{L(hints[mode])}</div>

          {prop && (
            <div className="tour-panel">
              <button className="tp-close" onClick={() => setUnit(null)} aria-label="Close">×</button>
              <p className="tp-eyebrow">{L({ en: "SELECTED FLOOR", ar: "الطابق المحدد" })}</p>
              <h3>{L(prop.title)}</h3>
              <p className="tp-specs">{lang === "ar"
                ? `${prop.beds} غرف · ${prop.baths} حمامات · ${prop.area}`
                : `${prop.beds} Beds · ${prop.baths} Baths · ${prop.area}`}</p>
              <ul className="tp-feats">{prop.feats.map((f, i) => <li key={i}>{L(f)}</li>)}</ul>
              <Link className="tp-link" to={`/property/${unit}`}>{L({ en: "View details →", ar: "عرض التفاصيل ←" })}</Link>
            </div>
          )}
          {theRoom && (
            <div className="tour-panel">
              <button className="tp-close" onClick={() => setRoom(null)} aria-label="Close">×</button>
              <p className="tp-eyebrow">{L({ en: "SELECTED ROOM", ar: "الغرفة المحددة" })}</p>
              <h3>{L(theRoom.t)}</h3>
              <p className="tp-specs">{theRoom.area}</p>
              <p className="tp-copy">{L(theRoom.p)}</p>
              <Link className="tp-link" to="/booking">{L({ en: "Book a viewing →", ar: "احجز معاينة ←" })}</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
