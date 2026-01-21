
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  color: string;
}

const Explosion: React.FC<Props> = ({ position, color }) => {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.scale.multiplyScalar(1.05);
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.opacity = Math.max(0, mesh.material.opacity - delta * 2);
        }
      });
    }
  });

  return (
    <group ref={group} position={position}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[(Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.8} 
            emissive={color} 
            emissiveIntensity={1} 
          />
        </mesh>
      ))}
    </group>
  );
};

export default Explosion;
