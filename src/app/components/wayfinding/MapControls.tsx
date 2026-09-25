import React from 'react';
import { QrCode, Plus, Minus, Maximize2 } from 'lucide-react';
import styles from './Wayfinding.module.css';
import { useMapCopy } from './useMapContent';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onToggleQrSim: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onToggleQrSim,
}) => {
  const copy = useMapCopy();
  return (
    <div
      className={styles.floatingControlsStack}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className={styles.controlBtnGroup}>
        <button className={styles.controlBtn} onClick={onZoomIn} title={copy.zoomIn} aria-label="Zoom in">
          <Plus size={18} />
        </button>
        <button className={styles.controlBtn} onClick={onZoomOut} title={copy.zoomOut} aria-label="Zoom out">
          <Minus size={18} />
        </button>
        <button
          className={`${styles.controlBtn} ${styles.fitBtn}`}
          onClick={onZoomFit}
          title={copy.zoomFit}
          aria-label="Fit floor to screen"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      <button
        className={styles.controlBtn}
        onClick={onToggleQrSim}
        title={copy.qrButton}
        aria-label="Select entrance location"
      >
        <QrCode size={18} />
      </button>
    </div>
  );
};
