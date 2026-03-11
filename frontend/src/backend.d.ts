import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlayerState {
    ammo: bigint;
    isAlive: boolean;
    position: Position;
    currentWeapon: string;
    health: bigint;
}
export interface Position {
    x: number;
    y: number;
    z: number;
}
export interface backendInterface {
    createSession(sessionId: string): Promise<void>;
    endSession(sessionId: string): Promise<void>;
    getPlayerState(sessionId: string, player: Principal): Promise<PlayerState>;
    getSessionStatus(sessionId: string): Promise<boolean>;
    joinSession(sessionId: string): Promise<void>;
    pickUpWeapon(sessionId: string, weapon: string, position: Position): Promise<void>;
    respawnPlayer(sessionId: string): Promise<void>;
    shootPlayer(sessionId: string, target: Principal): Promise<boolean>;
    updatePlayerPosition(sessionId: string, pos: Position): Promise<void>;
}
