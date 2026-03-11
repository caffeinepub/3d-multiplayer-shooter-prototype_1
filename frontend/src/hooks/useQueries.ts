import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PlayerState, Position } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

export function useCreateSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useJoinSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.joinSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useUpdatePlayerPosition() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ sessionId, position }: { sessionId: string; position: Position }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updatePlayerPosition(sessionId, position);
    },
  });
}

export function useShootPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, target }: { sessionId: string; target: Principal }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.shootPlayer(sessionId, target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerState'] });
    },
  });
}

export function usePickUpWeapon() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      weapon,
      position,
    }: {
      sessionId: string;
      weapon: string;
      position: Position;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.pickUpWeapon(sessionId, weapon, position);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerState'] });
    },
  });
}

export function useRespawnPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.respawnPlayer(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerState'] });
    },
  });
}

export function useGetPlayerState(sessionId: string, player: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<PlayerState>({
    queryKey: ['playerState', sessionId, player?.toString()],
    queryFn: async () => {
      if (!actor || !player) throw new Error('Actor or player not initialized');
      return actor.getPlayerState(sessionId, player);
    },
    enabled: !!actor && !isFetching && !!player,
    refetchInterval: 100,
  });
}

export function useGetSessionStatus(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['sessionStatus', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}
