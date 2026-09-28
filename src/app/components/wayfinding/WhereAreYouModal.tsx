import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MapPin, QrCode, X } from 'lucide-react';
import type { QrPoint } from '../../../types/wayfinding';
import { useFloorTexts, useMapCopy } from './useMapContent';

interface Props {
  isOpen: boolean;
  points: QrPoint[];
  currentCode?: string;
  onClose: () => void;
  onPick: (p: QrPoint) => void;
}

/** "Where are you?" — the map QR points, grouped by floor, for visitors who didn't scan one. */
export function WhereAreYouModal({ isOpen, points, currentCode, onClose, onPick }: Props) {
  const copy = useMapCopy();
  const { items: floors } = useFloorTexts();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="where-title"
            className="w-full sm:max-w-md max-h-[82vh] flex flex-col bg-[#11142e] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl text-white"
            initial={{ y: 40, opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 p-5 pb-4 border-b border-white/10">
              <div className="p-2.5 bg-[#801424]/25 text-[#f87171] rounded-xl border border-[#801424]/40"><QrCode size={22} /></div>
              <div className="flex-1 min-w-0">
                <h3 id="where-title" className="text-lg font-extrabold font-arizona-flare">{copy.hereTitle}</h3>
                <p className="text-[13px] text-gray-400 leading-snug">{copy.hereSubtitle}</p>
              </div>
              <button onClick={onClose} className="p-1.5 -m-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-3 pb-5">
              {points.length === 0 && <p className="p-4 text-sm text-gray-400">{copy.hereEmpty}</p>}
              {floors.map((f) => {
                const list = points.filter((p) => p.floorId === f.id);
                if (!list.length) return null;
                return (
                  <div key={f.id} className="mt-2 first:mt-0">
                    <p className="px-2 pt-2 pb-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{f.name}</p>
                    {list.map((p) => {
                      const on = p.code === currentCode;
                      return (
                        <button key={p.code} onClick={() => { onPick(p); onClose(); }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition-colors duration-150 group ${on ? 'bg-[#2f7bf6]/15' : 'hover:bg-white/5'}`}>
                          <MapPin size={16} className={on ? 'text-[#60a5fa] shrink-0' : 'text-[#f87171] shrink-0'} />
                          <span className="flex-1 min-w-0 font-semibold text-gray-100 truncate">{p.name}</span>
                          {on ? <Check size={16} className="text-[#60a5fa]" /> : <span className="text-[11px] text-gray-500 font-mono">{p.code}</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
