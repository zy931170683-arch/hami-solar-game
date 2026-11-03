import * as THREE from 'three';

// Each PNG is a complete freestanding mountain. No repeated UVs or cropped panorama joins.
export function createLandscape(scene){
 const environment=new THREE.Group();environment.name='新疆远景 · 分层PNG与空气透视';scene.add(environment);
 const loader=new THREE.TextureLoader(),layers=[];
 const specs=[
  {name:'ochre',radius:620,width:460,elevation:-5,haze:.25,count:8,offset:.16},
  {name:'teal',radius:970,width:730,elevation:-3,haze:.43,count:7,offset:.48},
  {name:'rose',radius:1480,width:1020,elevation:0,haze:.62,count:9,offset:.25},
  {name:'haze',radius:2180,width:1500,elevation:3,haze:.79,count:8,offset:.54}
 ];
 for(const [layerIndex,s] of specs.entries()){
  const texture=loader.load(`./public/assets/mountain-island-${s.name}.png`);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.anisotropy=4;
  const layer=new THREE.Group();layer.name=`独立山体层-${s.name}`;environment.add(layer);
  const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,depthTest:true,uniforms:{map:{value:texture},haze:{value:s.haze},viewFade:{value:1},mist:{value:new THREE.Color(0xf0e3c4)}},vertexShader:`varying vec2 texUV;void main(){texUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
   uniform sampler2D map;uniform float haze;uniform float viewFade;uniform vec3 mist;varying vec2 texUV;
   void main(){vec4 ink=texture2D(map,texUV);if(ink.a<.01)discard;
   float aerial=haze+.12*(1.-smoothstep(.02,.24,texUV.y));vec3 col=mix(ink.rgb,mist,aerial);
   float edge=smoothstep(0.,.055,texUV.x)*smoothstep(0.,.055,1.-texUV.x);
   float foot=smoothstep(0.,.16,texUV.y);gl_FragColor=vec4(col,ink.a*edge*foot*viewFade);
   #include <colorspace_fragment>
   }`});
  const cards=[];
  for(let i=0;i<s.count;i++){
   const angle=i/s.count*Math.PI*2+s.offset+Math.sin(i*2.1+layerIndex)*.18+Math.cos(i*4.7)*.065;
   const width=s.width*(.64+.58*(.5+.5*Math.sin(i*1.9+layerIndex)));
   const height=width/3;
   const radius=s.radius*(1+.09*Math.sin(i*2.7+layerIndex*.8));
   const cardMaterial=material.clone();cardMaterial.uniforms.map.value=texture;
   const card=new THREE.Mesh(new THREE.PlaneGeometry(width,height),cardMaterial);card.name=`完整山体-${s.name}-${i}`;
   card.position.set(Math.sin(angle)*radius,height/2+s.elevation+Math.sin(i*2.4+layerIndex)*height*.04,Math.cos(angle)*radius);
   card.rotation.y=angle+Math.PI;card.renderOrder=-10-layerIndex;
   card.userData={angle,radius,width,height,completePNG:true};layer.add(card);cards.push(card);
  }
  layers.push({...s,group:layer,cards,card:cards[0],texture});
 }
 // Low relief remains outside the circular plant, whose foundations stay level.
 const terrainGeometry=new THREE.PlaneGeometry(7800,7800,220,220);terrainGeometry.rotateX(-Math.PI/2);
 const points=terrainGeometry.attributes.position;
 for(let i=0;i<points.count;i++){
  const x=points.getX(i),z=points.getZ(i),distance=Math.hypot(x,z);
  const amplitude=THREE.MathUtils.smoothstep(distance,112,230);
  const fold=Math.sin(x*.014+Math.sin(z*.009)*1.4)*Math.cos(z*.011)+.43*Math.sin(x*.033-z*.018);
  points.setY(i,-1.6+amplitude*(2.7+fold*2.2));
 }
 terrainGeometry.computeVertexNormals();
 const floor=new THREE.Mesh(terrainGeometry,new THREE.ShaderMaterial({uniforms:{sand:{value:new THREE.Color(0xead5a5)},horizon:{value:new THREE.Color(0xf2e6c9)}},vertexShader:`varying vec3 world;varying vec3 terrainNormal;void main(){world=(modelMatrix*vec4(position,1.)).xyz;terrainNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,fragmentShader:`
  uniform vec3 sand;uniform vec3 horizon;varying vec3 world;varying vec3 terrainNormal;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
  void main(){float d=length(world.xz-cameraPosition.xz);vec2 p=world.xz;
   float grain=noise(p*1.5)*.55+noise(p*6.)*.3+hash(gl_FragCoord.xy)*.15;
   float alluvium=noise(vec2(p.x*.024,p.y*.11)+noise(p*.009)*2.);
   float striation=sin(p.y*.19+noise(p*.025)*7.+p.x*.025);
   float veins=1.-smoothstep(.025,.10,abs(striation));
   vec3 col=mix(sand,horizon,smoothstep(160.,1600.,d)*.84);
   col*=.89+grain*.16;col=mix(col,vec3(.48,.33,.19),alluvium*.08+veins*.045);
   col+=vec3(.055,.043,.025)*smoothstep(.68,.88,grain);
   float facet=clamp(dot(normalize(terrainNormal),normalize(vec3(-.6,1.,.3))),0.,1.);col*=.90+.13*facet;
   gl_FragColor=vec4(col,1.);
   #include <colorspace_fragment>
  }`}));floor.name='地平线戈壁地面';environment.add(floor);
 const sky=new THREE.Mesh(new THREE.SphereGeometry(4100,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{zenith:{value:new THREE.Color(0xe9e6d6)},horizon:{value:new THREE.Color(0xf2e6c9)}},vertexShader:`varying vec3 direction;void main(){direction=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform vec3 zenith;uniform vec3 horizon;varying vec3 direction;void main(){float h=smoothstep(0.,.7,normalize(direction).y);gl_FragColor=vec4(mix(horizon,zenith,h),1.);
 #include <colorspace_fragment>
 }`}));sky.name='纸色空气天空';sky.renderOrder=-100;environment.add(sky);
 environment.userData.layers=layers;
 // A fixed terrain set: camera pitch never translates, rotates, or reorders mountains.
 // The four radii alone create parallax. Depth testing keeps all cards behind the plant.
 environment.userData.update=()=>{};
 return environment;
}
