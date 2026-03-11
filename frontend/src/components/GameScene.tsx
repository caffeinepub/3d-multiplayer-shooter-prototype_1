import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere, useBox, usePlane } from '@react-three/cannon';
import { Vector3 } from 'three';
import * as THREE from 'three';
import type { Identity } from '@icp-sdk/core/agent';
import { useGameState } from '../hooks/useGameState';
import Player from './Player';
import Arena from './Arena';
import WeaponPickup from './WeaponPickup';

interface GameSceneProps {
  sessionId: string;
  identity?: Identity;
}

export default function GameScene({ sessionId, identity }: GameSceneProps) {
  const { camera } = useThree();
  const {
    localPlayer,
    otherPlayers,
    weaponSpawns,
    updatePosition,
    shoot,
    pickupWeapon,
    respawn,
  } = useGameState(sessionId, identity);

  const moveSpeed = 0.15;
  const rotateSpeed = 0.002;
  const keys = useRef<{ [key: string]: boolean }>({});
  const mouseMovement = useRef({ x: 0, y: 0 });
  const cameraRotation = useRef({ horizontal: 0, vertical: 0 });
  const isPointerLocked = useRef(false);

  // Player physics body
  const [playerRef, playerApi] = useSphere(() => ({
    mass: 1,
    position: [0, 2, 0],
    args: [0.5],
    fixedRotation: true,
  }));

  const playerPosition = useRef<Vector3>(new Vector3(0, 2, 0));

  useEffect(() => {
    const unsubscribe = playerApi.position.subscribe((p) => {
      playerPosition.current.set(p[0], p[1], p[2]);
    });
    return unsubscribe;
  }, [playerApi]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' && localPlayer && !localPlayer.isAlive) {
        respawn();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && isPointerLocked.current && localPlayer?.isAlive) {
        shoot();
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPointerLocked.current) {
        mouseMovement.current.x = e.movementX;
        mouseMovement.current.y = e.movementY;
      }
    };

    const handleClick = () => {
      if (!isPointerLocked.current) {
        document.body.requestPointerLock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.body.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.body.removeEventListener('click', handleClick);
    };
  }, [localPlayer, shoot, respawn]);

  // Game loop
  useFrame(() => {
    if (!localPlayer?.isAlive) return;

    // Handle mouse rotation
    if (mouseMovement.current.x !== 0 || mouseMovement.current.y !== 0) {
      cameraRotation.current.horizontal -= mouseMovement.current.x * rotateSpeed;
      cameraRotation.current.vertical -= mouseMovement.current.y * rotateSpeed;
      cameraRotation.current.vertical = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, cameraRotation.current.vertical)
      );
      mouseMovement.current.x = 0;
      mouseMovement.current.y = 0;
    }

    // Calculate movement direction
    const forward = new Vector3(
      Math.sin(cameraRotation.current.horizontal),
      0,
      Math.cos(cameraRotation.current.horizontal)
    );
    const right = new Vector3(
      Math.sin(cameraRotation.current.horizontal + Math.PI / 2),
      0,
      Math.cos(cameraRotation.current.horizontal + Math.PI / 2)
    );

    const velocity = new Vector3(0, 0, 0);

    if (keys.current['w']) velocity.add(forward);
    if (keys.current['s']) velocity.sub(forward);
    if (keys.current['a']) velocity.sub(right);
    if (keys.current['d']) velocity.add(right);

    if (velocity.length() > 0) {
      velocity.normalize().multiplyScalar(moveSpeed);
      playerApi.velocity.set(velocity.x, 0, velocity.z);
    } else {
      playerApi.velocity.set(0, 0, 0);
    }

    // Update camera position (third-person)
    const cameraDistance = 5;
    const cameraHeight = 2;
    const cameraOffset = new Vector3(
      -Math.sin(cameraRotation.current.horizontal) * cameraDistance,
      cameraHeight + Math.sin(cameraRotation.current.vertical) * 2,
      -Math.cos(cameraRotation.current.horizontal) * cameraDistance
    );

    camera.position.copy(playerPosition.current).add(cameraOffset);
    camera.lookAt(playerPosition.current);

    // Update backend position
    updatePosition({
      x: playerPosition.current.x,
      y: playerPosition.current.y,
      z: playerPosition.current.z,
    });

    // Check weapon pickups
    weaponSpawns.forEach((spawn) => {
      const distance = playerPosition.current.distanceTo(
        new Vector3(spawn.x, spawn.y, spawn.z)
      );
      if (distance < 1.5) {
        pickupWeapon(spawn.weapon, spawn);
      }
    });
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight intensity={0.3} groundColor="#444444" />

      {/* Arena */}
      <Arena />

      {/* Local Player (invisible, just physics) */}
      <mesh ref={playerRef as any} visible={false}>
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Other Players */}
      {otherPlayers.map((player) => (
        <Player
          key={player.principal}
          position={player.position}
          isAlive={player.isAlive}
          health={player.health}
        />
      ))}

      {/* Weapon Pickups */}
      {weaponSpawns.map((spawn, index) => (
        <WeaponPickup key={index} position={spawn} weapon={spawn.weapon} />
      ))}
    </>
  );
}
