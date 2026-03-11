import { usePlane, useBox } from '@react-three/cannon';

export default function Arena() {
  // Ground
  const [groundRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  // Walls
  const [wall1Ref] = useBox(() => ({
    position: [0, 2.5, -20],
    args: [40, 5, 1],
  }));

  const [wall2Ref] = useBox(() => ({
    position: [0, 2.5, 20],
    args: [40, 5, 1],
  }));

  const [wall3Ref] = useBox(() => ({
    position: [-20, 2.5, 0],
    args: [1, 5, 40],
  }));

  const [wall4Ref] = useBox(() => ({
    position: [20, 2.5, 0],
    args: [1, 5, 40],
  }));

  // Cover boxes - each hook must be called at top level
  const [cover1Ref] = useBox(() => ({
    position: [5, 1, 5],
    args: [2, 2, 2],
  }));

  const [cover2Ref] = useBox(() => ({
    position: [-5, 1, -5],
    args: [2, 2, 2],
  }));

  const [cover3Ref] = useBox(() => ({
    position: [10, 1, -8],
    args: [3, 2, 1.5],
  }));

  const [cover4Ref] = useBox(() => ({
    position: [-10, 1, 8],
    args: [3, 2, 1.5],
  }));

  const [cover5Ref] = useBox(() => ({
    position: [0, 1, 10],
    args: [4, 2, 2],
  }));

  return (
    <>
      {/* Ground */}
      <mesh ref={groundRef as any} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Grid pattern on ground */}
      <gridHelper args={[40, 20, '#444444', '#333333']} position={[0, 0.01, 0]} />

      {/* Walls */}
      <mesh ref={wall1Ref as any} castShadow receiveShadow>
        <boxGeometry args={[40, 5, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh ref={wall2Ref as any} castShadow receiveShadow>
        <boxGeometry args={[40, 5, 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh ref={wall3Ref as any} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 40]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh ref={wall4Ref as any} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 40]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Cover boxes */}
      <mesh ref={cover1Ref as any} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      <mesh ref={cover2Ref as any} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      <mesh ref={cover3Ref as any} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 1.5]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      <mesh ref={cover4Ref as any} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 1.5]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      <mesh ref={cover5Ref as any} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
    </>
  );
}
