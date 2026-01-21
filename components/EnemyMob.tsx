
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
}

const EnemyMob: React.FC<Props> = ({ position }) => {
  const innerGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (innerGroup.current) {
      // Apply floating to the inner group only
      innerGroup.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.3;
      innerGroup.current.rotation.y += 0.05;
      innerGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <group ref={innerGroup}>
        <mesh castShadow>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshStandardMaterial color="#ff4d4d" roughness={0.2} metalness={0.1} />
        </mesh>
        
        {/* Simple Eyes */}
        <mesh position={[0.3, 0.3, 0.7]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0, 0.1]}>
             <sphereGeometry args={[0.1, 8, 8]} />
             <meshStandardMaterial color="black" />
          </mesh>
        </mesh>
        <mesh position={[-0.3, 0.3, 0.7]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0, 0.1]}>
             <sphereGeometry args={[0.1, 8, 8]} />
             <meshStandardMaterial color="black" />
          </mesh>
        </mesh>
      </group>
    </group>
  );
};

export default EnemyMob;
