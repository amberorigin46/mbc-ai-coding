
export enum ItemType {
  NAMUL = 'NAMUL',       // Heal
  COKE = 'COKE',         // Speed + High Recoil
  BANDAGE = 'BANDAGE',   // Shield/Regen
  POTION = 'POTION'      // Buff
}

export interface AdConfig {
  id: string;
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  slogan: string;
}

export interface GameState {
  hp: number;
  maxHp: number;
  score: number;
  stage: number;
  isGameOver: boolean;
  consumingItem: ItemType | null; // 아이템 소비 연출용
  activeBuffs: {
    type: ItemType;
    remaining: number;
  }[];
}

export interface Enemy {
  id: number;
  position: [number, number, number];
  hp: number;
}

export interface ExplosionData {
  id: number;
  position: [number, number, number];
  color: string;
}
