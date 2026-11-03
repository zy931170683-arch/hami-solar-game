import * as THREE from 'three';


export {LANDMARKS,createLandmark} from './landmark-models.js';
export {createPowerModel} from './power-models.js';
export function modelTools(mat){
 const add=(parent,geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);parent.add(o);return o};
 const box=(p,w,h,d,m,x=0,y=0,z=0)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const cylinder=(p,r,h,m,x=0,y=0,z=0,rt=r)=>add(p,new THREE.CylinderGeometry(rt,r,h,24),m,x,y,z);
 const rod=(p,a,b,r,m)=>{const dir=new THREE.Vector3().subVectors(b,a);const o=cylinder(p,r,dir.length(),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return o};
 const ring=(p,r,y,m,t=.045)=>{const o=add(p,new THREE.TorusGeometry(r,t,5,64),m,0,y,0);o.rotation.x=Math.PI/2;return o};
 return{add,box,cylinder,rod,ring};
}
export function createDetailedHeliostat(mat){
 const root=new THREE.Group(),head=new THREE.Group(),{add,box,cylinder,rod,ring}=modelTools(mat);head.position.y=6;root.add(head);const v=(x,y,z)=>new THREE.Vector3(x,y,z);
 cylinder(root,1.15,.4,mat.cap,0,.2,0);cylinder(root,.32,5.1,mat.metal,0,2.95,0);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;cylinder(root,.065,.16,mat.gold,Math.cos(a)*.8,.45,Math.sin(a)*.8);}
 const outer=[],inner=[];for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.PI/2;outer.push(new THREE.Vector2(Math.cos(a)*4.5,Math.sin(a)*4.5));inner.push(outer[i].clone().multiplyScalar(.34));}
 const facets=[inner];for(let i=0;i<5;i++){const j=(i+1)%5,mid=outer[i].clone().add(outer[j]).multiplyScalar(.5),im=inner[i].clone().add(inner[j]).multiplyScalar(.5);facets.push([inner[i],outer[i],mid,im],[im,mid,outer[j],inner[j]]);}
 const palette=[mat.cap,mat.mirror,mat.cap,mat.mirror];
 facets.forEach((poly,i)=>{const center=poly.reduce((sum,p)=>sum.add(p),new THREE.Vector2()).multiplyScalar(1/poly.length);const points=poly.map(p=>p.clone().sub(center).multiplyScalar(.978).add(center));const geo=new THREE.ExtrudeGeometry(new THREE.Shape(points),{depth:.075,bevelEnabled:false});const pane=add(head,geo,palette[i%4]);pane.userData.facet=true;const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x156672,transparent:true,opacity:.7}));pane.add(e);});
 for(let i=0;i<5;i++){const j=(i+1)%5,a=v(outer[i].x,outer[i].y,-.12),b=v(outer[j].x,outer[j].y,-.12);rod(head,a,b,.07,mat.metal);rod(head,v(0,0,-.6),a,.11,mat.green);rod(head,v(0,0,-1.2),v(a.x*.73,a.y*.73,-.14),.065,mat.metal);const motor=box(head,.45,.6,.3,mat.gold,outer[i].x*.65,outer[i].y*.65,-.32);}
 const dustPositions=[];for(let i=0;i<150;i++){const a=i*2.399963,r=3.4*Math.sqrt((i+.5)/150);dustPositions.push(Math.cos(a)*r,Math.sin(a)*r,.10);}const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dustPositions,3));const dustCoat=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xa38650,size:.075,transparent:true,opacity:.8}));dustCoat.visible=false;head.add(dustCoat);
 box(head,.75,1.1,.65,mat.ink,0,0,-.9);root.userData.head=head;root.userData.dustCoat=dustCoat;root.userData.facets=11;root.userData.pivotHeight=6;root.userData.minimumGroundClearance=1.4;return root;
}

