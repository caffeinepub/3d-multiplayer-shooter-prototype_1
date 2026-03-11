import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { Identity } from '@icp-sdk/core/agent';
import type { Position } from '../backend';
import {
  useCreateSession,
  useJoinSession,
  useUpdatePlayerPosition,
  useShootPlayer,
  usePickUpWeapon,
  useRespawnPlayer,
  useGetPlayerState,
} from './useQueries';

interface LocalPlayerState {
  health: number;
  isAlive: boolean;
  ammo: number;
  currentWeapon: string;
  position: Position;
}

interface OtherPlayerState {
  principal: string;
  position: Position;
  health: number;
  isAlive: boolean;
}

interface WeaponSpawn extends Position {
  weapon: string;
}

export function useGameState(sessionId: string, identity?: Identity) {
  const [localPlayer, setLocalPlayer] = useState<LocalPlayerState | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<OtherPlayerState[]>([]);
  const [weaponSpawns] = useState<WeaponSpawn[]>([
    { x: 10, y: 0.5, z: 5, weapon: 'Rifle' },
    { x: -15, y: 0.5, z: -10, weapon: 'Shotgun' },
    { x: 20, y: 0.5, z: 15, weapon: 'SMG' },
  ]);

  const createSessionMutation = useCreateSession();
  const joinSessionMutation = useJoinSession();
  const updatePositionMutation = useUpdatePlayerPosition();
  const shootPlayerMutation = useShootPlayer();
  const pickUpWeaponMutation = usePickUpWeapon();
  const respawnPlayerMutation = useRespawnPlayer();

  const principal = identity?.getPrincipal();
  const { data: playerState, refetch } = useGetPlayerState(sessionId, principal);

  const hasJoined = useRef(false);
  const lastPosition = useRef<Position>({ x: 0, y: 2, z: 0 });

  // Initialize session
  useEffect(() => {
    if (!sessionId || !identity || hasJoined.current) return;

    const initSession = async () => {
      try {
        // Try to create session first
        await createSessionMutation.mutateAsync(sessionId);
        toast.success('Session created!');
      } catch (error: any) {
        // If session exists, join it
        if (error.message?.includes('already exists')) {
          try {
            await joinSessionMutation.mutateAsync(sessionId);
            toast.success('Joined session!');
          } catch (joinError: any) {
            if (!joinError.message?.includes('already joined')) {
              toast.error('Failed to join session');
              console.error(joinError);
            }
          }
        }
      }
      hasJoined.current = true;
    };

    initSession();
  }, [sessionId, identity]);

  // Update local player state from backend
  useEffect(() => {
    if (playerState) {
      setLocalPlayer({
        health: Number(playerState.health),
        isAlive: playerState.isAlive,
        ammo: Number(playerState.ammo),
        currentWeapon: playerState.currentWeapon,
        position: playerState.position,
      });
    }
  }, [playerState]);

  // Update position (throttled)
  const updatePosition = useCallback(
    (position: Position) => {
      const distance = Math.sqrt(
        Math.pow(position.x - lastPosition.current.x, 2) +
          Math.pow(position.y - lastPosition.current.y, 2) +
          Math.pow(position.z - lastPosition.current.z, 2)
      );

      if (distance > 0.1) {
        lastPosition.current = position;
        updatePositionMutation.mutate({ sessionId, position });
      }
    },
    [sessionId, updatePositionMutation]
  );

  // Shoot
  const shoot = useCallback(() => {
    if (!localPlayer?.isAlive) {
      return;
    }
    
    if (localPlayer.ammo <= 0) {
      toast.error('Out of ammo!');
      return;
    }

    // In a real implementation, we'd raycast to find the target
    // For now, just update ammo locally
    setLocalPlayer((prev) => (prev ? { ...prev, ammo: prev.ammo - 1 } : null));
    refetch();
  }, [localPlayer, refetch]);

  // Pick up weapon
  const pickupWeapon = useCallback(
    (weapon: string, position: Position) => {
      pickUpWeaponMutation.mutate(
        { sessionId, weapon, position },
        {
          onSuccess: () => {
            toast.success(`Picked up ${weapon}!`);
            refetch();
          },
        }
      );
    },
    [sessionId, pickUpWeaponMutation, refetch]
  );

  // Respawn
  const respawn = useCallback(() => {
    respawnPlayerMutation.mutate(sessionId, {
      onSuccess: () => {
        toast.success('Respawned!');
        refetch();
      },
    });
  }, [sessionId, respawnPlayerMutation, refetch]);

  return {
    localPlayer,
    otherPlayers,
    weaponSpawns,
    updatePosition,
    shoot,
    pickupWeapon,
    respawn,
  };
}
