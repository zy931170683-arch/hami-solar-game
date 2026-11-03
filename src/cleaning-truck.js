import * as THREE from 'three';
import {kit,pigment,bake,V} from './model-kit.js';
export function createCleaningTruck(mat){
 const root=new THREE.Group();root.name='纸上清洗车 · 储水罐、卷管与喷淋臂';const body=new THREE.Group();root.add(body);const k=kit(body);
 const cyan=pigment(mat.blue,0x268e9b,0x234f55),cream=pigment(mat.cream,0xf2dc9e,0x986b49),dark=pigment(mat.metal,0x28444b,0x26383e),glass=pigment(mat.blue,0xa9d9d1,0x326b7b),gold=mat.gold;
 k.box(5.6,.35,2.3,dark,0,.8,0);k.box(5.2,.25,2.5,cyan,0,1.1,0);k.box(1.55,1.8,2.25,cream,2.05,2.05,0);k.box(1.1,.65,2.2,cream,2.45,1.35,0);k.box(.04,.8,1.8,glass,2.84,2.38,0);
 for(const z of [-1.14,1.14]){k.box(1.1,.75,.035,glass,2,2.42,z);k.box(.4,.08,.05,dark,1.9,1.83,z*1.015);k.box(.35,.16,.5,dark,2.9,1.2,z*.7);k.box(.3,.28,.2,gold,2.95,1.48,z*.73);k.rod(V(2.4,2.5,z),V(2.5,2.5,z*1.27),.04,dark);k.box(.15,.35,.22,dark,2.5,2.5,z*1.3);}
 const tank=k.cyl(.95,3.4,cyan,-.65,2.1,0,.95,24);tank.rotation.z=Math.PI/2;for(const x of [-2.4,1.1])k.sphere(.94,cream,x,2.1,0,.15,1,1);for(const x of [-1.9,.6])k.ring(.98,.06,cream,x,2.1,0,'x');
 k.cyl(.35,.18,cream,-.6,3.11,0);k.cyl(.18,.13,dark,-.6,3.26,0);for(const z of [-.8,.8]){k.rod(V(-2.2,3,z),V(.9,3,z),.045,cream);for(const x of [-2.2,-.7,.9])k.rod(V(x,2.7,z),V(x,3,z),.035,cream);}
 for(let i=0;i<5;i++)k.rod(V(-2.6,1.15+i*.32,-.75),V(-2.6,1.15+i*.32,.1),.045,cream);for(const z of [-.75,.1])k.rod(V(-2.6,1,z),V(-2.6,2.8,z),.04,cyan);
 for(let i=0;i<7;i++)k.ring(.4+i*.028,.045,dark,-2.8,1.9,0,'x');k.pipe([[-2.8,1.7,0],[-2.8,1.4,-.8],[-2,1.25,-1.3],[-1.6,1.45,-1.3]],.055,gold);
 for(let i=0;i<6;i++)k.box(.15,.12,.06,dark,2.95,1.8,-.5+i*.2);k.box(.08,.2,1.9,cream,-2.87,.95,0);k.rod(V(.3,3,0),V(.5,4,0),.09,cyan);k.rod(V(.5,4,0),V(1.5,4.4,-1.4),.08,cyan);k.sphere(.15,gold,1.5,4.4,-1.4);bake(body);
 const wheels=[];for(const x of [-1.8,1.95])for(const z of [-1.25,1.25]){const w=new THREE.Group();w.position.set(x,.65,z);root.add(w);const kw=kit(w);kw.cyl(.58,.34,dark).rotation.x=Math.PI/2;kw.cyl(.3,.36,cream).rotation.x=Math.PI/2;for(let i=0;i<6;i++){const a=i*Math.PI/3;kw.sphere(.05,dark,Math.cos(a)*.21,Math.sin(a)*.21,z>0?.19:-.19);}wheels.push(w);}
 const geo=new THREE.BufferGeometry(),positions=new Float32Array(180*3);geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const spray=new THREE.Points(geo,new THREE.PointsMaterial({color:0xb5e9e0,size:.12,transparent:true,opacity:.82,depthWrite:false}));spray.name='清洗水雾';spray.visible=false;root.add(spray);
 const parked=V(13,0,1),washing=V(5.3,0,6);root.position.copy(parked);let cycle=-1;
 function start(){if(cycle>=0)return false;cycle=0;return true;}
 function update(dt,time){let done=false;if(cycle>=0){cycle+=dt;const travel=cycle<1.5?cycle/1.5:cycle<4?1:Math.max(0,1-(cycle-4)/1.4);root.position.lerpVectors(parked,washing,THREE.MathUtils.smoothstep(travel,0,1));if(cycle<1.5||cycle>4)wheels.forEach(w=>w.rotation.z-=dt*4);spray.visible=cycle>=1.5&&cycle<4;
  if(spray.visible)for(let i=0;i<180;i++){const t=(time*.0011+i/180)%1,target=V(1-root.position.x,6,7-root.position.z);positions[i*3]=THREE.MathUtils.lerp(1.5,target.x,t)+Math.sin(i*23.4)*.45*t;positions[i*3+1]=THREE.MathUtils.lerp(4.4,target.y,t)+Math.sin(t*Math.PI)*.6;positions[i*3+2]=THREE.MathUtils.lerp(-1.4,target.z,t)+Math.cos(i*9.2)*.55*t;}geo.attributes.position.needsUpdate=true;
  if(cycle>=5.4){cycle=-1;spray.visible=false;done=true;root.position.copy(parked);}
 }return done;}
 return{root,start,update,get busy(){return cycle>=0},get washProgress(){return cycle<0?0:THREE.MathUtils.clamp((cycle-1.5)/2.5,0,1)}};
}

