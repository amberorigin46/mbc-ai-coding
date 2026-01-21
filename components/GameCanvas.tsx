
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import Scene from './Scene';
import { GameState, ItemType } from '../types';
import { STAGE_THEMES } from '../constants';

interface Props {
  gameState: GameState;
  onScore: (val: number) => void;
  onHpChange: (val: number) => void;
  onBuff: (type: ItemType) => void;
  onNextStage: () => void;
}

const GameCanvas: React.FC<Props> = ({ gameState, onScore, onHpChange, onBuff, onNextStage }) => {
  const themeIdx = (gameState.stage - 1) % STAGE_THEMES.length;
  const theme = STAGE_THEMES[themeIdx];

  return (
    <Canvas 
      shadows 
      dpr={[1, 2]} 
      className="w-full h-full"
      gl={{ antialias: true }}
    >
      <color attach="background" args={[theme.sky]} />
      <fog attach="fog" args={[theme.fog, 30, 150]} />
      
      <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={1.0} />
      <directionalLight 
        position={[15, 40, 15]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />

      <Scene 
        gameState={gameState} 
        onScore={onScore} 
        onHpChange={onHpChange} 
        onBuff={onBuff}
        onNextStage={onNextStage}
      />

      <ContactShadows 
        position={[0, -0.01, 0]} 
        opacity={0.4} 
        scale={100} 
        blur={2.5} 
        far={20} 
        resolution={256} 
        color="#000" 
      />
    </Canvas>
  );
};

export default GameCanvas;
