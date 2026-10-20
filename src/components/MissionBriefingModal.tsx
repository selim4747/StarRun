import React from 'react';
import { Shield, Crosshair, Terminal, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

interface MissionBriefingModalProps {
  sector: number;
  onStartInfiltration: () => void;
  onAbort: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  sector,
  onStartInfiltration,
  onAbort,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0d0d14] border border-orange-500/40 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="p-2.5 rounded-xl bg-orange-950/60 border border-orange-500/40 text-orange-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-orange-400 font-mono tracking-wider uppercase font-semibold">
              KALE DOKUNA KİLİTLENDİ · SEKTÖR 0{sector}
            </div>
            <h3 className="text-xl font-bold font-display tracking-wide">
              KARTEL KALESİNE SIZMA OPERASYONU
            </h3>
          </div>
        </div>

        {/* Narrative & Tactical Directives */}
        <p className="text-xs text-white/70 leading-relaxed">
          Sektördeki hidrojen kapsüllerini imha ederek savunma ağını çökerttiniz. Şimdi kartelin yıldız üstü ana ekstraksiyon kalesine sızıp reaktörü sabote etme zamanı!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold font-display text-blue-300">Saklanma & Siper</div>
              <div className="text-[11px] text-white/60">Kutuların arkasına eğilerek dronların kırmızı görüş alanından saklanın.</div>
            </div>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
            <Crosshair className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold font-display text-rose-300">Sessiz Atış</div>
              <div className="text-[11px] text-white/60">Susturuculu enerji tüfeği ile devriye dronlarını alarma geçmeden avlayın.</div>
            </div>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold font-display text-amber-300">EMP Şoku</div>
              <div className="text-[11px] text-white/60">Sıkıştığınızda EMP fırlatarak yakındaki tüm dronları dondurun.</div>
            </div>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold font-display text-emerald-300">Reaktör Sabotajı</div>
              <div className="text-[11px] text-white/60">Ana konsolu hackleyin ve geri sayım bitmeden kaçış kilidine dönün!</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onAbort}
            className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
          >
            Geri Çekil (Yüzeyde Kal)
          </button>
          <button
            onClick={onStartInfiltration}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-display font-bold shadow-lg shadow-orange-500/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            Sızmayı Başlat
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
