import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Position } from '../backend';

interface PlayerProps {
  position: Position;
  isAlive: boolean;
  health: number;
}

export default function Player({ position, isAlive, health }: PlayerProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position.x, position.y, position.z);
    }
  });

  if (!isAlive) return null;

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.6, 1.5, 0.4]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#ffb380" />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, 0.6, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[0.4, 0.6, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>

      {/* Health bar above player */}
      <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.5 + (health / 100) * 0.5, 2.5, 0.01]} rotation={[0, 0, 0]}>
        <planeGeometry args={[health / 100, 0.08]} />
        <meshBasicMaterial color={health > 50 ? '#4ade80' : health > 25 ? '#fbbf24' : '#ef4444'} />
      </mesh>
    </group>
  );
}
