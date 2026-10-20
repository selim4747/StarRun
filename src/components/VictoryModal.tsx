import React from 'react';
import { Trophy, Cpu, ArrowRight, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  bonusCredits: number;
  totalCredits: number;
  sector: number;
  onNextSector: () => void;
  onOpenHangar: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  bonusCredits,
  totalCredits,
  sector,
  onNextSector,
  onOpenHangar,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0a1118] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 text-white">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Trophy className="w-8 h-8 text-cyan-400" />
        </div>

        <div>
          <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase font-semibold">
            GÖREV BAŞARILI · SEKTÖR 0{sector}
          </span>
          <h3 className="text-2xl font-bold font-display tracking-wide mt-1">
            KALE ÇÖKERTİLDİ!
          </h3>
          <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
            Dyson Karteli'nin hidrojen sifon reaktörü imha edildi. Yıldızın enerjisi kurtarılıyor!
          </p>
        </div>

        {/* Rewards Box */}
        <div className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3.5 flex items-center justify-between">
          <span className="text-xs text-white/80 font-medium">Kazanılan Operasyon Ödülü:</span>
          <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold text-sm">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>+{bonusCredits} H-KREDİ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full mt-2">
          <button
            onClick={onOpenHangar}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-display font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Hangara Git
          </button>
          <button
            onClick={onNextSector}
            className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl text-xs font-display transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-1.5"
          >
            Sonraki Sektör
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
