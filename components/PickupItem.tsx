
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import { ItemType } from '../types';
import { ITEM_PROPERTIES } from '../constants';

interface Props {
  type: ItemType;
  position: [number, number, number];
}

const PickupItem: React.FC<Props> = ({ type, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const props = ITEM_PROPERTIES[type];

  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
      <group position={position}>
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[0.9, 1.3, 0.5]} />
          <meshStandardMaterial 
            color={props.color} 
            roughness={0.1} 
            metalness={0.5}
            emissive={props.color} 
            emissiveIntensity={0.5} 
          />
        </mesh>
        
        {/* Ad Label - Using default font */}
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {props.label}
        </Text>

        {/* Decorative Floating Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
          <torusGeometry args={[0.8, 0.04, 12, 24]} />
          <meshBasicMaterial color={props.color} transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
};

export default PickupItem;
