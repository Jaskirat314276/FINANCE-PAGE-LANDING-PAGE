import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap, ScrollTrigger } from '../motion/gsap';
import { useGSAP } from '@gsap/react';
import { mulberry32 } from '@/lib/utils';

/*
 * Signature Animation #1 — "Noise → Signal".
 * Phase A: brownian market chaos. Phase B: particles snap onto the Seeker
 * chart-line (the logo polyline as a CatmullRom ribbon), emerald→blue.
 * Phase C: breathing + a light pulse travelling the curve.
 */

const VERT = /* glsl */ `
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
`;

const FRAG = /* glsl */ `
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
`;

function gauss(rnd: () => number) {
  return (rnd() + rnd() + rnd() + rnd() - 2) / 2;
}

function Particles() {
  const { viewport, gl } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);

  const count = useMemo(
    () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 4000 : 9000),
    [],
  );

  const { geometry } = useMemo(() => {
    const rnd = mulberry32(1337);
    // Guard: R3F reports 0×0 (NaN aspect) on its first measure pass.
    const W = Number.isFinite(viewport.width) && viewport.width > 0 ? viewport.width : 12;
    const H = Number.isFinite(viewport.height) && viewport.height > 0 ? viewport.height : 8;

    // Seeker logo polyline (viewBox 32, y-down): (7,21) (12,15) (16,18) (22,10)
    const pts = [
      [7, 21],
      [12, 15],
      [16, 18],
      [22, 10],
    ].map(([x, y]) => {
      const nx = ((x - 7) / 15 - 0.5) * W * 0.72;
      const ny = ((21 - y) / 11 - 0.5) * H * 0.34 - H * 0.18;
      return new THREE.Vector3(nx, ny, 0);
    });
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.6);

    const scatter = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const delay = new Float32Array(count);
    const seed = new Float32Array(count);
    const tArr = new Float32Array(count);

    const tangent = new THREE.Vector3();
    const normal = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      const t = Math.min(0.9999, Math.max(0, i / (count - 1) + (rnd() - 0.5) * 0.002));
      const p = curve.getPoint(t);
      curve.getTangent(t, tangent);
      normal.set(-tangent.y, tangent.x, 0).normalize();
      const off = gauss(rnd) * 0.1;

      target[i * 3] = p.x + normal.x * off;
      target[i * 3 + 1] = p.y + normal.y * off;
      target[i * 3 + 2] = (rnd() - 0.5) * 0.7;

      scatter[i * 3] = (rnd() - 0.5) * W * 1.15;
      scatter[i * 3 + 1] = (rnd() - 0.5) * H * 1.15;
      scatter[i * 3 + 2] = (rnd() - 0.5) * 3;

      delay[i] = t * 0.6 + rnd() * 0.08;
      seed[i] = rnd();
      tArr[i] = t;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(scatter.slice(), 3)); // required by three
    g.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
    g.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
    g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aT', new THREE.BufferAttribute(tArr, 1));
    return { geometry: g };
  }, [count, viewport.width, viewport.height]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPulse: { value: -0.2 },
      uOpacity: { value: 1 },
      uSize: { value: 0.052 * Math.min(gl.getPixelRatio(), 2) },
      uColNoise: { value: new THREE.Color('#64748b') },
      uColA: { value: new THREE.Color('#34d399') },
      uColB: { value: new THREE.Color('#3987e5') },
      uColRed: { value: new THREE.Color('#d03b3b') },
    }),
    [gl],
  );

  useGSAP(() => {
    // Phase B — the morph. 1.1s of chaos, then 1.6s snap-to-signal.
    gsap.to(uniforms.uProgress, { value: 1, duration: 1.6, delay: 1.1, ease: 'power3.inOut' });
    // Phase C — recurring pulse along the line.
    gsap.fromTo(
      uniforms.uPulse,
      { value: -0.15 },
      { value: 1.15, duration: 1.6, ease: 'none', repeat: -1, repeatDelay: 2.6, delay: 3.2 },
    );
  }, [uniforms]);

  useFrame((state, dt) => {
    uniforms.uTime.value += dt;
    if (group.current) {
      // Mouse parallax — lerp toward pointer.
      const rx = state.pointer.y * 0.06;
      const ry = state.pointer.x * 0.09;
      group.current.rotation.x += (rx - group.current.rotation.x) * 0.05;
      group.current.rotation.y += (ry - group.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={mat}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function HeroCanvas({
  active,
  onContextLost,
}: {
  active: boolean;
  onContextLost: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Scroll exit — the signal dissolves upward as the hero leaves.
      const heroSection = wrap.current?.closest('section') ?? wrap.current;
      gsap.to(wrap.current, {
        opacity: 0,
        y: -90,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom 25%', scrub: true },
      });
    },
    { scope: wrap },
  );

  // Re-measure pinned sections once the canvas exists.
  useGSAP(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div ref={wrap} aria-hidden className="absolute inset-0">
      <Canvas
        dpr={[1, typeof window !== 'undefined' && window.innerWidth < 768 ? 1.5 : 2]}
        camera={{ position: [0, 0, 9], fov: 50 }}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (e) => {
              e.preventDefault();
              onContextLost();
            },
            false,
          );
        }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
