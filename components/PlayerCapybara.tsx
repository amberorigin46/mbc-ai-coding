
import React, { useRef, useState, forwardRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  onShoot: (position: THREE.Vector3, direction: THREE.Vector3) => void;
  hasSpeedBuff: boolean;
  hasPowerBuff: boolean;
  isConsuming: boolean;
}

const PlayerCapybara = forwardRef<THREE.Group, Props>(({ onShoot, hasSpeedBuff, hasPowerBuff, isConsuming }, ref) => {
  const group = useRef<THREE.Group>(null);
  const { mouse, camera } = useThree();
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  
  const walkCycle = useRef(0);
  const recoil = useRef(0);

  React.useImperativeHandle(ref, () => group.current!);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.code]: false }));
    
    const handleClick = () => {
      if (!group.current || isConsuming) return;
      
      const muzzleOffset = new THREE.Vector3(0.6, 0.4, 1.8);
      muzzleOffset.applyQuaternion(group.current.quaternion);
      const spawnPos = group.current.position.clone().add(muzzleOffset);
      
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(group.current.quaternion);
      
      onShoot(spawnPos, direction);
      recoil.current = 0.5;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [onShoot, isConsuming]);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (isConsuming) {
      // 소비 중일 때는 멈추고 제자리에서 살짝 뜀
      group.current.position.y = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.5;
      return;
    }

    // 기본 전진
    const forwardSpeed = (hasSpeedBuff ? 25 : 18) * delta;
    group.current.position.z -= forwardSpeed;

    // 좌우 이동 (A, D)
    const sideSpeed = 30 * delta;
    if (keys['KeyA'] || keys['ArrowLeft']) group.current.position.x -= sideSpeed;
    if (keys['KeyD'] || keys['ArrowRight']) group.current.position.x += sideSpeed;
    
    // 도로 경계 제한
    group.current.position.x = THREE.MathUtils.clamp(group.current.position.x, -10, 10);

    // 애니메이션
    walkCycle.current += delta * (hasSpeedBuff ? 25 : 15);
    const bodyGroup = group.current.getObjectByName('bodyContainer');
    if (bodyGroup) {
      bodyGroup.position.y = 0.6 + Math.abs(Math.sin(walkCycle.current)) * 0.25;
      bodyGroup.rotation.z = Math.sin(walkCycle.current) * 0.08;
    }

    // 조준 (전방 180도)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersectPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
      const targetRotation = Math.atan2(
        intersectPoint.x - group.current.position.x,
        intersectPoint.z - group.current.position.z
      );
      let diff = targetRotation - Math.PI - group.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      group.current.rotation.y += diff * 0.15;
    }

    const gun = group.current.getObjectByName('gun');
    if (gun) {
      recoil.current = THREE.MathUtils.lerp(recoil.current, 0, 0.2);
      gun.position.z = 1.0 + recoil.current;
    }

    // 카메라 숄더뷰 팔로우
    const cameraOffset = new THREE.Vector3(0, 15, 20);
    const targetCamPos = group.current.position.clone().add(cameraOffset);
    camera.position.lerp(targetCamPos, 0.1);
    camera.lookAt(group.current.position.x, group.current.position.y + 1, group.current.position.z - 15);
  });

  return (
    <group ref={group}>
      <group name="bodyContainer">
        {/* 귀여운 둥근 카피바라 */}
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.4, 2.8]} />
          <meshStandardMaterial color="#8B4513" roughness={1} />
        </mesh>
        
        <group position={[0, 0.4, 1.6]}>
          <mesh castShadow>
            <boxGeometry args={[1.2, 1.1, 1.3]} />
            <meshStandardMaterial color="#A0522D" />
          </mesh>
          <mesh position={[0, -0.2, 0.6]}>
            <boxGeometry args={[1.0, 0.8, 0.4]} />
            <meshStandardMaterial color="#5C4033" />
            <mesh position={[0, 0, 0.21]}>
              <boxGeometry args={[0.4, 0.2, 0.05]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </mesh>
          <mesh position={[0.45, 0.3, 0.5]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[-0.45, 0.3, 0.5]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[0.5, 0.6, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.2]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
          <mesh position={[-0.5, 0.6, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.2]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
        </group>

        {[[-0.6, 1], [0.6, 1], [-0.6, -1], [0.6, -1]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.7, z]}>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
        ))}

        <group name="gun" position={[1.0, 0.2, 1.0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 1.6]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
          {recoil.current > 0.1 && (
            <mesh position={[0, 0, 1.0]}>
              <sphereGeometry args={[0.6, 8, 8]} />
              <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
});

export default PlayerCapybara;
