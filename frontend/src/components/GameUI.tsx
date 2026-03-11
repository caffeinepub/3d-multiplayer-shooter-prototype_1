import { useGameState } from '../hooks/useGameState';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { X, Heart } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface GameUIProps {
  sessionId: string;
  onExit: () => void;
}

export default function GameUI({ sessionId, onExit }: GameUIProps) {
  const { identity } = useInternetIdentity();
  const { localPlayer } = useGameState(sessionId, identity);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top Bar */}
      <div className="pointer-events-auto flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-black/40 px-4 py-2 backdrop-blur-sm">
            <div className="text-xs text-slate-400">Session</div>
            <div className="font-mono text-sm font-semibold text-white">{sessionId}</div>
          </div>
        </div>
        <Button
          onClick={onExit}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-red-500/20 hover:text-red-400"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <img
          src="/assets/generated/crosshair-transparent.dim_64x64.png"
          alt="Crosshair"
          className="h-8 w-8 opacity-80"
        />
      </div>

      {/* Bottom HUD */}
      {localPlayer && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <div className="mx-auto max-w-md space-y-3">
            {/* Health Bar */}
            <div className="rounded-lg bg-black/40 p-3 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-white">Health</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">
                  {localPlayer.health}/100
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all"
                  style={{ width: `${localPlayer.health}%` }}
                />
              </div>
            </div>

            {/* Weapon & Ammo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-black/40 p-3 backdrop-blur-sm">
                <div className="text-xs text-slate-400">Weapon</div>
                <div className="font-semibold text-white">{localPlayer.currentWeapon}</div>
              </div>
              <div className="rounded-lg bg-black/40 p-3 backdrop-blur-sm">
                <div className="text-xs text-slate-400">Ammo</div>
                <div className="font-mono font-semibold text-white">{localPlayer.ammo}</div>
              </div>
            </div>

            {/* Death Screen */}
            {!localPlayer.isAlive && (
              <div className="pointer-events-auto rounded-lg bg-red-900/80 p-4 text-center backdrop-blur-sm">
                <div className="mb-2 text-xl font-bold text-white">You were eliminated!</div>
                <div className="text-sm text-red-200">Press SPACE to respawn</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute right-4 top-20 rounded-lg bg-black/40 p-4 text-xs text-slate-300 backdrop-blur-sm">
        <div className="mb-2 font-semibold text-white">Controls</div>
        <div className="space-y-1">
          <div>WASD - Move</div>
          <div>Mouse - Look</div>
          <div>Click - Shoot</div>
          <div>Space - Respawn</div>
        </div>
      </div>
    </div>
  );
}
