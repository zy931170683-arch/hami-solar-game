import * as THREE from 'three';
import {mergeGeometries} from '../public/vendor/BufferGeometryUtils.js';
export const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export function pigment(source,color,shade){const m=source.clone();m.uniforms.base.value.set(color);m.uniforms.shade.value.set(shade);m.uniforms.sun.value=source.uniforms.sun.value;return m;}
export function kit(parent){
 const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;};
 const box=(w,h,d,m,x=0,y=0,z=0)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const cyl=(r,h,m,x=0,y=0,z=0,top=r,segments=16)=>mesh(new THREE.CylinderGeometry(top,r,h,segments),m,x,y,z);
 const rod=(a,b,r,m)=>{const o=cyl(r,a.distanceTo(b),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize());return o;};
 const pipe=(points,r,m,segments=32)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>p.isVector3?p:V(...p)),false,'centripetal');mesh(new THREE.TubeGeometry(curve,segments,r,8,false),m);return curve;};
 const ring=(r,t,m,x=0,y=0,z=0,axis='y',arc=Math.PI*2)=>{const o=mesh(new THREE.TorusGeometry(r,t,6,48,arc),m,x,y,z);if(axis==='y')o.rotation.x=-Math.PI/2;if(axis==='x')o.rotation.y=Math.PI/2;return o;};
 const sphere=(r,m,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const o=mesh(new THREE.SphereGeometry(r,32,18),m,x,y,z);o.scale.set(sx,sy,sz);return o;};
 const group=(name,x=0,y=0,z=0)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;};
 return{mesh,box,cyl,rod,pipe,ring,sphere,group};
}
// Bake only this component; moving shafts, liquid and particles remain separate.
export function bake(group){group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),batches=new Map(),lines=new Map();let count=0;
 group.traverse(o=>{if(o.isMesh){count++;let g=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(g.index){const n=g.toNonIndexed();g.dispose();g=n;}for(const name of Object.keys(g.attributes))if(!['position','normal','uv'].includes(name))g.deleteAttribute(name);if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(g);o.geometry.dispose();}else if(o.isLineSegments){const g=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(!lines.has(o.material))lines.set(o.material,[]);lines.get(o.material).push(g);o.geometry.dispose();}});
 group.clear();for(const [m,parts] of batches){const combined=mergeGeometries(parts);parts.forEach(g=>g.dispose());if(!combined)throw Error('Incompatible model geometry');const mesh=new THREE.Mesh(combined,m);mesh.name=group.name+' · 合批';group.add(mesh);}for(const [m,parts] of lines){const pos=parts.flatMap(g=>Array.from(g.attributes.position.array));parts.forEach(g=>g.dispose());const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));group.add(new THREE.LineSegments(g,m));}group.userData.sourceParts=count;return group;
}
export function rectangularFrustum(bottom,top,height,material,parent,y=0){const g=new THREE.CylinderGeometry(top/Math.SQRT2,bottom/Math.SQRT2,height,4,1);g.rotateY(Math.PI/4);return kit(parent).mesh(g,material,0,y+height/2,0);}
export function roof(parent,width,base,rise,material,edgeMaterial,inner=.58){const positions=[],k=kit(parent),N=20,M=8,half=width/2;
 const point=(face,u,t)=>{const r=half*(inner+(1-inner)*t),y=base+rise*(1-t)**2+Math.abs(u)**10*t**5*.8;const a=face*Math.PI/2,x=u*r,z=r;return V(x*Math.cos(a)+z*Math.sin(a),y,z*Math.cos(a)-x*Math.sin(a));};
 for(let f=0;f<4;f++){for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=point(f,i/N*2-1,j/M),b=point(f,(i+1)/N*2-1,j/M),c=point(f,(i+1)/N*2-1,(j+1)/M),d=point(f,i/N*2-1,(j+1)/M);for(const p of [a,b,d,b,c,d])positions.push(...p.toArray());}
  for(let i=0;i<=16;i++){const u=i/16*2-1,pts=[];for(let j=0;j<=6;j++)pts.push(point(f,u,j/6).add(V(0,.025,0)));k.pipe(pts,.045,edgeMaterial,12);}const pts=[];for(let i=0;i<=20;i++)pts.push(point(f,i/20*2-1,1));k.pipe(pts,.13,edgeMaterial,24);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return k.mesh(g,material);
}
