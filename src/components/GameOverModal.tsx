import React from 'react';
import { Skull, RotateCcw, Wrench } from 'lucide-react';

interface GameOverModalProps {
  reason: 'destroyed' | 'overheat' | 'spotted';
  onRestart: () => void;
  onOpenHangar: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  reason,
  onRestart,
  onOpenHangar,
}) => {
  const getReasonText = () => {
    switch (reason) {
      case 'overheat':
        return 'Güneş püskürmesi ve aşırı plazma sıcaklığı hovercraft termal çekirdeğini eritti!';
      case 'spotted':
        return 'Reaktör patlamadan önce hava kilidine yetişemediniz veya devriye ateşi altında kaldınız!';
      default:
        return 'Hovercraft gövde bütünlüğünü kaybetti ve parçalandı!';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#160a0a] border border-rose-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 text-white">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse">
          <Skull className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs text-rose-400 font-mono tracking-widest uppercase font-semibold">
            GÖREV BAŞARISIZ
          </span>
          <h3 className="text-2xl font-bold font-display tracking-wide mt-1 text-white">
            SİNYAL KAYBEDİLDİ
          </h3>
          <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
            {getReasonText()}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full mt-2">
          <button
            onClick={onOpenHangar}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-display font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            Hangarda Güçlen
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs font-display transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Yeniden Dene
          </button>
        </div>
      </div>
    </div>
  );
};
