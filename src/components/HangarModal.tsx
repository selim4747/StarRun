import React, { useState } from 'react';
import { PlayerStats, UpgradeConfig } from '../types/game';
import { sound } from '../game/sound';
import { Shield, Zap, Crosshair, Cpu, Wind, Lock, CheckCircle, Terminal, EyeOff, Play } from 'lucide-react';

interface HangarModalProps {
  playerStats: PlayerStats;
  onUpgrade: (upgradeId: string, cost: number) => void;
  onDeploy: (sector: number) => void;
  onClose: () => void;
}

export const HangarModal: React.FC<HangarModalProps> = ({
  playerStats,
  onUpgrade,
  onDeploy,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'vehicle' | 'operative' | 'sectors'>('vehicle');

  const vehicleUpgrades: UpgradeConfig[] = [
    {
      id: 'engine',
      name: 'İyon İtki Motoru',
      description: 'Hovercraft maksimum hızını, dönüş çevikliğini ve itki torkunu artırır.',
      category: 'vehicle',
      level: playerStats.engineLevel,
      maxLevel: 5,
      baseCost: 150,
      costMultiplier: 1.8,
      icon: 'wind',
      statBonus: `+${playerStats.engineLevel * 20}% Sürat`,
    },
    {
      id: 'weapon',
      name: 'İkiz Plazma Kanonları',
      description: 'Hidrojen kapsüllerini daha hızlı parçalamak için plazma hasarını ve atış sıklığını yükseltir.',
      category: 'vehicle',
      level: playerStats.weaponLevel,
      maxLevel: 5,
      baseCost: 200,
      costMultiplier: 1.8,
      icon: 'crosshair',
      statBonus: `+${playerStats.weaponLevel * 25}% Hasar`,
    },
    {
      id: 'shield',
      name: 'Termal Plazma Kalkanı',
      description: 'Güneş püskürmeleri ve termal patlamalara karşı kalkan kapasitesini ve ısı dayanımını güçlendirir.',
      category: 'vehicle',
      level: playerStats.shieldLevel,
      maxLevel: 5,
      baseCost: 180,
      costMultiplier: 1.7,
      icon: 'shield',
      statBonus: `+${playerStats.shieldLevel * 30} Kalkan Kapasitesi`,
    },
    {
      id: 'magnet',
      name: 'Manyetik Vakum Bobini',
      description: 'Parçalanan kapsüllerden etrafa saçılan hidrojen çekirdeklerini uzaktan çeker.',
      category: 'vehicle',
      level: playerStats.magnetLevel,
      maxLevel: 5,
      baseCost: 120,
      costMultiplier: 1.6,
      icon: 'zap',
      statBonus: `+${playerStats.magnetLevel * 4}m Çekim Alanı`,
    },
  ];

  const operativeUpgrades: UpgradeConfig[] = [
    {
      id: 'stealth',
      name: 'Optik Termal Kamuflaj',
      description: 'Kartel dronlarının görüş alanında tespit edilme hızını düşürür ve siper saklanmasını artırır.',
      category: 'operative',
      level: playerStats.stealthLevel,
      maxLevel: 5,
      baseCost: 180,
      costMultiplier: 1.8,
      icon: 'eyeoff',
      statBonus: `-${playerStats.stealthLevel * 15}% Tespit Hızı`,
    },
    {
      id: 'blaster',
      name: 'Susturuculu Enerji Tüfeği',
      description: 'Sızma modunda güvenlik devriyelerini alarmları tetiklemeden sessizce imha eder.',
      category: 'operative',
      level: playerStats.blasterLevel,
      maxLevel: 5,
      baseCost: 220,
      costMultiplier: 1.8,
      icon: 'crosshair',
      statBonus: `+${playerStats.blasterLevel * 30}% Sessiz Hasar`,
    },
    {
      id: 'emp',
      name: 'EMP Şok Kondansatörü',
      description: 'Düşman dronlarını geçici olarak donduran elektromanyetik şok dalgası yarıçapını ve süresini uzatır.',
      category: 'operative',
      level: playerStats.empLevel,
      maxLevel: 5,
      baseCost: 240,
      costMultiplier: 1.9,
      icon: 'zap',
      statBonus: `+${playerStats.empLevel * 1.5}sn Felç Süresi`,
    },
    {
      id: 'hack',
      name: 'Kriptografik Hack Kiti',
      description: 'Kartel veri terminallerini ve hidrojen reaktör konsollarını daha kısa sürede sabote eder.',
      category: 'operative',
      level: playerStats.hackLevel,
      maxLevel: 5,
      baseCost: 200,
      costMultiplier: 1.7,
      icon: 'terminal',
      statBonus: `+${playerStats.hackLevel * 35}% Hack Hızı`,
    },
  ];

  const getCost = (cfg: UpgradeConfig) => {
    return Math.round(cfg.baseCost * Math.pow(cfg.costMultiplier, cfg.level - 1));
  };

  const handleBuy = (cfg: UpgradeConfig) => {
    const cost = getCost(cfg);
    if (playerStats.credits >= cost && cfg.level < cfg.maxLevel) {
      sound.playCreditChime();
      sound.vibrate(50);
      onUpgrade(cfg.id, cost);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'wind': return <Wind className="w-5 h-5 text-cyan-400" />;
      case 'crosshair': return <Crosshair className="w-5 h-5 text-red-400" />;
      case 'shield': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'eyeoff': return <EyeOff className="w-5 h-5 text-purple-400" />;
      case 'terminal': return <Terminal className="w-5 h-5 text-emerald-400" />;
      default: return <Cpu className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0e0e16] border border-white/15 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-wide">
              HELIOS HANGAR & GELİŞTİRME
            </h2>
            <p className="text-xs text-white/60">
              Yıldız yüzeyinde topladığın Hidrojen Kredilerini teknolojik yükseltmelere dönüştür.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold shadow-inner">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="tabular-nums">{playerStats.credits}</span>
            <span className="text-[10px] text-cyan-400">H-KREDİ</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 my-4 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('vehicle')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-display transition-colors ${
              activeTab === 'vehicle'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Hovercraft Sistemleri
          </button>
          <button
            onClick={() => setActiveTab('operative')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-display transition-colors ${
              activeTab === 'operative'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Sızma Ajanı Donanımı
          </button>
          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-display transition-colors ${
              activeTab === 'sectors'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Sektör Haritası
          </button>
        </div>

        {/* Upgrades List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'vehicle' &&
            vehicleUpgrades.map((item) => {
              const cost = getCost(item);
              const canAfford = playerStats.credits >= cost;
              const isMax = item.level >= item.maxLevel;

              return (
                <div
                  key={item.id}
                  className="bg-black/50 border border-white/10 hover:border-white/20 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white font-display">{item.name}</span>
                        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.2 rounded">
                          Lvl {item.level}/{item.maxLevel}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5 line-clamp-1">{item.description}</p>
                      <div className="text-[11px] text-emerald-400 font-mono mt-1 font-medium">{item.statBonus}</div>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <div>
                    {isMax ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-display">
                        <CheckCircle className="w-4 h-4" /> MAKS
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display flex items-center gap-1.5 transition-all ${
                          canAfford
                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/30 active:scale-95'
                            : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span className="tabular-nums font-mono">{cost}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {activeTab === 'operative' &&
            operativeUpgrades.map((item) => {
              const cost = getCost(item);
              const canAfford = playerStats.credits >= cost;
              const isMax = item.level >= item.maxLevel;

              return (
                <div
                  key={item.id}
                  className="bg-black/50 border border-white/10 hover:border-white/20 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white font-display">{item.name}</span>
                        <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-1.5 py-0.2 rounded">
                          Lvl {item.level}/{item.maxLevel}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5 line-clamp-1">{item.description}</p>
                      <div className="text-[11px] text-emerald-400 font-mono mt-1 font-medium">{item.statBonus}</div>
                    </div>
                  </div>

                  <div>
                    {isMax ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-display">
                        <CheckCircle className="w-4 h-4" /> MAKS
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display flex items-center gap-1.5 transition-all ${
                          canAfford
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 active:scale-95'
                            : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span className="tabular-nums font-mono">{cost}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {activeTab === 'sectors' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { sector: 1, title: 'Korona Kuşağı', desc: '4 Hidrojen Kapsülü · Standart Termal Yoğunluk', unlocked: true },
                { sector: 2, title: 'Manyetosfer Boğazı', desc: '5 Hidrojen Kapsülü · Güçlü Güneş Arkları', unlocked: playerStats.infiltratedCitadelsTotal >= 1 },
                { sector: 3, title: 'Apex Dyson Reaktörü', desc: '6 Hidrojen Kapsülü · Elit Dron Devriyeleri', unlocked: playerStats.infiltratedCitadelsTotal >= 2 },
              ].map((s) => (
                <div
                  key={s.sector}
                  className={`p-4 rounded-xl border flex flex-col justify-between h-40 ${
                    s.unlocked
                      ? s.sector === playerStats.currentSector
                        ? 'bg-orange-950/40 border-orange-500/60 shadow-lg'
                        : 'bg-black/50 border-white/15'
                      : 'bg-black/30 border-white/5 opacity-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-display">
                      <span className="text-white/60">SEKTÖR 0{s.sector}</span>
                      {s.unlocked ? (
                        s.sector === playerStats.currentSector && (
                          <span className="text-orange-400 font-bold">AKTİF</span>
                        )
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-white/40" />
                      )}
                    </div>
                    <h4 className="font-bold text-white font-display mt-1">{s.title}</h4>
                    <p className="text-[11px] text-white/50 mt-1">{s.desc}</p>
                  </div>

                  {s.unlocked && (
                    <button
                      onClick={() => {
                        onDeploy(s.sector);
                      }}
                      className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-display font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Görevi Başlat
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
          <div className="text-[11px] text-white/50">
            İmha Edilen Kapsüller: <span className="text-orange-400 font-mono font-bold">{playerStats.destroyedCapsulesTotal}</span> · Çökertilen Kaleler: <span className="text-cyan-400 font-mono font-bold">{playerStats.infiltratedCitadelsTotal}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-display font-semibold transition-colors"
          >
            Kapat & Savaşa Dön
          </button>
        </div>
      </div>
    </div>
  );
};
