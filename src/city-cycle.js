const smooth=(a,b,t)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
export function createCityCycle(parent){
 const el=document.createElement('div');el.id='city-panorama';el.hidden=true;el.setAttribute('role','img');el.setAttribute('aria-label','随时间与供电量变化的城市全景');
 el.innerHTML='<div class="city-cycle-stage"><div class="city-sky city-sky-day"></div><div class="city-sky city-sky-dusk"></div><div class="city-sky city-sky-night"></div><canvas class="city-windows" width="2172" height="724" aria-hidden="true"></canvas><img class="city-building city-building-day" src="./public/assets/city-cycle/day.png" alt=""><img class="city-building city-building-dusk" src="./public/assets/city-cycle/dusk.png" alt=""><img class="city-building city-building-night" src="./public/assets/city-cycle/night.png" alt=""></div><div class="city-caption"><span id="city-clock">06:00 · 白天</span><span>每一扇窗，都在等待这一束光</span><strong id="city-light-count">城市亮灯 100%</strong></div>';
 parent.append(el);
 const ctx=el.querySelector('canvas').getContext('2d'),canvas=ctx.canvas;let windows=[],loaded=false,clock=0,light=1,lit=0,lastPaint='',weights={day:1,dusk:0,night:0};
 const dataReady=fetch('./public/assets/city-cycle/windows.json').then(r=>{if(!r.ok)throw Error('Window mask unavailable');return r.json();}).then(data=>{windows=data.windows;canvas.width=data.width;canvas.height=data.height;loaded=true;paint(true);});
 dataReady.catch(e=>{console.error(e);el.querySelector('#city-light-count').textContent='城市灯光资源载入失败';});
 function paint(force=false){const key=Math.round(light*100)+':'+Math.round(weights.night*40);if(key===lastPaint&&!force)return;lastPaint=key;ctx.clearRect(0,0,canvas.width,canvas.height);lit=0;
 for(const w of windows){const power=light<=0?0:light>=1?1:Math.max(0,Math.min(1,(light-w.rank)*20));if(power>.5)lit++;const dark=[9,24,30],warm=[255,210,124];ctx.fillStyle='rgb('+dark.map((v,i)=>Math.round(v+(warm[i]-v)*power)).join(',')+')';ctx.fillRect(w.x,w.y,w.w,w.h);}
 el.dataset.light=String(Math.round(light*100));el.dataset.litWindows=String(lit);el.querySelector('#city-light-count').textContent='亮灯 '+Math.round(light*100)+'% · '+lit+' 扇';
 }
 function update(t,power){clock=Math.max(0,Math.min(1,t));light=Math.max(0,Math.min(1,power));const dusk=smooth(.56,.70,clock),night=smooth(.72,.86,clock);weights={day:(1-dusk)*(1-night),dusk:dusk*(1-night),night};
 // Back-to-front compositing with the same alpha ensures opaque walls throughout the dissolve.
 el.querySelector('.city-building-dusk').style.opacity=dusk;el.querySelector('.city-building-night').style.opacity=night;el.querySelector('.city-sky-dusk').style.opacity=dusk;el.querySelector('.city-sky-night').style.opacity=night;
 const minutes=Math.round((6+16*clock)*60),phase=night>=.999?'夜晚':night>0?'晚霞 → 夜晚':dusk>=.999?'晚霞':dusk>0?'白天 → 晚霞':'白天';
 el.querySelector('#city-clock').textContent=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')+' · '+phase;el.dataset.phase=phase;el.style.setProperty('--city-caption',night>.5?'#f9dd9d':'#234d49');paint();
 }
 return{el,ready:dataReady,update,enter(){el.hidden=false;lastPaint='';update(0,1);},getStats:()=>({loaded,clock,light,litWindows:lit,totalWindows:windows.length,weights:{...weights}})};
}

