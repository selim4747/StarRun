import React from 'react';
import { PlayerStats, GameMode } from '../types/game';
import { sound } from '../game/sound';
import { Volume2, VolumeX, Maximize2, Flame, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';

interface HUDProps {
  playerStats: PlayerStats;
  gameMode: GameMode;
  objectiveText: string;
  isCitadelUnlocked?: boolean;
  alertLevel?: number;
  escapeTimer?: number;
  hackProgress?: number;
  isNearTerminal?: boolean;
  onOpenHangar: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerStats,
  gameMode,
  objectiveText,
  isCitadelUnlocked = false,
  alertLevel = 0,
  escapeTimer = 0,
  hackProgress = 0,
  isNearTerminal = false,
  onOpenHangar,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const shieldPercent = Math.round((playerStats.shield / playerStats.maxShield) * 100);
  const healthPercent = Math.round((playerStats.health / playerStats.maxHealth) * 100);
  const heatPercent = Math.round((playerStats.heat / playerStats.maxHeat) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 md:p-6">
      {/* 1. Top Navigation Bar Contract (Brand Zone - Objective - Controls) */}
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Brand & Sector */}
        <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <span className="font-display font-bold text-sm tracking-wide text-white">HELIOS</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-xs text-orange-400 font-medium">Sektör 0{playerStats.currentSector}</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-xs text-white/70">
            {gameMode === 'SURFACE' ? 'Yıldız Yüzeyi' : 'Sızma Kalesi'}
          </span>
        </div>

        {/* Dynamic Objective Banner */}
        <div className="hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white/10 text-xs font-medium">
          {gameMode === 'SURFACE' ? (
            <span className={isCitadelUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
              {objectiveText}
            </span>
          ) : (
            <span className={escapeTimer > 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
              {objectiveText}
            </span>
          )}
        </div>

        {/* Right Info: Credits, Hangar, Audio & Fullscreen */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* H-Credits */}
          <div className="flex items-center gap-1.5 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
            <Cpu className="w-3.5 h-3.5" />
            <span className="tabular-nums font-mono font-bold tracking-tight">{playerStats.credits}</span>
            <span className="text-[10px] text-cyan-400">H-KREDİ</span>
          </div>

          {/* Hangar Trigger */}
          <button
            onClick={onOpenHangar}
            className="px-3 py-1.5 bg-black/60 hover:bg-black/80 border border-white/15 text-white/90 text-xs font-medium rounded-lg transition-colors"
          >
            Hangar
          </button>

          {/* Sound Mute */}
          <button
            onClick={toggleSound}
            className="p-1.5 bg-black/60 hover:bg-black/80 border border-white/15 text-white/80 rounded-lg transition-colors"
            title="Sesi Aç/Kapat"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden md:flex p-1.5 bg-black/60 hover:bg-black/80 border border-white/15 text-white/80 rounded-lg transition-colors"
            title="Tam Ekran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Escape Countdown Warning (Visible when Citadel Core Overloaded) */}
      {gameMode === 'CITADEL' && escapeTimer > 0 && (
        <div className="self-center bg-rose-950/90 border-2 border-rose-500 text-rose-100 px-6 py-2 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <div className="text-center font-display">
            <div className="text-xs tracking-wider uppercase text-rose-300">REAKTÖR ERİMESİ</div>
            <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-white">
              00:{escapeTimer < 10 ? `0${escapeTimer}` : escapeTimer}
            </div>
            <div className="text-[10px] text-rose-200">Geri sayım bitmeden çıkış hava kilidine koş!</div>
          </div>
        </div>
      )}

      {/* 3. Terminal Hack Progress Bar (Visible in Citadel near terminal) */}
      {gameMode === 'CITADEL' && isNearTerminal && escapeTimer === 0 && (
        <div className="self-center bg-black/80 border border-emerald-500/50 px-5 py-2.5 rounded-xl shadow-xl flex flex-col items-center gap-1.5">
          <div className="text-xs font-display text-emerald-400 font-semibold tracking-wider">
            KARTEL TERMİNALİ HACKLENİYOR
          </div>
          <div className="w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/30">
            <div
              style={{ width: `${hackProgress}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-100"
            />
          </div>
          <div className="text-[10px] text-white/70">[E] veya HACK butonuna basılı tutun ({hackProgress}%)</div>
        </div>
      )}

      {/* 4. Left Vitals Telemetry (Shield, Hull, Heat/Alert) */}
      <div className="flex flex-col gap-2 max-w-xs mb-20 md:mb-12">
        {/* Shield Bar */}
        <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-display">
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> KALKAN
            </span>
            <span className="font-mono tabular-nums text-white/90">{shieldPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${shieldPercent}%` }}
              className="h-full bg-cyan-400 transition-all duration-200"
            />
          </div>
        </div>

        {/* Hull Health Bar */}
        <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-display">
            <span className="text-rose-400 font-semibold">GÖVDE</span>
            <span className="font-mono tabular-nums text-white/90">{healthPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${healthPercent}%` }}
              className={`h-full transition-all duration-200 ${
                healthPercent > 40 ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
            />
          </div>
        </div>

        {/* Mode Specific: Heat Gauge on Surface vs Stealth Alert in Citadel */}
        {gameMode === 'SURFACE' ? (
          <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-display">
              <span className={`font-semibold flex items-center gap-1 ${heatPercent > 80 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                <Flame className="w-3.5 h-3.5" /> TERMAL ISI
              </span>
              <span className="font-mono tabular-nums text-white/90">{heatPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${heatPercent}%` }}
                className={`h-full transition-all duration-200 ${
                  heatPercent > 80 ? 'bg-red-500' : heatPercent > 50 ? 'bg-orange-400' : 'bg-amber-300'
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-display">
              <span className={`font-semibold ${alertLevel > 60 ? 'text-rose-400' : alertLevel > 30 ? 'text-amber-400' : 'text-cyan-400'}`}>
                GİZLİLİK / TESPİT
              </span>
              <span className="font-mono tabular-nums text-white/90">{Math.round(alertLevel)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${alertLevel}%` }}
                className={`h-full transition-all duration-200 ${
                  alertLevel > 60 ? 'bg-rose-500' : alertLevel > 30 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
