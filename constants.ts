
import { ItemType, AdConfig } from './types';

export const GAME_SPEED = 1.0;
export const PLAYER_SPEED = 10.0;
export const ENEMY_SPEED = 5.0; 
export const INITIAL_SPAWN_RATE = 4000;
export const ROAD_LENGTH = 500; // 이 거리를 이동하면 다음 스테이지
export const MAX_ENEMIES_BASE = 6;

export const STAGE_THEMES = [
  { ground: '#1a1a1a', sky: '#87ceeb', fog: '#87ceeb', name: 'CITY CENTER' },
  { ground: '#c2b280', sky: '#f4a460', fog: '#f4a460', name: 'SANDY DESERT' },
  { ground: '#2d1b4e', sky: '#1a0b2e', fog: '#1a0b2e', name: 'NEON NIGHT' },
];

export const AD_PACKS: Record<string, AdConfig> = {
  BRAND_A: {
    id: 'A',
    brandName: 'Fresh Namul Co.',
    logoUrl: 'https://picsum.photos/seed/namul/400/400',
    primaryColor: '#4ade80',
    slogan: 'Natural Health, Naturally.'
  },
  BRAND_B: {
    id: 'B',
    brandName: 'Super Cola',
    logoUrl: 'https://picsum.photos/seed/cola/400/400',
    primaryColor: '#f87171',
    slogan: 'Fizz Your Way to Victory!'
  },
  BRAND_C: {
    id: 'C',
    brandName: 'Quick Heal Pharma',
    logoUrl: 'https://picsum.photos/seed/bandage/400/400',
    primaryColor: '#60a5fa',
    slogan: 'Patch Up, Keep Going.'
  },
  BRAND_D: {
    id: 'D',
    brandName: 'Power Potion',
    logoUrl: 'https://picsum.photos/seed/potion/400/400',
    primaryColor: '#a78bfa',
    slogan: 'Unleash the Beast.'
  }
};

export const ITEM_PROPERTIES = {
  [ItemType.NAMUL]: { color: '#4ade80', label: 'NAMUL', brandId: 'BRAND_A' },
  [ItemType.COKE]: { color: '#f87171', label: 'COKE', brandId: 'BRAND_B' },
  [ItemType.BANDAGE]: { color: '#60a5fa', label: 'BANDAGE', brandId: 'BRAND_C' },
  [ItemType.POTION]: { color: '#a78bfa', label: 'POTION', brandId: 'BRAND_D' },
};
