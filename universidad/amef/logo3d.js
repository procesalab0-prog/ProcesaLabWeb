import * as THREE from 'three';
import {gearShape} from '/assets/gear-shape.js';
const slot=document.getElementById('brand-gear'),host=document.getElementById('logo-scene');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{/* The orange typographic gear remains visible without WebGL. */}
if(renderer){
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,30);camera.position.z=5;
 const shape=new THREE.ExtrudeGeometry(gearShape(),{depth:.4,bevelEnabled:true,bevelThickness:.1,bevelSize:.07,bevelSegments:5,curveSegments:32});shape.center();
 const front=new THREE.MeshPhysicalMaterial({color:0xff4e3a,roughness:.28,metalness:.18,clearcoat:1}),side=new THREE.MeshStandardMaterial({color:0xc43020,roughness:.3,metalness:.22});
 const gear=new THREE.Mesh(shape,[front,side]);gear.rotation.set(.25,-.35,0);scene.add(gear);
 scene.add(new THREE.AmbientLight(0xffffff,2));
 const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-3,4,6);scene.add(key);
 const rim=new THREE.DirectionalLight(0xffd3df,3);rim.position.set(4,-1,2);scene.add(rim);
 slot.textContent='';slot.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 function resize(){const size=Math.max(40,slot.clientWidth*1.5);renderer.setSize(size,size,false);renderer.render(scene,camera);}
 new ResizeObserver(resize).observe(slot);resize();
 let active=true,last=0,spin=0,tx=-.35,ty=.25;
 new IntersectionObserver(entries=>{active=entries[0].isIntersecting;}).observe(host);
 host.addEventListener('pointermove',e=>{if(reduced.matches)return;const box=host.getBoundingClientRect();tx=((e.clientX-box.left)/box.width-.5)*.9;ty=((e.clientY-box.top)/box.height-.5)*.6;});
 host.addEventListener('pointerleave',()=>{tx=-.35;ty=.25;});
 document.getElementById('rotate-logo').addEventListener('click',()=>{if(!reduced.matches)spin+=Math.PI*2;});
 function frame(now){requestAnimationFrame(frame);if(!active||document.hidden){last=now;return;}const delta=Math.min((now-last)/1000,.04);last=now;if(!reduced.matches){gear.rotation.z+=delta*.35;gear.rotation.x+=(ty-gear.rotation.x)*.05;gear.rotation.y+=(tx+spin-gear.rotation.y)*.05;}renderer.render(scene,camera);}
 requestAnimationFrame(frame);
}

