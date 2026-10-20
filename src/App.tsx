/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameMode, PlayerStats, TouchInputState } from './types/game';
import { SurfaceScene } from './game/surfaceScene';
import { CitadelScene } from './game/citadelScene';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { HangarModal } from './components/HangarModal';
import { MissionBriefingModal } from './components/MissionBriefingModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { sound } from './game/sound';
import { Play, Sparkles, Shield, Cpu, Flame, Crosshair } from 'lucide-react';

const INITIAL_PLAYER_STATS: PlayerStats = {
  credits: 250, // Initial seed credits for quick starting upgrades
  health: 100,
  maxHealth: 100,
  shield: 100,
  maxShield: 100,
  heat: 0,
  maxHeat: 100,
  engineLevel: 1,
  weaponLevel: 1,
  shieldLevel: 1,
  magnetLevel: 1,
  stealthLevel: 1,
  blasterLevel: 1,
  empLevel: 1,
  hackLevel: 1,
  destroyedCapsulesTotal: 0,
  infiltratedCitadelsTotal: 0,
  currentSector: 1,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Game States
  const [gameMode, setGameMode] = useState<GameMode>('MENU');
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('helios_player_stats');
    if (saved) {
      try {
        return { ...INITIAL_PLAYER_STATS, ...JSON.parse(saved) };
      } catch {
        return INITIAL_PLAYER_STATS;
      }
    }
    return INITIAL_PLAYER_STATS;
  });

  const [isHangarOpen, setIsHangarOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isCitadelUnlocked, setIsCitadelUnlocked] = useState(false);
  const [objectiveText, setObjectiveText] = useState('Hidrojen Kapsüllerini İmha Et (0/4)');
  const [alertLevel, setAlertLevel] = useState(0);
  const [hackState, setHackState] = useState({ isNearTerminal: false, hackProgress: 0, isOverloaded: false, escapeTimer: 0 });
  const [victoryCredits, setVictoryCredits] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<'destroyed' | 'overheat' | 'spotted'>('destroyed');

  // Input state
  const touchInputRef = useRef<TouchInputState>({
    moveX: 0,
    moveY: 0,
    isMoving: false,
    isFiring: false,
    isBoosting: false,
    isCovering: false,
    isEMPTriggered: false,
    isInteracting: false,
  });

  // Scene instances refs
  const surfaceSceneRef = useRef<SurfaceScene | null>(null);
  const citadelSceneRef = useRef<CitadelScene | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Save stats to LocalStorage
  const saveStats = useCallback((stats: PlayerStats) => {
    localStorage.setItem('helios_player_stats', JSON.stringify(stats));
  }, []);

  const updateStats = useCallback((updater: (prev: PlayerStats) => PlayerStats) => {
    setPlayerStats((prev) => {
      const next = updater(prev);
      saveStats(next);
      return next;
    });
  }, [saveStats]);

  // Clean current 3D scene
  const cleanupCurrentScene = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (surfaceSceneRef.current) {
      surfaceSceneRef.current.dispose();
      surfaceSceneRef.current = null;
    }
    if (citadelSceneRef.current) {
      citadelSceneRef.current.dispose();
      citadelSceneRef.current = null;
    }
    if (canvasMountRef.current) {
      canvasMountRef.current.innerHTML = '';
    }
  }, []);

  // Initialize Surface Mode Scene
  const initSurfaceMode = useCallback(() => {
    if (!canvasMountRef.current) return;
    cleanupCurrentScene();

    setIsCitadelUnlocked(false);
    setObjectiveText('Hidrojen Kapsüllerini İmha Et');

    const scene = new SurfaceScene(canvasMountRef.current, playerStats, {
      onCapsuleDestroyed: (remaining, total) => {
        const destroyed = total - remaining;
        setObjectiveText(`Hidrojen Kapsülleri: ${destroyed}/${total}`);
      },
      onCreditCollected: (amount) => {
        updateStats((prev) => ({ ...prev, credits: prev.credits + amount }));
      },
      onDamageTaken: (newShield, newHealth) => {
        updateStats((prev) => ({ ...prev, shield: newShield, health: newHealth }));
      },
      onCitadelReady: () => {
        setIsCitadelUnlocked(true);
        setObjectiveText('KARTEL KALESİ SAVUNMASI ÇÖKTÜ! DOKA GİDİN');
      },
      onEnterCitadel: () => {
        setIsBriefingOpen(true);
      },
      onGameOver: () => {
        setGameOverReason('destroyed');
        setGameMode('GAMEOVER');
      },
    });

    surfaceSceneRef.current = scene;

    // Render loop
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      scene.update(delta, touchInputRef.current);
    };
    animate();
  }, [cleanupCurrentScene, playerStats, updateStats]);

  // Initialize Citadel Infiltration Mode Scene
  const initCitadelMode = useCallback(() => {
    if (!canvasMountRef.current) return;
    cleanupCurrentScene();

    setIsBriefingOpen(false);
    setGameMode('CITADEL');
    setObjectiveText('Reaktör Konsoluna Sız & Sabote Et');

    const scene = new CitadelScene(canvasMountRef.current, playerStats, {
      onTerminalHacked: () => {
        sound.playCreditChime();
        updateStats((prev) => ({ ...prev, credits: prev.credits + 300 }));
      },
      onCoreOverloaded: (countdown) => {
        setObjectiveText('REAKTÖR SABOTE EDİLDİ! HAVA KİLİDİNE KAÇ!');
        setHackState((prev) => ({ ...prev, isOverloaded: true, escapeTimer: countdown }));
      },
      onDroneDestroyed: () => {
        updateStats((prev) => ({ ...prev, credits: prev.credits + 40 }));
      },
      onAlertChanged: (lvl) => {
        setAlertLevel(lvl);
      },
      onDamageTaken: (newShield, newHealth) => {
        updateStats((prev) => ({ ...prev, shield: newShield, health: newHealth }));
      },
      onInfiltrationSuccess: (bonus) => {
        updateStats((prev) => ({
          ...prev,
          credits: prev.credits + bonus,
          infiltratedCitadelsTotal: prev.infiltratedCitadelsTotal + 1,
        }));
        setVictoryCredits(bonus);
        setGameMode('VICTORY');
      },
      onGameOver: () => {
        setGameOverReason('spotted');
        setGameMode('GAMEOVER');
      },
    });

    citadelSceneRef.current = scene;

    const clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      scene.update(delta, touchInputRef.current);
      setHackState(scene.getHackState());
    };
    animate();
  }, [cleanupCurrentScene, playerStats, updateStats]);

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasMountRef.current) return;
      const w = canvasMountRef.current.clientWidth;
      const h = canvasMountRef.current.clientHeight;
      if (surfaceSceneRef.current) surfaceSceneRef.current.resize(w, h);
      if (citadelSceneRef.current) citadelSceneRef.current.resize(w, h);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mode Transition Controller
  useEffect(() => {
    if (gameMode === 'SURFACE') {
      initSurfaceMode();
    } else if (gameMode === 'CITADEL') {
      // already initialized via initCitadelMode
    } else {
      cleanupCurrentScene();
    }

    return () => {
      cleanupCurrentScene();
    };
  }, [gameMode, cleanupCurrentScene, initSurfaceMode]);

  // Upgrade Handler
  const handleUpgrade = (upgradeId: string, cost: number) => {
    updateStats((prev) => {
      const next = { ...prev, credits: prev.credits - cost };
      switch (upgradeId) {
        case 'engine': next.engineLevel++; break;
        case 'weapon': next.weaponLevel++; break;
        case 'shield':
          next.shieldLevel++;
          next.maxShield += 30;
          next.shield = next.maxShield;
          break;
        case 'magnet': next.magnetLevel++; break;
        case 'stealth': next.stealthLevel++; break;
        case 'blaster': next.blasterLevel++; break;
        case 'emp': next.empLevel++; break;
        case 'hack': next.hackLevel++; break;
      }
      return next;
    });
  };

  const handleStartGame = () => {
    // Reset vitals
    updateStats((prev) => ({
      ...prev,
      health: prev.maxHealth,
      shield: prev.maxShield,
      heat: 0,
    }));
    setGameMode('SURFACE');
  };

  const handleDeploySector = (sector: number) => {
    updateStats((prev) => ({
      ...prev,
      currentSector: sector,
      health: prev.maxHealth,
      shield: prev.maxShield,
      heat: 0,
    }));
    setIsHangarOpen(false);
    setGameMode('SURFACE');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070407] text-slate-100 flex flex-col font-sans select-none">
      {/* 3D WebGL Canvas Viewport Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      />

      {/* Main Menu Hero Screen */}
      {gameMode === 'MENU' && (
        <div className="relative z-30 flex-1 flex flex-col justify-between p-6 md:p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-2xl tracking-wider text-orange-500">
                HELIOS INFILTRATOR
              </span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-xs text-white/60 tracking-widest font-mono">SOLAR SKIMMER 3D</span>
            </div>
            <button
              onClick={() => setIsHangarOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-display font-semibold transition-colors"
            >
              Hangar & Geliştirmeler
            </button>
          </div>

          {/* Center Title & Game Narrative */}
          <div className="max-w-xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 bg-orange-950/60 border border-orange-500/30 px-3 py-1 rounded-full w-fit">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Kızıl Dev Yıldızın Koronal Plazma Yüzeyi</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-white leading-none">
              YILDIZI KURTAR. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400">
                KAPSÜLLERİ YOK ET.
              </span>
            </h1>

            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              Dyson Karteli, devasa sifon kuleleriyle yıldızın hidrojenini emerek güneşi karartıyor. Hızlı hovercraft ile kızıl plazma üzerinde süzülün, kapsülleri patlatın, plazma kredileri toplayıp kalelerine sızın!
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs text-white/80">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/50 border border-white/10">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>3. Şahıs Hover Sürüşü</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/50 border border-white/10">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <span>Kapsül İmhası & Kredi</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/50 border border-white/10">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Siperli Sızma & Sabotaj</span>
              </div>
            </div>
          </div>

          {/* Bottom Launch Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base font-display rounded-2xl shadow-xl shadow-orange-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              OPERASYONU BAŞLAT
            </button>

            <div className="text-xs text-white/50 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Android Dokunmatik Joystick & Klavye/Fare Uyumlu</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Game HUD (Surface or Citadel) */}
      {(gameMode === 'SURFACE' || gameMode === 'CITADEL') && (
        <>
          <HUD
            playerStats={playerStats}
            gameMode={gameMode}
            objectiveText={objectiveText}
            isCitadelUnlocked={isCitadelUnlocked}
            alertLevel={alertLevel}
            escapeTimer={hackState.escapeTimer}
            hackProgress={hackState.hackProgress}
            isNearTerminal={hackState.isNearTerminal}
            onOpenHangar={() => setIsHangarOpen(true)}
          />

          <TouchControls
            gameMode={gameMode}
            onInputChange={(input) => {
              touchInputRef.current = input;
            }}
            isNearTerminal={hackState.isNearTerminal}
          />
        </>
      )}

      {/* Mission Briefing Modal (When reaching the Citadel Dock) */}
      {isBriefingOpen && (
        <MissionBriefingModal
          sector={playerStats.currentSector}
          onStartInfiltration={() => initCitadelMode()}
          onAbort={() => setIsBriefingOpen(false)}
        />
      )}

      {/* Hangar & Upgrade Bay */}
      {isHangarOpen && (
        <HangarModal
          playerStats={playerStats}
          onUpgrade={handleUpgrade}
          onDeploy={handleDeploySector}
          onClose={() => setIsHangarOpen(false)}
        />
      )}

      {/* Victory Modal */}
      {gameMode === 'VICTORY' && (
        <VictoryModal
          bonusCredits={victoryCredits}
          totalCredits={playerStats.credits}
          sector={playerStats.currentSector}
          onNextSector={() => {
            handleDeploySector(Math.min(playerStats.currentSector + 1, 3));
          }}
          onOpenHangar={() => {
            setGameMode('MENU');
            setIsHangarOpen(true);
          }}
        />
      )}

      {/* Game Over Modal */}
      {gameMode === 'GAMEOVER' && (
        <GameOverModal
          reason={gameOverReason}
          onRestart={() => {
            handleStartGame();
          }}
          onOpenHangar={() => {
            setGameMode('MENU');
            setIsHangarOpen(true);
          }}
        />
      )}
    </div>
  );
}
