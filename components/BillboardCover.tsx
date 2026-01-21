
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Image } from '@react-three/drei';
import * as THREE from 'three';
import { AD_PACKS } from '../constants';

interface Props {
  position: [number, number, number];
  rotation?: [number, number, number];
  brandId: string;
  hits: number;
}

const BillboardCover: React.FC<Props> = ({ position, rotation = [0, 0, 0], brandId, hits }) => {
  const brand = AD_PACKS[brandId];
  const boardRef = useRef<THREE.Group>(null);
  const lastHits = useRef(hits);
  const wobble = useRef(0);

  if (hits > lastHits.current) {
    wobble.current = 1.0;
    lastHits.current = hits;
  }

  useFrame((state, delta) => {
    if (boardRef.current) {
      wobble.current = THREE.MathUtils.lerp(wobble.current, 0, 0.1);
      boardRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 25) * wobble.current * 0.08;
      boardRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 15) * wobble.current * 0.03);
    }
  });

  const damageFactor = Math.max(0.4, 1 - (hits * 0.02));

  return (
    <group position={position} rotation={rotation}>
      {/* 지지대 */}
      <mesh position={[-2.5, -3.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[2.5, -3.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <group ref={boardRef} scale={[damageFactor, damageFactor, 1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[11, 6.5, 0.8]} />
          <meshStandardMaterial color={brand.primaryColor} roughness={0.2} metalness={0.5} />
        </mesh>
        
        <group position={[0, 0, 0.45]}>
          <Text
            position={[0, 2, 0]}
            fontSize={0.8}
            color="white"
            maxWidth={10}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="black"
          >
            {brand.brandName}
          </Text>
          
          {/* 이미지가 로딩되지 않아도 게임이 멈추지 않도록 처리됨 */}
          <Image 
            url={brand.logoUrl} 
            scale={[3.5, 3.5]} 
            position={[0, -0.4, 0]} 
            transparent
          />

          <Text
            position={[0, -2.4, 0]}
            fontSize={0.4}
            color="white"
            maxWidth={9}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
          >
            {brand.slogan}
          </Text>
        </group>

        {[[-5.2, 3], [5.2, 3], [-5.2, -3], [5.2, -3]].map((pos, i) => (
          <mesh key={i} position={[pos[0], pos[1], 0.5]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#fff000" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default BillboardCover;
