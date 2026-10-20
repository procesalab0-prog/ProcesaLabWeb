// Closing section: the two big background gears and the gear on the retro
// computer's screen become 3D pieces, matching the hero. Nothing is built
// until the section is about to scroll into view, and nothing renders while
// it is off screen. The SVG gears stay as the fallback.
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { gearShape } from './gear-shape.js';

const finale = document.querySelector('.finale');
const cta = finale && finale.querySelector('.cta');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function makeRenderer() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (!r.getContext()) return null;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    return r;
  } catch (e) { return null; }
}

function envFor(renderer, scene, intensity) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = intensity;
  pmrem.dispose();
}

function build() {
  const geo = new THREE.ExtrudeGeometry(gearShape(), {
    depth: .2, curveSegments: 48, bevelEnabled: true,
    bevelThickness: .08, bevelSize: .045, bevelSegments: 6
  });
  geo.center();

  // --- background gears, one canvas over the whole card ---
  const bg = makeRenderer();
  if (!bg) return;
  const canvas = bg.domElement;
  canvas.className = 'cta-gl';
  canvas.setAttribute('aria-hidden', 'true');
  cta.prepend(canvas);
  const scene = new THREE.Scene();
  envFor(bg, scene, .35);
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.z = 30;
  // dark, glossy bodies whose edges catch pink and red light, so they read
  // as quiet background pieces the way the faint SVG gears did
  const rimPink = new THREE.DirectionalLight(0xF7B6C9, 3.2);
  rimPink.position.set(-8, 10, -2);
  const rimRed = new THREE.DirectionalLight(0xFF4E3A, 1.6);
  rimRed.position.set(10, -6, -4);
  const fill = new THREE.DirectionalLight(0xffffff, .5);
  fill.position.set(0, 0, 10);
  scene.add(rimPink, rimRed, fill);
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x3a2a32, roughness: .38, clearcoat: 1, clearcoatRoughness: .2 });
  const decos = [...cta.querySelectorAll('.cta-deco')].map((el, i) => {
    const m = new THREE.Mesh(geo, bodyMat);
    m.userData = { el, dir: i ? 1 : -1, spin: i * .4 };
    scene.add(m);
    return m;
  });

  // --- screen gear, its own small canvas inside the CSS monitor ---
  const screen = cta.querySelector('.screen');
  const sr = makeRenderer();
  let sScene, sCam, sGear;
  if (sr && screen) {
    sr.domElement.className = 'screen-gl';
    sr.domElement.setAttribute('aria-hidden', 'true');
    screen.append(sr.domElement);
    sScene = new THREE.Scene();
    envFor(sr, sScene, .8);
    sCam = new THREE.PerspectiveCamera(30, 124 / 96, .1, 50);
    sCam.position.z = 8;
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-3, 4, 6);
    sScene.add(key);
    sGear = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xFF4E3A, roughness: .3, clearcoat: 1, clearcoatRoughness: .15 }));
    sGear.scale.set(1.45, 1.45, 2);
    sScene.add(sGear);
    sr.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    sr.setSize(124, 96, false);
  }

  function layout() {
    const w = cta.clientWidth, h = cta.clientHeight;
    bg.setPixelRatio(Math.min(devicePixelRatio || 1, w < 760 ? 1.5 : 2));
    bg.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    pointer.tx = e.clientX / innerWidth * 2 - 1;
    pointer.ty = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  let running = false, visible = false, prev = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - prev) / 1000);
    prev = now;
    pointer.x += (pointer.tx - pointer.x) * .05;
    pointer.y += (pointer.ty - pointer.y) * .05;
    const fr = finale.getBoundingClientRect();
    const scrollP = Math.min(1, Math.max(0, -fr.top / Math.max(1, fr.height - innerHeight)));

    // place each 3D gear over the SVG slot it replaces
    const cr = canvas.getBoundingClientRect();
    const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const vw = vh * camera.aspect;
    decos.forEach(g => {
      const u = g.userData, r = u.el.getBoundingClientRect();
      g.position.set(
        ((r.left + r.width / 2 - cr.left) / cr.width - .5) * vw,
        -((r.top + r.height / 2 - cr.top) / cr.height - .5) * vh,
        0
      );
      const s = u.el.offsetWidth / 2 / cr.width * vw;
      g.scale.set(s, s, s * .9);
      // a turn every 28 s like the SVG, plus a push from the scroll
      u.spin += u.dir * dt * Math.PI * 2 / 28;
      g.rotation.set(.35 + pointer.y * .25, (u.dir * .3) + pointer.x * .35, u.spin + u.dir * scrollP * Math.PI);
    });
    bg.render(scene, camera);

    if (sGear) {
      sGear.rotation.set(Math.sin(now / 900) * .25, Math.cos(now / 1100) * .3, sGear.rotation.z - dt * 1.6);
      sr.render(sScene, sCam);
    }
    if (running) requestAnimationFrame(frame);
  }
  function play() {
    const should = visible && !document.hidden && !reduce;
    if (should && !running) { running = true; prev = performance.now(); requestAnimationFrame(frame); }
    if (!should) running = false;
  }

  layout();
  new ResizeObserver(layout).observe(cta);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); }).observe(finale);
  document.addEventListener('visibilitychange', play);
  finale.classList.add('gl-on');
  if (reduce) frame(performance.now());
}

// build shortly before the section arrives
if (cta) {
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    build();
  }, { rootMargin: '100% 0px' });
  io.observe(finale);
}
