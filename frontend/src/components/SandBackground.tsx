import { useRef } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";

// Procedural Beach Texture Shader
class BeachTextureMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        // Warmer, more golden/beige sand
        uSandColor: { value: new THREE.Color("#ede2ce") },
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

        // --- Drops Function ---
        // (Deleted)

        void main() {
            // Adjust UV for aspect ratio
            float aspect = uResolution.x / uResolution.y;
            vec2 uv = vUv * vec2(aspect, 1.0);
            
            // --- Sand Generation (with Stones/Debris) ---
            
            // 1. Base Sand
            float grain = snoise(uv * 300.0); 
            vec3 sandBase = uSandColor + vec3(grain * 0.04);
            
            // 2. Small Stones / Debris (Disabled)
            // float debrisNoise = snoise(uv * 25.0 + vec2(15.0, 5.0)); 
            // float stones = smoothstep(0.95, 0.95, debrisNoise); 
            
            // Darker brownish/grey color for stones
            // vec3 stoneColor = vec3(0.45, 0.4, 0.35);
            // Mix stones in
            // sandBase = mix(sandBase, stoneColor, stones * 0.5);

            // --- Shadows (Leaves/Log) ---
            // Large, slow moving shadows from above
            float shadowTime = uTime * 0.05;
            float shadowN = snoise(uv * 1.5 + vec2(shadowTime, 0.0));
            float shadowMask = smoothstep(0.2, 0.6, shadowN); // Soft shadows
            
            // Darken sand where there are shadows
            sandBase = mix(sandBase, sandBase * 0.75, shadowMask);

            // --- Water Hybrid (Silk + Caustics) ---
            // Hybrid approach: 
            // - "Silk" comes from domain warping (distorting the coordinates)
            // - "Caustics" comes from the ridge noise (1.0 - abs(noise))
            
            float t = uTime * 0.10; // Slightly slower for relaxed feel
            
            // 1. Domain Warping (The "Silk" Part)
            // We warp the coordinate space slightly before sampling the ripple noise.
            // This curves the straight lines of the caustics.
            vec2 warp = vec2(
                snoise(uv * 2.0 + vec2(0.0, t)),
                snoise(uv * 2.0 + vec2(5.2, t + 1.3))
            ) * 0.15; // Strength of the warp
            
            vec2 flowUV = uv + warp;
            
            // 2. Caustic Ripples (The "Water" Part) - Moving Up
            vec2 flow1 = vec2(0.0, -t);
            float n1 = snoise(flowUV * 6.0 + flow1);
            
            vec2 flow2 = vec2(0.05, -t * 1.4);
            float n2 = snoise(flowUV * 10.0 + flow2 + vec2(3.2, 1.5));
            
            // Combine using "ridge" function
            float ridges = (
                (1.0 - abs(n1)) * 0.6 + 
                (1.0 - abs(n2)) * 0.4
            );
            
            // 3. Hybrid Softening
            // Lower power than pure caustics (was 5.0) to make it softer/silkier
            // but keep enough definition to look like water
            float caustic = pow(ridges, 4.0); 

            // Reduced intensity to avoid "burning" white look (was 0.6)
            float totalLight = caustic * 0.2;
            
            // --- Refraction ---
            // Distort sand based on water pattern
            vec2 waterGrad = vec2(n1, n2) * 0.005;
            float refractedGrain = snoise((uv + waterGrad) * 300.0);
            
            // Refracted stones
            // float refractedDebris = snoise((uv + waterGrad) * 25.0 + vec2(15.0, 5.0));
            // float refractedStones = smoothstep(0.75, 0.85, refractedDebris);
            
            // Refracted Shadows
            float refractedShadowN = snoise((uv + waterGrad) * 1.5 + vec2(shadowTime, 0.0));
            float refractedShadowMask = smoothstep(0.2, 0.6, refractedShadowN);
            
            // Re-compose sand with refraction
            vec3 finalSand = uSandColor + vec3(refractedGrain * 0.04);
            // finalSand = mix(finalSand, stoneColor, refractedStones * 0.5);
            finalSand = mix(finalSand, finalSand * 0.75, refractedShadowMask);
            
            // --- Composition ---
            vec3 finalColor = mix(finalSand, uWaterTint, 0.15);
            finalColor += vec3(1.0, 1.0, 0.95) * totalLight;
            
            // Vignette
            float vignette = smoothstep(0.0, 0.15, vUv.y);
            finalColor = mix(finalColor * 0.9, finalColor, vignette);

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
