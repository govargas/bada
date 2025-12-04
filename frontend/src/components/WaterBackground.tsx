import { useRef } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";

// Custom water shader material - High quality procedural generation
// Updated for a "Summery Swedish Lake" vibe in dark theme
// Lighter, clearer, crisper ripples
class WaterMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        // Deep Teal/Blue - calm and inviting, not scary black
        uColorDeep: { value: new THREE.Color("#2A6F97") },

        // Clear Ocean Blue
        uColorMid: { value: new THREE.Color("#61A5C2") },

        // Bright Azure/Turquoise
        uColorShallow: { value: new THREE.Color("#A9D6E5") },

        // Soft Highlights
        uColorHighlight: { value: new THREE.Color("#ffffff") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormal;
        
        // Simplex noise
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
        
        void main() {
          vUv = uv;
          
          float t = uTime * 0.2; // Slower, calmer movement
          
          // Gentle, organic ripples using overlapping sine waves at different angles
          float elevation = 0.0;
          
          // Primary swell
          elevation += sin(position.x * 0.3 + t) * 0.15;
          elevation += sin(position.y * 0.2 + t * 0.8) * 0.15;
          
          // Secondary ripples (diagonal)
          elevation += sin((position.x + position.y) * 0.5 + t * 1.2) * 0.1;
          elevation += sin((position.x - position.y) * 0.4 + t * 0.9) * 0.1;
          
          // Fine detail noise for water surface texture
          float noiseVal = snoise(vec3(position.x * 3.5, position.y * 3.5, t * 0.8));
          elevation += noiseVal * 0.06;
          
          vElevation = elevation;

          // Calculate Normal for lighting
          float eps = 0.01; 
          
          // Function to calculate height at any point (needs to match above logic)
          #define GET_HEIGHT(p) (sin(p.x*0.3 + t)*0.15 + sin(p.y*0.2 + t*0.8)*0.15 + sin((p.x+p.y)*0.5 + t*1.2)*0.1 + sin((p.x-p.y)*0.4 + t*0.9)*0.1 + snoise(vec3(p.x*3.5, p.y*3.5, t*0.8))*0.06)

          float h = elevation;
          float hx = GET_HEIGHT((position + vec3(eps, 0, 0)));
          float hy = GET_HEIGHT((position + vec3(0, eps, 0)));
          
          // Normal calculation
          vNormal = normalize(vec3(hx - h, hy - h, 0.025)); // Lower Z component for stronger perceived slopes
          
          vec3 newPosition = position;
          newPosition.z += elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorDeep;
        uniform vec3 uColorMid;
        uniform vec3 uColorShallow;
        uniform vec3 uColorHighlight;
        
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormal;
        
        void main() {
          // Mix based on height
          float mixStrength = smoothstep(-0.2, 0.2, vElevation);
          
          vec3 color = mix(uColorDeep, uColorMid, mixStrength);
          color = mix(color, uColorShallow, smoothstep(0.1, 0.4, vElevation)); // Highlights on peaks
          
          // Specular Lighting (Sun/Moon reflection)
          vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
          vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
          vec3 halfDir = normalize(lightDir + viewDir);
          
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 100.0);
          
          // Add specular highlight
          color += uColorHighlight * spec * 0.5;
          
          // Fresnel-ish effect (lighter at edges/angles)
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
          color = mix(color, uColorShallow, fresnel * 0.4);

          gl_FragColor = vec4(color, 1.0);
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

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -2, -4]}>
      <planeGeometry args={[60, 60, 512, 512]} />
      <waterMaterial ref={materialRef} />
    </mesh>
  );
}

export default function WaterBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 4, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#2A6F97"]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[2, 5, 2]} intensity={2.0} />
        <Water />
      </Canvas>
    </div>
  );
}
