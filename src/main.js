import * as THREE from 'three';
import {OrbitControls} from '../public/vendor/OrbitControls.js';
import {GLTFLoader} from '../public/vendor/GLTFLoader.js';
import {createLandscape} from './landscape.js';
import {createExperience} from './experience.js';
import {createStory} from './story.js';
import {createSceneLayout} from './scene-layout.js';

const $=s=>document.querySelector(s), host=$('#viewport');
const C={paper:0xf6f2df,ink:0x124b3a,pink:0xee2985,green:0x00ac64,blue:0x009abd,gold:0xffcb52,cream:0xfff5c7};
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){$('#error').hidden=false;$('#loading').hidden=true;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(C.paper,0);host.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label','哈密光热站三维场景，使用下方按钮切换观察角度');
renderer.domElement.tabIndex=0;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,1,4600);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=38;controls.maxDistance=370;controls.maxPolarAngle=Math.PI*.495;controls.enablePan=false;
const sun=new THREE.Vector3(-.7,1,.45).normalize();
let sunMode=false,mirrorMotion=true,lastFrame=0,experience=null,story=null;
const sunHistory=[{time:performance.now()-1000,direction:sun.clone()}];
const cursor=document.createElement('div');cursor.id='sun-cursor';cursor.hidden=true;cursor.setAttribute('aria-hidden','true');
cursor.innerHTML='<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="10"/><g><path d="M24 1v8m0 30v8M1 24h8m30 0h8M8 8l6 6m20 20 6 6M8 40l6-6m20-20 6-6"/></g><circle class="sun-center" cx="24" cy="24" r="3"/></svg>';
document.body.appendChild(cursor);
const printMaterials=[];
function print(color,shadow=C.blue,{warmth=.18,field=0}={}){
 const m=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{base:{value:new THREE.Color(color)},shade:{value:new THREE.Color(shadow)},sun:{value:sun},warmth:{value:warmth},field:{value:field},fieldCool:{value:new THREE.Color(0x13a9ac)}},vertexShader:`
 varying vec3 n; varying vec3 wp;
 void main(){vec4 p=vec4(position,1.);vec3 nn=normal;
 #ifdef USE_INSTANCING
 p=instanceMatrix*p;nn=mat3(instanceMatrix)*nn;
 #endif
 wp=(modelMatrix*p).xyz;n=normalize(mat3(modelMatrix)*nn);gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,fragmentShader:`
 uniform vec3 base; uniform vec3 shade; uniform vec3 sun;uniform float warmth;uniform float field;uniform vec3 fieldCool;varying vec3 n;varying vec3 wp;
 float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){
 vec3 normal=normalize(n)*(gl_FrontFacing?1.:-1.);
 float l=dot(normal,sun);
 // One local pigment per material. Surface orientation alone selects its print tones.
 vec3 lit=mix(base,vec3(1.,.77,.20),warmth);
 vec3 mid=mix(base,shade,.36);
 vec3 dark=mix(base,shade,.92);
 // Artistic finite-source distance tint, independent of the optical tracking direction.
 float distanceTint=smoothstep(38.,185.,length(wp.xz-sun.xz*120.))*field;
 lit=mix(lit,fieldCool,distanceTint*.96);
 mid=mix(mid,fieldCool,distanceTint*.7);
 vec3 col=mix(dark,mid,smoothstep(-.12,.16,l));
 col=mix(col,lit,smoothstep(.44,.64,l));
 vec2 grid=mod(gl_FragCoord.xy,5.)-2.5;
 float density=1.-smoothstep(-.1,.8,l);
 float radius=mix(.35,2.15,density);
 float dots=1.-smoothstep(radius-.25,radius+.25,length(grid));
 float terminator=1.-smoothstep(.12,.6,abs(l-.25));
 col=mix(col,shade,dots*(.2+.5*terminator));
 float grain=hash(gl_FragCoord.xy);col*=.92+grain*.13;
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
 }`});printMaterials.push(m);return m;
}
const mat={cream:print(C.cream,0xa56947,{warmth:.25}),mirror:print(0xffd84d,0x07535b,{field:1,warmth:.08}),pink:print(C.pink,0x7a305f),green:print(C.green,0x52426a),mirrorBack:print(C.blue,0x07535b,{warmth:.025}),blue:print(C.blue,0x663c91,{warmth:.025}),gold:print(C.gold,0x9a5b74),ink:print(C.ink,0x4c375a),paper:print(C.paper,C.gold),tower:print(0xe3e4df,0x9c9993,{warmth:0}),cap:print(0xf2f1e9,0xaaa5aa,{warmth:0}),receiver:print(0x34383a,0x5d4f5c,{warmth:0}),metal:print(0xa6a6a0,0x787078,{warmth:0})};
for(const name of ['tower','cap','receiver','metal'])mat[name].name=`tower-${name}`;
// Separate coplanar front/back layers at long viewing distances.
mat.mirror.side=THREE.FrontSide;mat.mirror.polygonOffset=true;mat.mirror.polygonOffsetFactor=-1;mat.mirror.polygonOffsetUnits=-2;
const lineMat=new THREE.LineBasicMaterial({color:C.ink,transparent:true,opacity:.65});
const towerLineMat=new THREE.LineBasicMaterial({color:0x77736e,transparent:true,opacity:.32});
const landscape=createLandscape(scene,mat,lineMat);
function mesh(g,m,x=0,y=0,z=0,edges=false){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);scene.add(o);if(edges){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(g,28),lineMat);o.add(edge);}return o;}
function ring(r,w,color,y=.06){const g=new THREE.RingGeometry(r-w/2,r+w/2,180);g.rotateX(-Math.PI/2);return mesh(g,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}),0,y,0);}

// A locally painted print texture: speckled sand, registration marks and hand-drawn floral borders.
function groundTexture(){
 const cv=document.createElement('canvas');cv.width=cv.height=2048;const ctx=cv.getContext('2d');let seed=29;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 ctx.fillStyle='#f2e4ac';ctx.fillRect(0,0,2048,2048);
 for(let i=0;i<95000;i++){ctx.fillStyle=['#dba86938','#fffbe65c','#e5c45d35'][i%3];ctx.fillRect(rand()*2048,rand()*2048,1+rand()*3,1+rand()*2);}
 const cx=1024,cy=1024;
 for(let a=0;a<Math.PI*2;a+=.025){const r=876+Math.sin(a*17)*2;ctx.fillStyle=a%1<.5?'#ed3284':'#04a770';ctx.beginPath();ctx.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2.5,0,7);ctx.fill();}
 for(let i=0;i<90;i++){const a=i/90*Math.PI*2,r=923,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle=['#ef388b','#009e67','#008fac'][Math.floor(i/9)%3];ctx.lineWidth=3;ctx.strokeRect(-12,-11,24,22);ctx.rotate(Math.PI/4);ctx.strokeRect(-6,-6,12,12);ctx.restore();}
 for(let r of [300,550,790]){ctx.strokeStyle='#eecc7480';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();}
 return new THREE.CanvasTexture(cv);
}
const ground=mesh(new THREE.CylinderGeometry(91,91.3,.65,192),mat.paper,0,-.45,0);
const disk=new THREE.Mesh(new THREE.CircleGeometry(91,192),new THREE.MeshBasicMaterial({map:groundTexture()}));disk.rotation.x=-Math.PI/2;disk.position.y=-.08;scene.add(disk);
ring(89,.12,C.pink,.03);ring(84.7,.15,C.green,.04);ring(26,.28,C.green,.05);ring(25.3,.11,C.pink,.05);
const core=mesh(new THREE.CylinderGeometry(24.7,24.7,.15,128),mat.paper,0,.07,0);
for(let a=0;a<Math.PI*2;a+=Math.PI*2/3){const road=mesh(new THREE.BoxGeometry(2.05,.06,62),mat.paper,Math.sin(a)*55,.06,Math.cos(a)*55);road.rotation.y=a;}

// Heliostats are genuinely three dimensional, with the normal bisecting the light and receiver vectors.
const points=[];for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.PI/2;points.push(new THREE.Vector2(Math.cos(a)*.82,Math.sin(a)*.82));}
const shape=new THREE.Shape(points);const mirrorGeo=new THREE.ShapeGeometry(shape);const rimGeo=new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:false,steps:1});rimGeo.translate(0,0,-.065);const supportGeo=new THREE.CylinderGeometry(.055,.075,1.0,4);
const poses=[];
for(let r=28,ri=0;r<83;r+=2.15,ri++){const count=Math.floor(Math.PI*2*r/2.05);for(let i=0;i<count;i++){const a=(i+.5*(ri%2))/count*Math.PI*2;if([0,2*Math.PI/3,4*Math.PI/3].some(b=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))<1.2/r))continue;poses.push({r,a,x:Math.sin(a)*r,z:Math.cos(a)*r,ri});}}
const groups=[[],[],[],[]];poses.forEach(p=>{const k=(Math.floor((p.a+.3)/(.5*Math.PI))%4);groups[k].push(p);});
const mirrors=[],mirrorBatches=[],dummy=new THREE.Object3D();const mirrorMats=[mat.mirror,mat.mirror,mat.mirror,mat.mirror];
for(let k=0;k<4;k++){
 const list=groups[k];const faces=new THREE.InstancedMesh(mirrorGeo,mirrorMats[k],list.length);const rims=new THREE.InstancedMesh(rimGeo,mat.mirrorBack,list.length);const poles=new THREE.InstancedMesh(supportGeo,mat.green,list.length);
 list.forEach((p,i)=>{const target=new THREE.Vector3(-p.x,34,-p.z).normalize();const normal=target.add(sun).normalize();dummy.position.set(p.x,1.18,p.z);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);dummy.scale.set(1,1,1);dummy.updateMatrix();faces.setMatrixAt(i,dummy.matrix);dummy.position.addScaledVector(normal,-.04);dummy.scale.set(1.085,1.085,1.085);dummy.updateMatrix();rims.setMatrixAt(i,dummy.matrix);dummy.position.set(p.x,.55,p.z);dummy.quaternion.identity();dummy.scale.set(1,1,1);dummy.updateMatrix();poles.setMatrixAt(i,dummy.matrix);});
 list.forEach((p,i)=>{const target=new THREE.Vector3(-p.x,30-1.18,-p.z).normalize();p.receiver=target;p.rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),target.clone().add(sun).normalize());p.delay=65+(p.ri%5)*23+(i%7)*9;});
 faces.instanceMatrix.setUsage(THREE.DynamicDrawUsage);rims.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 faces.frustumCulled=rims.frustumCulled=false;
 faces.userData.part='field';rims.userData.part='field';scene.add(rims,poles,faces);mirrors.push(faces,rims);mirrorBatches.push({list,faces,rims});
}
const normalAxis=new THREE.Vector3(0,0,1),desiredNormal=new THREE.Vector3(),desiredRotation=new THREE.Quaternion();
function updateMirrors(dt,time,instant=false){
 let moving=false;
 for(const {list,faces,rims} of mirrorBatches){
  list.forEach((p,i)=>{
   let delayedSun=sun;
   if(!instant){for(let j=sunHistory.length-1;j>=0;j--){if(sunHistory[j].time<=time-p.delay){delayedSun=sunHistory[j].direction;break;}}}
   desiredNormal.copy(p.receiver).add(delayedSun).normalize();desiredRotation.setFromUnitVectors(normalAxis,desiredNormal);
   const angle=p.rotation.angleTo(desiredRotation);
   if(instant)p.rotation.copy(desiredRotation);
   else if(angle>.0003){p.rotation.rotateTowards(desiredRotation,Math.min(angle*(1-Math.exp(-dt/.22)),dt*1.8));moving=true;}
   dummy.position.set(p.x,1.18,p.z);dummy.quaternion.copy(p.rotation);dummy.scale.set(1,1,1);dummy.updateMatrix();faces.setMatrixAt(i,dummy.matrix);
   desiredNormal.copy(normalAxis).applyQuaternion(p.rotation);dummy.position.addScaledVector(desiredNormal,-.10);dummy.scale.set(1.055,1.055,1);dummy.updateMatrix();rims.setMatrixAt(i,dummy.matrix);
  });faces.instanceMatrix.needsUpdate=true;rims.instanceMatrix.needsUpdate=true;
 }
 mirrorMotion=moving;
}
updateMirrors(0,performance.now(),true);
// Flat offset ink shadows are deliberate screenprint shapes, rather than soft photographic shading.
const shadowGeo=new THREE.CircleGeometry(.82,5);shadowGeo.rotateX(-Math.PI/2);const shadows=new THREE.InstancedMesh(shadowGeo,new THREE.MeshBasicMaterial({color:C.green,transparent:true,opacity:.22,depthWrite:false}),poses.length);
poses.forEach((p,i)=>{dummy.position.set(p.x+1.1,.02,p.z-.6);dummy.quaternion.identity();dummy.scale.set(1.1,1,1.5);dummy.updateMatrix();shadows.setMatrixAt(i,dummy.matrix);});scene.add(shadows);
const longShadowShape=new THREE.Shape([new THREE.Vector2(-1,0),new THREE.Vector2(2,0),new THREE.Vector2(24,-23),new THREE.Vector2(18,-25)]);const longShadow=mesh(new THREE.ShapeGeometry(longShadowShape),new THREE.MeshBasicMaterial({color:C.pink,transparent:true,opacity:.23,side:THREE.DoubleSide}));longShadow.rotation.x=-Math.PI/2;longShadow.position.y=.17;
function updateShadows(){
 const dx=-sun.x/Math.max(sun.y,.15),dz=-sun.z/Math.max(sun.y,.15);
 for(let i=0;i<poses.length;i++){const p=poses[i];dummy.position.set(p.x+dx*1.18,.02,p.z+dz*1.18);dummy.quaternion.identity();dummy.rotation.y=Math.atan2(dx,dz);dummy.scale.set(.9,1,1.05+Math.hypot(dx,dz)*.3);dummy.updateMatrix();shadows.setMatrixAt(i,dummy.matrix);}shadows.instanceMatrix.needsUpdate=true;
 const p=longShadow.geometry.attributes.position;for(let i=0;i<p.count;i++){const base=longShadow.geometry.userData.original||(longShadow.geometry.userData.original=Array.from(p.array));const x=base[i*3],y=base[i*3+1];const length=Math.max(0,-y/25);p.setXYZ(i,x*(1-length)+dx*32*length,-dz*32*length,0);}p.needsUpdate=true;longShadow.geometry.computeBoundingSphere();
}
updateShadows();

// Original Blender geometry, unchanged on disk. Materials are remapped for this art direction.
const loader=new GLTFLoader();const pickables=[...mirrors,core];core.userData.part='plant';let plant,campus,campusScale=1;
loader.load('./public/assets/hami-plant.glb',gltf=>{
 plant=gltf.scene;plant.scale.set(.11,.154,.11);scene.add(plant);
 campus=new THREE.Group();campus.name='放大的中央动力岛';
 const towerName=/^(塔基|塔身|混凝土|塔肩|吸热器|上下白|罩板|环形检修|塔顶|塔底)/;
 for(const child of [...plant.children]){if(!towerName.test(child.name))campus.add(child);}
 plant.add(campus);plant.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(campus);
 const radialExtent=Math.hypot(Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x)),Math.max(Math.abs(bounds.min.z),Math.abs(bounds.max.z)));
 campusScale=23/radialExtent;campus.scale.set(campusScale,1.55,campusScale);
 plant.traverse(o=>{if(!o.isMesh)return;const name=o.name;const original=(Array.isArray(o.material)?o.material[0]:o.material)?.name||'';
 if(/塔身.*(字标|标识)|塔身英文/.test(name)){o.visible=false;return;}
 let m=mat.cream;
 if(towerName.test(name)){
  if(/管屏|管束/.test(name))m=mat.receiver;
  else if(/吊机/.test(name))m=mat.pink;
  else if(/护栏|压条|接缝|分节|板缝|设备颈部/.test(name))m=mat.metal;
  else if(/白色|顶|罩|托座|平台/.test(name))m=mat.cap;
  else m=mat.tower;
 }
 else if(/管屏|吸热器暗|运行中/.test(name))m=mat.pink;
 else if(/标识|字|检修门/.test(name))m=mat.green;
 else if(/起重|吊|红|crane/i.test(name))m=mat.pink;
 else if(/顶|罐|屋|冷却|散热/.test(name))m=mat.blue;
 else if(/管|护栏|立柱|钢|支|梁|梯|框/.test(name))m=mat.green;
 else if(/BLUE|蓝/i.test(original))m=mat.blue;
 else if(/BLACK|深|暗|DARK/i.test(original))m=mat.ink;
 o.material=m;o.userData.part=towerName.test(name)?'tower':/罐|HOT|COLD/.test(name)?'salt':'plant';pickables.push(o);
 const outline=towerName.test(name)?/塔身.*(直筒|防护)|白色.*罩|圆形平台/.test(name):/筒身|保温罩|厂房|储罐|罐体|汽轮|混凝土/.test(name);
 if(outline&&o.geometry.attributes.position.count<30000){o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,35),towerName.test(name)?towerLineMat:lineMat));}
 });$('#loading').hidden=true;window.hami.loaded=true;
},undefined,e=>{$('#loading').textContent='厂区模型加载失败，请刷新重试';console.error(e);});

// A few readable rays show the idea of concentration without obscuring the model.
const beamGroup=new THREE.Group();scene.add(beamGroup);beamGroup.visible=false;
for(let i=0;i<21;i++){const p=poses[Math.floor(i*poses.length/21)];const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p.x,1.3,p.z),new THREE.Vector3(0,30,0)]);beamGroup.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:i%2?C.gold:C.pink,transparent:true,opacity:.42})));}
const halo=mesh(new THREE.TorusGeometry(2,.035,6,90),new THREE.MeshBasicMaterial({color:C.pink}),0,31,0);halo.rotation.x=Math.PI/2;halo.visible=false;

const views={overview:{pos:[126,63,158],target:[-17,5,0]},top:{pos:[0,260,.1],target:[-20,0,0]},tower:{pos:[37,31,46],target:[-6,18,0]},horizon:{pos:[170,26,205],target:[0,24,0]}};
let flight=null,activeView='overview';const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function view(name,instant=false){activeView=name;const v=views[name];const mobile=innerWidth<600;const pos=new THREE.Vector3(...v.pos),target=new THREE.Vector3(...v.target);if(mobile&&name==='overview'){pos.multiplyScalar(1.24);target.set(0,3,0);}if(instant||reduced){camera.position.copy(pos);controls.target.copy(target);controls.update();}else flight={start:performance.now(),from:camera.position.clone(),targetFrom:controls.target.clone(),pos,target};document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',String(b.dataset.view===name));});}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
controls.addEventListener('start',()=>flight=null);
$('#reset').onclick=()=>{$('#detail').hidden=true;view('overview');};$('#beams').onclick=()=>{beamGroup.visible=!beamGroup.visible;halo.visible=beamGroup.visible;$('#beams').setAttribute('aria-pressed',String(beamGroup.visible));$('#beams .button-arrow').textContent=beamGroup.visible?'−':'＋';};
$('#about').onclick=()=>$('#about-dialog').showModal();$('#close-about').onclick=()=>$('#about-dialog').close();$('#about-dialog').onclick=e=>{if(e.target===$('#about-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};$('#close-detail').onclick=()=>$('#detail').hidden=true;
let sunDirty=false,lastShadowUpdate=0;
const sunMenu=document.createElement('div');sunMenu.id='sun-context';sunMenu.hidden=true;sunMenu.setAttribute('role','menu');
sunMenu.innerHTML='<button role="menuitem" id="sun-context-action">切回鼠标模式</button><small>右键随手切换 · Esc 关闭</small>';document.body.appendChild(sunMenu);
function setSunMode(enabled){
 sunMode=enabled;sunMenu.hidden=true;document.body.classList.toggle('sun-mode',sunMode);
 $('#sun-toggle').setAttribute('aria-pressed',String(sunMode));$('#sun-action').textContent=sunMode?'切回鼠标模式':'开启太阳模式';
 $('#sun-help').innerHTML=sunMode?'移动太阳，观察光影<br>右键可在身旁切回鼠标':'光照已固定<br>点击太阳，移动光源';
 cursor.hidden=true;$('#part-label').hidden=true;mirrorMotion=sunMode;
 sunHistory.length=0;sunHistory.push({time:performance.now()-1000,direction:sun.clone()});
}
$('#sun-toggle').onclick=()=>setSunMode(!sunMode);
$('#sun-context-action').onclick=()=>setSunMode(!sunMode);
host.addEventListener('contextmenu',e=>{
 if(experience?.mode==='game'||experience?.mode==='mirror'){e.preventDefault();return;}
 e.preventDefault();cursor.hidden=true;$('#part-label').hidden=true;
 $('#sun-context-action').textContent=sunMode?'切回鼠标模式':'开启太阳模式';sunMenu.hidden=false;
 sunMenu.style.left=`${Math.min(e.clientX+12,innerWidth-205)}px`;sunMenu.style.top=`${Math.min(e.clientY+10,innerHeight-94)}px`;
 $('#sun-context-action').focus({preventScroll:true});
});
document.addEventListener('pointerdown',e=>{if(!sunMenu.hidden&&!sunMenu.contains(e.target)&&e.button!==2)sunMenu.hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sunMenu.hidden){e.preventDefault();e.stopPropagation();sunMenu.hidden=true;renderer.domElement.focus({preventScroll:true});}});
host.addEventListener('pointermove',e=>{
 if(!sunMode||!sunMenu.hidden||e.pointerType==='touch'&&e.buttons===0)return;
 const r=host.getBoundingClientRect(),x=THREE.MathUtils.clamp((e.clientX-r.left)/r.width,0,1),y=THREE.MathUtils.clamp((e.clientY-r.top)/r.height,0,1);
 const azimuth=Math.atan2(camera.position.x,camera.position.z)+(x-.5)*Math.PI*1.65;
 const elevation=THREE.MathUtils.lerp(1.35,.16,y);
 sun.set(Math.sin(azimuth)*Math.cos(elevation),Math.sin(elevation),Math.cos(azimuth)*Math.cos(elevation));
 const time=performance.now();sunHistory.push({time,direction:sun.clone()});while(sunHistory.length>2&&sunHistory[1].time<time-1000)sunHistory.shift();
 mirrorMotion=true;sunDirty=true;cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`;cursor.hidden=false;
});
host.addEventListener('pointerleave',()=>cursor.hidden=true);
// Keep the normal pointer on buttons and dialogs, even while sun mode is active.
document.addEventListener('pointermove',e=>{if(!host.contains(e.target))cursor.hidden=true;});
const descriptions={tower:['吸热塔','聚光的中心','定日镜把阳光送向塔顶的吸热器。这里把光变成热，让流经管道的熔盐升温。'],field:['定日镜场','把万束光，汇成一束','每一面五边形镜子都朝着太阳调整角度，把阳光反射到同一个吸热器上。试着切换俯瞰，看看镜场的放射纹理。'],salt:['熔盐储热罐','把白天，留给夜晚','高温熔盐在储罐里保存热量。太阳落山后，储存的热能仍可用于产生蒸汽、驱动发电。'],plant:['动力岛','阳光的下一站','储存的热能经换热系统产生蒸汽，推动汽轮发电机。管道、储罐和厂房，让这片镜场成为一座电站。']};
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down={x:0,y:0};
function hit(e){const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(pickables,false)[0];}
host.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
host.addEventListener('pointerup',e=>{if(experience?.blocksPointer||e.button!==0||!sunMenu.hidden||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const h=hit(e);if(!h)return;if(experience?.onPartClick(h.object.userData.part))return;const d=descriptions[h.object.userData.part];if(!d)return;$('#detail-kind').textContent=d[0];$('#detail-title').textContent=d[1];$('#detail-copy').textContent=d[2];$('#detail').hidden=false;});
let lastMove=0;host.addEventListener('pointermove',e=>{if(experience?.blocksPointer||sunMode||e.buttons||performance.now()-lastMove<100)return;lastMove=performance.now();const h=hit(e);const label=$('#part-label');if(experience?.mode==='explore'){experience.highlight(h?.object.userData.part??null);label.hidden=true;host.style.cursor=h?'pointer':'grab';return;}label.hidden=!h;host.style.cursor=h?'pointer':'grab';if(h){label.textContent=descriptions[h.object.userData.part]?.[0]||'';const r=host.getBoundingClientRect();label.style.left=`${Math.min(e.clientX-r.left+15,r.width-120)}px`;label.style.top=`${e.clientY-r.top-35}px`;}});host.addEventListener('pointerleave',()=>{$('#part-label').hidden=true;experience?.highlight(null);});
renderer.domElement.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();flight=null;const off=camera.position.clone().sub(controls.target);if(e.key==='+'||e.key==='-')off.multiplyScalar(e.key==='+'?.9:1.1);else{const s=new THREE.Spherical().setFromVector3(off);s.theta+=e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0;s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.08:e.key==='ArrowDown'?.08:0),.02,Math.PI*.495);off.setFromSpherical(s);}camera.position.copy(controls.target).add(off);controls.update();}});
function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(innerWidth<600&&activeView==='overview'&&!experience?.isFocus)view('overview',true);}
window.addEventListener('resize',resize);view('overview',true);resize();
window.hami={loaded:false,renderer,scene,camera,controls,mirrorBatches,mirrorCount:poses.length,view,getStats:()=>({loaded:window.hami.loaded,mirrors:poses.length,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,view:activeView,beams:beamGroup.visible,sunMode,sun:sun.toArray(),mirrorMotion,campusScale,experience:experience?.getStats()}),trackingSample:()=>{const p=mirrorBatches[0].list[0];return{sun:sun.toArray(),normal:normalAxis.clone().applyQuaternion(p.rotation).toArray(),receiver:p.receiver.toArray(),rotation:p.rotation.toArray()};}};
experience=createExperience({scene,camera,controls,host,mat,sun,landscape,getPlant:()=>plant,isSunMode:()=>sunMode,setSunMode,cancelFlight:()=>{flight=null;$('#detail').hidden=true;beamGroup.visible=halo.visible=false;},getTargets:kind=>{if(kind==='mirror')return mirrors;const nodes=[];plant?.traverse(o=>{if(o.isMesh&&o.visible&&(kind==='tower'?o.userData.part==='tower':o.userData.part==='plant'||o.userData.part==='salt'))nodes.push(o);});return nodes;}});
window.hami.experience=experience;
story=createStory({experience,camera,controls,host,setSunMode,loaded:()=>window.hami.loaded,stats:()=>window.hami.getStats()});window.hami.story=story;createSceneLayout({experience,story});
function animate(t){requestAnimationFrame(animate);const dt=Math.min((t-lastFrame)/1000,.05);lastFrame=t;if(flight){const u=Math.min((t-flight.start)/1200,1),s=u*u*(3-2*u);camera.position.lerpVectors(flight.from,flight.pos,s);controls.target.lerpVectors(flight.targetFrom,flight.target,s);if(u===1)flight=null;}
 if(sunMode&&!experience.isFocus&&(mirrorMotion||t-sunHistory.at(-1).time<500))updateMirrors(dt,t);
 if(sunDirty&&t-lastShadowUpdate>50){updateShadows();sunDirty=false;lastShadowUpdate=t;}
 experience.update(dt,t);controls.update();story?.update();
 landscape.userData.update(camera);
 renderer.render(scene,camera);}requestAnimationFrame(animate);




