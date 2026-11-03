import * as THREE from 'three';
import {kit,V,bake,pigment,rectangularFrustum,roof} from './model-kit.js';
export const LANDMARKS=[
 {id:'pearl',name:'东方明珠塔',city:'上海',height:468,source:'https://english.shanghai.gov.cn/en-ScenicSpots/20231205/19a5f5184eca45728fd57a4d4c8efc61.html'},
 {id:'canton',name:'广州塔 · 小蛮腰',city:'广州',height:600,source:'https://www.eguangzhou.gov.cn/fortunebeautifulguangzhou/content/post_31119.html'},
 {id:'crane',name:'黄鹤楼',city:'武汉',height:51.4,source:'https://korean.wuhan.gov.cn/wh_hanyuwz06_2021/wh_hanyuwz061_2021/202112/t20211202_1864590.shtml'},
 {id:'goose',name:'大雁塔',city:'西安',height:64.5,source:'https://xadfz.xa.gov.cn/xadq/rwxa/1802954373708996609.html'}
];
function pearl(g,m){const k=kit(g);k.cyl(59,1.2,m.cap,0,.6);for(let j=0;j<3;j++)k.cyl(48-j*7,1.1,m.cap,0,1.7+j*1.1);
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2,x=Math.sin(a)*7.5,z=Math.cos(a)*7.5;k.cyl(4.5,283,m.cap,x,145,z);k.rod(V(Math.sin(a)*55,3,Math.cos(a)*55),V(x,93,z),3.5,m.cap);k.sphere(7,m.pink,Math.sin(a)*34,10,Math.cos(a)*34);for(const y of [38,62,138,163,188,213,238,305])k.ring(4.53,.14,m.metal,x,y,z);}
 const ball=(r,y)=>{k.sphere(r,m.pink,0,y);const underside=k.mesh(new THREE.SphereGeometry(r*1.003,40,16,0,Math.PI*2,Math.PI/2,Math.PI/2),m.cap,0,y);const glass=k.mesh(new THREE.SphereGeometry(r*1.007,48,8,0,Math.PI*2,Math.PI*.42,Math.PI*.17),m.blue,0,y);
  for(const a of [.24,.36,.42,.59,.7])k.ring(Math.sin(a*Math.PI)*r*1.012,.18,m.cap,0,y+Math.cos(a*Math.PI)*r,0);
  for(let row=0;row<5;row++){const t0=.08+row*.075,t1=t0+.075;for(let i=0;i<28;i++){const a=i/28*Math.PI*2+(row%2)*Math.PI/28,b=a+Math.PI/28;const p=(t,a)=>V(Math.sin(t*Math.PI)*r*Math.sin(a),y+Math.cos(t*Math.PI)*r,Math.sin(t*Math.PI)*r*Math.cos(a));k.rod(p(t0,a),p(t1,b),.12,m.cap);k.rod(p(t0,a),p(t1,b-Math.PI/14),.12,m.cap);}}
 };
 ball(25,93);ball(22.5,272.5);ball(8,342);for(let i=0;i<5;i++){const a=i*2.1;k.sphere(6,m.pink,Math.sin(a)*6,132+i*24,Math.cos(a)*6);k.ring(6.03,.2,m.cap,Math.sin(a)*6,132+i*24,Math.cos(a)*6);}
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2,b=(i+1)/3*Math.PI*2;for(const y of [122,148,173,198,223,248])k.rod(V(Math.sin(a)*7.5,y,Math.cos(a)*7.5),V(Math.sin(b)*7.5,y,Math.cos(b)*7.5),.65,m.cap);}
 k.cyl(4,63,m.cap,0,315.5);k.cyl(1.9,30,m.cap,0,365);k.cyl(1.1,44,m.cap,0,402);k.cyl(.6,44,m.cap,0,446,.12);
 for(let y=354;y<452;y+=6){k.ring(y<382?1.95:y<424?1.15:.65,.16,y%12?m.pink:m.cap,0,y);if(y<400)for(let i=0;i<4;i++){const a=i*Math.PI/2,b=a+Math.PI/2;k.rod(V(Math.sin(a)*1.8,y,Math.cos(a)*1.8),V(Math.sin(b)*1.8,y+6,Math.cos(b)*1.8),.12,m.metal);}}
 return{spheres:11,mainSpheres:[{center:93,diameter:50},{center:272.5,diameter:45},{center:342,diameter:16}],columns:3,mastBase:350};
}
function canton(g,m){const k=kit(g),h=454;const point=(a,t)=>{const x=40*Math.cos(a),z=30*Math.sin(a),b=a+Math.PI*.75;return V(x*(1-t)+(25*Math.cos(b)+4)*t,h*t,z*(1-t)+(20*Math.sin(b)+2)*t);};
 k.cyl(43,1,m.cap,0,.5);for(let i=0;i<24;i++)k.rod(point(i/24*Math.PI*2,0),point(i/24*Math.PI*2,1),1.05,m.cap);
 for(let row=0;row<46;row++){const t=row/45,pts=[];for(let i=0;i<=72;i++)pts.push(point(i/72*Math.PI*2,t));k.pipe(pts,.42,m.metal,90);if(row<45)for(let i=0;i<24;i++)k.rod(point(i/24*Math.PI*2,t),point((i+1)/24*Math.PI*2,(row+1)/45),.25,m.cap);}
 const core=k.cyl(8.5,448,m.blue,1,224,0);core.scale.z=14/17;
 for(let y=6;y<448;y+=5.5){const o=k.ring(8.55,.18,m.cap,1,y,0);o.scale.z=14/17;}
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2;k.rod(V(1+8.6*Math.cos(a),3,7.1*Math.sin(a)),V(1+8.6*Math.cos(a),448,7.1*Math.sin(a)),.16,m.cap);}
 for(let y=425;y<=449;y+=4){const pts=[];for(let i=0;i<=60;i++)pts.push(point(i/60*Math.PI*2,y/h));k.pipe(pts,.65,m.cap,72);}
 for(let i=0;i<16;i++){const p=point(i/16*Math.PI*2,.986);k.sphere(1.5,m.pink,p.x,p.y+2,p.z,1.1,1.3,1);}
 const cx=4,cz=2;for(const [base,end,r0,r1] of [[454,488,4.1,3],[488,530,2.7,1.8],[530,568,1.8,.9],[568,600,.9,.25]]){k.cyl(r0,end-base,m.cap,cx,(base+end)/2,cz,r1);for(let y=base+2;y<end;y+=5)k.ring(r0*.9,.2,y%10?m.cap:m.pink,cx,y,cz);}
 return{columns:24,rings:46,diagonalBraces:1080,bodyHeight:454,antennaHeight:146,topRotationDegrees:135};
}
function crane(g,m){const wood=pigment(m.cream,0xa65a44,0x563b51),wall=pigment(m.cream,0xe9d4a2,0xa77955),tiles=pigment(m.gold,0xd3a04a,0x8b6856),k=kit(g);k.box(34,1,34,m.cap,0,.5);k.box(31,1,31,m.cap,0,1.5);
 for(let i=0;i<9;i++)k.box(10,.22,3.3,wall,0,.12+i*.22,18-i*.28);
 for(let l=0;l<5;l++){const y=2+l*8.5,w=25-l*2.2,wallW=w*.70,storey=6.9;const floor=k.group('重檐楼层-'+(l+1));const f=kit(floor);f.box(w,.38,w,m.cap,0,y+.19);f.box(wallW,storey,wallW,wall,0,y+storey/2);
  for(let side=0;side<4;side++){const a=side*Math.PI/2,face=f.group('柱廊');face.rotation.y=a;const c=kit(face);const columnN=[6,5,5,4,3][l];for(let i=0;i<columnN-1;i++){const x=-w*.45+i/(columnN-1)*w*.9;c.cyl(.26,6.6,wood,x,y+3.6,w*.45);c.box(.85,.3,.85,tiles,x,y+6.5,w*.45);for(const dx of [-.28,.28])c.box(.23,.2,.7,wood,x+dx,y+6.2,w*.45);}
   for(let i=0;i<6;i++){const x=(i-2.5)*wallW/6;c.box(wallW/6*.72,3.7,.08,m.ink,x,y+3.2,wallW/2+.045);for(let j=1;j<5;j++)c.box(.07,3.65,.11,wood,x-wallW/6*.36+j*wallW/6*.144,y+3.2,wallW/2+.10);for(let j=0;j<4;j++)c.box(wallW/6*.72,.07,.11,wood,x,y+1.9+j*.8,wallW/2+.12);}
   for(let i=0;i<13;i++){const x=(i-6)*w/13;c.cyl(.10,1.15,m.cap,x,y+1.0,w*.48);if(i<12){c.box(w/13,.09,.13,m.cap,x+w/26,y+1.45,w*.48);c.box(w/13,.08,.13,wood,x+w/26,y+.75,w*.48);c.rod(V(x,y+.8,w*.48),V(x+w/13,y+1.4,w*.48),.045,wood);}}
  }
  roof(floor,w*1.18,y+6.4,2.5,tiles,wood,.62);if(l>0)roof(floor,w*1.15,y+2.9,1.5,tiles,wood,.76);
 }
 // Square pavilion crown, upturned ridge ornaments and gourd finial.
 roof(g,15.8,44,3.7,tiles,wood,.02);for(const [y,r] of [[48.2,.9],[49.3,.6],[50.1,.35]])k.sphere(r,tiles,0,y);k.cyl(.15,1.0,tiles,0,50.9,0,.04);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const ctx=canvas.getContext('2d');ctx.fillStyle='#164b42';ctx.fillRect(0,0,512,192);ctx.strokeStyle='#d7b566';ctx.lineWidth=10;ctx.strokeRect(8,8,496,176);ctx.fillStyle='#f2cf75';ctx.font='bold 130px KaiTi, SimSun, serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('黄鹤楼',256,103);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;kit(g).mesh(new THREE.PlaneGeometry(5.2,1.85),new THREE.MeshBasicMaterial({map:texture}),0,41.5,5.9);return{storeys:5,columnCount:72,roofLayers:10,curvedEaves:true,facadeBaseWidth:30,railings:true,latticeWindows:true};
}
function goose(g,m){const brick=pigment(m.cream,0xb78b59,0x79604e),edge=pigment(m.cream,0xc7a16d,0x8b6b50),k=kit(g);k.box(45.7,2.7,45.7,brick,0,1.35);k.box(43,1,43,edge,0,3.2);
 for(let j=0;j<14;j++)k.box(11,.23,1.1,edge,0,.12+j*.23,26-j*.34);
 const heights=[10.36,7.37,7.15,6.65,6.7,6.4,5.2],widths=[25.5,23.4,21.3,19.3,17.3,15.6,13.8];let y=3.7;const segments=[];
 for(let l=0;l<7;l++){const h=heights[l]*1.08,w=widths[l],tw=w-.7,r=l===0?1.55:1.2,sill=l===0?1.1:1.05,stem=h*.34;
  for(let side=0;side<4;side++){const face=k.group('砖塔立面');face.position.y=y;face.rotation.y=side*Math.PI/2;const q=kit(face),shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(tw/2,h);shape.lineTo(-tw/2,h);shape.closePath();const opening=new THREE.Path();opening.moveTo(-r,sill);opening.lineTo(r,sill);opening.lineTo(r,sill+stem);opening.absarc(0,sill+stem,r,0,Math.PI,false);opening.lineTo(-r,sill);shape.holes.push(opening);q.mesh(new THREE.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:false}),brick,0,0,w/2-.65);q.box(r*2,stem+r,.08,m.ink,0,sill+(stem+r)/2,w/2-.9);
   const n=l<2?9:l<5?7:5;for(let i=0;i<=n;i++){const x=(i/n-.5)*(w-.5);if(Math.abs(x)<r+.3)continue;q.rod(V(x,.15,w/2+.02),V(x*tw/w,h-.1,w/2+.02),.14,edge);}
   for(let i=0;i<13;i++){const a=i/12*Math.PI,qx=Math.cos(a)*(r+.18),qy=sill+stem+Math.sin(a)*(r+.18);const b=q.box(.35,.42,.20,edge,qx,qy,w/2+.08);b.rotation.z=a-Math.PI/2;}
   for(let row=.45;row<h;row+=.42){const rw=w+(tw-w)*(row/h);for(const [x1,x2] of [[-rw/2,Math.abs(row-sill-stem)<r?-r-.3:-r-.15],[r+.15,rw/2]])segments.push(V(x1,row,w/2+.012).applyAxisAngle(V(0,1,0),side*Math.PI/2).add(V(0,y,0)),V(x2,row,w/2+.012).applyAxisAngle(V(0,1,0),side*Math.PI/2).add(V(0,y,0)));}
  }
  for(let i=0;i<3;i++)k.box(w+.6-i*.2,.22,w+.6-i*.2,edge,0,y+h+.11+i*.22);y+=h+.66;
 }
 rectangularFrustum(14,10,1.2,brick,g,y);k.box(10.3,.4,10.3,edge,0,y+1.4);k.cyl(.35,.6,edge,0,y+1.9,.0,.15);
 const lineGeo=new THREE.BufferGeometry().setFromPoints(segments);g.add(new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({color:0x755a40,transparent:true,opacity:.25})));
 return{storeys:7,brickTower:true,baseWidth:25.5,podiumWidth:45.7,archedOpenings:28,levelHeights:heights};
}
export function createLandmark(spec,mat){const g=new THREE.Group();g.name=spec.name+' · 细节模型';const features=({pearl,canton,crane,goose})[spec.id](g,mat);bake(g);g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g),height=b.max.y-b.min.y,scale=(spec.height/220*32)/height;g.scale.setScalar(scale);g.position.y=-b.min.y*scale;const root=new THREE.Group();root.name=spec.name;root.add(g);root.userData={height:spec.height,worldHeight:spec.height/220*32,name:spec.name,features,sourceParts:g.userData.sourceParts,referenceModel:true};return root;}
