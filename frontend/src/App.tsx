import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Suspense, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import GameScene from './components/GameScene';
import GameUI from './components/GameUI';
import MainMenu from './components/MainMenu';
import { Toaster } from './components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const { identity } = useInternetIdentity();

  const handleStartGame = (id: string) => {
    setSessionId(id);
    setGameStarted(true);
  };

  const handleExitGame = () => {
    setGameStarted(false);
    setSessionId('');
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="h-screen w-screen overflow-hidden bg-background">
        {!gameStarted ? (
          <MainMenu onStartGame={handleStartGame} />
        ) : (
          <>
            <Canvas
              shadows
              camera={{ position: [0, 5, 10], fov: 60 }}
              className="absolute inset-0"
            >
              <Suspense fallback={null}>
                <Physics gravity={[0, -20, 0]}>
                  <GameScene sessionId={sessionId} identity={identity} />
                </Physics>
              </Suspense>
            </Canvas>
            <GameUI sessionId={sessionId} onExit={handleExitGame} />
          </>
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
