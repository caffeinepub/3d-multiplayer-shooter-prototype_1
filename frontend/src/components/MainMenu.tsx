import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Crosshair, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface MainMenuProps {
  onStartGame: (sessionId: string) => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [sessionId, setSessionId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { login, identity, isLoggingIn } = useInternetIdentity();

  const handleCreateSession = () => {
    if (!identity) {
      toast.error('Please login first');
      return;
    }
    if (!sessionId.trim()) {
      toast.error('Please enter a session ID');
      return;
    }
    setIsCreating(true);
    onStartGame(sessionId.trim());
  };

  const handleJoinSession = () => {
    if (!identity) {
      toast.error('Please login first');
      return;
    }
    if (!sessionId.trim()) {
      toast.error('Please enter a session ID');
      return;
    }
    onStartGame(sessionId.trim());
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/assets/generated/arena-map.dim_800x600.jpg')] bg-cover bg-center opacity-10" />
      
      <div className="relative z-10 w-full max-w-md space-y-8 px-4">
        {/* Logo/Title */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-4">
              <Crosshair className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-5xl font-bold tracking-tight text-white">
            Battle Arena
          </h1>
          <p className="text-lg text-slate-400">3D Multiplayer Shooter</p>
        </div>

        {/* Main Card */}
        <Card className="border-slate-700 bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Join the Battle</CardTitle>
            <CardDescription className="text-slate-400">
              {identity ? 'Enter or create a session to start playing' : 'Login to start playing'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!identity ? (
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
                size="lg"
              >
                {isLoggingIn ? 'Connecting...' : 'Login to Play'}
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter Session ID"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && sessionId.trim()) {
                        handleJoinSession();
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleCreateSession}
                    disabled={isCreating || !sessionId.trim()}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Create
                  </Button>
                  <Button
                    onClick={handleJoinSession}
                    disabled={!sessionId.trim()}
                    variant="outline"
                    className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Join
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-500">3D</div>
            <div className="text-xs text-slate-400">Graphics</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-500">Real-time</div>
            <div className="text-xs text-slate-400">Multiplayer</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-orange-500">Fast</div>
            <div className="text-xs text-slate-400">Action</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          © 2025. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-400"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}
