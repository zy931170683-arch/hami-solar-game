import * as THREE from 'three';
import {kit,bake,pigment,V} from './model-kit.js';

const smooth=(a,b,t)=>THREE.MathUtils.smoothstep(t,a,b);
// Complete district cutouts live at fixed world coordinates. Their relative motion
// comes only from the perspective camera, as it does for the mountain cards.
export function createWorldCity({mat,camera,host,landscape}){
 const specs=[
  {id:'residential',name:'绿洲居住街区',x:-48,z:-153,width:90,angle:.08,haze:.22},
  {id:'center',name:'城市中心',x:15,z:-142,width:90,angle:.04,haze:.16},
  {id:'neighborhood',name:'新老城街区',x:70,z:-111,width:68,angle:-.13,haze:.10}
 ];
 const loader=new THREE.TextureLoader(),districts=[];let group=null,network=null,clock=0,light=0,loaded=false,active=false,lit=0,total=0,phase='白天',weights={day:1,dusk:0,night:0},elapsed=0,nightMaterials=[],lampFaces=[],lightPools=[];
 const status=document.createElement('div');status.id='city-world-status';status.hidden=true;status.innerHTML='<span id="city-world-clock">06:00 · 白天</span><strong id="city-world-lights">城市亮灯 100%</strong><small>新疆绿洲城市 · 插画示意</small>';document.querySelector('main').append(status);
 const labels=document.createElement('div');labels.id='supply-route-labels';labels.hidden=true;labels.innerHTML='<span>① 发电与升压</span><span>② 输电线路</span><span>③ 远方城市</span>';host.append(labels);
 const labelPoints=[V(20,7,5.7),V(42,17,-47),V(25,26,-135)];
 const savedColors=[];landscape?.traverse(o=>{for(const key of ['zenith','horizon','sand']){const u=o.material?.uniforms?.[key];if(u?.value?.isColor)savedColors.push({key,u,day:u.value.clone()});}});
 const mountainNights=[];landscape?.traverse(o=>{const m=o.material;if(!m?.uniforms?.viewFade)return;if(!m.uniforms.cityNight){m.uniforms.cityNight={value:0};m.fragmentShader='uniform float cityNight;\n'+m.fragmentShader.replace('gl_FragColor=vec4(col,','col=mix(col,col*vec3(.18,.32,.55)+vec3(.012,.028,.055),cityNight*.94);gl_FragColor=vec4(col,');m.needsUpdate=true;}mountainNights.push(m.uniforms.cityNight);});
 const ready=Promise.all(specs.map(async spec=>{
  const base='./public/assets/xinjiang-city/'+spec.id;
  const [day,dusk,night,mask,source,data]=await Promise.all(['day','dusk','night','windows-mask','master'].map(id=>loader.loadAsync(base+'-'+id+'.png')).concat(fetch(base+'-windows.json').then(r=>{if(!r.ok)throw Error('新疆城市窗灯数据载入失败');return r.json();})));
  for(const t of [day,dusk,night,source]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
  mask.minFilter=THREE.LinearMipmapLinearFilter;mask.anisotropy=8;
  const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:false,uniforms:{day:{value:day},dusk:{value:dusk},night:{value:night},windows:{value:mask},source:{value:source},twilight:{value:0},nightfall:{value:0},supply:{value:1},haze:{value:spec.haze},mist:{value:new THREE.Color(0xeadcc0)}},vertexShader:`varying vec2 texUV;void main(){texUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
   uniform sampler2D day,dusk,night,windows,source;uniform float twilight,nightfall,supply,haze;uniform vec3 mist;varying vec2 texUV;
   void main(){vec4 a=texture2D(day,texUV),b=texture2D(dusk,texUV),c=texture2D(night,texUV),w=texture2D(windows,texUV);
    if(max(a.a,w.a)<.05)discard;
    vec3 wall=mix(mix(a.rgb,b.rgb,twilight),c.rgb,nightfall);
    float rank=w.r/max(w.a,.001),rim=clamp(w.g/max(w.a,.001),0.,1.);
    float power=supply<=0.?0.:supply>=.9999?1.:smoothstep(-.02,.02,supply-rank);
    // Keep the source ink and mullions visible inside lit glass, rather than
    // replacing every selected pixel with the same flat luminous rectangle.
    float glassInk=clamp(pow(dot(texture2D(source,texUV).rgb,vec3(.2126,.7152,.0722))*7.,1.2),.10,1.);
    float darkRim=.28+.72*smoothstep(0.,.8,rim);
    vec3 glass=mix(vec3(.006,.018,.024),vec3(1.,.68,.25)*glassInk*darkRim,power);
    vec3 col=mix(wall,glass,w.a);col=mix(col,mist,haze*(1.-w.a*.88));
    gl_FragColor=vec4(col,1.);
    #include <colorspace_fragment>
   }`});
  const item={...spec,material,data,day,dusk,night,mask,card:null};districts.push(item);return item;
 })).then(()=>{districts.sort((a,b)=>specs.findIndex(s=>s.id===a.id)-specs.findIndex(s=>s.id===b.id));total=districts.reduce((n,d)=>n+d.data.windows.length,0);loaded=true;if(group)attachCards();update(clock,light,0);}).catch(e=>{console.error(e);status.querySelector('small').textContent='城市素材载入失败，请刷新';});

 function attachCards(){for(const d of districts){const height=d.width*d.data.height/d.data.width,card=new THREE.Mesh(new THREE.PlaneGeometry(d.width,height),d.material);card.name=d.name+' · 完整透明PNG';card.position.set(d.x,height*((d.data.footY??d.data.height)/d.data.height-.5)+.4,d.z);card.rotation.y=d.angle;card.userData={completePNG:true,fixedWorld:true,district:d.id};group.add(card);d.card=card;}}
 function createNetwork(){
  const root=new THREE.Group();root.name='发电机组 → 输电塔 → 新疆城市';const metal=pigment(mat.metal,0x496d64,0x484955),ceramic=pigment(mat.cream,0xc3ddc4,0x427b7d),base=pigment(mat.cream,0xbfa57e,0x777264),steel=new THREE.Group();root.add(steel);const k=kit(steel),points=[V(30,0,-9),V(42,0,-47),V(48,0,-86),V(54,0,-124)];
  const armHeight=16,halfArm=4.1;
  for(const [index,p]of points.entries()){
   const tower=new THREE.Group();tower.name='输电铁塔 '+(index+1);tower.position.copy(p);steel.add(tower);const q=kit(tower),levels=[0,4,8,12,16,19],radius=y=>3.1*(1-y/23);
   for(let j=0;j<levels.length-1;j++){const low=levels[j],high=levels[j+1],r=radius(low),t=radius(high);for(let s=0;s<4;s++){const a=s*Math.PI/2+Math.PI/4,b=(s+1)*Math.PI/2+Math.PI/4;const A=V(Math.cos(a)*r,low,Math.sin(a)*r),B=V(Math.cos(a)*t,high,Math.sin(a)*t),C=V(Math.cos(b)*r,low,Math.sin(b)*r),D=V(Math.cos(b)*t,high,Math.sin(b)*t);q.rod(A,B,.10,metal);q.rod(A,D,.055,metal);q.rod(C,B,.055,metal);q.rod(B,D,.065,metal);}}
   for(const sign of [-1,1]){q.rod(V(0,18,0),V(sign*halfArm,armHeight,0),.12,metal);q.rod(V(0,armHeight,0),V(sign*halfArm,armHeight,0),.12,metal);for(let j=0;j<5;j++)q.cyl(.18,.12,ceramic,sign*halfArm,armHeight-.18-j*.18,0);q.cyl(.07,1.2,metal,sign*halfArm,armHeight-.55,0);}
   for(const a of [-1,1])for(const b of [-1,1])q.box(1,.55,1,base,a*2.2,.25,b*2.2);
  }
  // A real terminal at the plant and city substations anchors every conductor.
  const terminals=[V(21,4.6,5.7),...points.map(p=>p.clone().add(V(0,14.9,0))),V(60,3.6,-134)],curves=[];
  const wireMaterial=new THREE.MeshBasicMaterial({color:0x4c645d}),flowMaterial=new THREE.MeshBasicMaterial({color:0xffcf72});
  for(const side of [-1,1])for(let i=0;i<terminals.length-1;i++){const a=terminals[i].clone().add(V(side*(i===0?.6:halfArm),0,0)),b=terminals[i+1].clone().add(V(side*(i===terminals.length-2?3:halfArm),0,0)),mid=a.clone().lerp(b,.5);mid.y-=Math.min(3.6,a.distanceTo(b)*.07);const curve=new THREE.CatmullRomCurve3([a,mid,b]);k.mesh(new THREE.TubeGeometry(curve,32,.075,5,false),wireMaterial);curves.push(curve);}
  const sub=kit(steel);for(const x of [57,63]){sub.box(3.5,2.7,2.5,metal,x,1.4,-134);for(let j=0;j<4;j++)sub.cyl(.13,.8,ceramic,x+(j-1.5)*.65,3.2,-134);}
  bake(steel);const pulses=[];for(const [i,c]of curves.entries())for(let j=0;j<4;j++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.23,6,4),flowMaterial);root.add(mesh);pulses.push({mesh,curve:c,phase:j/4+i*.07});}
  root.userData={pylons:points.map(p=>p.toArray()),terminals:terminals.map(p=>p.toArray()),conductors:curves.length,pulses,wireMaterial};return root;
 }
 function restoreSky(){for(const c of savedColors)c.u.value.copy(c.day);for(const u of mountainNights)u.value=0;}
 function illuminatePlant(parent){
  const copies=new Map();nightMaterials=[];lampFaces=[];lightPools=[];
  parent.traverse(o=>{if(!o.isMesh||!o.material?.isShaderMaterial||!o.material.fragmentShader.includes('varying vec3 wp;'))return;const original=o.material;if(!copies.has(original)){
   const m=original.clone();m.uniforms.sun.value=original.uniforms.sun.value;m.uniforms.powerNight={value:0};m.fragmentShader='uniform float powerNight;\n'+m.fragmentShader.replace('gl_FragColor=vec4(col,1.);',`vec3 flood=vec3(0.);vec3 lampA=vec3(-18.,15.,12.)-wp,lampB=vec3(8.,13.,9.)-wp,lampC=vec3(23.,12.,0.)-wp;
    float poolA=exp(-dot(lampA,lampA)/550.)*(.30+.70*max(0.,dot(normal,normalize(lampA))));
    float poolB=exp(-dot(lampB,lampB)/370.)*(.30+.70*max(0.,dot(normal,normalize(lampB))));
    float poolC=exp(-dot(lampC,lampC)/300.)*(.30+.70*max(0.,dot(normal,normalize(lampC))));
    vec3 nightPigment=col*vec3(.30,.43,.68)+vec3(.015,.035,.07);
    nightPigment+=(col*.92+vec3(.14,.095,.035))*min(1.3,poolA+poolB+poolC);
    col=mix(col,nightPigment,powerNight);gl_FragColor=vec4(col,1.);`);copies.set(original,m);nightMaterials.push(m);
  }o.material=copies.get(original);});
  const k=kit(parent);for(const [x,y,z]of [[-18,15,12],[8,13,9],[23,12,0]]){
   k.cyl(.12,y,mat.metal,x,y/2,z);k.box(1.8,.65,.8,mat.metal,x,y,z);const face=new THREE.MeshBasicMaterial({color:0xd6c391});k.box(1.5,.10,.65,face,x,y-.35,z);lampFaces.push(face);
   const poolMat=new THREE.MeshBasicMaterial({color:0xffce80,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});const pool=k.mesh(new THREE.CircleGeometry(9,48),poolMat,x,.04,z);pool.rotation.x=-Math.PI/2;lightPools.push(poolMat);
  }
 }
 function enter(parent){active=true;elapsed=0;illuminatePlant(parent);group=new THREE.Group();group.name='新疆绿洲城市 · 世界远景';parent.add(group);attachCards();network=createNetwork();group.add(network);status.hidden=labels.hidden=false;update(0,0,0);}
 function leave(){active=false;status.hidden=labels.hidden=true;restoreSky();for(const d of districts)d.card=null;for(const m of nightMaterials)m.dispose();for(const m of [...lampFaces,...lightPools])m.dispose();if(network){const materials=new Set();network.traverse(o=>{if(o.material)materials.add(o.material);});for(const m of materials)m.dispose();}nightMaterials=[];lampFaces=[];lightPools=[];group=null;network=null;}
 function update(t,power,dt=0,output=0){clock=THREE.MathUtils.clamp(t,0,1);light=THREE.MathUtils.clamp(power,0,1);const dusk=smooth(.56,.70,clock),night=smooth(.72,.86,clock);weights={day:(1-dusk)*(1-night),dusk:dusk*(1-night),night};lit=0;
  for(const d of districts){const u=d.material.uniforms;u.twilight.value=dusk;u.nightfall.value=night;u.supply.value=light;u.mist.value.set(0xeadcc0).lerp(new THREE.Color(0xe6af86),dusk).lerp(new THREE.Color(0x213f4a),night);lit+=d.data.windows.filter(w=>light>=1||(light>0&&light>=w.rank)).length;}
  phase=night>=.999?'夜晚':night>0?'晚霞 → 夜晚':dusk>=.999?'晚霞':dusk>0?'白天 → 晚霞':'白天';const minutes=Math.round((6+16*clock)*60);status.querySelector('#city-world-clock').textContent=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')+' · '+phase;status.querySelector('#city-world-lights').textContent='城市亮灯 '+Math.round(light*100)+'%';
  if(!active)return;elapsed+=dt;for(const m of nightMaterials)m.uniforms.powerNight.value=night;for(const m of lampFaces)m.color.set(0xd6c391).lerp(new THREE.Color(0xffe4a2),night);for(const m of lightPools)m.opacity=night*.10;
  for(const u of mountainNights)u.value=night;
  for(const c of savedColors){const sunset=new THREE.Color(c.key==='zenith'?0xb9a6a1:0xe8bb86),dark=new THREE.Color(c.key==='zenith'?0x142f51:c.key==='sand'?0x21415d:0x314c68);c.u.value.copy(c.day).lerp(sunset,dusk*.75).lerp(dark,night);}
  if(network){network.userData.wireMaterial.color.set(0x4c645d).lerp(new THREE.Color(0xe5ac4f),Math.min(output/100,1)*.75);for(const p of network.userData.pulses){p.mesh.visible=output>2;p.mesh.position.copy(p.curve.getPointAt((elapsed*(.10+output*.002)+p.phase)%1));}}
  group.updateMatrixWorld(true);const bounds=host.getBoundingClientRect();for(const [i,e]of [...labels.children].entries()){const p=labelPoints[i].clone().project(camera);e.style.left=(p.x+1)*bounds.width/2+'px';e.style.top=(1-p.y)*bounds.height/2+'px';e.hidden=p.z>1||Math.abs(p.x)>.96||Math.abs(p.y)>.94;}
 }
 return{ready,enter,leave,update,getStats:()=>({loaded,active,clock,phase,light,litWindows:lit,totalWindows:total,weights:{...weights},worldSpace:true,workLights:{count:lampFaces.length,night:nightMaterials[0]?.uniforms.powerNight.value??0},modules:districts.map(d=>({id:d.id,windows:d.data.windows.length,position:d.card?.position.toArray(),rotation:d.card?.rotation.y,width:d.width,completePNG:true})),network:network?{pylons:network.userData.pylons,terminals:network.userData.terminals,conductors:network.userData.conductors,flowing:network.userData.pulses[0].mesh.visible}:null})};
}
