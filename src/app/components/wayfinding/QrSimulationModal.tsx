import React, { useState } from 'react';
import { QrCode, X, MapPin, Check } from 'lucide-react';
import { FloorId, FLOOR_LABELS } from '../../../types/wayfinding';
import { fill, useFloorTexts, useMapCopy } from './useMapContent';
import styles from './Wayfinding.module.css';

interface QrSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntrance: (floorId: FloorId, locationId: string, name: string) => void;
}

export const QrSimulationModal: React.FC<QrSimulationModalProps> = ({
  isOpen,
  onClose,
  onSelectEntrance,
}) => {
  const [customInput, setCustomInput] = useState('');
  const copy = useMapCopy();
  const { names: floorNames } = useFloorTexts();
  const entrances = (Array.isArray(copy.entrances) ? copy.entrances : []).filter(
    (e) => e && e.name && e.locationId && e.floorId in FLOOR_LABELS
  ) as Array<{ floorId: FloorId; locationId: string; name: string }>;

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const parts = customInput.split(':');
    if (parts.length === 2 && parts[0] in FLOOR_LABELS) {
      onSelectEntrance(parts[0] as FloorId, parts[1], fill(copy.qrCustomPoint, { id: parts[1] }));
      onClose();
    } else {
      onSelectEntrance('ground_floor', customInput.trim(), fill(copy.qrPoint, { id: customInput.trim() }));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#11142e] border border-gray-800 rounded-2xl p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
          <div className="p-2.5 bg-[#801424]/20 text-[#f87171] rounded-xl border border-[#801424]/40">
            <QrCode size={24} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold font-arizona-flare">{copy.qrTitle}</h3>
            <p className="text-xs text-gray-400">{copy.qrSubtitle}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            {copy.qrPresetLabel}
          </label>
          {entrances.map((entrance, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectEntrance(entrance.floorId, entrance.locationId, entrance.name);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-[#b91c1c] text-left transition-all text-sm group"
            >
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#f87171] shrink-0" />
                <div>
                  <div className="font-semibold text-gray-100 group-hover:text-[#f87171]">
                    {entrance.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {floorNames[entrance.floorId]} &bull; {copy.qrShutter} {entrance.locationId}
                  </div>
                </div>
              </div>
              <Check size={16} className="opacity-0 group-hover:opacity-100 text-[#f87171]" />
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} className="mt-5 pt-4 border-t border-gray-800">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
            {copy.qrCustomLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={copy.qrCustomPlaceholder}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-[#b91c1c]"
            />
            <button type="submit" className={styles.btnSecondary}>
              {copy.qrApply}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
