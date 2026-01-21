
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';
import PlayerCapybara from './PlayerCapybara';
import EnemyMob from './EnemyMob';
import PickupItem from './PickupItem';
import BillboardCover from './BillboardCover';
import Explosion from './Explosion';
import { GameState, ItemType, Enemy, ExplosionData } from '../types';
import { INITIAL_SPAWN_RATE, MAX_ENEMIES_BASE, AD_PACKS, ENEMY_SPEED, ROAD_LENGTH, STAGE_THEMES } from '../constants';
import { sounds } from '../utils/SoundManager';

interface Props {
  gameState: GameState;
  onScore: (val: number) => void;
  onHpChange: (val: number) => void;
  onBuff: (type: ItemType) => void;
  onNextStage: () => void;
}

const Scene: React.FC<Props> = ({ gameState, onScore, onHpChange, onBuff, onNextStage }) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [items, setItems] = useState<{ id: number, type: ItemType, pos: [number, number, number] }[]>([]);
  const [bullets, setBullets] = useState<{ id: number, pos: [number, number, number], dir: THREE.Vector3 }[]>([]);
  const [explosions, setExplosions] = useState<ExplosionData[]>([]);
  const [billboardHits, setBillboardHits] = useState<Record<string, number>>({});
  
  const nextId = useRef(0);
  const playerRef = useRef<THREE.Group>(null);
  
  const environment = useMemo(() => {
    const obstacles = [];
    const billboards = [];
    const roadWidth = 24;
    const brandIds = Object.keys(AD_PACKS);

    for (let z = 0; z > -ROAD_LENGTH - 200; z -= 40) {
      [-1, 1].forEach(side => {
        const xPos = side * (roadWidth / 2 + 10);
        const isBuilding = Math.random() > 0.4;

        if (isBuilding) {
          const height = 15 + Math.random() * 25;
          obstacles.push({
            id: `obs-${z}-${side}`,
            pos: [xPos + side * 5, height / 2, z] as [number, number, number],
            size: [15, height, 30] as [number, number, number],
            color: '#333'
          });
        } else {
          billboards.push({
            id: `bb-${z}-${side}`,
            brandId: brandIds[Math.floor(Math.random() * brandIds.length)],
            pos: [side * (roadWidth / 2 + 4), 5, z] as [number, number, number],
            rot: [0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0] as [number, number, number]
          });
        }
      });
    }

    return { obstacles, billboards };
  }, [gameState.stage]);

  const spawnRate = Math.max(800, INITIAL_SPAWN_RATE - (gameState.stage - 1) * 600);
  const maxEnemies = MAX_ENEMIES_BASE + (gameState.stage - 1) * 3;

  useEffect(() => {
    if (gameState.isGameOver) {
      setEnemies([]);
      setItems([]);
      setBullets([]);
      return;
    }

    const interval = setInterval(() => {
      if (!playerRef.current) return;
      const pPos = playerRef.current.position;

      setEnemies(prev => {
        if (prev.length >= maxEnemies) return prev;
        const angle = (Math.random() - 0.5) * 0.4;
        const dist = 60 + Math.random() * 20;
        return [...prev, {
          id: nextId.current++,
          position: [pPos.x + Math.sin(angle) * dist, 0.5, pPos.z - dist],
          hp: 1
        }];
      });

      if (Math.random() > 0.3) {
        const types = [ItemType.NAMUL, ItemType.COKE, ItemType.BANDAGE, ItemType.POTION];
        const type = types[Math.floor(Math.random() * types.length)];
        setItems(prev => [...prev, {
          id: nextId.current++,
          type,
          pos: [(Math.random() - 0.5) * 16, 0.5, pPos.z - 45]
        }]);
      }
    }, spawnRate);

    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.stage, spawnRate, maxEnemies]);

  const handleShoot = useCallback((spawnPos: THREE.Vector3, direction: THREE.Vector3) => {
    if (gameState.isGameOver || gameState.consumingItem) return;
    sounds.playShootSound();
    setBullets(prev => [...prev, {
      id: nextId.current++,
      pos: [spawnPos.x, spawnPos.y, spawnPos.z],
      dir: direction
    }]);
  }, [gameState.isGameOver, gameState.consumingItem]);

  const triggerExplosion = (pos: [number, number, number], color: string = '#ff6b6b') => {
    const id = nextId.current++;
    sounds.playExplosionSound();
    setExplosions(prev => [...prev, { id, position: pos, color }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(ex => ex.id !== id));
    }, 800);
  };

  useFrame((state, delta) => {
    if (gameState.isGameOver || gameState.consumingItem) return;

    if (playerRef.current && playerRef.current.position.z < -ROAD_LENGTH) {
      playerRef.current.position.z = 0;
      onNextStage();
      setEnemies([]);
      setItems([]);
      setBullets([]);
      return;
    }

    setBullets(prev => {
      const next: typeof prev = [];
      prev.forEach(b => {
        const newPos: [number, number, number] = [
          b.pos[0] + b.dir.x * delta * 120,
          b.pos[1] + b.dir.y * delta * 120,
          b.pos[2] + b.dir.z * delta * 120,
        ];

        let hitSomething = false;

        setEnemies(currentEnemies => {
          let hitId = -1;
          const updated = currentEnemies.filter(e => {
            const dist = Math.sqrt((e.position[0]-newPos[0])**2 + (e.position[2]-newPos[2])**2);
            if (dist < 2.2 && !hitSomething) {
              hitId = e.id;
              hitSomething = true;
              triggerExplosion(e.position, '#ffaa00');
              return false;
            }
            return true;
          });
          if (hitId > -1) onScore(100);
          return updated;
        });

        if (!hitSomething && Math.abs(newPos[2] - (playerRef.current?.position.z || 0)) < 180) {
          next.push({ ...b, pos: newPos });
        }
      });
      return next;
    });

    if (playerRef.current) {
      const pPos = playerRef.current.position;
      
      setEnemies(prev => prev.map(e => {
        const dir = new THREE.Vector3(pPos.x - e.position[0], 0, pPos.z - e.position[2]).normalize();
        const dist = Math.sqrt((e.position[0]-pPos.x)**2 + (e.position[2]-pPos.z)**2);
        if (dist < 2.2) onHpChange(-1.5);
        return {
          ...e,
          position: [
            e.position[0] + dir.x * delta * ENEMY_SPEED,
            0.5,
            e.position[2] + dir.z * delta * ENEMY_SPEED
          ]
        };
      }));

      setItems(prev => {
        const remaining: typeof prev = [];
        prev.forEach(item => {
          const dist = Math.sqrt((item.pos[0]-pPos.x)**2 + (item.pos[2]-pPos.z)**2);
          if (dist < 2.5) {
            onBuff(item.type);
            triggerExplosion(item.pos, '#ffffff');
          } else {
            remaining.push(item);
          }
        });
        return remaining;
      });
    }
  });

  const theme = STAGE_THEMES[(gameState.stage - 1) % STAGE_THEMES.length];

  return (
    <>
      <Grid 
        infiniteGrid 
        fadeDistance={250} 
        fadeStrength={10} 
        cellSize={1} 
        sectionSize={10} 
        sectionThickness={1.5} 
        sectionColor="#555" 
        cellColor="#222"
      />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[24, 2000]} />
        <meshStandardMaterial color={theme.ground} roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[0.6, 2000]} />
        <meshStandardMaterial color="#ffcc00" emissive="#332200" />
      </mesh>

      {environment.obstacles.map((obs) => (
        <mesh key={obs.id} position={obs.pos} castShadow receiveShadow>
          <boxGeometry args={obs.size} />
          <meshStandardMaterial color="#333" roughness={0.5} />
        </mesh>
      ))}

      {environment.billboards.map((bb) => (
        <BillboardCover 
          key={bb.id} 
          position={bb.pos} 
          rotation={bb.rot} 
          brandId={bb.brandId} 
          hits={billboardHits[bb.id] || 0} 
        />
      ))}

      <PlayerCapybara 
        ref={playerRef} 
        onShoot={handleShoot} 
        hasSpeedBuff={gameState.activeBuffs.some(b => b.type === ItemType.COKE)}
        hasPowerBuff={gameState.activeBuffs.some(b => b.type === ItemType.POTION)}
        isConsuming={!!gameState.consumingItem}
      />

      {enemies.map(e => <EnemyMob key={e.id} position={e.position} />)}
      {items.map(i => <PickupItem key={i.id} type={i.type} position={i.pos} />)}
      {explosions.map(ex => <Explosion key={ex.id} position={ex.position} color={ex.color} />)}

      {bullets.map(b => (
        <mesh key={b.id} position={b.pos}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      ))}
    </>
  );
};

export default Scene;
