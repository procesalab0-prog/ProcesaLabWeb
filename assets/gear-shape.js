// The ProcesaLab gear as a THREE.Shape (outer radius 1), shared by every
// 3D gear on the landing so they all match the logo exactly.
import * as THREE from 'three';

export function gearShape() {
  // Same geometry as the logo (viewBox 100, centre 50): a body of r=25 plus
  // eight stadium teeth 15 wide from r=14 to r=44, and a hole of r=10.5.
  // The union is star-shaped from the centre, so a radial profile is exact.
  const teeth = 8, halfW = 7.5, a = 14 + halfW, b = 44 - halfW;
  const inside = (x, y) => {
    for (let k = 0; k < teeth; k++) {
      const t = k * Math.PI * 2 / teeth;
      const u = x * Math.cos(t) + y * Math.sin(t);   // along the tooth
      const v = -x * Math.sin(t) + y * Math.cos(t);  // across it
      const c = Math.min(b, Math.max(a, u));
      if ((u - c) ** 2 + v * v <= halfW * halfW) return true;
    }
    return x * x + y * y <= 625;
  };
  const shape = new THREE.Shape();
  const N = 400;
  for (let i = 0; i < N; i++) {
    const th = i / N * Math.PI * 2 + Math.PI / 2;
    let r = 25;
    for (let s = 44; s > 25; s -= .25) {
      if (inside(s * Math.cos(th), s * Math.sin(th))) { r = s; break; }
    }
    const x = r * Math.cos(th) / 44, y = r * Math.sin(th) / 44;
    i ? shape.lineTo(x, y) : shape.moveTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, 10.5 / 44, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}
