import{a as u,j as c,C as z,u as B,V as b,b as k,B as N,c as l,d as y,e as D,A as E}from"./three-ywUWy7Hc.js";import{u as C,g as A,m as W,S as O}from"./index-C945TZG5.js";const V=`
  attribute vec3 aScatter;
  attribute vec3 aTarget;
  attribute float aDelay;
  attribute float aSeed;
  attribute float aT;
  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  varying float vMix;
  varying float vT;
  varying float vSeed;

  float easeS(float p) { return p * p * (3.0 - 2.0 * p); }

  void main() {
    float p = clamp((uProgress * 1.6 - aDelay) / 1.0, 0.0, 1.0);
    p = easeS(p);
    vMix = p;
    vT = aT;
    vSeed = aSeed;

    vec3 drift = vec3(
      sin(uTime * 0.35 + aSeed * 17.0),
      cos(uTime * 0.28 + aSeed * 23.0),
      sin(uTime * 0.22 + aSeed * 11.0)
    ) * 0.38 * (1.0 - p);

    vec3 breathe = vec3(
      sin(uTime * 0.9 + aSeed * 40.0),
      cos(uTime * 0.8 + aSeed * 31.0),
      0.0
    ) * 0.05 * p;

    vec3 pos = mix(aScatter + drift, aTarget + breathe, p);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float sz = uSize * (0.8 + aSeed * 0.9) * (1.0 + p * 0.55);
    gl_PointSize = sz * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`,_=`
  precision highp float;
  uniform vec3 uColNoise;
  uniform vec3 uColA;
  uniform vec3 uColB;
  uniform vec3 uColRed;
  uniform float uPulse;
  uniform float uTime;
  uniform float uOpacity;
  varying float vMix;
  varying float vT;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.12, d);

    vec3 lineCol = mix(uColA, uColB, vT);

    // Tick-data flicker while in the noise phase.
    float tick = step(0.965, fract(vSeed * 91.17 + floor(uTime * 2.5) * 0.618034));
    vec3 flick = mix(uColRed, uColA, step(0.5, fract(vSeed * 57.29)));
    vec3 noiseCol = mix(uColNoise, flick, tick * 0.85);

    vec3 col = mix(noiseCol, lineCol, vMix);

    // Travelling light pulse along the formed line.
    float pd = abs(vT - uPulse);
    float pulse = (1.0 - smoothstep(0.0, 0.06, pd)) * vMix;
    col += pulse * 1.6 * lineCol;

    float baseA = mix(0.32, 0.85, vMix);
    gl_FragColor = vec4(col, alpha * baseA * uOpacity);
  }
`;function G(e){return(e()+e()+e()+e()-2)/2}function H(){const{viewport:e,gl:v}=B(),n=u.useRef(null),a=u.useRef(null),o=u.useMemo(()=>typeof window<"u"&&window.innerWidth<768?4e3:9e3,[]),{geometry:j}=u.useMemo(()=>{const r=W(1337),p=Number.isFinite(e.width)&&e.width>0?e.width:12,d=Number.isFinite(e.height)&&e.height>0?e.height:8,x=[[7,21],[12,15],[16,18],[22,10]].map(([t,s])=>{const h=((t-7)/15-.5)*p*.72,w=((21-s)/11-.5)*d*.34-d*.18;return new b(h,w,0)}),P=new k(x,!1,"catmullrom",.6),m=new Float32Array(o*3),g=new Float32Array(o*3),M=new Float32Array(o),R=new Float32Array(o),F=new Float32Array(o),S=new b,T=new b;for(let t=0;t<o;t++){const s=Math.min(.9999,Math.max(0,t/(o-1)+(r()-.5)*.002)),h=P.getPoint(s);P.getTangent(s,S),T.set(-S.y,S.x,0).normalize();const w=G(r)*.1;g[t*3]=h.x+T.x*w,g[t*3+1]=h.y+T.y*w,g[t*3+2]=(r()-.5)*.7,m[t*3]=(r()-.5)*p*1.15,m[t*3+1]=(r()-.5)*d*1.15,m[t*3+2]=(r()-.5)*3,M[t]=s*.6+r()*.08,R[t]=r(),F[t]=s}const i=new N;return i.setAttribute("position",new l(m.slice(),3)),i.setAttribute("aScatter",new l(m,3)),i.setAttribute("aTarget",new l(g,3)),i.setAttribute("aDelay",new l(M,1)),i.setAttribute("aSeed",new l(R,1)),i.setAttribute("aT",new l(F,1)),{geometry:i}},[o,e.width,e.height]),f=u.useMemo(()=>({uProgress:{value:0},uTime:{value:0},uPulse:{value:-.2},uOpacity:{value:1},uSize:{value:.052*Math.min(v.getPixelRatio(),2)},uColNoise:{value:new y("#64748b")},uColA:{value:new y("#34d399")},uColB:{value:new y("#3987e5")},uColRed:{value:new y("#d03b3b")}}),[v]);return C(()=>{A.to(f.uProgress,{value:1,duration:1.6,delay:1.1,ease:"power3.inOut"}),A.fromTo(f.uPulse,{value:-.15},{value:1.15,duration:1.6,ease:"none",repeat:-1,repeatDelay:2.6,delay:3.2})},[f]),D((r,p)=>{if(f.uTime.value+=p,a.current){const d=r.pointer.y*.06,x=r.pointer.x*.09;a.current.rotation.x+=(d-a.current.rotation.x)*.05,a.current.rotation.y+=(x-a.current.rotation.y)*.05}}),c.jsx("group",{ref:a,children:c.jsx("points",{geometry:j,frustumCulled:!1,children:c.jsx("shaderMaterial",{ref:n,vertexShader:V,fragmentShader:_,uniforms:f,transparent:!0,depthWrite:!1,blending:E})})})}function I({active:e,onContextLost:v}){const n=u.useRef(null);return C(()=>{var o;const a=((o=n.current)==null?void 0:o.closest("section"))??n.current;A.to(n.current,{opacity:0,y:-90,scale:1.05,ease:"none",scrollTrigger:{trigger:a,start:"top top",end:"bottom 25%",scrub:!0}})},{scope:n}),C(()=>{const a=window.setTimeout(()=>O.refresh(),120);return()=>window.clearTimeout(a)},[]),c.jsx("div",{ref:n,"aria-hidden":!0,className:"absolute inset-0",children:c.jsx(z,{dpr:[1,typeof window<"u"&&window.innerWidth<768?1.5:2],camera:{position:[0,0,9],fov:50},frameloop:e?"always":"never",gl:{antialias:!1,alpha:!0,powerPreference:"high-performance"},onCreated:({gl:a})=>{a.domElement.addEventListener("webglcontextlost",o=>{o.preventDefault(),v()},!1)},children:c.jsx(H,{})})})}export{I as default};
