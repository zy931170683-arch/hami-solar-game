export function createSceneLayout({experience,story}){
 const $=s=>document.querySelector(s),note=$('.scene-note');
 note.insertBefore($('#beams'),$('#sun-help'));$('#beams').innerHTML='<span class="beam-icon" aria-hidden="true">◎</span><span>聚光路径</span><span class="button-arrow" aria-hidden="true">↗</span>';
 const exit=document.createElement('button');exit.id='scene-exit';exit.textContent='退出探索 ×';exit.onclick=()=>story.exit();document.querySelector('header').append(exit);
 const icons=[
 '<circle cx="40" cy="28" r="12"/><path d="M40 8v-6m0 46v6M20 28h-8m48 0h8M25 13l-5-5m35 5 5-5M25 43l-5 5m35-5 5 5"/>',
 '<path d="m15 12 41 7-5 28-41-7zM21 14l-5 27m18-24-5 27m18-24-5 27M12 25l41 7M30 44v13m-12 0h25"/>',
 '<path d="M33 8h14v9H33zm1 10h12v11H34zm1 12h10l3 27H32zM29 58h22"/><path d="M35 4h8v4M43 3l8 2"/>',
 '<path d="m22 12 39 8-12 27-38-9zM33 16l-9 25m23-22L36 44M16 26l39 8M31 43v13m-12 0h23M58 6l8 3m-3 5 8 2"/>',
 '<path d="M12 24v30c0 6 24 6 24 0V24M11 24c0-7 26-7 26 0s-26 7-26 0M42 16v37c0 7 24 7 24 0V16M41 16c0-7 26-7 26 0s-26 7-26 0"/>',
 '<path d="m16 8-8 48m8-48 8 48M6 20h20M3 33h26m-14-13 9 13m-9-13-6 13M35 31h16v25H35zm20-12h15v37H55zM9 56h65"/>',
 '<path d="M8 30h12v27H8zm17-13h15v40H25zm20 9h11v31H45zm15-16h12v47H60zM5 58h70M12 36h4m-4 7h4m14-18h5m-5 9h5m-5 9h5m30-25h4m-4 9h4m-4 9h4m-4 9h4"/>'
 ];
 document.querySelectorAll('[data-chapter]').forEach((b,i)=>{const art=document.createElementNS('http://www.w3.org/2000/svg','svg');art.setAttribute('viewBox','0 0 80 64');art.setAttribute('aria-hidden','true');art.classList.add('chapter-art');art.innerHTML='<g fill="none" stroke="currentColor" stroke-width="2">'+icons[i]+'</g>';b.append(art);});
 const panel=$('#comparison-panel');panel.insertAdjacentHTML('afterbegin','<div class="arc-instruction"><span aria-hidden="true">↶</span><div><b>沿弧线选择，拖到塔旁</b><small>松开插画，变成同比例三维地标</small></div></div>');
 $('#landmark-gallery').insertAdjacentHTML('afterbegin','<svg class="landmark-arc" viewBox="0 0 250 600" preserveAspectRatio="none" aria-hidden="true"><path d="M30 0 Q270 295 30 600"/><path d="M0 0 Q220 295 0 600" stroke-dasharray="3 7"/></svg>');
 document.querySelectorAll('[data-drag-landmark]').forEach((b,i)=>{b.textContent='';b.setAttribute('aria-label','拖动'+document.querySelector('[data-pick-landmark="'+i+'"]').getAttribute('aria-label').slice(2)+'到吸热塔旁');});
 const meters=$('#tower-meters'),energy=document.createElement('section'),light=document.createElement('section');energy.id='energy-gauge';light.id='light-gauge';
 const labels=meters.querySelectorAll('label');energy.append(labels[0],$('.energy-meter'));light.append(labels[1],$('.light-meter'),$('.meter-legend'));meters.append(energy,light);
 $('#game-panel').append($('#game-zone-text'),$('#game-warning'),$('#game-guide'));
 $('#lesson-panel').setAttribute('aria-label','章节说明与操作指引');$('#game-panel').setAttribute('aria-label','储能教学与状态');
 const observer=new MutationObserver(()=>{const mode=experience.mode,tutorial=document.body.hasAttribute('data-tutorial');exit.hidden=mode==='home'&&!tutorial;document.body.classList.toggle('inside-chapter',mode!=='home'||tutorial);if(mode==='power')document.body.style.setProperty('--lesson-tint','#e9d5b3');else if(mode==='mirror')document.body.style.setProperty('--lesson-tint','#dbe6d6');else document.body.style.setProperty('--lesson-tint','#ede4c4');});
 observer.observe(document.body,{attributes:true,attributeFilter:['data-experience','data-tutorial']});exit.hidden=true;
}

