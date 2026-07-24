import { useState, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html } from "@react-three/drei";

/**
 * InteractiveBody3D
 * ------------------------------------------------
 * ASSET NOTE: there's no real rigged/segmented human body model
 * available to me in this environment, so the body below is built from
 * primitive geometries (capsules/spheres) positioned to *represent* a
 * simplified figure — it's a fully functional, runnable stand-in, not a
 * placeholder image. Swap in a real GLTF for production by:
 *   1. Sourcing/commissioning a low-poly rigged body model where each
 *      muscle group is a separately-named mesh (e.g. "chest",
 *      "biceps_L", "biceps_R", ...) — the standard approach for
 *      clickable-region 3D anatomy viewers.
 *   2. Loading it with `useGLTF` from drei instead of the <MuscleGroup>
 *      primitives below.
 *   3. Keeping the same onClick/hover wiring — `useGLTF` gives you
 *      `nodes` keyed by mesh name, so `nodes.chest.geometry` slots into
 *      the same <mesh> + event handlers pattern used here.
 * Everything else (click-to-select, hover highlight, camera controls,
 * mobile fallback) works identically either way.
 */

const MUSCLE_LAYOUT = [
  { key: "CHEST", label: "Chest", position: [0, 1.15, 0.18], size: [0.5, 0.32, 0.22] },
  { key: "SHOULDERS", label: "Shoulders", position: [0.42, 1.35, 0], size: [0.22, 0.22, 0.22], mirror: true },
  { key: "BICEPS", label: "Biceps", position: [0.5, 0.95, 0.05], size: [0.14, 0.32, 0.14], mirror: true },
  { key: "TRICEPS", label: "Triceps", position: [0.5, 0.95, -0.1], size: [0.13, 0.3, 0.13], mirror: true },
  { key: "FOREARMS", label: "Forearms", position: [0.52, 0.55, 0.02], size: [0.12, 0.32, 0.12], mirror: true },
  { key: "ABS", label: "Abs", position: [0, 0.75, 0.2], size: [0.36, 0.34, 0.18] },
  { key: "BACK", label: "Back", position: [0, 1.1, -0.2], size: [0.5, 0.55, 0.18] },
  { key: "QUADS", label: "Quads", position: [0.18, 0.05, 0.1], size: [0.22, 0.55, 0.22], mirror: true },
  { key: "HAMSTRINGS", label: "Hamstrings", position: [0.18, 0.05, -0.12], size: [0.2, 0.5, 0.18], mirror: true },
  { key: "GLUTES", label: "Glutes", position: [0.13, 0.35, -0.16], size: [0.24, 0.22, 0.2], mirror: true },
  { key: "CALVES", label: "Calves", position: [0.16, -0.55, -0.05], size: [0.16, 0.4, 0.16], mirror: true }
];

function MuscleGroup({ def, mirrorSign, isSelected, isHovered, onSelect, onHover }) {
  const position = [def.position[0] * mirrorSign, def.position[1], def.position[2]];
  const color = isSelected ? "#a78bfa" : isHovered ? "#8b5cf6" : "#3d3456";
  const emissive = isSelected || isHovered ? "#8b5cf6" : "#000000";

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(def.key);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(def.key);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "auto";
      }}
    >
      <capsuleGeometry args={[def.size[0], def.size[1], 4, 8]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.4} roughness={0.5} />
    </mesh>
  );
}

function Body({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null);

  const groups = useMemo(() => {
    const flat = [];
    for (const def of MUSCLE_LAYOUT) {
      flat.push({ def, mirrorSign: 1 });
      if (def.mirror) flat.push({ def, mirrorSign: -1 });
    }
    return flat;
  }, []);

  return (
    <group>
      {/* Simplified head/torso base, non-interactive, just for visual context */}
      <mesh position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#2a2540" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.32, 0.9, 4, 8]} />
        <meshStandardMaterial color="#221e33" roughness={0.7} />
      </mesh>

      {groups.map(({ def, mirrorSign }, i) => (
        <MuscleGroup
          key={`${def.key}-${mirrorSign}-${i}`}
          def={def}
          mirrorSign={mirrorSign}
          isSelected={selected === def.key}
          isHovered={hovered === def.key}
          onSelect={onSelect}
          onHover={setHovered}
        />
      ))}

      {hovered && (
        <Html distanceFactor={8} position={[0, 2, 0]}>
          <div className="body3d-tooltip">
            {MUSCLE_LAYOUT.find((m) => m.key === hovered)?.label}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * @param {{ selectedMuscle: string|null, onSelectMuscle: (key: string) => void }} props
 */
export default function InteractiveBody3D({ selectedMuscle, onSelectMuscle }) {
  return (
    <div className="body3d-canvas-wrap">
      <Canvas
        camera={{ position: [1.6, 1.1, 1.6], fov: 40 }}
        dpr={[1, 1.5]} // cap device pixel ratio — mobile GPUs choke on dpr 3 canvases
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} />
        <Suspense fallback={null}>
          <Body selected={selectedMuscle} onSelect={onSelectMuscle} />
          <ContactShadows position={[0, -1.05, 0]} opacity={0.35} blur={2} />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={1.4} maxDistance={3.5} target={[0, 0.9, 0]} />
      </Canvas>
    </div>
  );
}
