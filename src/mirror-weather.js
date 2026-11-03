import * as THREE from 'three';
// Test the projected incoming light segment, not just the pointer inside a cloud.
export function segmentHitsCloud(a,b,c){
 const ax=(a.x-c.x)/c.rx,ay=(a.y-c.y)/c.ry,dx=(b.x-a.x)/c.rx,dy=(b.y-a.y)/c.ry;
 const t=THREE.MathUtils.clamp(-(ax*dx+ay*dy)/(dx*dx+dy*dy||1),0,1);return (ax+dx*t)**2+(ay+dy*t)**2<1;
}
export function createMirrorWeather({host,camera}){
 const el=document.createElement('div');el.id='mirror-weather';el.hidden=true;el.innerHTML=`<img class="weather-cloud" data-cloud="0" src="./public/assets/painted-cloud.png" alt="飘过光路的云层"><img class="weather-cloud" data-cloud="1" src="./public/assets/painted-cloud.png" alt="远处的云层"><canvas id="sand-veil" aria-hidden="true"></canvas><aside id="mirror-mission"><b>让光，穿过晴空</b><p>避开入射光路上的云层。沙尘经过后，再启动清洗车，洗去镜面的灰尘。</p><span id="mirror-task"></span><strong id="mirror-weather-status" role="status"></strong></aside><button id="cleaning-truck" aria-label="启动清洗车清洗镜面" disabled>清洗镜面 <span>↗</span></button>`;document.querySelector('main').append(el);
 const cloudEls=[...el.querySelectorAll('[data-cloud]')],truck=el.querySelector('#cleaning-truck'),canvas=el.querySelector('canvas'),ctx=canvas.getContext('2d'),mission=el.querySelector('#mirror-mission');
 const particles=Array.from({length:360},(_,i)=>({x:(i*.6180339)%1,y:.15+.85*((i*.41421)%1)**.28,r:.6+(i%9)*.24,speed:.03+(i%13)*.003}));
 let elapsed=0,stable=0,cleaned=0,dust=0,nextDust=8,stormEnd=0,finished=false,active=false,blocked=false,cleaner=null,clouds=[],storm=false;
 function enter(vehicle){elapsed=stable=cleaned=dust=0;nextDust=8;stormEnd=0;finished=false;active=true;blocked=storm=false;cleaner=vehicle;el.hidden=false;}
 truck.onclick=()=>{if(dust>0&&!storm&&cleaner&&!cleaner.busy)cleaner.start();};
 function point(v,r){const p=v.clone().project(camera);return{x:(p.x+1)*r.width/2,y:(1-p.y)*r.height/2};}
 function drawDust(dt,r){if(canvas.width!==Math.round(r.width)||canvas.height!==Math.round(r.height)){canvas.width=r.width;canvas.height=r.height;}ctx.clearRect(0,0,canvas.width,canvas.height);if(!storm)return;const g=ctx.createLinearGradient(0,0,0,r.height);g.addColorStop(0,'#c28b4300');g.addColorStop(.35,'#c28b4305');g.addColorStop(1,'#b7784099');ctx.fillStyle=g;ctx.fillRect(0,0,r.width,r.height);for(const p of particles){p.x=(p.x+dt*p.speed)%1;const y=p.y*r.height+Math.sin(elapsed*1.6+p.x*12)*15;ctx.fillStyle=`rgba(132,83,39,${p.y**3*.55})`;ctx.beginPath();ctx.ellipse(p.x*r.width,y,p.r*2.8,p.r,0,0,Math.PI*2);ctx.fill();}}
 function update(dt,time,mode,mirror,lines,glow){el.hidden=mode!=='mirror';mission.hidden=mode!=='mirror';if(mode!=='mirror'){active=false;return;}if(!active)enter(cleaner);elapsed+=dt;const r=host.getBoundingClientRect(),lesson=document.querySelector('#lesson-panel');if(mission.parentElement!==lesson)lesson.append(mission);
  clouds=[];for(let i=0;i<2;i++){const w=Math.max(145,Math.min(290,r.width*.19)),h=w*.34,x=r.width*(.43+.2*Math.sin(elapsed*.12+i*2.8)),y=r.height*(.12+i*.15);Object.assign(cloudEls[i].style,{width:w+'px',height:h+'px',left:x+'px',top:y+'px'});clouds.push({x:x+w*.5,y:y+h*.53,rx:w*.43,ry:h*.38});}
  const pos=lines[0]?.geometry.attributes.position;blocked=!!pos&&clouds.some(c=>segmentHitsCloud(point(new THREE.Vector3().fromBufferAttribute(pos,0),r),point(new THREE.Vector3().fromBufferAttribute(pos,1),r),c));
  if(!storm&&elapsed>=nextDust){storm=true;stormEnd=elapsed+6;nextDust=Infinity;}if(storm&&elapsed>=stormEnd){storm=false;dust=.8;}
  const washed=cleaner?.update(dt,time);if(washed){dust=0;cleaned++;nextDust=elapsed+28;}
  for(const line of lines){if(!line.userData.cleanMaterial){line.userData.cleanMaterial=line.material;line.userData.dustMaterial=new THREE.LineDashedMaterial({color:0xb98a41,dashSize:.8,gapSize:.7,transparent:true,opacity:.45});}line.material=dust||storm?line.userData.dustMaterial:line.userData.cleanMaterial;line.computeLineDistances();line.visible=!blocked;}
  if(glow)glow.visible=!blocked&&!dust&&!storm;if(!blocked&&!dust&&!storm&&!cleaner?.busy)stable+=dt;
  if(mirror?.userData.dustCoat){mirror.userData.dustCoat.visible=dust>0;mirror.userData.dustCoat.material.opacity=dust*(1-(cleaner?.washProgress||0));}
  truck.disabled=storm||!dust||!!cleaner?.busy;truck.classList.toggle('needs-cleaning',dust>0&&!storm);truck.innerHTML=cleaner?.busy?'正在清洗镜面…':storm?'等待沙尘经过':dust?'清洗镜面 <span>↗</span>':'镜面洁净 <span>✓</span>';
  if(cleaner){const p=point(cleaner.root.position.clone().add(new THREE.Vector3(0,-.5,0)),r);truck.style.left=THREE.MathUtils.clamp(p.x-truck.offsetWidth/2,16,r.width-truck.offsetWidth-16)+'px';truck.style.top=THREE.MathUtils.clamp(p.y+12,25,r.height-65)+'px';}
  drawDust(dt,r);mission.querySelector('#mirror-weather-status').textContent=cleaner?.busy?'清洗车正在喷水 · 镜面逐渐恢复':storm?'沙尘经过 · 光路减弱，暂时不要清洗':dust?'沙尘已过 · 镜面待清洗':blocked?'云层挡住了入射光路 · 移动太阳绕开':'晴空聚光 · 阳光正在送往塔顶';mission.querySelector('#mirror-task').textContent=`稳定聚光 ${Math.min(10,Math.floor(stable))} / 10 秒　清洗 ${Math.min(1,cleaned)} / 1 次`;
  if(stable>=10&&cleaned>=1&&!finished){finished=true;document.dispatchEvent(new CustomEvent('hami-mirror-complete'));}
 }
 return{enter,update,getStats:()=>({elapsed,stable,cleaned,dust,blocked,storm,stormEnd,finished,cleaning:!!cleaner?.busy,truckPosition:cleaner?.root.position.toArray(),clouds})};
}

