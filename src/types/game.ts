/**
 * Game data types and interfaces for Helios Infiltrator
 */

export type GameMode = 'MENU' | 'SURFACE' | 'CITADEL' | 'HANGAR' | 'GAMEOVER' | 'VICTORY';

export interface PlayerStats {
  credits: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  heat: number;
  maxHeat: number;
  // Hovercraft upgrades
  engineLevel: number;
  weaponLevel: number;
  shieldLevel: number;
  magnetLevel: number;
  // Operative upgrades
  stealthLevel: number;
  blasterLevel: number;
  empLevel: number;
  hackLevel: number;
  // Progress
  destroyedCapsulesTotal: number;
  infiltratedCitadelsTotal: number;
  currentSector: number;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  category: 'vehicle' | 'operative';
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  icon: string;
  statBonus: string;
}

export interface SurfaceObjective {
  targetCapsules: number;
  destroyedCapsules: number;
  citadelUnlocked: boolean;
}

export interface CitadelObjective {
  terminalsHacked: number;
  totalTerminals: number;
  coreOverloaded: boolean;
  escaped: boolean;
  alertLevel: number; // 0 to 100
}

export interface TouchInputState {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  isMoving: boolean;
  isFiring: boolean;
  isBoosting: boolean;
  isCovering: boolean; // Crouch / Cover in citadel
  isEMPTriggered: boolean;
  isInteracting: boolean;
}
