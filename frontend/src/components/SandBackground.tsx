import { useRef } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";

// Procedural Beach Texture Shader
// Improved based on feedback:
// - Warmer sand colors, clearer blue water (less green)
// - "Droppy" / Organic water ripple texture using layered noise and domain warping
class BeachTextureMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        // Warmer, more golden/beige sand
        uSandColor: { value: new THREE.Color("#efebe4") },
        // Clearer, subtle blue tint (less teal/green)
        uWaterTint: { value: new THREE.Color("#B0D4E8") },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uSandColor;
        uniform vec3 uWaterTint;
        varying vec2 vUv;

        // --- Noise Functions ---
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
            // Adjust UV for aspect ratio
            float aspect = uResolution.x / uResolution.y;
            vec2 uv = vUv * vec2(aspect, 1.0);
            
            // --- Water Simulation (Organic / Droppy) ---
            float speed = 0.05; // Slower speed
            float flowTime = uTime * speed;
            
            // Domain warping for organic feel
            vec2 q = vec2(0.);
            q.x = snoise(uv + vec2(0.0, flowTime));
            q.y = snoise(uv + vec2(1.0, flowTime));
            
            vec2 r = vec2(0.);
            r.x = snoise(uv + 1.0*q + vec2(1.7, 9.2) + 0.05*uTime);
            r.y = snoise(uv + 1.0*q + vec2(8.3, 2.8) + 0.04*uTime);
            
            float f = snoise(uv + r);
            
            // "Droppy" ripples: Combine sine waves with warped noise
            // Moving upwards mainly
            float wavePhase = uv.y * 8.0 - uTime * 0.3; // Slower wave phase
            // Distort the phase with the noise
            wavePhase += f * 1.5;
            
            float wave = sin(wavePhase);
            
            // Create caustic network pattern
            // Absolute value creates sharp ridges -> "caustics"
            float caustic = abs(wave);
            caustic = 1.0 - caustic; // Invert so crests are 1.0
            caustic = pow(caustic, 4.0); // Sharpen
            
            // Secondary smaller ripples for detail
            float smallRipples = snoise(uv * 15.0 + uTime * 0.2); // Slower small ripples
            float causticDetail = smoothstep(0.4, 0.8, smallRipples);
            
            // Combine
            float totalCaustic = caustic * 0.6 + causticDetail * 0.2; // Reduced intensity
            
            // --- Refraction ---
            // Stronger distortion for "droppy" look
            vec2 distort = vec2(
                cos(wavePhase) * 0.005,
                sin(wavePhase) * 0.005
            );
            vec2 sandUv = uv + distort;
            
            // --- Sand Generation ---
            // Warm, granular sand
            float grain = snoise(sandUv * 500.0); 
            float patches = snoise(sandUv * 5.0);
            
            vec3 sandColor = uSandColor;
            // Variation based on wetness/depth
            sandColor *= 0.9 + 0.1 * patches;
            
            // Add grain
            sandColor += vec3(grain * 0.04);
            
            // --- Composition ---
            vec3 finalColor = sandColor;
            
            // Water Tint
            // Clear blue, more opaque in deeper parts (low wave height)
            float depth = 0.5 + 0.5 * sin(wavePhase); // 0..1
            vec3 waterColor = uWaterTint;
            // Apply tint more where water is "deep" or just generally
            finalColor = mix(finalColor, waterColor, 0.15);
            
            // Add Caustics (Light focusing)
            vec3 highlightColor = vec3(1.0, 1.0, 0.95);
            finalColor += totalCaustic * highlightColor * 0.5;
            
            // Specular Sparkles (Sun reflection)
            // High frequency noise threshold - significantly reduced
            float sparkleNoise = snoise(uv * 40.0 + uTime * 0.5);
            float sparkle = smoothstep(0.8, 1.0, sparkleNoise) * smoothstep(0.4, 0.6, depth); 
            finalColor += sparkle * vec3(1.0, 1.0, 1.0) * 0.3; // Much subtler sparkles

            // Vignette for depth
            float vignette = smoothstep(0.0, 0.2, vUv.y); // Darker at bottom
            finalColor = mix(finalColor * 0.8, finalColor, vignette);

            gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }
}

extend({ BeachTextureMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      beachTextureMaterial: any;
    }
  }
}

function BeachScene() {
  const materialRef = useRef<BeachTextureMaterial>(null);

  useFrame(({ clock, size }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uResolution.value.set(
        size.width,
        size.height
      );
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <beachTextureMaterial ref={materialRef} />
    </mesh>
  );
}

export default function SandBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#efebe4"]} />
        <BeachScene />
      </Canvas>
    </div>
  );
}
