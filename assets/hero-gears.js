// Hero 3D: the ProcesaLab gear, extruded and turned into a small mechanism
// that turns on its own, follows the pointer (or the phone's tilt) and
// speeds up with scroll. The SVG gear in the markup stays as the fallback
// when WebGL is not available or the visitor prefers reduced motion.
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { gearShape } from './gear-shape.js';

const hero = document.querySelector('.hero');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;


function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  if (!renderer.getContext()) return;

  const canvas = renderer.domElement;
  canvas.className = 'hero-gl';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .7;

  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(0, 0, 30);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-5, 7, 16);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 9;
  key.shadow.blurSamples = 16;
  Object.assign(key.shadow.camera, { left: -20, right: 20, top: 14, bottom: -14, near: 1, far: 50 });
  scene.add(key, new THREE.AmbientLight(0xffe4ec, .55));

  // A wall right behind the gears that only shows their shadow: the same
  // offset-shadow look the cards and buttons use, but cast in 3D.
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), new THREE.ShadowMaterial({ color: 0x6f4c84, opacity: .2 }));
  wall.position.z = -3.2;
  wall.receiveShadow = true;
  scene.add(wall);

  const geo = new THREE.ExtrudeGeometry(gearShape(), {
    depth: .2, curveSegments: 48, bevelEnabled: true,
    bevelThickness: .08, bevelSize: .045, bevelSegments: 6
  });
  geo.center();

  const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({
    color, roughness: .32, metalness: 0, clearcoat: 1, clearcoatRoughness: .18, ...o
  });
  // size = radius in world units, dir/speed keep neighbours turning in mesh
  const specs = [
    { name: 'big',   color: 0xF5A3BD, size: 5.6, dir: -1, z: -1.2 },
    { name: 'red',   color: 0xFF4E3A, size: 3.0, dir:  1, z:  .6 },
    { name: 'ink',   color: 0x1a1a1a, size: 1.75, dir: -1, z: 1.4, o: { roughness: .4, clearcoatRoughness: .3 } },
    { name: 'cream', color: 0xFFF6EC, size: 1.25, dir: 1, z: 2.2 }
  ];
  const gears = specs.map(s => {
    const m = new THREE.Mesh(geo, mat(s.color, s.o));
    m.castShadow = true;
    m.scale.setScalar(s.size);
    m.scale.z = s.size * .9;
    m.userData = { ...s, spin: Math.random() * Math.PI, pop: 0 };
    return m;
  });
  const rig = new THREE.Group();
  gears.forEach(g => rig.add(g));
  scene.add(rig);

  // The gear in the wordmark becomes a 3D piece too. It lives outside the
  // rig so it stays glued to the text, and every frame it is placed over
  // the (now invisible) SVG slot it replaces.
  const titleEl = document.querySelector('.ll-gear');
  const title = new THREE.Mesh(geo, mat(0xFF4E3A));
  title.castShadow = true;
  scene.add(title);
  const TITLE_Z = 2;
  function placeTitle() {
    const hr = canvas.getBoundingClientRect(), r = titleEl.getBoundingClientRect();
    const vh = 2 * (camera.position.z - TITLE_Z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const vw = vh * camera.aspect;
    title.position.set(
      ((r.left + r.width / 2 - hr.left) / hr.width - .5) * vw,
      -((r.top + r.height / 2 - hr.top) / hr.height - .5) * vh,
      TITLE_Z
    );
    return titleEl.offsetWidth / 2 / hr.width * vw;
  }

  // Positions are worked out from the visible frustum, so the composition
  // keeps hugging the right edge from a phone to a wide monitor.
  function layout() {
    const w = hero.clientWidth, h = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, w < 760 ? 1.6 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const vw = vh * camera.aspect;
    const R = vw / 2, T = vh / 2;
    const mobile = w < 760;
    const k = mobile ? Math.min(1, vw / 14) : Math.min(1.25, Math.max(.8, vh / 18));
    const place = {
      big:   mobile ? [R - 1.2 * k, T - 2.6 * k] : [R - 3.6 * k, T - 4.4 * k],
      red:   mobile ? [R - 4.8 * k, T - 7.6 * k] : [R - 9.0 * k, T - 9.6 * k],
      ink:   mobile ? [R - 1.2 * k, T - 8.6 * k] : [R - 4.4 * k, T - 12.2 * k],
      cream: mobile ? [R - 7.4 * k, T - 4.6 * k] : [R - 11.6 * k, T - 3.9 * k]
    };
    gears.forEach(g => {
      const [x, y] = place[g.userData.name];
      g.userData.base = new THREE.Vector3(x, y, g.userData.z);
      g.userData.k = k * (mobile ? .82 : 1);
    });
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    pointer.tx = e.clientX / innerWidth * 2 - 1;
    pointer.ty = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });
  addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    pointer.tx = Math.max(-1, Math.min(1, e.gamma / 30));
    pointer.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  }, { passive: true });

  // Clicking/tapping a gear gives it a kick.
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  hero.addEventListener('pointerdown', e => {
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects([...gears, title])[0];
    if (hit) { hit.object.userData.pop = 1; boost = Math.max(boost, 6); }
  });

  let boost = 0, lastScroll = scrollY, t0 = performance.now(), prev = t0, running = false, visible = true;
  // the gears make their entrance when the intro curtain lifts
  document.addEventListener('pl:intro-done', () => { t0 = performance.now(); });
  addEventListener('scroll', () => {
    boost = Math.min(10, boost + Math.abs(scrollY - lastScroll) * .02);
    lastScroll = scrollY;
  }, { passive: true });

  const ease = t => 1 - Math.pow(1 - t, 4);
  const back = t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

  function frame(now) {
    const dt = Math.min(.05, (now - prev) / 1000);
    prev = now;
    const t = (now - t0) / 1000;
    pointer.x += (pointer.tx - pointer.x) * .05;
    pointer.y += (pointer.ty - pointer.y) * .05;
    boost *= Math.pow(.2, dt);

    rig.rotation.y = pointer.x * .32;
    rig.rotation.x = pointer.y * .22;
    const sp = Math.min(1, scrollY / innerHeight);
    rig.position.y = sp * 6;

    gears.forEach((g, i) => {
      const u = g.userData;
      // all gears share the tooth count, so the angular speed is inversely
      // proportional to the size for them to look like they mesh
      u.spin += u.dir * dt * (.35 + boost * .25) * (3.3 / u.size);
      u.pop *= Math.pow(.02, dt);
      const intro = reduce ? 1 : Math.min(1, Math.max(0, (t - .25 - i * .14) / 1.1));
      const s = u.size * u.k * (reduce ? 1 : back(intro)) * (1 + u.pop * .12);
      g.scale.set(s, s, s * .9);
      g.rotation.z = u.spin + (1 - ease(intro)) * u.dir * -2.4;
      g.rotation.x = Math.sin(t * .6 + i) * .08;
      g.rotation.y = Math.cos(t * .5 + i * 1.7) * .1;
      g.position.copy(u.base);
      g.position.y += Math.sin(t * .9 + i * 1.3) * .18;
      g.position.x += pointer.x * (u.z + 2) * .12;
    });
    // one turn every 9 s, like the SVG it replaces, and it leans toward the pointer
    const tu = title.userData;
    tu.spin = (tu.spin || 0) - dt * (Math.PI * 2 / 9) * (1 + boost * .35);
    tu.pop = (tu.pop || 0) * Math.pow(.02, dt);
    const ti = reduce ? 1 : Math.min(1, Math.max(0, (t - .6) / .9));
    const ts = placeTitle() * (reduce ? 1 : back(ti)) * (1 + tu.pop * .2);
    title.scale.set(ts, ts, ts * 1.4);
    title.rotation.set(pointer.y * .45, pointer.x * .55, tu.spin);
    renderer.render(scene, camera);
    if (running) requestAnimationFrame(frame);
  }

  function play() {
    const should = visible && !document.hidden && !reduce;
    if (should && !running) { running = true; prev = performance.now(); requestAnimationFrame(frame); }
    if (!should) running = false;
  }

  layout();
  new ResizeObserver(() => { layout(); if (!running) renderer.render(scene, camera); }).observe(hero);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); }).observe(hero);
  document.addEventListener('visibilitychange', play);
  hero.classList.add('gl-on');
  if (reduce) frame(performance.now()); else play();
}

if (document.documentElement.classList.contains('intro') && !window.plIntroReady) {
  document.addEventListener('pl:intro-ready', start, { once: true });
} else {
  start();
}
