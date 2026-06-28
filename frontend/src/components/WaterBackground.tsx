import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";

// Shared 3D simplex noise (Ashima/Stefan Gustavson) reused in both stages.
const NOISE_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

// Custom water shader material - High quality procedural generation
// "Summery Swedish Lake" vibe for the dark theme: clear teal water,
// FBM swell, analytic normals, fresnel sky reflection and sun glitter.
class WaterMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        // Deep Teal/Blue - calm and inviting, not scary black
        uColorDeep: { value: new THREE.Color("#1F5E84") },
        // Clear Ocean Blue
        uColorMid: { value: new THREE.Color("#61A5C2") },
        // Bright Azure/Turquoise
        uColorShallow: { value: new THREE.Color("#A9D6E5") },
        // Soft Highlights (sun glitter / foam)
        uColorHighlight: { value: new THREE.Color("#ffffff") },
        // Sky tint used for the grazing-angle reflection
        uSky: { value: new THREE.Color("#D7EEF6") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        ${NOISE_GLSL}

        // 3-octave fractal noise for organic, non-repeating swell detail.
        float fbm(vec3 p) {
          float f = 0.0;
          float a = 0.5;
          for (int i = 0; i < 3; i++) {
            f += a * snoise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return f;
        }

        // Height field: directional swell + fbm chop. Single source of truth so
        // the analytic normal below stays consistent with the displacement.
        float waterHeight(vec2 p, float t) {
          float h = 0.0;
          h += sin(p.x * 0.30 + t) * 0.14;
          h += sin(p.y * 0.20 + t * 0.8) * 0.14;
          h += sin((p.x + p.y) * 0.50 + t * 1.2) * 0.07;
          h += fbm(vec3(p * 0.70, t * 0.5)) * 0.16;
          return h;
        }

        void main() {
          vUv = uv;
          float t = uTime * 0.2; // slow, calm movement

          float h = waterHeight(position.xy, t);
          vElevation = h;

          // Analytic surface normal from the height gradient (central-ish diff).
          float e = 0.1;
          float hx = waterHeight(position.xy + vec2(e, 0.0), t);
          float hy = waterHeight(position.xy + vec2(0.0, e), t);
          vec3 localN = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));
          vNormal = normalize(normalMatrix * localN);

          vec3 newPosition = position;
          newPosition.z += h;

          vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorDeep;
        uniform vec3 uColorMid;
        uniform vec3 uColorShallow;
        uniform vec3 uColorHighlight;
        uniform vec3 uSky;

        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        ${NOISE_GLSL}

        void main() {
          vec3 N = normalize(vNormal);

          // High-frequency micro-ripple normal so the low-poly mesh still reads
          // as a finely textured surface (detail lives here, not in geometry).
          vec2 wp = vWorldPos.xz;
          float t2 = uTime * 0.25;
          float n0 = snoise(vec3(wp * 1.8, t2));
          float nx = snoise(vec3((wp + vec2(0.18, 0.0)) * 1.8, t2));
          float ny = snoise(vec3((wp + vec2(0.0, 0.18)) * 1.8, t2));
          vec3 detail = vec3(-(nx - n0), 0.0, -(ny - n0)) * 1.1;
          N = normalize(N + detail);

          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          vec3 lightDir = normalize(vec3(0.4, 0.85, 0.35));
          vec3 halfDir = normalize(lightDir + viewDir);

          // Depth-ramped base colour.
          float depthMix = smoothstep(-0.22, 0.22, vElevation);
          vec3 color = mix(uColorDeep, uColorMid, depthMix);
          color = mix(color, uColorShallow, smoothstep(0.12, 0.40, vElevation));

          // Fresnel sky reflection - brighter toward grazing angles / horizon.
          float fresnel = pow(1.0 - max(dot(N, viewDir), 0.0), 4.0);
          color = mix(color, uSky, clamp(fresnel, 0.0, 1.0) * 0.5);

          // Sun glitter: tight specular broken into sparse glints by hi-freq
          // noise. The glints ride on top of the specular lobe so they cluster
          // where the surface faces the light, rather than fizzing everywhere.
          float spec = pow(max(dot(N, halfDir), 0.0), 220.0);
          float glitter = smoothstep(0.70, 1.0, snoise(vec3(wp * 3.0, uTime * 0.6)));
          color += uColorHighlight * spec * (0.18 + glitter * 0.55);

          // Faint foam only on the very highest crests.
          float foamN = snoise(vec3(wp * 2.5, uTime * 0.3));
          float foam = smoothstep(0.24, 0.34, vElevation + foamN * 0.05);
          color = mix(color, vec3(0.95, 0.97, 1.0), foam * 0.08);

          gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
        }
      `,
    });
  }
}

extend({ WaterMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterMaterial: any;
    }
  }
}

function Water() {
  const materialRef = useRef<WaterMaterial>(null);
  const invalidate = useThree((s) => s.invalidate);

  // Drive the on-demand render loop at ~30fps. Smooth water doesn't need 60,
  // and RAF pauses on hidden tabs so we don't burn cycles in the background.
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (ts: number) => {
      if (ts - last >= 33) {
        last = ts;
        invalidate();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -2, -4]}>
      <planeGeometry args={[60, 60, 128, 128]} />
      <waterMaterial ref={materialRef} />
    </mesh>
  );
}

export default function WaterBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full" aria-hidden="true">
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 4, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#1F5E84"]} />
        <ambientLight intensity={1.0} />
        <directionalLight position={[2, 5, 2]} intensity={1.2} />
        <Water />
      </Canvas>
    </div>
  );
}
