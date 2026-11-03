import * as THREE from 'three';
import {createWorldCity} from './city-world.js';
export function createDispatch({host,mat,camera,landscape}){
 const ui=document.createElement('section');ui.id='dispatch-chart';ui.hidden=true;ui.innerHTML=`<div class="chart-heading"><b>把电，送到需要它的时刻</b><span>青线 · 需要补足的负荷　金线 · 你的发电</span></div><canvas id="load-chart" width="1000" height="260" aria-label="一天中需要补足的负荷鸭子曲线与玩家发电曲线"></canvas><p id="dispatch-status" role="status"></p><div id="dispatch-hold-row"><button id="power-hold" aria-label="按住蒸汽阀增大发电量，松开减小" aria-pressed="false" disabled><span aria-hidden="true">☀</span>按住蒸汽阀，增大发电</button><label>松开减小 · 当前发电<output id="valve-value">0%</output></label></div><div id="dispatch-switches"></div>`;document.querySelector('main').append(ui);
 const city=createWorldCity({host,mat,camera,landscape});let wasActive=false;
 let elapsed=0,cityLight=0,match=0,finished=false,running=false,samples=[],state=null,held=false,currentDemand=24,supplyRatio=0;const cv=ui.querySelector('canvas'),ctx=cv.getContext('2d'),hold=ui.querySelector('#power-hold'),output=ui.querySelector('output');
 const demand=t=>24-16*Math.exp(-(((t-.42)/.21)**2))+46*Math.exp(-(((t-.76)/.16)**2))+10*t;
 function setHeld(value){held=!!value&&!!state&&state.heat>0;hold.setAttribute('aria-pressed',String(held));}
 hold.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();hold.setPointerCapture(e.pointerId);setHeld(true);};
 hold.onpointerup=()=>setHeld(false);hold.onpointercancel=()=>setHeld(false);hold.onlostpointercapture=()=>setHeld(false);window.addEventListener('blur',()=>setHeld(false));
 hold.onkeydown=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();setHeld(true);}};hold.onkeyup=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();setHeld(false);}};
 function enter(root,s){state=s;state.flow=0;held=false;elapsed=match=0;cityLight=0;currentDemand=demand(0);supplyRatio=0;finished=running=false;samples=[];ui.hidden=false;city.enter(root);wasActive=true;output.textContent='0%';hold.setAttribute('aria-pressed','false');city.update(0,0);}
 function draw(t,power){
 const bounds=cv.getBoundingClientRect(),w=bounds.width,h=bounds.height,dpr=Math.min(devicePixelRatio||1,2);if(!w||!h)return;
 if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);
 const p=18,px=x=>p+x*(w-p*2),py=y=>h-21-y/100*(h-31);ctx.clearRect(0,0,w,h);ctx.strokeStyle='#174f4720';ctx.lineWidth=.7;
 for(let y=0;y<=100;y+=25){ctx.beginPath();ctx.moveTo(p,py(y));ctx.lineTo(w-p,py(y));ctx.stroke();}
 ctx.fillStyle='#41645b';ctx.font=(innerWidth<650?'9':'11')+'px sans-serif';ctx.textBaseline='alphabetic';['清晨','正午','傍晚','夜晚'].forEach((s,i)=>ctx.fillText(s,px([0,.38,.68,.9][i]),h-4));
 ctx.strokeStyle='#147f82';ctx.lineWidth=1.7;ctx.beginPath();for(let i=0;i<=120;i++){const x=i/120;i?ctx.lineTo(px(x),py(demand(x))):ctx.moveTo(px(x),py(demand(x)));}ctx.stroke();
 ctx.strokeStyle='#c38a22';ctx.lineWidth=2;ctx.beginPath();samples.forEach((s,i)=>i?ctx.lineTo(px(s.t),py(s.output)):ctx.moveTo(px(s.t),py(s.output)));ctx.stroke();
 ctx.strokeStyle='#b3755580';ctx.beginPath();ctx.moveTo(px(t),8);ctx.lineTo(px(t),h-19);ctx.stroke();ctx.fillStyle='#d99a27';ctx.beginPath();ctx.arc(px(t),py(power),3,0,Math.PI*2);ctx.fill();
 }
 function update(dt,mode,power,s){ui.hidden=mode!=='power';if(mode!=='power'||!power){setHeld(false);if(wasActive){city.leave();wasActive=false;}return;}hold.disabled=s.heat<=0;s.flow=THREE.MathUtils.clamp(s.flow+dt*(held?23:-20),0,100);s.valve=s.flow>.1&&s.heat>0;output.textContent=Math.round(s.output)+'%';if(s.valve&&s.heat>0)running=true;if(running)elapsed+=dt;const t=Math.min(elapsed/60,1),need=demand(t);if(running)s.night=t>.79;// Window coverage follows the currently plotted output without a separate accumulator.
 const ratio=s.output/Math.max(need,1);currentDemand=need;supplyRatio=ratio;cityLight=THREE.MathUtils.clamp(ratio,0,1);city.update(t,cityLight,dt,s.output);
 const liquid=power.userData.hotLiquid,h=.03+s.heat/100*(power.userData.liquidHeight||3.95);liquid.scale.y=h;liquid.position.y=(power.userData.liquidBase||.18)+h/2;liquid.userData.percent=s.heat;
 if(running){if(!samples.length||t-samples.at(-1).t>.0025)samples.push({t,output:s.output});if(samples.length>450)samples.shift();if(t>.86&&Math.abs(s.output-need)<14&&cityLight>.55)match+=dt;}
 ui.querySelector('#dispatch-status').textContent=finished?'城市稳稳亮着 · 进入第七章，看看阳光的去处。':!running?'① 左侧充热 → ② 按住下方蒸汽阀增大发电 → ③ 松开减小，让金线跟上青线。':`当前负荷 ${Math.round(need)}% · 发电 ${Math.round(s.output)}%${ratio<.98?' · 供电不足，请按住按钮':ratio>1.35?' · 松开按钮，节省储热':' · 供需正在平衡'} · 城市亮灯 ${Math.round(cityLight*100)}%`;
 if(match>=6&&!finished){finished=true;document.dispatchEvent(new CustomEvent('hami-dispatch-complete'));}if(t>=1&&!finished){elapsed=0;samples=[];}draw(t,s.output);
 }
 return{enter,update,leave(){city.leave();wasActive=false;ui.hidden=true;setHeld(false);},setNight:night=>{elapsed=night?56:0;samples=[];},getStats:()=>({elapsed,cityLight,demand:currentDemand,supplyRatio,match,finished,running,flow:state?.flow,held,windows:city.getStats().totalWindows,city:city.getStats()})};
}

