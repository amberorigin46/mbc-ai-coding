
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, ItemType } from './types';
import { Heart, Zap, Trophy, Sparkles } from 'lucide-react';
import { AD_PACKS, ITEM_PROPERTIES } from './constants';
import { sounds } from './utils/SoundManager';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    hp: 100,
    maxHp: 100,
    score: 0,
    stage: 1,
    isGameOver: false,
    consumingItem: null,
    activeBuffs: []
  });

  const restartGame = () => {
    setGameState({
      hp: 100,
      maxHp: 100,
      score: 0,
      stage: 1,
      isGameOver: false,
      consumingItem: null,
      activeBuffs: []
    });
  };

  const nextStage = useCallback(() => {
    sounds.playStageClearSound();
    setGameState(prev => ({ 
      ...prev, 
      stage: prev.stage + 1,
      score: prev.score + 1000 
    }));
  }, []);

  const updateScore = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + amount }));
  }, []);

  const updateHp = useCallback((amount: number) => {
    setGameState(prev => {
      const newHp = Math.min(prev.maxHp, Math.max(0, prev.hp + amount));
      if (newHp <= 0 && !prev.isGameOver) {
        sounds.playGameOverSound();
        return { ...prev, hp: 0, isGameOver: true };
      }
      return { ...prev, hp: newHp };
    });
  }, []);

  const applyBuff = useCallback((type: ItemType) => {
    sounds.playPickupSound();
    setGameState(prev => {
      let newHp = prev.hp;
      if (type === ItemType.NAMUL) {
        newHp = Math.min(prev.maxHp, prev.hp + 40);
      }
      
      const newBuffs = [...prev.activeBuffs];
      const idx = newBuffs.findIndex(b => b.type === type);
      if (idx > -1) {
        newBuffs[idx].remaining = 15;
      } else if (type !== ItemType.NAMUL) {
        newBuffs.push({ type, remaining: 15 });
      }

      return {
        ...prev,
        hp: newHp,
        activeBuffs: newBuffs,
        consumingItem: type
      };
    });

    setTimeout(() => {
      setGameState(prev => ({ ...prev, consumingItem: null }));
    }, 1500);
  }, []);

  useEffect(() => {
    if (gameState.isGameOver) return;
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        activeBuffs: prev.activeBuffs
          .map(b => ({ ...b, remaining: b.remaining - 0.5 }))
          .filter(b => b.remaining > 0)
      }));
    }, 500);
    return () => clearInterval(interval);
  }, [gameState.isGameOver]);

  const consumingProps = gameState.consumingItem ? ITEM_PROPERTIES[gameState.consumingItem] : null;
  const brand = consumingProps ? AD_PACKS[consumingProps.brandId] : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 p-6 flex flex-col justify-start items-start space-y-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-white/90 px-5 py-3 rounded-3xl shadow-2xl border-2 border-red-200 backdrop-blur-md">
            <Heart className="text-red-500 fill-red-500 w-8 h-8 animate-pulse" />
            <div className="w-56 h-6 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-red-400 via-pink-500 to-red-600 transition-all duration-500 ease-out" 
                style={{ width: `${(gameState.hp / gameState.maxHp) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/90 px-6 py-3 rounded-3xl shadow-2xl border-2 border-yellow-300 backdrop-blur-md">
            <Trophy className="text-yellow-500 w-8 h-8" />
            <span className="font-black text-3xl text-gray-900 tracking-tight">{gameState.score.toLocaleString()}</span>
          </div>

          <div className="bg-blue-600 text-white px-8 py-3 rounded-3xl shadow-2xl font-black text-2xl animate-pulse">
            STAGE {gameState.stage}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pointer-events-none">
          {gameState.activeBuffs.map(buff => (
            <div key={buff.type} className="flex items-center space-x-2 bg-white px-5 py-2 rounded-full shadow-lg border-2 border-blue-400 animate-bounce transition-all">
              <Zap className="text-orange-500 w-6 h-6" />
              <span className="text-base font-black uppercase text-gray-800">{buff.type}</span>
              <span className="text-sm font-bold text-blue-600 ml-1">{Math.ceil(buff.remaining)}s</span>
            </div>
          ))}
        </div>
      </div>

      {/* Item Consumption AD Overlay */}
      {gameState.consumingItem && brand && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center bg-white p-12 rounded-[5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-8 border-yellow-400 transform scale-110 animate-bounce">
            <div className="absolute -top-16 -right-16 bg-red-500 text-white rounded-full p-6 shadow-2xl rotate-12 flex items-center justify-center">
              <Sparkles className="w-12 h-12" />
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-2 italic tracking-tighter">REFRESHING!</h2>
            <p className="text-2xl font-bold text-blue-600 mb-8 uppercase tracking-widest">{brand.brandName}</p>
            <div className="w-64 h-64 relative mb-6">
              <img src={brand.logoUrl} className="w-full h-full object-contain rounded-3xl shadow-xl border-4 border-gray-100" alt="Product" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
            </div>
            <p className="text-3xl font-black text-gray-800 text-center max-w-sm">"{brand.slogan}"</p>
            <div className="mt-8 flex space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping delay-75"></div>
              <div className="w-4 h-4 bg-red-400 rounded-full animate-ping delay-150"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main 3D Container */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center text-white font-black text-4xl">LOADING STAGE...</div>}>
          <GameCanvas 
            gameState={gameState} 
            onScore={updateScore} 
            onHpChange={updateHp}
            onBuff={applyBuff}
            onNextStage={nextStage}
          />
        </Suspense>
      </div>

      {/* Game Over */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-2xl z-[60] flex flex-col items-center justify-center">
          <div className="bg-white p-16 rounded-[4rem] shadow-2xl text-center">
            <h1 className="text-8xl font-black text-red-600 mb-4">REST TIME</h1>
            <p className="text-3xl font-bold text-gray-500 mb-10">Final Score: {gameState.score}</p>
            <button 
              onClick={restartGame}
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-20 py-8 rounded-full font-black text-4xl transition-all active:scale-95 shadow-[0_15px_0_rgb(180,140,0)]"
            >
              REPLAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
