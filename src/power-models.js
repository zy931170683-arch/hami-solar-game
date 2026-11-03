import * as THREE from 'three';
import {kit,V,bake,pigment} from './model-kit.js';
export function createPowerModel(mat){
 const root=new THREE.Group();root.name='熔盐储热与汽轮发电产线 · 精细模型';const k=kit(root),steel=pigment(mat.cap,0xd0d1c5,0x7b8685),hotColor=pigment(mat.pink,0xd46a4c,0x784958),coldColor=pigment(mat.blue,0x369da9,0x315c6c),copper=pigment(mat.gold,0xd9a34b,0x8d6258),shell=pigment(mat.blue,0x2c9daa,0x365f70),parts=[];
 const component=(name,x=0,y=0,z=0)=>{const g=k.group(name,x,y,z);parts.push(g);return g;};
 const plate=component('设备基础与管廊');const p=kit(plate);p.box(48,.38,23,mat.paper,1,-.2,-.2);for(let x=-22;x<=24;x+=4)p.box(.035,.015,22.5,steel,x,.005,-.2);
 const flange=(parent,x,y,z,r,axis='y',color=steel)=>{const f=kit(parent),disc=f.cyl(r,.16,color,x,y,z,r,24);if(axis==='x')disc.rotation.z=Math.PI/2;if(axis==='z')disc.rotation.x=Math.PI/2;f.ring(r*.76,.025,mat.ink,x,y,z,axis);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const pos=axis==='x'?V(x+.10,y+Math.cos(a)*r*.82,z+Math.sin(a)*r*.82):axis==='z'?V(x+Math.cos(a)*r*.82,y+Math.sin(a)*r*.82,z+.10):V(x+Math.cos(a)*r*.82,y+.10,z+Math.sin(a)*r*.82);const b=f.cyl(.045,.09,mat.metal,...pos.toArray(),.045,6);if(axis==='x')b.rotation.z=Math.PI/2;if(axis==='z')b.rotation.x=Math.PI/2;}return disc;};
 const guardrail=(parent,a,b,height=.65)=>{const f=kit(parent),n=Math.max(1,Math.ceil(a.distanceTo(b)/.9));f.rod(a.clone().add(V(0,height,0)),b.clone().add(V(0,height,0)),.035,copper);f.rod(a.clone().add(V(0,height*.5,0)),b.clone().add(V(0,height*.5,0)),.025,steel);for(let i=0;i<=n;i++){const c=a.clone().lerp(b,i/n);f.rod(c,c.clone().add(V(0,height,0)),.035,steel);}};
 const ladder=(parent,x,z,base,top)=>{const f=kit(parent);for(const dx of [-.32,.32])f.rod(V(x+dx,base,z),V(x+dx,top+.7,z),.045,steel);for(let y=base+.15;y<top;y+=.3)f.rod(V(x-.32,y,z),V(x+.32,y,z),.035,steel);for(let y=base+2;y<top;y+=.9){const o=f.ring(.48,.025,steel,x,y,z);o.scale.z=.8;}};
 const gauge=(parent,x,y,z)=>{const f=kit(parent);const o=f.cyl(.18,.09,mat.cap,x,y,z,.18,24);o.rotation.x=Math.PI/2;f.ring(.19,.025,steel,x,y,z+.05,'z');f.rod(V(x,y,z+.10),V(x+.08,y+.07,z+.10),.015,mat.ink);};
 function tank(name,x,cut){const g=component(name,x,0,-4),t=kit(g);t.cyl(3.65,.45,mat.cap,0,.225);const body=t.mesh(new THREE.CylinderGeometry(3.2,3.2,6.6,64,1,true,cut?1.5:0,cut?4.7:Math.PI*2),steel,0,3.8);const roofPoints=[[0,7.72],[.6,7.72],[1.6,7.54],[3.25,7.1]].map(([r,y])=>new THREE.Vector2(r,y));t.mesh(new THREE.LatheGeometry(roofPoints,64,cut?1.5:0,cut?4.7:Math.PI*2),steel);
  t.cyl(3.21,.13,steel,0,.55);for(let y=.7;y<7;y+=1.08)t.ring(3.22,.025,mat.metal,0,y);for(let i=0;i<32;i++){const a=i/32*Math.PI*2;if(cut&&a<1.5)continue;t.rod(V(Math.sin(a)*3.22,.5,Math.cos(a)*3.22),V(Math.sin(a)*3.22,7.1,Math.cos(a)*3.22),.014,mat.metal);t.cyl(.06,.12,mat.metal,Math.sin(a)*3.45,.5,Math.cos(a)*3.45,.06,6);}
  t.ring(3.22,.045,cut?hotColor:coldColor,0,6.48);for(let i=0;i<32;i++){const a=i/32*Math.PI*2;t.rod(V(Math.sin(a)*3.12,7.2,Math.cos(a)*3.12),V(Math.sin(a)*3.12,7.8,Math.cos(a)*3.12),.03,steel);}t.ring(3.12,.035,copper,0,7.8);
  for(const z of [-1.05,1.05]){t.cyl(.3,.9,shell,-.8,8,z);t.box(.8,.18,.8,mat.cap,-.8,7.55,z);for(let y=7.7;y<8.4;y+=.1)t.ring(.31,.02,steel,-.8,y,z);t.pipe([[-.8,7.8,z],[-.8,8.5,z],[1.7,8.5,z],[2.4,7.6,z]],.12,cut?hotColor:coldColor);}
  t.box(1.25,.15,1.35,steel,2.7,7.15,-1.7);ladder(g,2.7,-2.15,.5,7.2);flange(g,0,2.2,3.20,.5,'z');gauge(g,.65,2.7,3.25);for(const z of [-1.2,1.2]){t.rod(V(3.2,1.1,z),V(3.7,1.1,z),.17,cut?hotColor:coldColor);flange(g,3.6,1.1,z,.3,'x');}
  return g;
 }
 const hot=tank('热盐罐 · 保温壁板、泵组与剖切窗口',-15,true),cold=tank('冷盐罐 · 焊缝、检修梯与人孔',-7,false);
 const hotLiquid=k.cyl(3.03,1,new THREE.MeshBasicMaterial({color:0xefad42}),-15,.57,-4);hotLiquid.name='可见热盐液位';hotLiquid.scale.y=.03;
 // Steel-framed steam generator: horizontal shells, steam drum, vertical exchanger.
 const sg=component('蒸汽发生器 · 预热器、蒸发器与过热器',.5,0,-4),s=kit(sg);
 for(const x of [-2.7,2.7])for(const z of [-3,3]){s.box(.18,8.5,.18,hotColor,x,4.25,z);s.box(.8,.18,.8,mat.cap,x,.1,z);s.rod(V(x,.6,z),V(-x,4,z),.055,steel);}
 for(const y of [1,4.4,7.4]){for(const z of [-3,3])s.box(5.7,.18,.16,steel,0,y,z);for(const x of [-2.7,2.7])s.box(.16,.18,6,steel,x,y,0);s.box(1.1,.09,6.6,steel,3.15,y+.1,0);guardrail(sg,V(3.65,y+.18,-3.2),V(3.65,y+.18,3.2));}
 function vessel(parent,x,y,z,length,r,material){const q=kit(parent),o=q.cyl(r,length,material,x,y,z,r,32);o.rotation.z=Math.PI/2;for(const end of [-1,1]){q.sphere(r,material,x+end*length/2,y,z,.42,1,1);flange(parent,x+end*length*.43,y,z,r*1.06,'x');}for(const dx of [-length*.3,length*.3])q.box(.3,y-r+.2,r*1.8,steel,x+dx,(y-r)/2,z);return o;}
 vessel(sg,0,2.2,-1.7,6.3,.65,steel);vessel(sg,0,3.6,1.15,6.1,.7,steel);vessel(sg,0,8.25,-.6,5.5,.8,steel);
 const vertical=s.cyl(.68,5.0,steel,-1.1,4.6,-.1);for(const y of [2.3,6.9])flange(sg,-1.1,y,-.1,.78);for(let i=0;i<7;i++)s.rod(V(-2.2+i*.35,2.9,-.8),V(-2.2+i*.35,6.7,-.8),.055,copper);
 for(const x of [-1.5,.7]){s.pipe([[x,3.5,1.1],[x,5.3,1.1],[x,5.8,-1.7],[x,2.6,-1.7]],.12,coldColor);gauge(sg,x,5.2,1.5);}
 for(let j=0;j<2;j++){const y0=j*3.5+.8;for(let i=0;i<13;i++){const y=y0+i*.27,z=3.2-i*.46;s.box(1,.07,.36,steel,3.2,y,z);}guardrail(sg,V(3.65,y0,3.25),V(3.65,y0+3.5,-2.5));}
 s.pipe([[-2,8.8,-.6],[-2,9.4,-.6],[1.5,9.4,-.6],[1.5,8.8,-.6]],.12,steel);ladder(sg,-3.1,2.6,.3,7.5);
 // Axial multi-stage rotor in a partial casing, not an exposed radial fan.
 const turbine=component('汽轮机 · 剖切缸体、法兰、轴承与进汽阀',9,0,-4),t=kit(turbine);t.box(10,.5,5.6,mat.cap,0,.25);const profile=[[-4,.72],[-3.7,1.05],[-2,1.2],[-1,1.45],[.8,1.7],[2.6,2.15],[3.8,2.22]].map(([x,r])=>new THREE.Vector2(r,x));const casing=new THREE.LatheGeometry(profile,40,0,Math.PI*1.17);casing.rotateZ(-Math.PI/2);t.mesh(casing,shell,0,3.6);
 for(const [x,r] of [[-3.7,1.10],[-2,1.28],[0,1.65],[2.4,2.15],[3.75,2.28]]){t.ring(r,.1,steel,x,3.6,0,'x');for(let i=0;i<18;i++){const a=i/18*Math.PI*2;t.rod(V(x-.1,3.6+Math.sin(a)*r,Math.cos(a)*r),V(x+.16,3.6+Math.sin(a)*r,Math.cos(a)*r),.055,mat.metal);}}
 for(const x of [-4.2,4.1]){t.box(1.05,2.6,2.1,steel,x,1.8);const bearing=t.cyl(.55,.8,copper,x,3.6,0,.55,24);bearing.rotation.z=Math.PI/2;for(const z of [-.7,.7])t.box(.26,.18,.26,mat.metal,x,3,z);}
 for(const x of [-2.6,-1.4]){t.cyl(.3,1.5,steel,x,5.6,-.7);t.ring(.4,.07,hotColor,x,6.4,-.7);t.rod(V(x-.35,6.4,-.7),V(x+.35,6.4,-.7),.04,hotColor);t.pipe([[x,5.4,-.7],[x,5.0,-1.4],[x,4.6,-1.4]],.25,steel);gauge(turbine,x,5.8,.1);}
 const rotor=k.group('汽轮机多级转子',9,3.6,-4),r=kit(rotor);r.rod(V(-4.8,0,0),V(5.3,0,0),.20,mat.metal);
 for(let stage=0;stage<10;stage++){const x=-3.3+stage*.68,radius=.75+stage*.105;const disc=r.cyl(radius*.65,.14,steel,x,0,0,radius*.65,28);disc.rotation.z=Math.PI/2;for(let i=0;i<28;i++){const a=i/28*Math.PI*2,blade=r.box(.20,.48,.07,copper,x,Math.cos(a)*(radius-.16),Math.sin(a)*(radius-.16));blade.quaternion.setFromUnitVectors(V(0,1,0),V(0,Math.cos(a),Math.sin(a)));blade.rotateY(.43);}r.ring(radius,.025,steel,x,0,0,'x');}bake(rotor);
 // Coupling and ribbed cylindrical synchronous generator, terminal box and cooling ducts.
 const gen=component('同步发电机 · 联轴器、定子、散热筋与端子箱',17,0,-4),g=kit(gen);g.box(6.7,.5,4.8,mat.cap,0,.25);const main=g.cyl(1.42,5.3,shell,0,3.6,0,1.42,40);main.rotation.z=Math.PI/2;
 for(const x of [-2.65,2.65]){g.sphere(1.42,steel,x,3.6,0,.4,1,1);flange(gen,x,3.6,0,1.46,'x');}
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;g.rod(V(-2.35,3.6+Math.cos(a)*1.45,Math.sin(a)*1.45),V(2.35,3.6+Math.cos(a)*1.45,Math.sin(a)*1.45),.055,steel);}
 for(const x of [-1.8,1.8])for(const z of [-1,1])g.box(.75,1.8,.75,steel,x,1.4,z);
 g.box(2.5,.7,1.6,shell,0,5.2);for(const x of [-.7,0,.7]){g.cyl(.15,.35,copper,x,5.72,.3);g.pipe([[x,5.85,.3],[x,6.25,1.3],[x+1,5.4,2.4],[x+1,1.2,3.6]],.055,mat.ink);}
 g.rod(V(-4.1,3.6,0),V(-2.65,3.6,0),.23,mat.metal);for(const x of [-3.6,-3.3])flange(gen,x,3.6,0,.52,'x');g.box(1.2,.10,1.25,steel,-3.45,4.25);
 for(let j=0;j<12;j++){const a=j/12*Math.PI*2;g.rod(V(2.95,3.6+Math.sin(a)*.3,Math.cos(a)*.3),V(2.95,3.6+Math.sin(a)*1.05,Math.cos(a)*1.05),.045,mat.metal);}g.ring(1.08,.08,steel,2.95,3.6,0,'x');
 const condenser=component('凝汽器与凝结水泵组',7,0,4.2),c=kit(condenser);vessel(condenser,1,1.65,0,5.5,1.08,steel);for(let i=0;i<19;i++){const a=i*2.399,rad=.75*Math.sqrt((i+.5)/19);c.rod(V(3.82,1.65+Math.sin(a)*rad,Math.cos(a)*rad),V(4.05,1.65+Math.sin(a)*rad,Math.cos(a)*rad),.06,copper);}
 for(const x of [-3.2,-1.4]){c.box(1.4,.25,2.4,mat.cap,x,.13,2.9);const motor=c.cyl(.37,1.1,coldColor,x,.8,3.25);motor.rotation.x=Math.PI/2;c.sphere(.45,steel,x,.8,2.2);for(let y=.55;y<1.05;y+=.13)c.box(.8,.04,.85,steel,x,y,3.25);c.pipe([[x,.8,2.2],[x,1.2,1.4],[x+.5,1.5,.2]],.12,coldColor);}
 const transformer=component('升压变压器与配电柜',18,0,5.7),e=kit(transformer);e.box(4.6,.35,4.5,mat.cap,0,.18);e.box(3,2.8,2.6,steel,0,1.8);for(let i=0;i<13;i++)for(const z of [-1.5,1.5])e.box(.12,2.5,.65,coldColor,-1.4+i*.23,1.8,z);for(const x of [-.9,0,.9]){e.cyl(.12,1.8,steel,x,4.0,0);for(let y=3.3;y<4.7;y+=.2)e.cyl(.25,.07,mat.cream,x,y,0,.25,12);e.sphere(.16,copper,x,4.8,0);}
 for(let i=0;i<3;i++){e.box(.85,1.8,.7,shell,-1.1+i*1.05,1.1,3);e.box(.62,.5,.025,mat.ink,-1.1+i*1.05,1.45,3.36);e.sphere(.06,hotColor,-1.3+i*1.05,.9,3.39);}
 // Separate physical circuits, with flanges and supported insulated pipes.
 const routes=[
  [[-15,7.5,-4],[-15,9.8,-4],[-10,9.8,-8],[-1.5,9.8,-8],[-1.5,8.3,-4.6]],
  [[.5,2.5,-2.8],[-1,1.4,.5],[-7,1.4,.5],[-7,6.9,-2]],
  [[2,8.5,-4.6],[4,8.5,-4.6],[5.4,6.4,-4.6],[6.4,5.3,-4.6]],
  [[11,2.4,-4],[11,1.6,-.5],[8,1.65,4.2]],
  [[3.8,.8,6.4],[1.7,.8,6.4],[1.7,2.5,-1.5]]
 ];
 const curves=routes.map((points,i)=>p.pipe(points,i===2?.20:.16,[hotColor,coldColor,steel,steel,coldColor][i],50));
 for(const x of [-12,-8,-4]){p.box(.13,7.8,.13,steel,x,3.9,-8);p.box(1.5,.12,1,steel,x,7.8,-8);}
 for(const [x,y,z,axis] of [[-11,9.8,-8,'x'],[-4,9.8,-8,'x'],[-4,1.4,.5,'x'],[4.5,7.6,-4.6,'y']])flange(plate,x,y,z,.3,axis);
 const particles=[];for(let i=0;i<50;i++){const path=i%5,mesh=k.sphere(.13,[copper,coldColor,mat.cap,mat.cap,coldColor][path]);particles.push({mesh,path,offset:Math.floor(i/5)/10});}
 const bulbs=[];for(let i=0;i<5;i++){p.rod(V(20+i*.6,.2,9.5),V(20+i*.6,1.4,9.5),.035,mat.ink);bulbs.push(k.sphere(.16,mat.metal,20+i*.6,1.6,9.5));}
 const sourceParts=parts.reduce((sum,g)=>{bake(g);return sum+g.userData.sourceParts;},0)+rotor.userData.sourceParts;
 root.userData={rotor,rotorAxis:'x',curves,particles,bulbs,hot,cold,hotLiquid,liquidBase:.55,liquidHeight:6.2,sourceParts,componentNames:parts.map(g=>g.name),labelPoints:[[-15,9,-4],[-7,9,-4],[.5,10,-4],[9,6.6,-4],[17,6.4,-4],[8,3.5,4.2],[18,5.4,5.7]],features:{axialBladeStages:10,rotorBlades:280,flowCircuits:5,cutawayTank:true,condenser:true,transformer:true,steamGeneratorPlatforms:3}};
 return root;
}
