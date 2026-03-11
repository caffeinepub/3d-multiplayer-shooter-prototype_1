import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Position } from '../backend';

interface WeaponPickupProps {
  position: Position & { weapon: string };
  weapon: string;
}

export default function WeaponPickup({ position, weapon }: WeaponPickupProps) {
  const meshRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y = time.current;
      meshRef.current.position.y = position.y + Math.sin(time.current * 2) * 0.1;
    }
  });

  const getWeaponColor = () => {
    switch (weapon) {
      case 'Rifle':
        return '#ff6b35';
      case 'Shotgun':
        return '#4ecdc4';
      case 'SMG':
        return '#ffe66d';
      default:
        return '#95a5a6';
    }
  };

  return (
    <group ref={meshRef} position={[position.x, position.y, position.z]}>
      {/* Weapon model */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.2, 0.2]} />
        <meshStandardMaterial color={getWeaponColor()} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glow effect */}
      <pointLight intensity={0.5} distance={3} color={getWeaponColor()} />

      {/* Base platform */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
        <meshStandardMaterial color="#333333" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
